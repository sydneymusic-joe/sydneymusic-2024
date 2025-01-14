import 'dotenv/config';
import { GraphQLClient, gql } from 'graphql-request';
import * as fs from 'fs/promises';
import nj from 'nunjucks';
import datefilter from 'nunjucks-date-filter'
import { group } from 'console';

const client = new GraphQLClient(
	`https://graphql.datocms.com/`,
	{
		headers: {
			authorization: `Bearer ${process.env.DATOCMS_TOKEN}`
		}
	}
);

function doQuery(query) {
	return client.request(
		gql`
			${query}
		`
	);
}

async function doIt() {
	let startDate = new Date("2024-01-01");
	let endDate = new Date("2025-01-01");

	let exclude = [
		"Monday Night Confessions",
		"Saturday Jazz",
		"Sunday Jazz",
		"Sunset Acoustics"
	];
	let cleanUp = [
		/\(.*\)/g,
		/\[.*\]/g,
	]

	const pagesize = 100;
	let iter = 0;
	let ret = 100;

	let data = [];
	let query = '';
	while (iter < 80) {
		query += `
		page${iter + 1}:allEvents(
			orderBy: [gigStartDate_ASC],
			first: ${pagesize},
			skip:${iter * pagesize}
			filter: { gigStartDate : {gte: "${startDate.toISOString()}", lt: "${endDate.toISOString()}" }}
		) {
			id
			gigStartDate
			promotedName
			ticketUrl
			performersListJson
			furtherInfo
			furtherInfoContributorInitials
			isFree
			isPwyc
			venue {
				venueName
				address
				suburb
				url,
				slug
			}
		}
		`;

		iter++;
	}

	const page = await doQuery(`{
		${query}
	}`);

	for (iter = 1; iter < 80; iter++) {
		const p = page['page' + iter];
		if (p.length == 0) break;

		data = data.concat(p);
	}
	ret = data.length;

	// this gives an object with dates as keys
	const groups = data.reduce((groups, gig) => {
		const date = gig.gigStartDate.split('T')[0];
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(gig);
		return groups;
	}, {});

	const groupArtists = data.reduce((groupArtists, gig) => {
		const artists = [...(gig.performersListJson ?? [])];
		if (!exclude.includes(gig.promotedName)) {
			artists.push(gig.promotedName);
		}

		artists.forEach((artist) => {
			let a = artist.toString().trim() + "\0";
			cleanUp.forEach((regex) => {
				a = a.replace(regex, '').trim();
			});
			if (!groupArtists[a]) {
				groupArtists[a] = 0;
			}
			groupArtists[a]++;
		});
		return groupArtists;
	}, {});

	const sortedGroupArtists = Object.entries(groupArtists)
		.sort(([, a], [, b]) => b - a)
		.reduce((acc, [key, value]) => {
			acc[key.toString()] = value;
			return acc;
		}, {});

	const groupVenues = data.reduce((groupVenues, gig) => {
		const venueName = gig.venue.venueName;
		if (!groupVenues[venueName]) {
			groupVenues[venueName] = gig.venue;
			groupVenues[venueName].count = 0;
		}
		groupVenues[venueName].count++;
		return groupVenues;
	}, {});

	const sortedGroupVenues = Object.values(groupVenues)
		.sort((a, b) => b.count - a.count);
		
	// Edit: to add it in the array format instead
	const groupArrays = Object.keys(groups).map((date) => {
		return groups[date].length;
	});

	const freeShows = data.filter((gig) => gig.isFree);

	let env = nj.configure('views', {autoescape:true});
	env.addFilter('date', datefilter);
	
	env.addFilter('json', function (value, spaces) {
		if (value instanceof nj.runtime.SafeString) {
		  value = value.toString()
		}
		const jsonString = JSON.stringify(value, null, spaces).replace(/</g, '\\u003c')
		return nj.runtime.markSafe(jsonString)
	  });

		await fs.mkdir('build', { recursive: true });
		await fs.writeFile("build/index.html", nj.render('index.html',
		{
			gigs: data,
			busiestVenues: Object.entries(sortedGroupVenues).splice(0, 10),
			hardestGigger: Object.entries(sortedGroupArtists)[0],
			gigsFree: freeShows.length,
			gigsPerDayDates: Object.keys(groups),
			gigsPerDay: groupArrays
		}));
}

doIt()
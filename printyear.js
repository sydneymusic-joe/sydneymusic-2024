import "dotenv/config";
import { GraphQLClient, gql } from "graphql-request";
import * as fs from "fs/promises";
import nj from "nunjucks";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const client = new GraphQLClient(`https://graphql.datocms.com/`, {
  headers: {
    authorization: `Bearer ${process.env.DATOCMS_TOKEN}`,
  },
});

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
    "Sunset Acoustics",
  ];
  let cleanUp = [/\(.*\)/g, /\[.*\]/g];
  const pagesize = 100;
  let iter = 0;
  let data = [];
  let query = "";

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
          url
          slug
        }
      }
    `;
    iter++;
  }

  const page = await doQuery(`{ ${query} }`);

  for (iter = 1; iter < 80; iter++) {
    const p = page["page" + iter];
    if (!p || p.length === 0) break;
    data = data.concat(p);
  }

  const groups = data.reduce((groups, gig) => {
    const date = gig.gigStartDate.split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(gig);
    return groups;
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

  const sortedGroupVenues = Object.values(groupVenues).sort(
    (a, b) => b.count - a.count
  );

  const groupArrays = Object.keys(groups).map((date) => {
    return groups[date].length;
  });

  const freeShows = data.filter((gig) => gig.isFree);

  const artistGigs = {};

  function pushGig(artist, gig) {
    if (!artistGigs[artist]) {
      artistGigs[artist] = [];
    }
    artistGigs[artist].push(gig);
  }

  for (const gig of data) {
    const performers = [...(gig.performersListJson ?? [])];
    if (!exclude.includes(gig.promotedName)) {
      performers.push(gig.promotedName);
    }
    for (let artist of performers) {
      artist = artist.trim();
      cleanUp.forEach((regex) => {
        artist = artist.replace(regex, "").trim();
      });
      pushGig(artist, gig);
    }
  }

  Object.values(artistGigs).forEach((gigs) => {
    gigs.sort((a, b) => new Date(a.gigStartDate) - new Date(b.gigStartDate));
  });

  const sortedArtistGigs = Object.entries(artistGigs)
    .sort(([aName, aGigs], [bName, bGigs]) => bGigs.length - aGigs.length)
    .slice(0, 100);

  const venueGigs = {};

  for (const gig of data) {
    const vName = gig.venue.venueName;
    if (!venueGigs[vName]) {
      venueGigs[vName] = [];
    }
    venueGigs[vName].push(gig);
  }

  Object.values(venueGigs).forEach((gigs) => {
    gigs.sort((a, b) => new Date(a.gigStartDate) - new Date(b.gigStartDate));
  });

  const sortedVenueGigs = Object.entries(venueGigs)
    .sort(([vA, gigsA], [vB, gigsB]) => gigsB.length - gigsA.length)
    .slice(0, 100);

  let env = nj.configure("views", { autoescape: true });
  env.addFilter("date", function (value, format = "DD MMM") {
    return dayjs(value).tz("Australia/Sydney").format(format);
  });
  env.addFilter("json", function (value, spaces) {
    if (value instanceof nj.runtime.SafeString) {
      value = value.toString();
    }
    const jsonString = JSON.stringify(value, null, spaces).replace(
      /</g,
      "\\u003c"
    );
    return nj.runtime.markSafe(jsonString);
  });

  await fs.mkdir("build", { recursive: true });
  await fs.writeFile(
    "build/index.html",
    nj.render("index.html", {
      gigs: data,
      busiestVenues: Object.entries(sortedGroupVenues).splice(0, 10),
      gigsFree: freeShows.length,
      gigsPerDayDates: Object.keys(groups),
      gigsPerDay: groupArrays,
      sortedArtistGigs,
      sortedVenueGigs,
    })
  );
  await fs.copyFile("static/style.css", "build/style.css");
  await fs.copyFile("static/section-toggles.js", "build/section-toggles.js");
}

doIt();

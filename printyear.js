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

/**
  * @param {Object} object
  * @param {string} key
  * @return {any} value
 */
function getParameterCaseInsensitive(object, key) {
  const asLowercase = key.toLowerCase();
  return object[Object.keys(object)
    .find(k => k.toLowerCase() === asLowercase)
  ];
}

async function doIt() {
  let startDate = new Date("2024-01-01");
  let endDate = new Date("2025-01-01");
  let exclude = [
    "Monday Night Confessions",
    "Saturday Jazz",
    "Sunday Jazz",
    "Sunset Acoustics",
    "5 bands for 5 bucks",
    "PARRAMATTA LANES",
    "Innerwest Hop",
    "Hijinx Wednesdays",
    "Brett Whiteley Studio Sessions",
    "Fridays @ Lansdowne",
    "LOCAL PRODUCE"
  ];
  const regexIntl = /\([A-Z]{2,3}\)/g;
  let cleanUp = [regexIntl, /\[.*\]/g, /DJ\s/g];
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
          id
        }
      }
    `;
    iter++;
  }

  const venues = JSON.parse(await fs.readFile("static/venues.json"));

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

  // const venuesByCap = data.reduce((band, gig) => {
  //   if (gig.venue.capacity) {
  //     let cap = gig.venue.capacity;
  //     switch (true) {
  //       case (cap >= 250 && cap < 500):
  //         band["250-500"]++;
  //         break;
  //       case (cap >= 500 && cap < 1500):
  //         band["500-1500"]++;
  //         break;
  //       case (cap >= 1500 && cap < 5000):
  //         band["1500-5000"]++;
  //         break;
  //       case (cap >= 5000):
  //         band["5000+"]++;
  //         break;
  //       case (cap > 0 && cap < 100):
  //         band["<100"]++;
  //         break;
  //       case (cap >= 100 && cap < 250):
  //         band["100-250"]++;
  //         break;
  //     }
  //   }
  //   /*else {
  //     band["Uncategorized"]++;
  //   }*/
  //   return band;
  // }, {"<100" : 0, "100-250" : 0, "250-500" : 0, "500-1500" : 0, "1500-5000" : 0, "5000+" : 0});


  // const postcodeRanges = [
  //   { areaName: "CBD and Inner City", Postcodes: [2000,2001,2006,2007,2008,2009,2010,2011,2015,2016,2017,2018,2019,2020] },
  //   { areaName: "Inner West", Postcodes: [2037,2038,2039,2040,2041,2042,2043,2044,2045,2046,2047,2048,2049,2050,2130,2131,2132,2133,2134,2135,2136,2137,2138,2139,2140,2203,2204,2206] },
  //   { areaName: "Eastern Suburbs", Postcodes: [2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035,2036] },
  //   { areaName: "North Shore", Postcodes: [2055,2057,2059,2060,2061,2062,2063,2064,2065,2066,2067,2068,2069,2070,2071,2072,2073,2074,2075,2076,2077,2079,2080,2081,2082,2083,2088,2089,2090] },
  //   { areaName: "Northern Beaches", Postcodes: [2084,2085,2086,2087,2092,2093,2094,2095,2096,2097,2099,2100,2101,2102,2103,2104,2105,2106,2107,2108] },
  //   { areaName: "Southwest Sydney", Postcodes: [2148,2164,2165,2166,2167,2168,2170,2171,2172,2173,2174,2175,2176,2177,2178,2179,2214,2555,2556,2557,2558,2559,2560,2563,2564,2565,2566,2567,2568,2569,2570,2571,2572,2573,2574,2745,2752] },
  //   { areaName: "Western Sydney", Postcodes: [1700,1730,1740,1741,1750,1755,1790,1811,1825,1830,1831,1835,2123,2124,2127,2128,2141,2142,2143,2144,2145,2146,2147,2150,2151,2152,2153,2155,2160,2161,2162,2163,2197,2580,2747,2748,2749,2750,2751,2753,2754,2756,2758,2759,2760,2761,2762,2763,2765,2766,2767,2768,2769,2770,2773,2774,2776,2777,2778,2779,2780,2782,2783,2784,2785,2786,2787,2790] },
  //   { areaName: "Hills District", Postcodes : [1765,2154,2156,2157,2158,2159,2250,2330,2757,2775] },
  //   { areaName: "Northern Suburbs", Postcodes : [2109,2110,2111,2112,2113,2114,2115,2116,2117,2118,2119,2120,2121,2122,2123,2124,2125,2126,2127,2128] },
  //   { areaName : "Sutherland/Shire", Postcodes : [2224,2225,2226,2227,2228,2229,2230,2231,2232,2233,2234]}
  // ];
  
  // // Group events by postcode range
  // const venuesByArea = postcodeRanges.map((range) => ({
  //   areaName: range.areaName,
  //   Postcodes: range.Postcodes,
  //   count: data.filter(
  //     (event) => {
  //       return range.Postcodes.includes(parseInt(event.venue.postcode))
  //     }
  //   ).length
  // }));

  const sortedGroupVenues = Object.values(venues).sort(
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

  // split out all artists
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

  // sort the gigs by date ascending
  Object.values(artistGigs).forEach((gigs) => {
    gigs.sort((a, b) => new Date(a.gigStartDate) - new Date(b.gigStartDate));
  });

  // get the list of artists sorted by hardest gigging
  const sortedArtistGigs = Object.entries(artistGigs)
    .sort(([aName, aGigs], [bName, bGigs]) => bGigs.length - aGigs.length)
    .splice(0, 600);

  const sortedVenueGigs = Object.entries(venues.filter((v) => v.count > 0))
    .sort(([vA, gigsA], [vB, gigsB]) => gigsB.count - gigsA.count);

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
  await fs.cp("assets/", "build/assets/", {recursive:true});
  await fs.writeFile("build/allgigs.json",JSON.stringify(data));
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
      venueCount : venues.filter((v) => v.count > 0).length-10,
      intlGigCount:data.filter((g) => g.promotedName.search(regexIntl) > -1 || (g.performersListJson != null && g.performersListJson.filter((p) => p.search(regexIntl) > -1).length > 0)).length
    })
  );
  await fs.cp("static/", "build/", {recursive:true});
}

doIt();

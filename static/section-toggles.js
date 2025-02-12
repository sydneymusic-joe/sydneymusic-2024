document.addEventListener("DOMContentLoaded", () => {
  const actsSection = document.getElementById("acts-section");
  const venuesSection = document.getElementById("venues-section");
  const areaSection = document.getElementById("area-section");
  const dateSection = document.getElementById("date-section");
  const dateGigs = document.getElementById("date-gigs");
  const btnActs = document.getElementById("toggle-acts");
  const btnVenues = document.getElementById("toggle-venues");
  const btnDate = document.getElementById("toggle-by-date");
  const datePicker = document.getElementById("date-picker");

  // Toggle acts gigs
  btnActs.addEventListener("click", () => {
    hideDateSection();
    btnDate.style.backgroundColor = "";
    btnDate.style.color = "";
    actsSection.classList.remove("hidden");
    venuesSection.classList.add("hidden");
    btnActs.classList.add("bg-black", "text-white");
    btnVenues.classList.remove("bg-black", "text-white");
    btnDate.classList.remove("bg-black", "text-white");
    closeAllVenueGigs();
  });

  // Toggle acts gigs
  const artistItems = document.querySelectorAll(".artist-item");
  artistItems.forEach((item) => {
    item.addEventListener("click", () => {
      const artist = item.getAttribute("data-artist");
      const targetDiv = document.querySelector(
        `.gigs-for-artist[data-artist="${artist}"]`
      );
      if (!targetDiv) return;
      const regexFind = new RegExp(`^(DJ )?${artist}`,"gi");
      const findArtist = window.ALL_GIGS.filter((g) => g.promotedName.match(regexFind) || (g.performersListJson && g.performersListJson.filter((p) => p.match(regexFind)).length > 0));
      targetDiv.innerHTML = buildDateGigsHtml(findArtist);
      const wasHidden = targetDiv.classList.contains("hidden");
      closeAllArtistGigs();
      if (wasHidden) {
        targetDiv.classList.remove("hidden");
        item.classList.add("bg-black", "text-white");
      }
    });
  });

  function closeAllArtistGigs() {
    document.querySelectorAll(".gigs-for-artist").forEach((div) => {
      div.classList.add("hidden");
    });
    document.querySelectorAll(".artist-item").forEach((item) => {
      item.classList.remove("bg-black", "text-white");
    });
  }

  // Toggle venues section
  btnVenues.addEventListener("click", () => {
    hideDateSection();
    btnDate.style.backgroundColor = "";
    btnDate.style.color = "";
    venuesSection.classList.remove("hidden");
    actsSection.classList.add("hidden");
    btnVenues.classList.add("bg-black", "text-white");
    btnActs.classList.remove("bg-black", "text-white");
    btnDate.classList.remove("bg-black", "text-white");
    closeAllArtistGigs();
  });

  // Toggle venues gigs
  const venueItems = document.querySelectorAll(".venue-item");
  venueItems.forEach((item) => {
    item.addEventListener("click", () => {
      const venue = item.getAttribute("data-venue");
      const targetDiv = document.querySelector(
        `.gigs-for-venue[data-venue="${venue}"]`
      );
      if (!targetDiv) return;
      targetDiv.innerHTML = buildDateGigsHtml(window.ALL_GIGS.filter((g) => g.venue && g.venue.id === venue));
      const wasHidden = targetDiv.classList.contains("hidden");
      closeAllVenueGigs();
      if (wasHidden) {
        targetDiv.classList.remove("hidden");
        item.classList.add("bg-black", "text-white");
      }
    });
  });

  function closeAllVenueGigs() {
    document.querySelectorAll(".gigs-for-venue").forEach((div) => {
      div.classList.add("hidden");
    });
    document.querySelectorAll(".venue-item").forEach((item) => {
      item.classList.remove("bg-black", "text-white");
    });
  }

  // Toggle gigs by date
  btnDate.addEventListener("click", () => {
    const chosenDate = datePicker.value;
    actsSection.classList.add("hidden");
    venuesSection.classList.add("hidden");
    btnActs.classList.remove("bg-black", "text-white");
    btnVenues.classList.remove("bg-black", "text-white");
    btnDate.classList.add("bg-black", "text-white");
    dateSection.classList.remove("hidden");
    showGigsByDate(chosenDate);
  });

  // Toggle change to gigs by date
  datePicker.addEventListener("change", () => {
    const chosenDate = datePicker.value;
    showGigsByDate(chosenDate);
  });

  function showGigsByDate(chosenDate) {
    const filtered = window.ALL_GIGS.filter(
      (gig) => gig.gigStartDate.slice(0, 10) === chosenDate
    );
    dateGigs.innerHTML = buildDateGigsHtml(filtered);
  }

  function hideDateSection() {
    dateSection.classList.add("hidden");
    dateGigs.innerHTML = "";
  }

  function buildDateGigsHtml(gigsArray) {
    if (!gigsArray.length) {
      return `<p class="text-xl">No gigs :(</p>`;
    }

    let html =
    gigsArray.length === 1 ? 
    `<div class="w-full">` :
    `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 w-full">`;

    gigsArray.forEach((g) => {
      html += `
        <div class="border border-black p-3 flex flex-col">
          <div>
            <div class="mb-8">
              <div class="font-bold text-xl">${g.promotedName}</div>
              ${
                g.performersListJson && g.performersListJson.length
                  ? `<div class="text-sm line-clamp-4">
                      w/ ${g.performersListJson.join(", ")}
                    </div>`
                  : ""
              }
            </div>
          </div>
          <div class="mt-auto text-lg opacity-60">
            <span>@</span>
            <span class="font-bold">${g.venue ? g.venue.venueName : ""}</span>
          </div>
          <div class="mt-auto text-lg opacity-60">
            <span>${new Date(g.gigStartDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}</span>
          </div>
        </div>
    `;
    });
    html += `</div>`;
    return html;
  }

  // Semi 'paginate" venue gigs section for large gig lists
  function buildVenueGigsHtml(gigsArray, venueName, showAll = false) {
    let html = "";
    const gigsToDisplay = showAll ? gigsArray : gigsArray.slice(0, 24);

    gigsToDisplay.forEach((g) => {
      html += `
        <div class="border border-black p-3 flex flex-col">
          <div>
            <div class="mb-8">
              <div class="font-bold text-xl">${g.promotedName}</div>
              ${
                g.performersListJson && g.performersListJson.length
                  ? `<div class="text-sm line-clamp-4">
                      w/ ${g.performersListJson.join(", ")}
                    </div>`
                  : ""
              }
            </div>
          </div>
          <div class="mt-auto text-lg opacity-60">
            <span>${new Date(g.gigStartDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}</span>
          </div>
        </div>
      `;
    });

    if (!showAll && gigsArray.length > 24) {
      html += `
        <div
          class="border border-black p-2 flex flex-col justify-center items-center cursor-pointer see-all-gigs"
          data-venue="${venueName}"
        >
          <span class="font bold text-2xl">see all gigs for this venue</span>
        </div>
      `;
    }

    return html;
  }

  // toggle see all gigs
  venuesSection.addEventListener("click", (event) => {
    const seeAllButton = event.target.closest(".see-all-gigs");
    if (seeAllButton) {
      const venueName = seeAllButton.getAttribute("data-venue");
      const gigsContainer = seeAllButton.parentElement;
      const allGigs = window.ALL_GIGS.filter(
        (gig) => gig.venue.venueName === venueName
      );
      gigsContainer.innerHTML = buildVenueGigsHtml(allGigs, venueName, true);
    }
  });

  let map;

  function fetchPopupContent(id) {
    const g = ALL_GIGS.find((el) => el.id === id);
    return buildDateGigsHtml([g]);
  }
  
  async function initMap() {
    // Create the map centered on Sydney
    map = L.map('map').setView([-33.8148, 151.0017 ], 11);
    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom : 19, 
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
  
    let grp = L.markerClusterGroup();
    window.ALL_GIGS.forEach((el) => {
      if (el.venue && el.venue.lat && el.venue.lon) {
        let m = L.marker([el.venue.lat, el.venue.lon ]);
        m.bindPopup(fetchPopupContent(el.id), {minWidth : 400});
        grp.addLayer(m);
      }
    })
    map.addLayer(grp);
    const heatPoints = window.ALL_VENUES.filter((v) => v.lat && v.lon)
    .map(
      (v) => {
        return [v.lat, v.lon, v.count];
      });
    var heat = L.heatLayer(heatPoints, {minOpacity : 0.3});

    const mapcluster = document.getElementById('mapcluster');
    const mapheat = document.getElementById('mapheat');
    mapcluster.addEventListener('click', (e) => {
      e.preventDefault();
      mapcluster.classList.add('bg-black', 'text-white');
      mapheat.classList.remove('bg-black', 'text-white');
      map.removeLayer(heat);
      map.addLayer(grp);
    });
    mapheat.addEventListener('click', (e) => {
      e.preventDefault();
      mapheat.classList.add('bg-black', 'text-white');
      mapcluster.classList.remove('bg-black', 'text-white');
      map.removeLayer(grp);
      map.addLayer(heat);
    });
  }

  fetch("/venues.json").then((response) => response.json().then((obj) => { window.ALL_VENUES = obj; }));
  fetch("/allgigs.json")
    .then((response) => response.json().then((obj) => window.ALL_GIGS = obj))
    .then(() => {window.ALL_GIGS.forEach((el) => {
      el.venue = window.ALL_VENUES.find((elV) => el.venue.id === elV.id);
    })})
    .then(() => { initMap(); });
});

document.addEventListener("DOMContentLoaded", function(arg) {
});

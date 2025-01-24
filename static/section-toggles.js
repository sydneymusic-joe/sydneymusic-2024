document.addEventListener("DOMContentLoaded", () => {
  const actsSection = document.getElementById("acts-section");
  const venuesSection = document.getElementById("venues-section");
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

  btnActs.classList.add("bg-black", "text-white");

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
    let html = `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">`;

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
            <span class="font-bold">${g.venue.venueName}</span>
          </div>
        </div>
    `;
    });
    html += `</div>`;
    return html;
  }

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
});

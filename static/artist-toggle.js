document.addEventListener("DOMContentLoaded", () => {
  const actsSection = document.getElementById("acts-section");
  const venuesSection = document.getElementById("venues-section");
  const dateSection = document.getElementById("date-section");
  const dateGigs = document.getElementById("date-gigs");
  const btnActs = document.getElementById("toggle-acts");
  const btnVenues = document.getElementById("toggle-venues");
  const datePicker = document.getElementById("date-picker");

  // Toggle Acts Section
  btnActs.addEventListener("click", () => {
    hideDateSection();
    datePicker.value = "";
    datePicker.style.backgroundColor = "";
    datePicker.style.color = "";
    actsSection.classList.remove("hidden");
    venuesSection.classList.add("hidden");
    btnActs.classList.add("bg-black", "text-white");
    btnVenues.classList.remove("bg-black", "text-white");
    closeAllVenueGigs();
  });

  // Toggle Artist Gigs
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

  // Toggle Venues Section
  btnVenues.addEventListener("click", () => {
    hideDateSection();
    datePicker.value = "";
    datePicker.style.backgroundColor = "";
    datePicker.style.color = "";
    venuesSection.classList.remove("hidden");
    actsSection.classList.add("hidden");
    btnVenues.classList.add("bg-black", "text-white");
    btnActs.classList.remove("bg-black", "text-white");
    closeAllArtistGigs();
  });

  // Toggle Venue Gigs
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
    // Optionally reset all gigs containers to show only first 24 gigs
    // This is handled when "See All Gigs" is clicked, so no need to reset here
  }

  btnActs.classList.add("bg-black", "text-white");

  // Date Picker Functionality
  datePicker.addEventListener("change", () => {
    const chosenDate = datePicker.value;
    if (!chosenDate) {
      hideDateSection();
      datePicker.style.backgroundColor = "";
      datePicker.style.color = "";
      return;
    }
    datePicker.style.backgroundColor = "black";
    datePicker.style.color = "white";
    showGigsByDate(chosenDate);
  });

  function showGigsByDate(chosenDate) {
    actsSection.classList.add("hidden");
    venuesSection.classList.add("hidden");
    btnActs.classList.remove("bg-black", "text-white");
    btnVenues.classList.remove("bg-black", "text-white");
    const filtered = window.ALL_GIGS.filter(
      (gig) => gig.gigStartDate.slice(0, 10) === chosenDate
    );
    dateGigs.innerHTML = buildDateGigsHtml(filtered);
    dateSection.classList.remove("hidden");
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
        <div class="border border-black p-2 flex flex-col">
          <div class="font-bold">${g.promotedName}</div>
          ${
            g.performersListJson && g.performersListJson.length
              ? `<div class="font-medium text-sm">
                  w/ ${g.performersListJson.join(", ")}
                </div>`
              : ""
          }
          <div class="mt-2 text-sm">${new Date(
            g.gigStartDate
          ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}</div>
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }

  function buildGigsHtml(gigsArray, venueName, showAll = false) {
    let html = "";
    const gigsToDisplay = showAll ? gigsArray : gigsArray.slice(0, 24);
    gigsToDisplay.forEach((g) => {
      html += `
        <div class="border border-black p-2 flex flex-col">
          <div class="mb-2">
          <div class="font-bold">${g.promotedName}</div>
          ${
            g.performersListJson && g.performersListJson.length
              ? `<div class="font-medium text-sm">
                  w/ ${g.performersListJson.join(", ")}
                </div>`
              : ""
          }
          </div>
          <div class="flex mt-auto">
            <div class="mr-2 pr-2 border-r line-clamp-1">
              ${new Date(g.gigStartDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </div>
            <div class="line-clamp-1">${g.venue.venueName}</div>
          </div>
        </div>
      `;
    });

    // If more than 24 gigs and not showing all, add "See All Gigs" button
    if (!showAll && gigsArray.length > 24) {
      html += `
        <div class="border border-black p-2 flex flex-col justify-center items-center cursor-pointer see-all-gigs" data-venue="${venueName}">
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
      gigsContainer.innerHTML = buildGigsHtml(allGigs, venueName, true);
    }
  });
});

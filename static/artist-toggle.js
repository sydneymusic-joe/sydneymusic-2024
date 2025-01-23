document.addEventListener("DOMContentLoaded", () => {
  const actsSection = document.getElementById("acts-section");
  const venuesSection = document.getElementById("venues-section");
  const dateSection = document.getElementById("date-section");
  const dateGigs = document.getElementById("date-gigs");
  const btnActs = document.getElementById("toggle-acts");
  const btnVenues = document.getElementById("toggle-venues");
  const datePicker = document.getElementById("date-picker");

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

  const artistItems = document.querySelectorAll(".artist-item");
  artistItems.forEach((item) => {
    item.addEventListener("click", () => {
      const artist = item.getAttribute("data-artist");
      const targetDiv = document.querySelector(
        '.gigs-for-artist[data-artist="' + artist + '"]'
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

  const venueItems = document.querySelectorAll(".venue-item");
  venueItems.forEach((item) => {
    item.addEventListener("click", () => {
      const venue = item.getAttribute("data-venue");
      const targetDiv = document.querySelector(
        '.gigs-for-venue[data-venue="' + venue + '"]'
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
        <div class="border border-black p-2">
          <div class="font-bold">${g.promotedName}</div>
          ${
            g.performersListJson && g.performersListJson.length
              ? `<div class="font-medium text-sm">
                  w/ ${g.performersListJson.join(", ")}
                </div>`
              : ""
          }
          <div class="mt-2 text-sm">${g.gigStartDate}</div>
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }
});

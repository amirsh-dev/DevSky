/* =========================================================
   DOM REFERENCES
========================================================= */

const searchInput = document.querySelector("#location-search");
const cityCards = document.querySelectorAll(".city-card");
const themeToggle = document.querySelector("#theme-toggle");
const searchResults = document.querySelector("#search-results");

/* =========================================================
   THEME
========================================================= */

const THEME_KEY = "weather-theme";

function getSystemPreference() {
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getSavedTheme() {
  return localStorage.getItem(THEME_KEY);
}

function getInitialTheme() {
  return getSavedTheme() || getSystemPreference();
}

function applyTheme(theme) {
  const isLight = theme === "light";

  document.body.classList.toggle("light-theme", isLight);
  document.body.classList.toggle("dark-theme", !isLight);

  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute(
    "aria-label",
    isLight
      ? "Switch to dark theme"
      : "Switch to light theme"
  );
}

function initTheme() {
  applyTheme(getInitialTheme());
}

function toggleTheme() {
  const isCurrentlyLight =
    document.body.classList.contains("light-theme");

  const newTheme = isCurrentlyLight ? "dark" : "light";

  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}

/* =========================================================
   CITY SEARCH CONFIGURATION
========================================================= */

const SEARCH_CONFIG = {
  minQueryLength: 2,
  maxResults: 5,
  language: "en",
  apiUrl: "https://geocoding-api.open-meteo.com/v1/search"
};

/* =========================================================
   SEARCH UI
========================================================= */

function showSearchStatus(message) {
  searchResults.style.display = "block";
  searchResults.innerHTML = `
    <div class="search-message">${message}</div>
  `;
}

function hideSearchResults() {
  searchResults.innerHTML = "";
  searchResults.style.display = "none";
}

function buildCityResultHTML(city) {
  const location = [
    city.admin1,
    city.country
  ]
    .filter(Boolean)
    .join(", ");

  return `
    <button
      type="button"
      class="search-result"
      data-latitude="${city.latitude}"
      data-longitude="${city.longitude}"
      data-city="${city.name}"
    >
      <span class="search-result__name">
        ${city.name}
      </span>

      <span class="search-result__location">
        ${location}
      </span>
    </button>
  `;
}

/* =========================================================
   API SEARCH
========================================================= */

async function searchCities(query) {
  if (query.length < SEARCH_CONFIG.minQueryLength) {
    hideSearchResults();
    return;
  }

  showSearchStatus("Searching...");

  try {
    const encodedQuery = encodeURIComponent(query);

    const url =
      `${SEARCH_CONFIG.apiUrl}` +
      `?name=${encodedQuery}` +
      `&count=${SEARCH_CONFIG.maxResults}` +
      `&language=${SEARCH_CONFIG.language}` +
      `&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to search for cities.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      showSearchStatus("No cities found.");
      return;
    }

    searchResults.innerHTML =
      data.results.map(buildCityResultHTML).join("");

    searchResults.style.display = "block";
  } catch (error) {
    console.error("Search error:", error);

    showSearchStatus(
      "Something went wrong. Please try again."
    );
  }
}

/* =========================================================
   SEARCH INPUT
========================================================= */

function handleSearchInput(event) {
  const query = event.target.value.trim();

  searchCities(query);
}

function filterCityCards(event) {
  const query = event.target.value.trim().toLowerCase();

  cityCards.forEach((card) => {
    const cityName = card
      .querySelector(".city-name")
      .textContent
      .toLowerCase();

    card.style.display =
      !query || cityName.includes(query)
        ? ""
        : "none";
  });
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

themeToggle.addEventListener("click", toggleTheme);

searchInput.addEventListener(
  "input",
  handleSearchInput
);

searchInput.addEventListener(
  "input",
  filterCityCards
);

/* =========================================================
   INITIALIZATION
========================================================= */

initTheme();
const OMDB_API_KEY = "cd50eddf";
const MEALDB_URL = "https://www.themealdb.com/api/json/v1/1";

const state = {
  mode: "movies",
  activeFilter: "All",
  results: [],
  saved: loadSaved(),
  loading: false
};

const movieSamples = [
  {
    id: "sample-movie-1",
    title: "The Grand Budapest Hotel",
    year: "2014",
    genre: "Comedy, Drama",
    rating: "8.1",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=85",
    type: "Movie",
    imdbID: ""
  },
  {
    id: "sample-movie-2",
    title: "Interstellar",
    year: "2014",
    genre: "Sci-Fi, Drama",
    rating: "8.7",
    image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=600&q=85",
    type: "Movie",
    imdbID: ""
  },
  {
    id: "sample-movie-3",
    title: "Little Women",
    year: "2019",
    genre: "Drama, Romance",
    rating: "7.8",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=85",
    type: "Movie",
    imdbID: ""
  },
  {
    id: "sample-movie-4",
    title: "The Green Mile",
    year: "1999",
    genre: "Drama, Fantasy",
    rating: "8.6",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=85",
    type: "Movie",
    imdbID: ""
  }
];

const recipeSamples = [
  {
    id: "sample-recipe-1",
    title: "Creamy Garlic Pasta",
    year: "30 min",
    genre: "Italian, Comfort",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=85",
    type: "Recipe",
    mealId: ""
  },
  {
    id: "sample-recipe-2",
    title: "Shakshuka",
    year: "25 min",
    genre: "Breakfast, Vegetarian",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=700&q=85",
    type: "Recipe",
    mealId: ""
  },
  {
    id: "sample-recipe-3",
    title: "Crispy Salmon Bowl",
    year: "35 min",
    genre: "Healthy, Seafood",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85",
    type: "Recipe",
    mealId: ""
  },
  {
    id: "sample-recipe-4",
    title: "Chocolate Lava Cake",
    year: "45 min",
    genre: "Dessert, Baking",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=85",
    type: "Recipe",
    mealId: ""
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const input = $("#searchInput");
const resultsGrid = $("#resultsGrid");
const savedGrid = $("#savedGrid");
const notice = $("#notice");
const searchButton = $("#searchButton");
const savedButton = $("#savedButton");
const savedCount = $("#savedCount");
const savedSection = $("#savedSection");
const resultsSection = $(".results-section");
const detailsModal = $("#detailsModal");
const modalContent = $("#modalContent");

function loadSaved() {
  try {
    return JSON.parse(
      localStorage.getItem("careerghana-cinepantry-saved")
    ) || [];
  } catch {
    return [];
  }
}

function saveSaved() {
  localStorage.setItem(
    "careerghana-cinepantry-saved",
    JSON.stringify(state.saved)
  );
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showNotice(message = "") {
  notice.textContent = message;
}

function isSaved(item) {
  return state.saved.some((saved) => saved.id === item.id);
}

function updateSavedCount() {
  savedCount.textContent = state.saved.length;
}

function getFilters() {
  if (state.mode === "movies") {
    return [
      "All",
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Romance",
      "Sci-Fi"
    ];
  }

  return [
    "All",
    "Quick",
    "Vegetarian",
    "Chicken",
    "Beef",
    "Dessert",
    "Seafood"
  ];
}

function renderFilters() {
  const filters = getFilters();

  $("#filters").innerHTML = filters
    .map(
      (filter) => `
        <button
          class="filter ${filter === state.activeFilter ? "active" : ""}"
          data-filter="${escapeHTML(filter)}"
          type="button"
        >
          ${escapeHTML(filter)}
        </button>
      `
    )
    .join("");

  $$(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      renderFilters();
      renderResults();
    });
  });
}

function itemMatchesFilter(item) {
  const filter = state.activeFilter;

  if (filter === "All") {
    return true;
  }

  if (filter === "Quick" && item.type === "Recipe") {
    const minutes = parseInt(item.year, 10);
    return Number.isFinite(minutes) && minutes <= 30;
  }

  return `${item.genre || ""} ${item.category || ""} ${item.tags || ""}`
    .toLowerCase()
    .includes(filter.toLowerCase());
}

function getVisibleResults(items = state.results) {
  const query = input.value.trim().toLowerCase();

  return items.filter((item) => {
    const searchableText = [
      item.title,
      item.genre,
      item.category,
      item.tags,
      item.actors
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchableText.includes(query)) &&
      itemMatchesFilter(item)
    );
  });
}

function renderCard(item) {
  const saved = isSaved(item);

  return `
    <article
      class="result-card"
      data-id="${escapeHTML(item.id)}"
    >
      <div class="poster">

        <img
          src="${escapeHTML(item.image)}"
          alt="${escapeHTML(item.title)}"
          loading="lazy"
          onerror="this.src='https://placehold.co/600x900/e8f2fc/2374c6?text=No+Image'"
        >

        <button
          class="save-card ${saved ? "saved" : ""}"
          data-action="save"
          data-id="${escapeHTML(item.id)}"
          type="button"
          aria-label="${saved ? "Remove" : "Save"} ${escapeHTML(item.title)}"
        >
          ${saved ? "♥" : "♡"}
        </button>

        <span class="type-pill">
          ${escapeHTML(item.type)}
        </span>
      </div>

      <div class="card-body">

        <div class="card-title-row">
          <h3>${escapeHTML(item.title)}</h3>
          <span class="rating">
            ★ ${escapeHTML(item.rating || "—")}
          </span>
        </div>

        <p>
          ${escapeHTML(item.genre || item.category || "")}
        </p>

        <span class="meta">
          ${escapeHTML(item.year || "")} ·
          ${item.type === "Movie" ? "IMDb" : "TheMealDB"}
        </span>

      </div>
    </article>
  `;
}

function renderResults() {
  const visible = getVisibleResults();
  const query = input.value.trim();

  $("#resultsTitle").textContent = query
    ? `Results for “${query}”`
    : state.mode === "movies"
      ? "Popular right now"
      : "Good things to make";

  $("#sectionEyebrow").textContent =
    state.mode === "movies"
      ? "Curated for you"
      : "From the kitchen";

  $("#resultCount").textContent =
    `${visible.length} picks`;

  if (!visible.length) {
    resultsGrid.innerHTML = `
      <p class="empty-state">
        Nothing matches yet. Try a broader search.
      </p>
    `;
    return;
  }

  resultsGrid.innerHTML = visible
    .map(renderCard)
    .join("");
}

function renderSaved() {
  updateSavedCount();

  if (!state.saved.length) {
    savedGrid.innerHTML = `
      <p class="empty-state">
        You have not saved anything yet.
        Tap ♡ on a movie or recipe to save it.
      </p>
    `;
    return;
  }

  savedGrid.innerHTML = state.saved
    .map(renderCard)
    .join("");
}

function setInitialResults() {
  state.results =
    state.mode === "movies"
      ? [...movieSamples]
      : [...recipeSamples];

  state.activeFilter = "All";

  renderFilters();
  renderResults();
}

function normalizeMovie(movie) {
  return {
    id: movie.imdbID || `movie-${movie.Title}-${movie.Year}`,
    title: movie.Title || "Untitled movie",
    year: movie.Year || "",
    genre: movie.Genre || "Movie",
    rating: movie.imdbRating || "—",
    image:
      movie.Poster && movie.Poster !== "N/A"
        ? movie.Poster
        : movieSamples[0].image,
    type: "Movie",
    imdbID: movie.imdbID || "",
    actors: movie.Actors || ""
  };
}

function normalizeRecipe(meal) {
  const tags = meal.strTags
    ? meal.strTags.replaceAll(",", ", ")
    : "";

  return {
    id: meal.idMeal,
    title: meal.strMeal || "Untitled recipe",
    year: meal.strCategory || "Recipe",
    genre: meal.strArea || meal.strCategory || "Recipe",
    category: meal.strCategory || "",
    tags,
    rating: "—",
    image: meal.strMealThumb || "",
    type: "Recipe",
    mealId: meal.idMeal
  };
}

async function searchMovies(query) {
  if (
    !OMDB_API_KEY ||
    OMDB_API_KEY === "YOUR_VALID_OMDB_API_KEY"
  ) {
    throw new Error(
      "Add your valid OMDb API key in movie.js."
    );
  }

  const url =
    `https://www.omdbapi.com/?apikey=${encodeURIComponent(OMDB_API_KEY)}` +
    `&s=${encodeURIComponent(query)}` +
    `&type=movie&page=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.Response !== "True") {
    throw new Error(
      data.Error || "OMDb could not find any movies."
    );
  }

  return data.Search.map(normalizeMovie);
}

async function searchRecipes(query) {
  const response = await fetch(
    `${MEALDB_URL}/search.php?s=${encodeURIComponent(query)}`
  );

  const data = await response.json();

  if (!data.meals) {
    throw new Error(
      "TheMealDB could not find any recipes."
    );
  }

  return data.meals.map(normalizeRecipe);
}

async function searchAPI() {
  const query = input.value.trim();

  if (!query || state.loading) {
    return;
  }

  state.loading = true;
  searchButton.disabled = true;
  searchButton.textContent = "Searching...";
  showNotice("");

  try {
    state.results =
      state.mode === "movies"
        ? await searchMovies(query)
        : await searchRecipes(query);

    state.activeFilter = "All";

    renderFilters();
    renderResults();

    if (!state.results.length) {
      showNotice("No results found.");
    }
  } catch (error) {
    state.results = [];

    renderResults();

    showNotice(error.message);
  } finally {
    state.loading = false;
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
}

async function getMovieDetails(imdbID) {
  if (!imdbID) {
    throw new Error(
      "This sample movie does not have live details."
    );
  }

  const url =
    `https://www.omdbapi.com/?apikey=${encodeURIComponent(OMDB_API_KEY)}` +
    `&i=${encodeURIComponent(imdbID)}` +
    `&plot=full`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.Response !== "True") {
    throw new Error(
      data.Error || "Movie details could not be loaded."
    );
  }

  return data;
}

async function getRecipeDetails(mealId) {
  if (!mealId) {
    throw new Error(
      "This sample recipe does not have live details."
    );
  }

  const response = await fetch(
    `${MEALDB_URL}/lookup.php?i=${encodeURIComponent(mealId)}`
  );

  const data = await response.json();

  if (!data.meals || !data.meals[0]) {
    throw new Error(
      "Recipe details could not be loaded."
    );
  }

  return data.meals[0];
}

function buildRecipeInstructions(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push(
        `<li>${escapeHTML(
          `${measure || ""} ${ingredient}`.trim()
        )}</li>`
      );
    }
  }

  return `
    <div class="modal-meta">
      <span>
        ${escapeHTML(meal.strCategory || "Recipe")}
      </span>

      <span>
        ${escapeHTML(meal.strArea || "International")}
      </span>
    </div>

    <h3>Ingredients</h3>

    <ul>
      ${ingredients.join("")}
    </ul>

    <h3>Instructions</h3>

    <p>
      ${escapeHTML(
        meal.strInstructions ||
        "No instructions available."
      )}
    </p>
  `;
}

function openMovieModal(movie) {
  const movieItem = normalizeMovie(movie);

  modalContent.innerHTML = `
    <div class="modal-details">

      <img
        class="modal-poster"
        src="${escapeHTML(movieItem.image)}"
        alt="${escapeHTML(movie.Title)}"
      >

      <div class="modal-info">

        <p class="eyebrow">
          Movie details
        </p>

        <h2 id="modalTitle">
          ${escapeHTML(movie.Title)}
        </h2>

        <div class="modal-meta">
          <span>
            ${escapeHTML(movie.Year || "")}
          </span>

          <span>
            ★ ${escapeHTML(movie.imdbRating || "N/A")}
          </span>

          <span>
            ${escapeHTML(movie.Runtime || "")}
          </span>
        </div>

        <p>
          ${escapeHTML(
            movie.Plot ||
            "No plot summary available."
          )}
        </p>

        <p>
          <strong>Genre:</strong>
          ${escapeHTML(movie.Genre || "N/A")}
          <br>

          <strong>Director:</strong>
          ${escapeHTML(movie.Director || "N/A")}
          <br>

          <strong>Actors:</strong>
          ${escapeHTML(movie.Actors || "N/A")}
        </p>

        <button
          class="modal-save"
          id="modalSave"
          type="button"
        >
          ${isSaved(movieItem)
            ? "Remove from saved"
            : "Save movie"}
        </button>

      </div>
    </div>
  `;

  $("#modalSave").addEventListener("click", () => {
    toggleSaved(movieItem);

    $("#modalSave").textContent =
      isSaved(movieItem)
        ? "Remove from saved"
        : "Save movie";
  });
}

function openRecipeModal(meal) {
  const recipeItem = normalizeRecipe(meal);

  modalContent.innerHTML = `
    <div class="modal-details">

      <img
        class="modal-poster"
        src="${escapeHTML(meal.strMealThumb || "")}"
        alt="${escapeHTML(meal.strMeal)}"
      >

      <div class="modal-info">

        <p class="eyebrow">
          Recipe details
        </p>

        <h2 id="modalTitle">
          ${escapeHTML(meal.strMeal)}
        </h2>

        ${buildRecipeInstructions(meal)}

        <button
          class="modal-save"
          id="modalSave"
          type="button"
        >
          ${isSaved(recipeItem)
            ? "Remove from saved"
            : "Save recipe"}
        </button>

      </div>
    </div>
  `;

  $("#modalSave").addEventListener("click", () => {
    toggleSaved(recipeItem);

    $("#modalSave").textContent =
      isSaved(recipeItem)
        ? "Remove from saved"
        : "Save recipe";
  });
}

async function openDetails(item) {
  modalContent.innerHTML = `
    <div class="loading">
      Loading details...
    </div>
  `;

  showModal();

  try {
    if (item.type === "Movie") {
      const details =
        await getMovieDetails(item.imdbID);

      openMovieModal(details);
      return;
    }

    const details =
      await getRecipeDetails(item.mealId);

    openRecipeModal(details);

  } catch (error) {
    modalContent.innerHTML = `
      <div class="loading">
        ${escapeHTML(error.message)}
      </div>
    `;
  }
}

function toggleSaved(item) {
  const index = state.saved.findIndex(
    (saved) => saved.id === item.id
  );

  if (index >= 0) {
    state.saved.splice(index, 1);
  } else {
    state.saved.unshift(item);
  }

  saveSaved();
  updateSavedCount();
  renderResults();
  renderSaved();
}

function showSavedCollection() {
  savedSection.hidden = false;
  resultsSection.hidden = true;

  renderSaved();

  savedSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function hideSavedCollection() {
  savedSection.hidden = true;
  resultsSection.hidden = false;
}

function showModal() {
  detailsModal.classList.add("open");
  detailsModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add("modal-open");
}

function closeModal() {
  detailsModal.classList.remove("open");
  detailsModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove("modal-open");
}

resultsGrid.addEventListener("click", (event) => {
  const saveButton =
    event.target.closest("[data-action='save']");

  if (saveButton) {
    event.stopPropagation();

    const item =
      state.results.find(
        (result) =>
          result.id === saveButton.dataset.id
      ) ||
      state.saved.find(
        (saved) =>
          saved.id === saveButton.dataset.id
      );

    if (item) {
      toggleSaved(item);
    }

    return;
  }

  const card =
    event.target.closest(".result-card");

  if (!card) {
    return;
  }

  const item =
    state.results.find(
      (result) =>
        result.id === card.dataset.id
    );

  if (item) {
    openDetails(item);
  }
});

savedGrid.addEventListener("click", (event) => {
  const saveButton =
    event.target.closest("[data-action='save']");

  if (saveButton) {
    event.stopPropagation();

    const item =
      state.saved.find(
        (saved) =>
          saved.id === saveButton.dataset.id
      );

    if (item) {
      toggleSaved(item);
    }

    return;
  }

  const card =
    event.target.closest(".result-card");

  if (!card) {
    return;
  }

  const item =
    state.saved.find(
      (saved) =>
        saved.id === card.dataset.id
    );

  if (item) {
    openDetails(item);
  }
});

$$(".mode").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;

    input.value = "";

    input.placeholder =
      state.mode === "movies"
        ? "Search by title, actor, or genre..."
        : "Search by dish, ingredient, or cuisine...";

    setInitialResults();
    showNotice("");
  });
});

input.addEventListener("input", () => {
  renderResults();
});

input.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !event.isComposing
  ) {
    event.preventDefault();
    searchAPI();
  }
});

$("#clearButton").addEventListener("click", () => {
  input.value = "";
  showNotice("");
  renderResults();
  input.focus();
});

searchButton.addEventListener(
  "click",
  searchAPI
);

savedButton.addEventListener(
  "click",
  showSavedCollection
);

$("#closeSaved").addEventListener(
  "click",
  () => {
    hideSavedCollection();

    $("#discover").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
);

$("#modalClose").addEventListener(
  "click",
  closeModal
);

detailsModal.addEventListener(
  "click",
  (event) => {
    if (
      event.target.matches(
        "[data-close-modal]"
      )
    ) {
      closeModal();
    }
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  }
);

updateSavedCount();
setInitialResults();
renderSaved();
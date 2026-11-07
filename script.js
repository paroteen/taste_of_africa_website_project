/* ==========================================================
   Tastes of Africa — shared JavaScript
   1. Mobile navigation toggle
   2. Interactive recipe filter
   3. "Add to Favorites" with localStorage
   4. Contact form validation & feedback
   5. Newsletter signup feedback
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  setupNavigation();
  setupFavorites();
  setupRecipeFilter();
  setupContactForm();
  setupNewsletter();
});

/* ---------- 1. Mobile navigation ---------- */

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen);
  });
}

/* ---------- 3. Favorites (localStorage) ---------- */

const FAVORITES_KEY = "tastesOfAfricaFavorites";

// Read the saved list of recipe IDs. Returns [] if nothing is saved.
function getFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    // Storage can be unavailable (e.g. private browsing); the button still toggles.
  }
}

// Update one button so it matches whether its recipe is a favorite.
function renderFavoriteButton(button, isFavorite) {
  button.classList.toggle("is-favorite", isFavorite);
  button.setAttribute("aria-pressed", isFavorite);
  button.querySelector(".fav-label").textContent = isFavorite ? "Favorited" : "Favorite";
}

function setupFavorites() {
  const buttons = document.querySelectorAll(".fav-btn");
  if (buttons.length === 0) return;

  // Restore saved favorites when the page loads.
  const favorites = getFavorites();
  for (const button of buttons) {
    renderFavoriteButton(button, favorites.includes(button.dataset.id));
  }

  for (const button of buttons) {
    button.addEventListener("click", function () {
      const recipeId = button.dataset.id;
      let current = getFavorites();
      const isNowFavorite = !current.includes(recipeId);

      if (isNowFavorite) {
        current.push(recipeId);
      } else {
        current = current.filter(function (id) {
          return id !== recipeId;
        });
      }
      saveFavorites(current);

      // The same recipe can appear more than once on a page, so update every match.
      for (const other of buttons) {
        if (other.dataset.id === recipeId) {
          renderFavoriteButton(other, isNowFavorite);
        }
      }

      // If the "Favorites" filter is active, refresh the list straight away.
      const activeFilter = document.querySelector(".filter-btn.active");
      if (activeFilter && activeFilter.dataset.filter === "favorites") {
        applyFilter("favorites");
      }
    });
  }
}

/* ---------- 2. Recipe filter ---------- */

function applyFilter(filter) {
  const cards = document.querySelectorAll(".recipe-card[data-region]");
  const emptyMessage = document.querySelector("#no-recipes");
  const favorites = getFavorites();
  let visibleCount = 0;

  // Loop over every card and show or hide it.
  for (const card of cards) {
    let matches;
    if (filter === "all") {
      matches = true;
    } else if (filter === "favorites") {
      matches = favorites.includes(card.dataset.id);
    } else {
      matches = card.dataset.region === filter;
    }

    card.classList.toggle("hidden", !matches);
    if (matches) visibleCount++;
  }

  if (emptyMessage) {
    emptyMessage.classList.toggle("hidden", visibleCount > 0);
  }
}

function setupRecipeFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  if (filterButtons.length === 0) return;

  for (const button of filterButtons) {
    button.addEventListener("click", function () {
      for (const other of filterButtons) {
        other.classList.remove("active");
        other.setAttribute("aria-pressed", "false");
      }
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      applyFilter(button.dataset.filter);
    });
  }
}

/* ---------- 4. Contact form validation ---------- */

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const nameInput = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  const countrySelect = form.querySelector("#country");
  const messageInput = form.querySelector("#message");
  const counter = form.querySelector("#message-count");
  const success = document.querySelector("#form-success");
  const MIN_MESSAGE_LENGTH = 20;

  // JavaScript shows the feedback, so switch off the browser's own bubbles.
  form.setAttribute("novalidate", "");

  function setError(field, message) {
    const errorElement = form.querySelector("#" + field.id + "-error");
    errorElement.textContent = message;
    field.classList.toggle("invalid", message !== "");
    field.setAttribute("aria-invalid", message !== "");
  }

  // Live character counter for the message field.
  messageInput.addEventListener("input", function () {
    const length = messageInput.value.trim().length;
    counter.textContent = length + " characters (more than " + MIN_MESSAGE_LENGTH + " needed)";
  });

  form.addEventListener("submit", function (event) {
    // Stop the form from submitting and reloading the page.
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let firstInvalid = null;

    function check(field, isValid, errorText) {
      setError(field, isValid ? "" : errorText);
      if (!isValid && !firstInvalid) firstInvalid = field;
    }

    check(nameInput, name !== "", "Please enter your name.");
    check(emailInput, emailPattern.test(email), "Please enter a valid email address.");
    check(countrySelect, countrySelect.value !== "", "Please choose your country.");
    check(
      messageInput,
      message.length > MIN_MESSAGE_LENGTH,
      "Your message must be more than " + MIN_MESSAGE_LENGTH + " characters (currently " + message.length + ")."
    );

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Success: hide the form and show a message built from the user's name.
    form.classList.add("hidden");
    success.textContent = "Thank you, " + name + "! We've received your message.";
    success.classList.remove("hidden");
    success.focus();
  });
}

/* ---------- 5. Newsletter signup ---------- */

function setupNewsletter() {
  const form = document.querySelector("#newsletter-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = form.querySelector("input[type='email']").value.trim();
    const feedback = document.querySelector("#newsletter-feedback");
    feedback.textContent = "Asante! " + email + " is on the list.";
    form.reset();
  });
}

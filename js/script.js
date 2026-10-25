// @ts-check

/**
 * @fileoverview NATO Phonetic Generator - Core Application Logic & Services
 * =========================================================================
 * This client-side module powers the NATO Phonetic Generator application.
 * It transforms raw text, aviation callsigns, and codes into the official
 * International Radiotelephony Spelling Alphabet (NATO / ICAO / ITU) with
 * syllable pronunciation guides, Morse code representations, sequential audio
 * speech playback with real-time visual tile highlighting, local favourites
 * bookmarking, dark/light theme switching, and keyboard navigation.
 *
 * Architecture Overview:
 * ----------------------
 * 1. Phonetic Data Models: Dictionary of official codewords, pronunciations, and Morse code.
 * 2. Storage & State: Application state, theme preference, and localStorage favourites.
 * 3. Theme Management: Dark/light/system detection and seamless switching.
 * 4. Toast Notifications: Accessible non-blocking status alerts.
 * 5. Conversion Engine: Live text-to-phonetic rendering with badges and plain-text modes.
 * 6. Text-to-Speech (TTS): Web Speech API voice synthesis with active-word highlight.
 * 7. Favourites System: LocalStorage bookmarking manager with dialog inspection.
 * 8. Reference Chart: Dynamically generated lookup table with per-letter audio preview.
 * 9. Dialog Management: Native HTML5 dialogs with closedby and click-outside dismissal.
 * 10. Event Listeners & Shortcuts: Power-user keyboard bindings and input handling.
 * 11. Service Worker: PWA offline caching registration.
 * 12. Application Bootstrap: DOM lifecycle initialization.
 *
 * @author Guilherme Marques (https://guinuxbr.com)
 * @license GNU GPLv3
 */

// ==========================================================================
// Type Definitions (JSDoc Data Models)
// ==========================================================================

/**
 * Phonetic codeword metadata entry.
 * @typedef {Object} PhoneticEntry
 * @property {string} word - The official NATO / ICAO codeword (e.g. "Alfa", "Bravo").
 * @property {string} pronunciation - Syllable stress pronunciation guide (e.g. "AL-FAH").
 * @property {string} morse - International Morse code dots and dashes (e.g. "· —").
 * @property {boolean} [isSpecial] - Whether the character represents whitespace or punctuation.
 */

/**
 * Converted character token for rendering and speech playback.
 * @typedef {Object} ConvertedToken
 * @property {string} original - The raw character from the input string.
 * @property {string} word - The translated codeword or description.
 * @property {string} pronunciation - The pronunciation hint.
 * @property {string} morse - The Morse code representation.
 * @property {boolean} isSpace - Whether the token is a word separator.
 * @property {boolean} isUnknown - Whether the token had no phonetic entry.
 */

/**
 * Saved favourite conversion record in localStorage.
 * @typedef {Object} FavoriteConversion
 * @property {string} id - Unique timestamp identifier.
 * @property {string} rawText - The original input text.
 * @property {string} plainText - The formatted phonetic output.
 * @property {string} date - Localized timestamp string.
 */

/**
 * Allowed colour theme modes.
 * @typedef {"system" | "light" | "dark"} ThemeMode
 */

/**
 * Allowed toast alert severity types.
 * @typedef {"info" | "success" | "error"} ToastType
 */

// ==========================================================================
// Phonetic & Morse Code Data Sets
// ==========================================================================

/**
 * Official NATO / ICAO / ITU Radiotelephony Spelling Alphabet dictionary.
 * @type {Record<string, PhoneticEntry>}
 */
const NATO_ALPHABET = {
  a: { word: "Alfa", pronunciation: "AL-FAH", morse: "· —" },
  b: { word: "Bravo", pronunciation: "BRAH-VOH", morse: "— · · ·" },
  c: { word: "Charlie", pronunciation: "CHAR-LEE", morse: "— · — ·" },
  d: { word: "Delta", pronunciation: "DELL-TAH", morse: "— · ·" },
  e: { word: "Echo", pronunciation: "EKK-OH", morse: "·" },
  f: { word: "Foxtrot", pronunciation: "FOKS-TROT", morse: "· · — ·" },
  g: { word: "Golf", pronunciation: "GOLF", morse: "— — ·" },
  h: { word: "Hotel", pronunciation: "HOH-TELL", morse: "· · · ·" },
  i: { word: "India", pronunciation: "IN-DEE-AH", morse: "· ·" },
  j: { word: "Juliett", pronunciation: "JEW-LEE-ETT", morse: "· — — —" },
  k: { word: "Kilo", pronunciation: "KEY-LOH", morse: "— · —" },
  l: { word: "Lima", pronunciation: "LEE-MAH", morse: "· — · ·" },
  m: { word: "Mike", pronunciation: "MIKE", morse: "— —" },
  n: { word: "November", pronunciation: "NO-VEM-BER", morse: "— ·" },
  o: { word: "Oscar", pronunciation: "OSS-CAH", morse: "— — —" },
  p: { word: "Papa", pronunciation: "PAH-PAH", morse: "· — — ·" },
  q: { word: "Quebec", pronunciation: "KEH-BECK", morse: "— — · —" },
  r: { word: "Romeo", pronunciation: "ROW-ME-OH", morse: "· — ·" },
  s: { word: "Sierra", pronunciation: "SEE-AIR-RAH", morse: "· · ·" },
  t: { word: "Tango", pronunciation: "TANG-GO", morse: "—" },
  u: { word: "Uniform", pronunciation: "YOU-NEE-FORM", morse: "· · —" },
  v: { word: "Victor", pronunciation: "VIK-TAH", morse: "· · · —" },
  w: { word: "Whiskey", pronunciation: "WISS-KEY", morse: "· — —" },
  x: { word: "X-ray", pronunciation: "ECKS-RAY", morse: "— · · —" },
  y: { word: "Yankee", pronunciation: "YANG-KEY", morse: "— · — —" },
  z: { word: "Zulu", pronunciation: "ZOO-LOO", morse: "— — · ·" },
  "0": { word: "Zero", pronunciation: "ZEE-RO", morse: "— — — — —" },
  "1": { word: "One", pronunciation: "WUN", morse: "· — — — —" },
  "2": { word: "Two", pronunciation: "TOO", morse: "· · — — —" },
  "3": { word: "Three", pronunciation: "TREE", morse: "· · · — —" },
  "4": { word: "Four", pronunciation: "FOW-ER", morse: "· · · · —" },
  "5": { word: "Five", pronunciation: "FIFE", morse: "· · · · ·" },
  "6": { word: "Six", pronunciation: "SIX", morse: "— · · · ·" },
  "7": { word: "Seven", pronunciation: "SEV-EN", morse: "— — · · ·" },
  "8": { word: "Eight", pronunciation: "AIT", morse: "— — — · ·" },
  "9": { word: "Nine", pronunciation: "NIN-ER", morse: "— — — — ·" },
  " ": { word: "(space)", pronunciation: "PAUSE", morse: "/", isSpecial: true },
  "-": { word: "Dash", pronunciation: "HYPHEN", morse: "— · · · —", isSpecial: true },
  ".": { word: "Decimal", pronunciation: "FULL STOP", morse: "· — · — · —", isSpecial: true },
  "/": { word: "Stroke", pronunciation: "SLASH", morse: "— · · — ·", isSpecial: true },
  "@": { word: "At", pronunciation: "AT SIGN", morse: "· — — · — ·", isSpecial: true },
  "_": { word: "Underscore", pronunciation: "UNDERSCORE", morse: "· · — — · —", isSpecial: true },
  "?": { word: "Question", pronunciation: "QUERY", morse: "· · — — · ·", isSpecial: true }
};

/**
 * Random sample flight callsigns, codes, and aviation phrases.
 * @type {string[]}
 */
const RANDOM_SAMPLES = [
  "BRAVO-SIX",
  "DELTA-942",
  "G4ZTR",
  "MAYDAY",
  "OSCAR-MIKE",
  "ALPHA-TEAM",
  "AIRFORCE-ONE",
  "SPEEDBIRD-117",
  "ROGER-THAT",
  "VICTOR-ECHO"
];

// ==========================================================================
// DOM Element References
// ==========================================================================

/**
 * Centralized dictionary of cached DOM element references.
 */
const dom = {
  // Input
  inputText: /** @type {HTMLInputElement} */ (document.getElementById("input-text")),
  btnClear: /** @type {HTMLButtonElement} */ (document.getElementById("btn-clear")),
  charCounter: /** @type {HTMLElement} */ (document.getElementById("char-counter")),
  samplePills: /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll(".btn-pill")),

  // View mode
  btnModeTiles: /** @type {HTMLButtonElement} */ (document.getElementById("btn-mode-tiles")),
  btnModePlain: /** @type {HTMLButtonElement} */ (document.getElementById("btn-mode-plain")),

  // Output containers
  resultsCard: /** @type {HTMLElement} */ (document.getElementById("results-card")),
  resultsEmpty: /** @type {HTMLElement} */ (document.getElementById("results-empty")),
  tilesContainer: /** @type {HTMLElement} */ (document.getElementById("tiles-container")),
  plainContainer: /** @type {HTMLElement} */ (document.getElementById("plain-container")),

  // Speech controls
  btnSpeak: /** @type {HTMLButtonElement} */ (document.getElementById("btn-speak")),
  iconSpeak: /** @type {HTMLElement} */ (document.getElementById("icon-speak")),
  labelSpeak: /** @type {HTMLElement} */ (document.getElementById("label-speak")),
  rateSlider: /** @type {HTMLInputElement} */ (document.getElementById("rate-slider")),
  rateValuePill: /** @type {HTMLElement} */ (document.getElementById("rate-value-pill")),

  // Actions
  btnCopy: /** @type {HTMLButtonElement} */ (document.getElementById("btn-copy")),
  btnFavorite: /** @type {HTMLButtonElement} */ (document.getElementById("btn-favorite")),
  iconFavorite: /** @type {HTMLElement} */ (document.getElementById("icon-favorite")),
  labelFavorite: /** @type {HTMLElement} */ (document.getElementById("label-favorite")),
  btnRandom: /** @type {HTMLButtonElement} */ (document.getElementById("btn-random")),
  btnShare: /** @type {HTMLButtonElement} */ (document.getElementById("btn-share")),

  // Header Nav
  btnThemeToggle: /** @type {HTMLButtonElement} */ (document.getElementById("btn-theme-toggle")),
  iconTheme: /** @type {HTMLElement} */ (document.getElementById("icon-theme")),
  btnHistoryToggle: /** @type {HTMLButtonElement} */ (document.getElementById("btn-history-toggle")),
  historyBadge: /** @type {HTMLElement} */ (document.getElementById("history-badge")),
  btnChartToggle: /** @type {HTMLButtonElement} */ (document.getElementById("btn-chart-toggle")),
  btnShortcutsToggle: /** @type {HTMLButtonElement} */ (document.getElementById("btn-shortcuts-toggle")),

  // Dialogs
  dialogChart: /** @type {HTMLDialogElement} */ (document.getElementById("dialog-chart")),
  chartTableBody: /** @type {HTMLElement} */ (document.getElementById("chart-table-body")),
  dialogHistory: /** @type {HTMLDialogElement} */ (document.getElementById("dialog-history")),
  historyListContainer: /** @type {HTMLElement} */ (document.getElementById("history-list-container")),
  btnClearHistory: /** @type {HTMLButtonElement} */ (document.getElementById("btn-clear-history")),
  dialogShortcuts: /** @type {HTMLDialogElement} */ (document.getElementById("dialog-shortcuts")),

  // Toast
  toastContainer: /** @type {HTMLElement} */ (document.getElementById("toast-container"))
};

// ==========================================================================
// Application State
// ==========================================================================

const state = {
  currentInput: "",
  /** @type {ConvertedToken[]} */
  tokens: [],
  /** @type {"tiles" | "plain"} */
  viewMode: "tiles",
  isSpeaking: false,
  speechIndex: 0,
  speechRate: 1.0,
  /** @type {FavoriteConversion[]} */
  favorites: []
};

// ==========================================================================
// Theme Management
// ==========================================================================

/**
 * Initializes and binds colour theme preference.
 */
function initTheme() {
  const savedTheme = /** @type {ThemeMode | null} */ (localStorage.getItem("theme")) || "system";
  applyTheme(savedTheme);

  // React to OS changes when system theme is active
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const currentSetting = localStorage.getItem("theme");
    if (!currentSetting || currentSetting === "system") {
      applyTheme("system");
    }
  });
}

/**
 * Applies the requested theme to document root and updates toggle icon.
 * @param {ThemeMode} theme
 */
function applyTheme(theme) {
  let isDark = false;
  if (theme === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", "system");
  } else {
    isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }

  // Update theme icon
  if (dom.iconTheme) {
    dom.iconTheme.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    dom.btnThemeToggle.title = isDark ? "Switch to Light Theme (T)" : "Switch to Dark Theme (T)";
  }
}

/**
 * Cycles between theme modes.
 */
function toggleTheme() {
  const currentAttr = document.documentElement.getAttribute("data-theme") || "system";
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  /** @type {ThemeMode} */
  let newTheme;
  if (currentAttr === "system") {
    newTheme = systemPrefersDark ? "light" : "dark";
  } else if (currentAttr === "dark") {
    newTheme = "light";
  } else {
    newTheme = "dark";
  }

  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme} theme`, "info");
}

// ==========================================================================
// Toast Notifications
// ==========================================================================

/**
 * Displays a non-blocking toast notification.
 * @param {string} message - Content message.
 * @param {ToastType} [type="info"] - Notification severity level.
 * @param {number} [duration=2500] - Lifespan in milliseconds.
 */
function showToast(message, type = "info", duration = 2500) {
  if (!dom.toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconClass = "fa-solid fa-circle-info";
  if (type === "success") iconClass = "fa-solid fa-circle-check";
  if (type === "error") iconClass = "fa-solid fa-triangle-exclamation";

  toast.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i><span>${message}</span>`;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-out");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, duration);
}

// ==========================================================================
// Conversion Engine
// ==========================================================================

/**
 * Converts a raw text string into phonetic token objects.
 * @param {string} text
 * @returns {ConvertedToken[]}
 */
function convertTextToTokens(text) {
  /** @type {ConvertedToken[]} */
  const tokens = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const lowerChar = char.toLowerCase();

    if (NATO_ALPHABET[lowerChar]) {
      const entry = NATO_ALPHABET[lowerChar];
      tokens.push({
        original: char,
        word: entry.word,
        pronunciation: entry.pronunciation,
        morse: entry.morse,
        isSpace: lowerChar === " ",
        isUnknown: false
      });
    } else {
      // Unmapped character (numbers/symbols not in dictionary)
      tokens.push({
        original: char,
        word: char,
        pronunciation: "-",
        morse: "",
        isSpace: false,
        isUnknown: true
      });
    }
  }

  return tokens;
}

/**
 * Renders the phonetic output into both Badges (Tiles) and Plain Text formats.
 */
function renderResults() {
  const text = dom.inputText.value;
  state.currentInput = text;
  dom.charCounter.textContent = `${text.length} character${text.length === 1 ? "" : "s"}`;

  // If speech is running when input changes, stop it
  if (state.isSpeaking) {
    stopSpeech();
  }

  if (!text.trim()) {
    state.tokens = [];
    dom.resultsEmpty.style.display = "block";
    dom.tilesContainer.style.display = "none";
    dom.plainContainer.style.display = "none";
    dom.tilesContainer.innerHTML = "";
    dom.plainContainer.innerHTML = "";
    updateFavoriteButtonState();
    return;
  }

  state.tokens = convertTextToTokens(text);
  dom.resultsEmpty.style.display = "none";

  // 1. Render Tiles View
  dom.tilesContainer.innerHTML = "";
  state.tokens.forEach((token, index) => {
    if (token.isSpace) {
      const spaceEl = document.createElement("div");
      spaceEl.className = "tile-space";
      spaceEl.textContent = "SPACE";
      spaceEl.setAttribute("data-index", String(index));
      dom.tilesContainer.appendChild(spaceEl);
    } else {
      const tileEl = document.createElement("div");
      tileEl.className = "phonetic-tile";
      tileEl.setAttribute("data-index", String(index));
      tileEl.title = `Char: ${token.original} | Morse: ${token.morse}`;

      tileEl.innerHTML = `
        <div class="tile-top">
          <span class="tile-letter">${token.original.toUpperCase()}</span>
          <span class="tile-word">${token.word}</span>
        </div>
        <span class="tile-pronunciation">${token.pronunciation}</span>
        ${token.morse ? `<span class="tile-morse">${token.morse}</span>` : ""}
      `;

      // Allow clicking a tile to hear that individual letter
      tileEl.addEventListener("click", () => {
        speakSingleWord(token.word);
      });

      dom.tilesContainer.appendChild(tileEl);
    }
  });

  // 2. Render Plain Text View
  dom.plainContainer.innerHTML = "";
  state.tokens.forEach((token, index) => {
    const span = document.createElement("span");
    span.setAttribute("data-plain-index", String(index));

    if (token.isSpace) {
      span.textContent = "  "; // double space for clear separation
    } else {
      span.textContent = `${token.word} `;
    }

    dom.plainContainer.appendChild(span);
  });

  // Apply active view mode visibility
  applyViewMode(state.viewMode);
  updateFavoriteButtonState();
}

/**
 * Toggles between tiles and plain text presentation modes.
 * @param {"tiles" | "plain"} mode
 */
function applyViewMode(mode) {
  state.viewMode = mode;
  if (mode === "tiles") {
    dom.btnModeTiles.classList.add("is-active");
    dom.btnModePlain.classList.remove("is-active");
    if (state.tokens.length > 0) {
      dom.tilesContainer.style.display = "flex";
      dom.plainContainer.style.display = "none";
    }
  } else {
    dom.btnModePlain.classList.add("is-active");
    dom.btnModeTiles.classList.remove("is-active");
    if (state.tokens.length > 0) {
      dom.plainContainer.style.display = "block";
      dom.tilesContainer.style.display = "none";
    }
  }
}

/**
 * Gets formatted plain text of current phonetic translation for copying.
 * @returns {string}
 */
function getFormattedPlainText() {
  if (state.tokens.length === 0) return "";
  return state.tokens
    .map((token) => (token.isSpace ? " " : token.word))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

// ==========================================================================
// Text-to-Speech (TTS) Engine with Synced Highlighting
// ==========================================================================

/**
 * Speaks a single isolated word (used for chart audio preview or tile click).
 * @param {string} word
 */
function speakSingleWord(word) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = state.speechRate;
  window.speechSynthesis.speak(utterance);
}

/**
 * Toggles speech synthesis playback for the full phrase.
 */
function toggleSpeech() {
  if (state.isSpeaking) {
    stopSpeech();
  } else {
    startSpeech();
  }
}

/**
 * Starts sequential word-by-word speech synthesis with DOM element illumination.
 */
function startSpeech() {
  if (!("speechSynthesis" in window)) {
    showToast("Web Speech API is not supported in this browser", "error");
    return;
  }

  if (state.tokens.length === 0) {
    showToast("Enter some text to listen to its pronunciation", "info");
    return;
  }

  window.speechSynthesis.cancel();
  state.isSpeaking = true;
  state.speechIndex = 0;

  dom.btnSpeak.classList.add("is-speaking");
  dom.iconSpeak.className = "fa-solid fa-stop";
  dom.labelSpeak.textContent = "Stop";

  speakNextWord();
}

/**
 * Halts ongoing speech playback and clears active highlight classes.
 */
function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  state.isSpeaking = false;
  state.speechIndex = 0;

  dom.btnSpeak.classList.remove("is-speaking");
  dom.iconSpeak.className = "fa-solid fa-play";
  dom.labelSpeak.textContent = "Listen";

  clearTileHighlights();
}

/**
 * Speaks the next token in sequence with pause delay.
 */
function speakNextWord() {
  if (!state.isSpeaking) return;

  if (state.speechIndex >= state.tokens.length) {
    stopSpeech();
    showToast("Audio playback complete", "success", 1800);
    return;
  }

  const token = state.tokens[state.speechIndex];
  highlightActiveToken(state.speechIndex);

  // If token is whitespace, add a short silence pause
  if (token.isSpace) {
    state.speechIndex++;
    setTimeout(() => {
      speakNextWord();
    }, 250);
    return;
  }

  const wordToSpeak = token.word.replace(/[()]/g, "");
  const utterance = new SpeechSynthesisUtterance(wordToSpeak);
  utterance.rate = state.speechRate;

  utterance.onend = () => {
    state.speechIndex++;
    if (state.isSpeaking) {
      setTimeout(() => {
        speakNextWord();
      }, 160);
    }
  };

  utterance.onerror = () => {
    stopSpeech();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Highlights the active tile and plain text word during speech.
 * @param {number} index
 */
function highlightActiveToken(index) {
  clearTileHighlights();

  const activeTile = dom.tilesContainer.querySelector(`[data-index="${index}"]`);
  if (activeTile) {
    activeTile.classList.add("is-active-speech");
    activeTile.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  const activePlain = dom.plainContainer.querySelector(`[data-plain-index="${index}"]`);
  if (activePlain) {
    activePlain.classList.add("plain-word-highlight");
  }
}

/**
 * Removes active highlighting from all phonetic items.
 */
function clearTileHighlights() {
  dom.tilesContainer.querySelectorAll(".is-active-speech").forEach((el) => {
    el.classList.remove("is-active-speech");
  });
  dom.plainContainer.querySelectorAll(".plain-word-highlight").forEach((el) => {
    el.classList.remove("plain-word-highlight");
  });
}

// ==========================================================================
// Favourites & History System
// ==========================================================================

/**
 * Loads favourites from localStorage.
 */
function loadFavorites() {
  try {
    const stored = localStorage.getItem("nato_favorites");
    state.favorites = stored ? JSON.parse(stored) : [];
  } catch {
    state.favorites = [];
  }
  updateHistoryBadge();
}

/**
 * Persists favourites array to localStorage.
 */
function saveFavorites() {
  try {
    localStorage.setItem("nato_favorites", JSON.stringify(state.favorites));
  } catch (err) {
    console.error("Failed to save favourites to localStorage", err);
  }
  updateHistoryBadge();
  updateFavoriteButtonState();
}

/**
 * Updates the header counter badge for saved favourites.
 */
function updateHistoryBadge() {
  const count = state.favorites.length;
  if (dom.historyBadge) {
    dom.historyBadge.textContent = String(count);
    dom.historyBadge.style.display = count > 0 ? "inline-block" : "none";
  }
}

/**
 * Updates the state of the Favourite button on the main action deck.
 */
function updateFavoriteButtonState() {
  const text = state.currentInput.trim();
  if (!text) {
    dom.iconFavorite.className = "fa-regular fa-heart";
    dom.labelFavorite.textContent = "Favourite";
    return;
  }

  const isFav = state.favorites.some((fav) => fav.rawText.toLowerCase() === text.toLowerCase());
  if (isFav) {
    dom.iconFavorite.className = "fa-solid fa-heart";
    dom.iconFavorite.style.color = "var(--danger)";
    dom.labelFavorite.textContent = "Saved";
  } else {
    dom.iconFavorite.className = "fa-regular fa-heart";
    dom.iconFavorite.style.color = "";
    dom.labelFavorite.textContent = "Favourite";
  }
}

/**
 * Toggles favourite status of current input text.
 */
function toggleFavoriteCurrent() {
  const text = state.currentInput.trim();
  if (!text) {
    showToast("Type some text first to save it to favourites", "info");
    return;
  }

  const existingIndex = state.favorites.findIndex(
    (fav) => fav.rawText.toLowerCase() === text.toLowerCase()
  );

  if (existingIndex !== -1) {
    // Remove from favourites
    state.favorites.splice(existingIndex, 1);
    saveFavorites();
    showToast("Removed from favourites", "info");
  } else {
    // Add to favourites
    const newFav = {
      id: String(Date.now()),
      rawText: text,
      plainText: getFormattedPlainText(),
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };
    state.favorites.unshift(newFav);
    saveFavorites();
    showToast("Saved to favourites!", "success");
  }
}

/**
 * Renders the saved favourites inside the dialog.
 */
function renderHistoryModal() {
  if (!dom.historyListContainer) return;

  if (state.favorites.length === 0) {
    dom.historyListContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-bookmark"></i>
        <p>No saved conversions yet.<br>Click the ❤️ Favourite button to bookmark important codes.</p>
      </div>
    `;
    dom.btnClearHistory.style.display = "none";
    return;
  }

  dom.btnClearHistory.style.display = "inline-flex";
  dom.historyListContainer.innerHTML = "";

  const list = document.createElement("div");
  list.className = "history-list";

  state.favorites.forEach((fav) => {
    const item = document.createElement("div");
    item.className = "history-item";

    item.innerHTML = `
      <div class="history-content" title="Click to load into generator">
        <span class="history-text">${fav.rawText}</span>
        <span class="history-converted">${fav.plainText}</span>
        <span class="history-date">${fav.date}</span>
      </div>
      <div class="history-actions">
        <button type="button" class="btn-action btn-copy-fav" title="Copy phonetic text" aria-label="Copy phonetic text">
          <i class="fa-regular fa-copy"></i>
        </button>
        <button type="button" class="btn-action btn-del-fav" title="Delete bookmark" style="color: var(--danger);" aria-label="Delete bookmark">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;

    // Click on item loads into generator
    const content = item.querySelector(".history-content");
    content?.addEventListener("click", () => {
      dom.inputText.value = fav.rawText;
      renderResults();
      dom.dialogHistory.close();
      showToast(`Loaded "${fav.rawText}"`, "info");
    });

    // Copy action
    const btnCopy = item.querySelector(".btn-copy-fav");
    btnCopy?.addEventListener("click", (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(fav.plainText).then(() => {
        showToast("Copied favourite to clipboard!", "success");
      });
    });

    // Delete action
    const btnDel = item.querySelector(".btn-del-fav");
    btnDel?.addEventListener("click", (e) => {
      e.stopPropagation();
      state.favorites = state.favorites.filter((f) => f.id !== fav.id);
      saveFavorites();
      renderHistoryModal();
      showToast("Deleted favourite", "info");
    });

    list.appendChild(item);
  });

  dom.historyListContainer.appendChild(list);
}

// ==========================================================================
// Reference Alphabet Chart Builder
// ==========================================================================

/**
 * Builds the full searchable NATO alphabet and Morse table into the chart dialog.
 */
function buildReferenceChart() {
  if (!dom.chartTableBody) return;
  dom.chartTableBody.innerHTML = "";

  // Sort keys: letters A-Z, then numbers 0-9
  const keys = Object.keys(NATO_ALPHABET).filter((k) => !NATO_ALPHABET[k].isSpecial);
  keys.sort((a, b) => {
    const isANum = !isNaN(Number(a));
    const isBNum = !isNaN(Number(b));
    if (isANum && !isBNum) return 1;
    if (!isANum && isBNum) return -1;
    return a.localeCompare(b);
  });

  keys.forEach((key) => {
    const entry = NATO_ALPHABET[key];
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="letter-col">${key.toUpperCase()}</td>
      <td class="word-col">${entry.word}</td>
      <td class="pronounce-col">${entry.pronunciation}</td>
      <td class="morse-col">${entry.morse}</td>
      <td>
        <button type="button" class="btn-chart-audio" title="Listen to ${entry.word}" aria-label="Listen to ${entry.word}">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </td>
    `;

    const audioBtn = tr.querySelector(".btn-chart-audio");
    audioBtn?.addEventListener("click", () => {
      speakSingleWord(entry.word);
    });

    dom.chartTableBody.appendChild(tr);
  });
}

// ==========================================================================
// Clipboard, Web Sharing & Samples
// ==========================================================================

/**
 * Copies translated phonetic text to system clipboard.
 */
async function copyToClipboard() {
  const plainText = getFormattedPlainText();
  if (!plainText) {
    showToast("Enter some text first to copy", "info");
    return;
  }

  try {
    await navigator.clipboard.writeText(plainText);
    showToast("Copied NATO phonetics to clipboard!", "success");
  } catch {
    showToast("Could not copy to clipboard", "error");
  }
}

/**
 * Shares NATO conversion via native Web Share API or falls back to clipboard.
 */
async function shareConversion() {
  const plainText = getFormattedPlainText();
  if (!plainText) {
    showToast("Enter some text first to share", "info");
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: "NATO Phonetic Translation",
        text: `NATO phonetic translation for "${state.currentInput}":\n${plainText}`,
        url: window.location.href
      });
    } catch {
      // User cancelled share
    }
  } else {
    await copyToClipboard();
  }
}

/**
 * Generates a random realistic callsign or phrase.
 */
function loadRandomSample() {
  const sample = RANDOM_SAMPLES[Math.floor(Math.random() * RANDOM_SAMPLES.length)];
  dom.inputText.value = sample;
  renderResults();
  showToast(`Sample loaded: ${sample}`, "info");
}

// ==========================================================================
// Dialog Management (Native HTML5 <dialog> with Light-Dismiss Fallback)
// ==========================================================================

/**
 * Opens a modal dialog with accessibility focus management.
 * @param {HTMLDialogElement} dialog
 */
function openModal(dialog) {
  if (!dialog || typeof dialog.showModal !== "function") return;

  if (dialog === dom.dialogHistory) {
    renderHistoryModal();
  }

  dialog.showModal();
}

/**
 * Sets up light-dismiss click-outside listener fallback for dialogs without closedby.
 * @param {HTMLDialogElement} dialog
 */
function setupDialogBackdropDismiss(dialog) {
  if (!dialog) return;

  // Modern-web-guidance fallback for browsers lacking closedBy support
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isDialogContent =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!isDialogContent) {
      dialog.close();
    }
  });
}

// ==========================================================================
// Centralized Event Listeners & Keyboard Shortcuts
// ==========================================================================

/**
 * Attaches all DOM event listeners and power-user keyboard shortcuts.
 */
function attachEventListeners() {
  // 1. Input events
  dom.inputText.addEventListener("input", renderResults);

  dom.btnClear.addEventListener("click", () => {
    dom.inputText.value = "";
    dom.inputText.focus();
    renderResults();
    showToast("Input cleared", "info", 1500);
  });

  // 2. Sample pills
  dom.samplePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const sample = pill.getAttribute("data-sample");
      if (sample) {
        dom.inputText.value = sample;
        renderResults();
        showToast(`Loaded sample: ${sample}`, "info");
      }
    });
  });

  // 3. View mode buttons
  dom.btnModeTiles.addEventListener("click", () => applyViewMode("tiles"));
  dom.btnModePlain.addEventListener("click", () => applyViewMode("plain"));

  // 4. Speech playback & rate slider
  dom.btnSpeak.addEventListener("click", toggleSpeech);

  dom.rateSlider.addEventListener("input", () => {
    const rate = parseFloat(dom.rateSlider.value);
    state.speechRate = rate;
    dom.rateValuePill.textContent = `${rate.toFixed(1)}x`;
  });

  // 5. Actions
  dom.btnCopy.addEventListener("click", copyToClipboard);
  dom.btnFavorite.addEventListener("click", toggleFavoriteCurrent);
  dom.btnRandom.addEventListener("click", loadRandomSample);
  dom.btnShare.addEventListener("click", shareConversion);

  // 6. Header tools
  dom.btnThemeToggle.addEventListener("click", toggleTheme);
  dom.btnHistoryToggle.addEventListener("click", () => openModal(dom.dialogHistory));
  dom.btnChartToggle.addEventListener("click", () => openModal(dom.dialogChart));
  dom.btnShortcutsToggle.addEventListener("click", () => openModal(dom.dialogShortcuts));

  // 7. Dialog close buttons & backdrop dismiss
  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialogId = button.getAttribute("data-close-dialog");
      if (dialogId) {
        const dialog = /** @type {HTMLDialogElement} */ (document.getElementById(dialogId));
        dialog?.close();
      }
    });
  });

  [dom.dialogChart, dom.dialogHistory, dom.dialogShortcuts].forEach((dlg) => {
    setupDialogBackdropDismiss(dlg);
  });

  dom.btnClearHistory?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all saved favourite conversions?")) {
      state.favorites = [];
      saveFavorites();
      renderHistoryModal();
      showToast("Cleared all favourites", "info");
    }
  });

  // 8. Global Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    // If a modal dialog is currently open
    const openDialog = document.querySelector("dialog[open]");

    // Esc closes modal or clears text
    if (e.key === "Escape") {
      if (openDialog) {
        /** @type {HTMLDialogElement} */ (openDialog).close();
        return;
      }
      if (document.activeElement === dom.inputText && dom.inputText.value) {
        dom.inputText.value = "";
        renderResults();
        return;
      }
    }

    // Do not trigger shortcuts when typing inside text input
    if (document.activeElement === dom.inputText) {
      return;
    }

    // If modal is open, don't trigger main action shortcuts
    if (openDialog) return;

    switch (e.key.toLowerCase()) {
      case "/":
        e.preventDefault();
        dom.inputText.focus();
        dom.inputText.select();
        break;
      case "c":
        e.preventDefault();
        copyToClipboard();
        break;
      case "s":
        e.preventDefault();
        toggleSpeech();
        break;
      case "f":
        e.preventDefault();
        toggleFavoriteCurrent();
        break;
      case "r":
        e.preventDefault();
        loadRandomSample();
        break;
      case "a":
        e.preventDefault();
        openModal(dom.dialogChart);
        break;
      case "h":
        e.preventDefault();
        openModal(dom.dialogHistory);
        break;
      case "t":
        e.preventDefault();
        toggleTheme();
        break;
      case "?":
        e.preventDefault();
        openModal(dom.dialogShortcuts);
        break;
    }
  });
}

// ==========================================================================
// Service Worker Registration
// ==========================================================================

/**
 * Registers PWA service worker for offline functionality.
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    });
  }
}

// ==========================================================================
// Application Bootstrap
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadFavorites();
  buildReferenceChart();
  attachEventListeners();
  registerServiceWorker();

  // Populate default sample on first visit if input is empty
  dom.inputText.value = "BRAVO-SIX";
  renderResults();
});
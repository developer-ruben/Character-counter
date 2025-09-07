class ThemeToggle {
  constructor(buttonId, logoSelector, iconSelector) {
    this.themeButton = document.getElementById(buttonId);
    this.body = document.body;
    this.logo = document.querySelector(logoSelector);
    this.buttonIcon = document.querySelector(iconSelector);

    // Define dataset attributes for theme-based image paths
    this.logo.dataset.light = "./assets/images/logo-light-theme.svg";
    this.logo.dataset.dark = "./assets/images/logo-dark-theme.svg";
    this.buttonIcon.dataset.light = "./assets/images/icon-moon.svg";
    this.buttonIcon.dataset.dark = "./assets/images/icon-sun.svg";

    // Load theme preference from localStorage
    this.loadTheme();

    // Bind event listener
    this.themeButton.addEventListener("click", () => this.toggleTheme());
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      this.body.classList.add("light-theme");
      this.updateImages(true);
    }
  }

  toggleTheme() {
    const isLightTheme = this.body.classList.toggle("light-theme");

    // Update images based on theme
    this.updateImages(isLightTheme);

    // Save preference in localStorage
    localStorage.setItem("theme", isLightTheme ? "light" : "dark");
  }

  updateImages(isLight) {
    this.logo.src = isLight ? this.logo.dataset.light : this.logo.dataset.dark;
    this.buttonIcon.src = isLight
      ? this.buttonIcon.dataset.light
      : this.buttonIcon.dataset.dark;
  }
}

class TextAnalyzer {
  constructor() {
    // --- Default State ---
    this.excludeSpaces = false;
    this.charLimit = null;
    this.lettersDisplayCount = 5;

    // --- DOM Elements ---
    this.moreLink = document.getElementById("more");
    this.lessLink = document.getElementById("less");
    this.textInput = document.getElementById("text");
    this.totalCharsEl = document.getElementById("total-chars");
    this.wordCountEl = document.getElementById("word-count");
    this.sentenceCountEl = document.getElementById("sentence-count");
    this.readingTimeEl = document.getElementById("reading-time");
    this.numberEl = document.getElementById("number");
    this.noLettersEl = document.getElementById("no-letters");
    this.lettersEl = document.getElementById("letters");
    this.spacesEl = document.getElementById("spaces");
    this.charactersLimitEl = document.getElementById("character-limit");
    this.charLimitErrorVal = document.getElementById("character-limit-value");

    // Hide more/less links initially
    this.moreLink.style.display = "none";
    this.lessLink.style.display = "none";

    // --- Bind Methods ---
    this.handleTextInput = this.handleTextInput.bind(this);
    this.handleSpacesToggle = this.handleSpacesToggle.bind(this);
    this.handleCharLimitToggle = this.handleCharLimitToggle.bind(this);
    this.handleNumberBlur = this.handleNumberBlur.bind(this);

    // --- Event Listeners ---
    this.textInput.addEventListener("input", this.handleTextInput);
    this.spacesEl.addEventListener("change", this.handleSpacesToggle);
    this.charactersLimitEl.addEventListener(
      "change",
      this.handleCharLimitToggle
    );
    this.numberEl.addEventListener("blur", this.handleNumberBlur);

    this.moreLink.addEventListener("click", () => {
      this.lettersDisplayCount += 5;
      this.updateLetterList(this.textInput.value);
    });

    this.lessLink.addEventListener("click", () => {
      this.lettersDisplayCount = Math.max(5, this.lettersDisplayCount - 5);
      this.updateLetterList(this.textInput.value);
    });
  }

  // --- Event Handlers ---

  handleTextInput(e) {
    const text = e.target.value;

    const totalCharacters = this.getTotalCharacters(text);
    this.totalCharsEl.textContent = totalCharacters;

    const words = text.trim().split(/\s+/).filter(Boolean);
    this.wordCountEl.textContent = words.length;

    const sentences = text
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 0);
    this.sentenceCountEl.textContent = sentences.length;

    const readingTime = this.calculateReadingTime(text);
    this.readingTimeEl.textContent =
      readingTime < 1
        ? "< 1 minute"
        : `${readingTime} minute${readingTime === 1 ? "" : "s"}`;

    if (this.charLimit && totalCharacters > this.charLimit) {
      this.textInput.parentElement.classList.add(
        "text__input-container--error"
      );
      this.charLimitErrorVal.textContent = this.charLimit;
      return;
    } else {
      this.textInput.parentElement.classList.remove(
        "text__input-container--error"
      );
    }

    this.updateLetterList(text);
  }

  handleSpacesToggle(e) {
    this.excludeSpaces = e.target.checked;
    this.totalCharsEl.textContent = this.getTotalCharacters(
      this.textInput.value
    );
  }

  handleCharLimitToggle(e) {
    const isEnabled = e.target.checked;
    this.numberEl.classList.toggle("text__number--visible", isEnabled);

    if (isEnabled) {
      this.numberEl.focus();
    } else {
      this.charLimit = null;
      this.textInput.parentElement.classList.remove(
        "text__input-container--error"
      );
    }
  }

  handleNumberBlur(e) {
    const value = e.target.value.trim();
    if (value === "" || isNaN(value) || +value <= 0) {
      e.target.classList.add("text__number--error");
      this.charLimit = null;
      return;
    }
    e.target.classList.remove("text__number--error");
    this.charLimit = +value;

    // Re-run text input handler to update validations and UI
    this.handleTextInput({ target: this.textInput });
  }

  // --- Utility Methods ---

  /**
   * Returns the count of characters in `text`.
   * If excludeSpaces is true, spaces are not counted.
   */
  getTotalCharacters(text) {
    return this.excludeSpaces ? text.replace(/\s/g, "").length : text.length;
  }

  /**
   * Calculates reading time in minutes based on 1000 characters per minute.
   * Returns a rounded number of minutes.
   */
  calculateReadingTime(text) {
    const averageCharactersPerMinute = 1000;
    return Math.round(text.length / averageCharactersPerMinute);
  }

  /**
   * Updates the displayed list of letters with their frequency percentages.
   * Only the top `lettersDisplayCount` letters (sorted by frequency) are shown.
   */
  updateLetterList(text) {
    const frequencyMap = this.getLetterFrequency(text);

    // Show a "no letters" message if the map is empty
    this.noLettersEl.style.display =
      Object.keys(frequencyMap).length === 0 ? "block" : "none";

    // Clear the current list
    this.lettersEl.innerHTML = "";

    // Get sorted entries and determine display settings
    const entries = Object.entries(frequencyMap);
    const totalLetters = entries.length;
    this.moreLink.style.display =
      totalLetters > this.lettersDisplayCount ? "block" : "none";
    this.lessLink.style.display =
      this.lettersDisplayCount > 5 ? "block" : "none";

    // Render only the top lettersDisplayCount letters
    entries
      .slice(0, this.lettersDisplayCount)
      .forEach(([index, [letter, percentage]]) => {
        const letterDiv = document.createElement("div");
        letterDiv.classList.add("letter");

        letterDiv.innerHTML = `
        <span class="letter__value">${letter.toUpperCase()}</span>
        <div class="progress">
          <div class="progress__bar" style="width: ${percentage};"></div>
        </div>
        <span class="letter__density">${percentage}</span>
      `;
        this.lettersEl.appendChild(letterDiv);
      });
  }

  /**
   * Returns an object mapping each character (in lowercase) found in `text` to its frequency percentage.
   * The results are sorted in descending order by frequency.
   */
  getLetterFrequency(text) {
    if (!text) return {};

    // Count each character in a single pass.
    const counts = {};
    for (const char of text) {
      const lowerChar = char.toLowerCase();
      counts[lowerChar] = (counts[lowerChar] || 0) + 1;
    }

    const totalCount = Object.values(counts).reduce(
      (sum, count) => sum + count,
      0
    );

    // Convert counts into an array sorted in descending order.
    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    // Map counts to percentage strings.
    const frequencyMap = {};
    sortedEntries.forEach(([letter, count], index) => {
      const percentage = ((count / totalCount) * 100).toFixed(2) + "%";
      frequencyMap[index] = [letter, percentage];
    });

    return frequencyMap;
  }
}

const analyzer = new TextAnalyzer();
const theme = new ThemeToggle(
  "theme-button",
  ".header__logo",
  ".header__button-icon"
);

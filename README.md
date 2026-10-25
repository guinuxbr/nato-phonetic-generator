# NATO Phonetic Generator 🛩️

![GitHub repo size](https://img.shields.io/github/repo-size/guinuxbr/nato-phonetic-generator)
![GitHub contributors](https://img.shields.io/github/contributors/guinuxbr/nato-phonetic-generator)
![GitHub stars](https://img.shields.io/github/stars/guinuxbr/nato-phonetic-generator)
![GitHub forks](https://img.shields.io/github/forks/guinuxbr/nato-phonetic-generator)
[![X Follow](https://img.shields.io/badge/X-@guinuxbr-000000?style=flat&logo=x&logoColor=white)](https://x.com/guinuxbr)

A fast, accessible, and feature-packed web application for international radiotelephony spelling conversions (NATO /
ICAO / ITU) with synchronized audio speech pronunciation, Morse code, reference charts, and offline PWA capability.

---

## ✨ Features

- 📡 **Real-Time Phonetic & Morse Conversion**: Instantly converts any text, flight code, or radio callsign as you type.
- 🎴 **Dual Presentation Modes**: Switch smoothly between interactive **NATO Badges** (displaying character, codeword,
  syllable pronunciation guide, and Morse code) and **Plain Text** output.
- 🔊 **Synchronized Text-to-Speech (TTS)**: Built-in Web Speech API voice synthesis that pronounces each phonetic word
  sequentially with real-time visual tile highlighting, pause/stop controls, and speed rate adjustments.
- 📖 **Interactive Reference Chart**: Full searchable lookup table for all 26 alphabet letters and 10 digits with
  official syllable stress and single-click audio pronunciation preview.
- 📋 **One-Click Copy & Sharing**: Instant clipboard copy with floating toast alerts and native Web Share API support.
- ❤️ **Favourites & Saved History**: Bookmark important phrases or callsigns locally in your browser to reload or copy
  anytime.
- 🎲 **Quick Random Samples**: Generate realistic aviation callsigns, codes, and phrases (*BRAVO-SIX, DELTA-942, G4ZTR,
  MAYDAY, OSCAR-MIKE*).
- 🌙 **Dark & Light Mode**: Seamless theme switching with automatic system OS preference detection.
- ⌨️ **Keyboard Navigation**: Comprehensive power-user shortcuts for quick, mouse-free conversions.
- 📲 **PWA & Offline Capable**: Installable as a progressive web app with Service Worker offline caching.
- 🚀 **Automated CI/CD**: Automatic deployment to GitHub Pages via GitHub Actions with pinned commit SHAs.

---

## ⌨️ Keyboard Shortcuts

| Key            | Action                                              |
|:---------------|:----------------------------------------------------|
| <kbd>/</kbd>   | Focus text input box to start typing                |
| <kbd>C</kbd>   | Copy converted NATO text to clipboard               |
| <kbd>S</kbd>   | Listen / Stop audio speech playback                 |
| <kbd>F</kbd>   | Toggle Favourite (Save / Remove bookmark)           |
| <kbd>R</kbd>   | Load a random callsign or sample code               |
| <kbd>A</kbd>   | Open NATO Phonetic & Morse Alphabet Reference Chart |
| <kbd>H</kbd>   | Open Saved Favourites / History manager             |
| <kbd>T</kbd>   | Toggle Dark / Light theme mode                      |
| <kbd>?</kbd>   | Open Keyboard Shortcuts guide                       |
| <kbd>Esc</kbd> | Close active modal dialog or clear text input       |

---

## 🌐 Live Demo

Visit the live app: **[https://natogenerator.guinuxbr.com](https://natogenerator.guinuxbr.com)**

---

## 🛠️ Tech Stack

- **HTML5 & Modern Semantics** with ARIA accessibility compliance and native `<dialog>` overlays
- **CSS3 / Modern Variables & Glassmorphism** (responsive down to 320px, zero layout shift)
- **Vanilla JavaScript (ES6+)** with Web Speech API, Clipboard API, Web Share API, and LocalStorage
- **Font Awesome 6** & **Google Fonts (Poppins & JetBrains Mono)**
- **GitHub Actions** for automated CI/CD deployment

---

## 🤝 Contributing

1. Fork this repository.
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m 'Add awesome feature'`
4. Push to branch: `git push origin feature/awesome-feature`
5. Open a Pull Request.

---

## 👤 Maintainer

- **Guilherme Marques** ([@guinuxbr](https://github.com/guinuxbr)) — [guinuxbr.com](https://guinuxbr.com)

---

## 📜 Licence

This project is licensed under the [GNU GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.html).

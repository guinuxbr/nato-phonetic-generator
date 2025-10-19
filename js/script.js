document.addEventListener('DOMContentLoaded', () => {
    const textToConvertInput = document.querySelector("#text-to-convert");
    const convertedTextP = document.querySelector("#converted-text-p");
    const convertBtn = document.querySelector("#convert-btn");
    const clearBtn = document.querySelector("#clear-btn");
    const speakBtn = document.querySelector("#speak-btn");
    const modalMessage = document.querySelector("#modal-message");
    const modalClose = document.querySelector("#modal-close");
    const rateSlider = document.querySelector("#rate-slider");
    const themeSwitcher = document.querySelector("#theme-switcher");

    textToConvertInput.value = "";
    convertedTextP.value = "";

    const alphabet = {
        "a": "alpha",
        "b": "bravo",
        "c": "charlie",
        "d": "delta",
        "e": "echo",
        "f": "foxtrot",
        "g": "golf",
        "h": "hotel",
        "i": "india",
        "j": "juliet",
        "k": "kilo",
        "l": "lima",
        "m": "mike",
        "n": "november",
        "o": "oscar",
        "p": "papa",
        "q": "quebec",
        "r": "romeo",
        "s": "sierra",
        "t": "tango",
        "u": "uniform",
        "v": "victor",
        "w": "whisky",
        "x": "xray",
        "y": "yankee",
        "z": "zulu",
    };

    const specialChars = {
        ' ': ' (space) ',
        '@': ' (at) ',
        '-': ' (hyphen) ',
        '_': ' (underscore) ',
        '.': ' (dot) ',
    };

    function convert() {
        const textToConvert = textToConvertInput.value;
        if (textToConvert === "") {
            modalMessage.classList.add("is-active");
            return;
        }

        let convertedHtml = "";
        for (const char of textToConvert) {
            const lowerChar = char.toLowerCase();
            if (alphabet[lowerChar]) {
                const word = alphabet[lowerChar];
                convertedHtml += `<span class="first-letter">${word.charAt(0).toUpperCase()}</span>${word.slice(1)} `;
            } else if (specialChars[lowerChar]) {
                convertedHtml += specialChars[lowerChar];
            } else {
                convertedHtml += char;
            }
        }

        convertedTextP.innerHTML = convertedHtml;
        convertedTextP.classList.remove("has-text-grey-light");
    }

    function clear() {
        textToConvertInput.value = "";
        convertedTextP.innerHTML = "Converted text will appear here";
        convertedTextP.classList.add("has-text-grey-light");
    }

    function speak() {
        speechSynthesis.cancel();
        const text = convertedTextP.innerText;
        const words = text.split(" ").filter(word => word.length > 0);
        let i = 0;
        const rate = rateSlider.value;

        function speakWord() {
            if (i < words.length) {
                const utterance = new SpeechSynthesisUtterance(words[i]);
                utterance.rate = rate;
                utterance.onend = function () {
                    i++;
                    setTimeout(function () {
                        speakWord();
                    }, 200); // 200ms pause
                };
                speechSynthesis.speak(utterance);
            }
        }
        speakWord();
    }

    function applyTheme(theme) {
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'system';
        themeSwitcher.value = savedTheme;
        applyTheme(savedTheme);
    }

    convertBtn.addEventListener("click", convert);
    clearBtn.addEventListener("click", clear);
    speakBtn.addEventListener("click", speak);

    modalClose.addEventListener("click", function () {
        modalMessage.classList.remove("is-active");
    });

    themeSwitcher.addEventListener('change', function () {
        const selectedTheme = themeSwitcher.value;
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (themeSwitcher.value === 'system') {
            applyTheme('system');
        }
    });

    initTheme();
});
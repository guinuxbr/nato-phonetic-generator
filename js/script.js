document.querySelector("#text-to-convert").value = "";
document.querySelector("#converted-text-p").value = "";
let convertBtn = document.querySelector("#convert-btn");
let clearBtn = document.querySelector("#clear-btn");
let modalMessage = document.querySelector("#modal-message");
let modalClose = document.querySelector("#modal-close");

let alphabet = {
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

convertBtn.addEventListener("click", convert);
clearBtn.addEventListener("click", clear);

modalClose.addEventListener("click", function() {
    modalMessage.classList.remove("is-active")  
});

function convert() {
    const textToConvert = document.querySelector("#text-to-convert").value;
    if (textToConvert === "") {
        modalMessage.classList.add("is-active");
    } else {
        let convertedText = document.querySelector("#converted-text-p");

        convertedText.classList.remove("has-text-grey-light");
        convertedText.classList.add("has-text-black");
        
        convertedText.innerHTML = "";

        for (let index = 0; index < textToConvert.length; index++) {
            const letter = textToConvert.charAt(index).toLowerCase();

            if (letter in alphabet) {
                firstLetter = alphabet[letter].charAt(0).bold().toUpperCase().fontcolor("#00d1b2");
                convertedText.innerHTML += `${firstLetter}${alphabet[letter].slice(1)} `;
            } else if (letter === " ") {
                convertedText.innerHTML += ` (space) `;
            } else if (letter === "@") {
                convertedText.innerHTML += ` (at) `;
            } else if (letter === "-") {
                convertedText.innerHTML += ` (hyphen) `;
            } else if (letter === "_") {
                convertedText.innerHTML += ` (underscore) `;
            } else if (letter === ".") {
                convertedText.innerHTML += ` (dot) `;
            } else {
                convertedText.innerHTML += `${letter}`;
            }
        }
    }
}


function clear() {
    // Clear the text fields by refreshing the page
    window.location.reload();
}
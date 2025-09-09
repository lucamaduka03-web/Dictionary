const url = "https://api.dictionaryapi.dev/api/v2/entries/en/"; // Corrected URL structure
const resultDiv = document.getElementById("result"); // Renamed to avoid conflict with API response 'data'
const soundElement = document.getElementById("sound");
const searchBtn = document.getElementById("search-btn");
const inpWord = document.getElementById("inp-word");

// --- Configuration for reducing output ---
const MAX_MEANINGS_TO_DISPLAY = 2; // Display only the first two meaning
const MAX_DEFINITIONS_PER_MEANING = 2; // Display up to 2 definitions per meaning
const MAX_EXAMPLES_PER_DEFINITION = 2; // Display up to 1 example per definition
// --- End Configuration ---

// Function to fetch and display word data
async function fetchWordData() {
  let word = inpWord.value.trim().toLowerCase(); // Get the word from input, trim whitespace, and convert to lowercase

  if (word === "") {
    resultDiv.innerHTML = `<h3 class="error">Please enter a word.</h3>`;
    return;
  }

  try {
    resultDiv.innerHTML = `<h3 class="loading">Searching...</h3>`; // Show loading state
    const response = await fetch(`${url}${word}`);
    const data = await response.json(); // Correctly call .json()

    // Check if data is an array and has at least one entry, or if it's an error object
    if (data.title === "No Definitions Found" || data.length === 0) {
      resultDiv.innerHTML = `<h3 class="error">Couldn't find the word "${word}".</h3>`;
      return;
    }

    const wordData = data[0]; // Assuming the first entry is the primary one
    const wordText = wordData.word;
    const phoneticText = wordData.phonetic || ""; // Some words might not have phonetic transcription
    const meanings = wordData.meanings;

    // --- DEBUGGING: Log phonetics to console ---
    console.log("Phonetics for " + word + ":", wordData.phonetics);
    // --- END DEBUGGING ---

    // Find ANY available audio pronunciation (less restrictive)
    // You can revert to `p.audio.includes("en-us")` if you specifically need US English audio
    const audio = wordData.phonetics.find((p) => p.audio);
    const audioUrl = audio ? audio.audio : null;

    let html = `
      <div class="word">
        <h3>${wordText}</h3>
        ${
          audioUrl
            ? `<button class="volume-btn"><box-icon name="volume-full"></box-icon></button>`
            : ""
        }
      </div>
      <div class="details">
        <p>${meanings[0].partOfSpeech || ""}</p>
        <p>${phoneticText}</p>
      </div>
    `;

    // Loop through meanings and add definitions and examples, applying limits
    meanings.slice(0, MAX_MEANINGS_TO_DISPLAY).forEach((meaning) => {
      html += `
        <p class="part-of-speech">${meaning.partOfSpeech}</p>
      `;
      meaning.definitions
        .slice(0, MAX_DEFINITIONS_PER_MEANING)
        .forEach((definition, index) => {
          html += `
          <p class="word-meaning">${index + 1}. ${definition.definition}</p>
        `;

          if (definition.example) {
            html += `
            <p class="word-example">"${definition.example}"</p>
          `;
          }
        });
    });

    resultDiv.innerHTML = html;

    // Play sound if available
    if (audioUrl) {
      const volumeBtn = document.querySelector(".volume-btn");
      if (volumeBtn) {
        volumeBtn.addEventListener("click", () => {
          soundElement.src = audioUrl;
          soundElement.play();
        });
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    resultDiv.innerHTML = `<h3 class="error">An error occurred while fetching the definition. Please try again.</h3>`;
  }
}

// Event listener for search button click
searchBtn.addEventListener("click", fetchWordData);

// Event listener for Enter key press on the input field
inpWord.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    fetchWordData();
  }
});

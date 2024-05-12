function loadWordsFromFile(filePath) {
  return fetch(filePath)
    .then((res) => res.text())
    .then((text) => text.split(/\s+/));
}

let studyList = [];

function extractVocabulary() {
  const inputText = document.getElementById("textInput").value;
  const stopWordsFile = "stop_words.txt";
  const commonWordsFile = "common_words.txt";
  const knownWordsFile = "known_words.txt";

  Promise.all([
    loadWordsFromFile(stopWordsFile),
    loadWordsFromFile(commonWordsFile),
    loadWordsFromFile(knownWordsFile),
  ])
    .then(([stopWords, commonWords, knownWords]) => {
      const wordList = inputText
        .replace(/[^a-zA-Z\s]/g, "")
        .toLowerCase()
        .split(/\s+/);

      const uncommonWords = wordList.filter(
        (word) =>
          !stopWords.includes(word) &&
          !commonWords.includes(word) &&
          !knownWords.includes(word) &&
          word.length > 3,
      );

      const outputDiv = document.getElementById("outputDiv");
      outputDiv.innerHTML = "";

      if (uncommonWords.length == 0) {
        outputDiv.innerHTML = "<p>No uncommon words were found.</p>";
      } else {
        studyList = [];
        outputDiv.innerHTML =
          "<h2>Uncommon Words:</h2><ul>" +
          uncommonWords
            .map(
              (word) =>
                `<li class="word" onclick="toggleStudyList('${word}')">${word}</li>`,
            )
            .join("") +
          "</ul>";
        document.getElementById("saveStudyListBtn").disabled = false;
      }
    })
    .catch((err) => console.error(err));
}

function toggleStudyList(word) {
  if (studyList.includes(word)) {
    studyList = studyList.filter((w) => w !== word);
  } else {
    studyList.push(word);
  }
}

function saveStudyList() {
  const studyListDiv = document.getElementById("studyListDiv");
  studyListDiv.innerHTML =
    "<h2>Study List: </h2><ul>" +
    studyList.map((word) => `<li>${word}</li>`).join("") +
    "</ul>";
}

function loadWordsFromFile(filePath) {
  return fetch(filePath)
    .then((res) => res.text())
    .then((text) => text.split(/\s+/));
}

let studyList = [];
const data_dir = "data";

function extractVocabulary() {
  const inputText = document.getElementById("textInput").value;
  const studyListFile = data_dir + "/study_list.txt";
  const commonWordsFile = data_dir + "/common_words.txt";
  const knownWordsFile = data_dir + "/known_words.txt";

  Promise.all([
    loadWordsFromFile(studyListFile),
    loadWordsFromFile(commonWordsFile),
    loadWordsFromFile(knownWordsFile),
  ])
    .then(([studyListWords, commonWords, knownWords]) => {
      const wordList = inputText
        .replace(/[^a-zA-Z\s]/g, "")
        .toLowerCase()
        .split(/\s+/);

      const uncommonWords = wordList.filter(
        (word) =>
          !studyListWords.includes(word) &&
          !commonWords.includes(word) &&
          !knownWords.includes(word) &&
          word.length > 3,
      );

      const outputDiv = document.getElementById("outputDiv");
      outputDiv.innerHTML = "";

      if (uncommonWords.length == 0) {
        outputDiv.innerHTML = "<p>No  words of interest were found.</p>";
        document.getElementById("saveStudyListBtn").style.display = "none";
      } else {
        studyList = [];
        outputDiv.innerHTML =
          "<h2>Uncommon Words:</h2><ul>" +
          uncommonWords
            .map(
              (word) =>
                `<li class="word" onclick="removeFromStudyList('${word}')">${word}</li>`,
            )
            .join("") +
          "</ul>";
        document.getElementById("saveStudyListBtn").style.display =
          "inline-block";
      }
    })
    .catch((err) => console.error(err));
}

function removeFromStudyList(word) {
  if (studyList.includes(word)) {
    studyList = studyList.filter((w) => w !== word);
  } else {
    studyList.push(word);
    document
      .querySelector(`li[onclick="removeFromStudyList('${word}')"]`)
      .remove();
  }
}

function saveStudyList() {
  console.log("Save Study List button clicked");
  const knownWordsFile = "known_words.txt";
  const studyListFile = "study_list.txt";
  const knownWordsToSave = studyList.join("\n");

  const remainingWords = Array.from(
    document.querySelectorAll("#outputDiv li"),
  ).map((li) => li.textContent);
  const studyListToSave = remainingWords.join("\n");

  Promise.all([
    fetch("/save-known-words", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `words=${encodeURIComponent(knownWordsToSave)}`,
    }),
    fetch("/save-study-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `words=${encodeURIComponent(studyListToSave)}`,
    }),
  ])
    .then(([knownWordsResponse, studyListResponse]) =>
      Promise.all([knownWordsResponse.text(), studyListResponse.text()]),
    )
    .then(([knownWordsData, studyListData]) => {
      console.log("Server response (known words):", knownWordsData);
      console.log("Server response (study list):", studyListData);
      const studyListDiv = document.getElementById("studyListDiv");
      studyListDiv.innerHTML =
        "<h2>Study List saved to study_list.txt</h2><ul>" +
        remainingWords.map((word) => `<li>${word}</li>`).join("") +
        "</ul>";
      studyList = [];
      document.getElementById("outputDiv").innerHTML = "";
      document.getElementById("saveStudyListBtn").style.display = "none";
    })
    .catch((err) => console.error(err));
}

function loadWordList(filePath) {
  return fetch(filePath)
    .then((res) => res.text())
    .then((text) => new Set(text.split(/\s+/)));
}

function loadWordsFromFile(filePath) {
  return fetch(filePath)
    .then((res) => res.text())
    .then((text) => text.split(/\s+/));
}

function removeDuplicates(arr) {
  return [...new Set(arr)];
}

let wordsToRemoveList = [];
const data_dir = "data";

function extractVocabulary() {
  const inputText = document.getElementById("textInput").value;
  const studyListFile = data_dir + "/study_list.txt";
  const commonWordsFile = data_dir + "/common_words.txt";
  const knownWordsFile = data_dir + "/known_words.txt";
  const validWordsFile = data_dir + "/words_370k.txt";

  document.getElementById("saveStudyListBtn").style.display = "inline-block";

  Promise.all([
    loadWordsFromFile(studyListFile),
    loadWordsFromFile(commonWordsFile),
    loadWordsFromFile(knownWordsFile),
    loadWordList(validWordsFile),
  ])
    .then(([studyListWords, commonWords, knownWords, validWords]) => {
      const wordList = removeDuplicates(
        inputText
          .replace(/[^a-zA-Z\s]/g, "")
          .toLowerCase()
          .split(/\s+/),
      ).filter((word) => validWords.has(word));

      const uncommonWords = wordList.filter(
        (word) =>
          !studyListWords.includes(word) &&
          !commonWords.includes(word) &&
          !knownWords.includes(word) &&
          word.length > 3,
      );

      const outputDiv = document.getElementById("outputDiv");
      outputDiv.innerHTML = "";
      document.getElementById("extractVocabBtn").style.display = "none";
      document.getElementById("cancelExtractBtn").style.display =
        "inline-block";

      if (uncommonWords.length == 0) {
        outputDiv.innerHTML = "<p>No  words of interest were found.</p>";
        document.getElementById("saveStudyListBtn").style.display = "none";
        document.getElementById("extractVocabBtn").style.display =
          "inline-block";
        document.getElementById("cancelExtractBtn").style.display = "none";
      } else {
        wordsToRemoveList = [];
        outputDiv.innerHTML =
          uncommonWords
            .map(
              (word) =>
                `<span class="word" onclick="removeFromStudyList('${word}')">${word}</span>`,
            )
            .join("") + "</div>";
      }
    })
    .catch((err) => console.error(err));
}

function removeFromStudyList(word) {
  if (wordsToRemoveList.includes(word)) {
    wordsToRemoveList = wordsToRemoveList.filter((w) => w !== word);
  } else {
    wordsToRemoveList.push(word);
    const wordElement = document.querySelector(
      `span.word[onclick="removeFromStudyList('${word}')"]`,
    );
    if (wordElement) {
      wordElement.remove();
    }
  }
  console.log(wordsToRemoveList.length);
  console.log(wordsToRemoveList);
  if (wordsToRemoveList.length == 0) {
    document.getElementById("saveStudyListBtn").style.display = "none";
    document.getElementById("outputDiv").innerHTML = "";
  }
}

function saveStudyList() {
  console.log("Save Study List button clicked");
  const knownWordsFile = "known_words.txt";
  const studyListFile = "study_list.txt";
  const knownWordsToSave = wordsToRemoveList.join("\n");

  const remainingWords = Array.from(
    document.querySelectorAll("#outputDiv .word"),
  ).map((span) => span.textContent);
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
      // const studyListDiv = document.getElementById("studyListDiv");
      // studyListDiv.innerHTML =
      //   "<h2>Study List saved to study_list.txt</h2><ul>" +
      //   remainingWords.map((word) => `<li>${word}</li>`).join("") +
      //   "</ul>";
      wordsToRemoveList = [];
      document.getElementById("outputDiv").innerHTML = "";
      document.getElementById("saveStudyListBtn").style.display = "none";
      document.getElementById("extractVocabBtn").style.display = "inline-block";
      document.getElementById("cancelExtractBtn").style.display = "none";
    })
    .catch((err) => console.error(err));
}

function clearTextBox() {
  document.getElementById("textInput").value = "";
}

function cancelExtract() {
  wordsToRemoveList = [];
  document.getElementById("outputDiv").innerHTML = "";
  document.getElementById("saveStudyListBtn").style.display = "none";
  document.getElementById("extractVocabBtn").style.display = "inline-block";
  document.getElementById("cancelExtractBtn").style.display = "none";
}

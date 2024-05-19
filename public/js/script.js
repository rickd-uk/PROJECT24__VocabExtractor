function loadOxfordWords(filePath) {
  return fetch(filePath)
    .then((res) => res.text())
    .then((text) => new Set(text.split(/\s+/)));
}

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

let lastInputText = "";
let lastUncommonWords = [];

let oxfordWords = new Set();
let validWords = new Set();

Promise.all([
  loadOxfordWords(data_dir + "/oxford_5000_words.txt"),
  loadWordList(data_dir + "/words_370k.txt"),
])
  .then(([oxford, valid]) => {
    oxfordWords = oxford;
    validWords = valid;
  })
  .catch((err) => console.error(err));

function extractVocabulary() {
  const inputText = document.getElementById("textInput").value.trim();

  if (inputText === "") {
    const outputDiv = document.getElementById("outputDiv");
    outputDiv.innerHTML =
      "<p>Please enter some text to extract vocabulary from.</p>";
    return;
  }

  if (inputText === lastInputText) {
    const outputDiv = document.getElementById("outputDiv");
    outputDiv.innerHTML = "";
    document.getElementById("extractVocabBtn").style.display = "none";
    document.getElementById("cancelExtractBtn").style.display = "inline-block";

    const includeOxfordWords =
      document.getElementById("includeOxfordWords").checked;
    const includeValidWords =
      document.getElementById("includeValidWords").checked;

    const filteredUncommonWords = lastUncommonWords
      .filter((word) => !wordsToRemoveList.includes(word))
      .filter((word) => (includeOxfordWords ? oxfordWords.has(word) : true))
      .filter((word) => (includeValidWords ? validWords.has(word) : true));

    if (filteredUncommonWords.length === 0) {
      outputDiv.innerHTML = "<p>No words of interest were found.</p>";
      document.getElementById("saveStudyListBtn").style.display = "none";
      document.getElementById("extractVocabBtn").style.display = "inline-block";
      document.getElementById("cancelExtractBtn").style.display = "none";
    } else {
      outputDiv.innerHTML =
        filteredUncommonWords
          .map(
            (word) =>
              `<span class="word" onclick="toggleRemoveWord('${word}', this);">${word}</span>`,
          )
          .join("") + "</div>";
      document.getElementById("saveStudyListBtn").style.display =
        "inline-block";
    }
    return;
  }

  const studyListFile = data_dir + "/study_list.txt";
  const commonWordsFile = data_dir + "/common_words.txt";
  const knownWordsFile = data_dir + "/known_words.txt";

  document.getElementById("saveStudyListBtn").style.display = "inline-block";
  document.getElementById("saveStudyListBtn").onclick = () => saveStudyList();

  Promise.all([
    loadWordsFromFile(studyListFile),
    loadWordsFromFile(commonWordsFile),
    loadWordsFromFile(knownWordsFile),
  ])
    .then(([studyListWords, commonWords, knownWords]) => {
      const wordList = removeDuplicates(
        inputText
          .replace(/[^a-zA-Z\s]/g, "")
          .toLowerCase()
          .split(/\s+/),
      );

      const includeOxfordWords =
        document.getElementById("includeOxfordWords").checked;
      const includeValidWords =
        document.getElementById("includeValidWords").checked;

      const uncommonWords = wordList.filter(
        (word) =>
          !studyListWords.includes(word) &&
          !commonWords.includes(word) &&
          !knownWords.includes(word) &&
          !wordsToRemoveList.includes(word) &&
          (includeOxfordWords ? oxfordWords.has(word) : true) &&
          (includeValidWords ? validWords.has(word) : true) &&
          word.length > 3,
      );

      lastInputText = inputText;
      lastUncommonWords = uncommonWords.filter(
        (word) => !studyListWords.includes(word),
      );

      const outputDiv = document.getElementById("outputDiv");
      outputDiv.innerHTML = "";
      document.getElementById("extractVocabBtn").style.display = "none";
      document.getElementById("cancelExtractBtn").style.display =
        "inline-block";

      if (uncommonWords.length === 0) {
        outputDiv.innerHTML = "<p>No words of interest were found.</p>";
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
                `<span class="word" onclick="toggleRemoveWord('${word}', this);">${word}</span>`,
            )
            .join("") + "</div>";
      }
    })
    .catch((err) => console.error(err));
}

function toggleRemoveWord(word, element) {
  if (wordsToRemoveList.includes(word)) {
    wordsToRemoveList = wordsToRemoveList.filter((w) => w !== word);
    element.classList.remove("removed");
  } else {
    wordsToRemoveList.push(word);
    element.classList.add("removed");
  }

  if (wordsToRemoveList.length === 0) {
    document.getElementById("saveStudyListBtn").style.display = "none";
  } else {
    document.getElementById("saveStudyListBtn").style.display = "inline-block";
  }
}

function saveStudyList() {
  console.log("Save Study List button clicked");

  const knownWordsFile = "known_words.txt";
  const studyListFile = "study_list.txt";
  const knownWordsToSave = wordsToRemoveList.join("\n");

  const remainingWords = lastUncommonWords.filter(
    (word) => !wordsToRemoveList.includes(word),
  );
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
      lastUncommonWords = [];
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

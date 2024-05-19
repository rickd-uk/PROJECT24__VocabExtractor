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

function updateWordList(
  wordList,
  studyListWords,
  commonWords,
  knownWords,
  oxfordWords,
  validWords,
) {
  const includeOxfordWords =
    document.getElementById("includeOxfordWords").checked;
  const includeValidWords =
    document.getElementById("includeValidWords").checked;
  const outputDiv = document.getElementById("outputDiv");
  const uncommonWords = wordList.filter(
    (word) =>
      !studyListWords.includes(word) &&
      !commonWords.includes(word) &&
      !knownWords.includes(word) &&
      (includeOxfordWords ? oxfordWords.has(word) : true) &&
      (includeValidWords ? validWords.has(word) : true) &&
      word.length > 3,
  );

  outputDiv.innerHTML = "";

  if (uncommonWords.length === 0) {
    outputDiv.innerHTML = "<p>No words of interest were found.</p>";
    document.getElementById("saveStudyListBtn").style.display = "none";
  } else {
    wordsToRemoveList = [];
    outputDiv.innerHTML =
      uncommonWords
        .map(
          (word) =>
            `<span class="word" onclick="removeFromStudyList('${word}', '${oxfordWords}', '${validWords}');">${word}</span>`,
        )
        .join("") + "</div>";
    document.getElementById("saveStudyListBtn").style.display = "inline-block";
  }
}

let wordsToRemoveList = [];
const data_dir = "data";

function extractVocabulary() {
  const inputText = document.getElementById("textInput").value;
  if (inputText === "") {
    const outputDiv = document.getElementById("outputDiv");
    outputDiv.innerHTML =
      "<p>Please enter some text to extract vocabulary from.</p>";
    return;
  }
  const studyListFile = data_dir + "/study_list.txt";
  const commonWordsFile = data_dir + "/common_words.txt";
  const knownWordsFile = data_dir + "/known_words.txt";
  const validWordsFile = data_dir + "/words_370k.txt";
  const oxfordWordsFile = data_dir + "/oxford_5000_words.txt";
  const includeOxfordWords =
    document.getElementById("includeOxfordWords").checked;
  const includeValidWords =
    document.getElementById("includeValidWords").checked;

  document.getElementById("saveStudyListBtn").style.display = "inline-block";
  document.getElementById("saveStudyListBtn").onclick = () => saveStudyList();

  Promise.all([
    loadWordsFromFile(studyListFile),
    loadWordsFromFile(commonWordsFile),
    loadWordsFromFile(knownWordsFile),
    includeOxfordWords
      ? loadOxfordWords(oxfordWordsFile)
      : Promise.resolve(new Set()),
    includeValidWords
      ? loadWordList(validWordsFile)
      : Promise.resolve(new Set()),
  ])
    .then(
      ([studyListWords, commonWords, knownWords, oxfordWords, validWords]) => {
        const wordList = removeDuplicates(
          inputText
            .replace(/[^a-zA-Z\s]/g, "")
            .toLowerCase()
            .split(/\s+/),
        );

        updateWordList(
          wordList,
          studyListWords,
          commonWords,
          knownWords,
          oxfordWords,
          validWords,
        );

        const uncommonWords = wordList.filter(
          (word) =>
            !studyListWords.includes(word) &&
            !commonWords.includes(word) &&
            !knownWords.includes(word) &&
            (includeOxfordWords ? oxfordWords.has(word) : true) &&
            (includeValidWords ? validWords.has(word) : true) &&
            word.length > 3,
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
                  `<span class="word" onclick="removeFromStudyList('${word}');">${word}</span>`,
              )
              .join("") + "</div>";
        }
      },
    )
    .catch((err) => console.error(err));
}

function removeFromStudyList(word, oxfordWords, validWords) {
  if (wordsToRemoveList.includes(word)) {
    wordsToRemoveList = wordsToRemoveList.filter((w) => w !== word);
  } else {
    wordsToRemoveList.push(word);
    const wordElement = document.querySelector(
      `span.word[onclick="removeFromStudyList('${word}', '${oxfordWords}', '${validWords}')"]`,
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
  } else {
    saveStudyList(oxfordWords, validWords);
  }
}

function saveStudyList() {
  console.log("Save Study List button clicked");
  const includeOxfordWords =
    document.getElementById("includeOxfordWords").checked;
  const includeValidWords =
    document.getElementById("includeValidWords").checked;

  const knownWordsFile = "known_words.txt";
  const studyListFile = "study_list.txt";
  const knownWordsToSave = wordsToRemoveList.join("\n");

  const validWordsFile = data_dir + "/words_370k.txt";
  const oxfordWordsFile = data_dir + "/oxford_5000_words.txt";

  Promise.all([
    includeOxfordWords
      ? loadOxfordWords(oxfordWordsFile)
      : Promise.resolve(new Set()),
    includeValidWords
      ? loadWordList(validWordsFile)
      : Promise.resolve(new Set()),
  ])
    .then(([oxfordWords, validWords]) => {
      const remainingWords = Array.from(
        document.querySelectorAll("#outputDiv .word"),
      )
        .map((span) => span.textContent)
        .filter((word) => (includeOxfordWords ? !oxfordWords.has(word) : true))
        .filter((word) => (includeValidWords ? validWords.has(word) : true));
      const studyListToSave = remainingWords.join("\n");

      return Promise.all([
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
      ]);
    })
    .then(([knownWordsResponse, studyListResponse]) =>
      Promise.all([knownWordsResponse.text(), studyListResponse.text()]),
    )
    .then(([knownWordsData, studyListData]) => {
      console.log("Server response (known words):", knownWordsData);
      console.log("Server response (study list):", studyListData);
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

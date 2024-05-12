function extractVocabulary() {
  const inputText = document.getElementById("textInput").value;
  const stopWords = [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "are",
    "was",
    "were" /* add more stop words */,
  ];
  const commonWords = ["common", "word", "list" /* add more common words */];
  const wordList = inputText
    .replace(/[^a-zA-Z\s]/g, "")
    .toLowerCase()
    .split(/\s+/);
  const uncommonWords = wordList.filter(
    (word) =>
      !stopWords.includes(word) &&
      !commonWords.includes(word) &&
      word.length > 3,
  );
  const outputDiv = document.getElementById("outputDiv");
  outputDiv.innerHTML = "";

  if (uncommonWords.length === 0) {
    outputDiv.innerHTML = "<p>No uncommon words found.</p>";
  } else {
    outputDiv.innerHTML =
      "<h2>Uncommon Words:</h2><ul>" +
      uncommonWords.map((word) => `<li>${word}</li>`).join("") +
      "</ul>";
  }
}

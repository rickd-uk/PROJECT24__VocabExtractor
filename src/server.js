const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const saveToFile = (filePath, data, successMessage, errorMessage) => {
  if (data.trim() !== "") {
    try {
      fs.appendFileSync(filePath, `${data}\n`);
      console.log(successMessage);
      return true;
    } catch (err) {
      console.error(errorMessage, err);
      return false;
    }
  } else {
    console.log("No data to save");
    return true;
  }
};

app.post("/save-known-words", (req, res) => {
  console.log("Received POST request to /save-known-words");
  const words = req.body.words;
  console.log("Received known words:", words);

  const filePath = path.join(__dirname, "../public/data/known_words.txt");
  const successMessage = "Known words appended to file successfully";
  const errorMessage = "Error appending to known_words.txt:";

  const success = saveToFile(filePath, words, successMessage, errorMessage);

  if (success) {
    res.status(200).send("Known words saved successfully");
  } else {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/save-study-list", (req, res) => {
  console.log("Received POST request to /save-study-list");
  const words = req.body.words;
  console.log("Received study list words:", words);

  const filePath = path.join(__dirname, "../public/data/study_list.txt");
  const successMessage = "Study list saved to file successfully";
  const errorMessage = "Error writing to study_list.txt:";

  const success = saveToFile(filePath, words, successMessage, errorMessage);

  if (success) {
    res.status(200).send("Study list saved successfully");
  } else {
    res.status(500).send("Internal Server Error");
  }
});

app.use(express.static(path.join(__dirname, "../public")));

const port = process.env.PORT || 3000;
process.env.PORT = port;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

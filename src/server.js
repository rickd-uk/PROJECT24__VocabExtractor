const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/save-known-words", (req, res) => {
  console.log("Received POST request to /save-known-words");
  const words = req.body.words;
  console.log("Received known words:", words);

  fs.appendFile(
    path.join(__dirname, "../public/data/known_words.txt"),
    words + "\n",
    (err) => {
      if (err) {
        console.error("Error appending to known_words.txt:", err);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Known words appended to file successfully");
        res.status(200).send("Known words saved successfully");
      }
    },
  );
});

app.post("/save-study-list", (req, res) => {
  console.log("Received POST request to /save-study-list");
  const words = req.body.words;
  console.log("Received study list words:", words);

  fs.appendFile(
    path.join(__dirname, "../public/data/study_list.txt"),
    words,
    (err) => {
      if (err) {
        console.error("Error writing to study_list.txt:", err);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Study list saved to file successfully");
        res.status(200).send("Study list saved successfully");
      }
    },
  );
});

app.use(express.static(path.join(__dirname, "../public")));

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();
const apiKey = process.env.API_KEY;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create a GET route
app.get(
  "/getData/:fUsername/:sUsername/:character/:private",
  async (req, res) => {
    let firstInputName = req.params.fUsername;
    let secondInputName = req.params.sUsername;
    let selectedCharacter = req.params.character;
    let isPrivate = req.params.private === "true" ? true : false;

    console.log(firstInputName, secondInputName, selectedCharacter, isPrivate);

    res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" });
  }
);

app.listen(port, () => console.log(`Listening on port ${port}`));

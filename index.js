const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();
const apiKey = process.env.API_KEY;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create a GET route
app.get("/getData", (req, res) => {
  res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

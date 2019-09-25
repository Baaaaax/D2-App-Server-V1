const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();
const apiKey = process.env.API_KEY;

const settings = {
  method: "GET",
  headers: {
    "x-api-key": apiKey
  }
};

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
    let returnedObj = { errorType: 0 };

    await fetchBehaviour(
      firstInputName,
      secondInputName,
      selectedCharacter,
      isPrivate,
      returnedObj
    );

    res.send(returnedObj);
  }
);

const fetchBehaviour = async (
  firstInputName,
  secondInputName,
  selectedCharacter,
  isPrivate,
  returnedObj
) => {
  await getMembershipId(firstInputName, secondInputName, returnedObj);
  if (returnedObj.errorType === 0) {
    console.log("we are getting profile now");
    await getProfile(returnedObj);
  }
};

const getMembershipId = async (
  firstInputName,
  secondInputName,
  returnedObj
) => {
  try {
    const encodedName = encodeURIComponent(firstInputName);
    const encodedName2 = encodeURIComponent(secondInputName);

    const firstFetchUrl =
      "https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/" +
      encodedName +
      "/";
    const secondFetchUrl =
      "https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/" +
      encodedName2 +
      "/";

    const response = await axios.get(firstFetchUrl, settings);
    const response2 = await axios.get(secondFetchUrl, settings);

    if (
      response.data.Response.length > 0 &&
      response2.data.Response.length > 0
    ) {
      returnedObj.firstMembershipId = response.data.Response[0].membershipId;
      returnedObj.secondMembershipId = response2.data.Response[0].membershipId;
      returnedObj.membershipType = response.data.Response[0].membershipType;
    } else {
      if (response.data.Response.length <= 0) {
        returnedObj.errorType = 1;
      } else {
        returnedObj.errorType = 2;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getProfile = async returnedObj => {
  try {
    const fetchUrl =
      "https://www.bungie.net/Platform/Destiny2/" +
      returnedObj.membershipType +
      "/Profile/" +
      returnedObj.firstMembershipId +
      "/?components=100,200";

    const response = await axios.get(fetchUrl, settings);
    console.log(response);

    returnedObj.characterIds = response.data.Response.profile.data.characterIds;
    returnedObj.classHashes = Object.keys(
      response.data.Response.characters.data
    ).map(e => {
      return response.data.Response.characters.data[e].classHash;
    });

    await setCharacterOrder(
      response.data.Response.characters.data,
      returnedObj
    );
  } catch (error) {
    console.log(error);
  }
};

const setCharacterOrder = async (characterObj, returnedObj) => {
  console.log(characterObj);
  var copyArr = [...this.state.characterIds];
  Object.keys(characterObj).forEach(e => {
    switch (characterObj[e].classType) {
      case 0:
        if (e !== copyArr[0]) {
          console.log("old copy arr ", copyArr);
          insertAndShift(copyArr, copyArr.indexOf(e), 0);
          console.log("new copy arr ", copyArr);
        }
        break;
      case 1:
        if (e !== copyArr[1]) {
          console.log("old copy arr ", copyArr);
          insertAndShift(copyArr, copyArr.indexOf(e), 1);
          console.log("new copy arr ", copyArr);
        }
        break;
      case 3:
        if (e !== copyArr[2]) {
          console.log("old copy arr ", copyArr);
          insertAndShift(copyArr, copyArr.indexOf(e), 2);
          console.log("new copy arr ", copyArr);
        }
        break;
    }
  });
  returnedObj.characterIds = copyArr;
};

const insertAndShift = (arr, from, to) => {
  let cutOut = arr.splice(from, 1)[0]; // cut the element at index 'from'
  return arr.splice(to, 0, cutOut); // insert it at index 'to'
};

app.listen(port, () => console.log(`Listening on port ${port}`));

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
    // Check if the given usernames exists
    await getProfile(returnedObj);
    await getHistoricalStats(selectedCharacter, isPrivate, returnedObj);
    if (returnedObj.errorType === 0) {
      //Check if we find matches
      await getActivityHistory(selectedCharacter, isPrivate, returnedObj);
    }
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
  var copyArr = returnedObj.characterIds;
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

const getHistoricalStats = async (selectedCharacter, isPriv, returnedObj) => {
  try {
    const fetchUrl =
      "https://www.bungie.net/Platform//Destiny2/" +
      returnedObj.membershipType +
      "/Account/" +
      returnedObj.firstMembershipId +
      "/Character/" +
      returnedObj.characterIds[selectedCharacter] +
      "/Stats/?modes=5,32";

    const response = await axios.get(fetchUrl, settings);
    console.log("history ", response);

    let bool =
      Object.entries(response.data.Response.allPvP).length === 0 &&
      response.data.Response.allPvP.constructor === Object;
    let bool2 =
      Object.entries(response.data.Response.privateMatches).length === 0 &&
      response.data.Response.privateMatches.constructor === Object;

    if (bool || bool2) {
      if (bool) {
        if (!isPriv) {
          returnedObj.errorType = 3;
          return;
        } else {
          returnedObj.activitiesListCount = [
            0,
            response.data.Response.privateMatches.allTime.activitiesEntered
              .basic.value
          ];
        }
      } else {
        // is Bool2
        if (isPriv) {
          returnedObj.errorType = 3;
          return;
        } else {
          returnedObj.activitiesListCount = [
            response.data.Response.allPvP.allTime.activitiesEntered.basic.value,
            0
          ];
        }
      }
    }

    returnedObj.tst = response.data.Response;
  } catch (error) {
    console.log(error);
  }
};

const getActivityHistory = async (
  selectedCharacter,
  isPrivate,
  returnedObj
) => {
  try {
    var actListCount = isPrivate
      ? returnedObj.activitiesListCount[1]
      : returnedObj.activitiesListCount[0];
    var arr = Array(actListCount).fill(0);

    if (arr.length <= 200) {
      const res = await activityFetch(
        selectedCharacter,
        0,
        isPrivate,
        returnedObj
      );

      returnedObj.activitiesListIds = res.data.Response.activities.map(e => {
        return e.activityDetails.instanceId;
      });
    } else {
      var requests = [...arr];

      if (requests.length % 200 === 0) {
        requests = arr.slice(0, arr.length / 200);
      } else {
        requests = arr.slice(0, arr.length / 200 + 1);
      }
      var currPg = 0;
      var req = requests.map(e => {
        currPg++;
        return activityFetch(
          selectedCharacter,
          currPg - 1,
          isPrivate,
          returnedObj
        );
      });

      const response = await Promise.all(req);

      let arr1d = response.map(e => {
        return e.data.Response.activities.map(f => {
          return f.activityDetails.instanceId;
        });
      });

      returnedObj.activitiesListIds = [].concat(...arr1d);

      // response.forEach(e => {
      //   this.setState(prevState => ({
      //     activitiesList: [
      //       ...prevState.activitiesList,
      //       e.data.Response.activities
      //     ]
      //   }));
      // });
      // var arr1d = [].concat(...this.state.activitiesList);
      // if ((!arr1d[0], !arr1d[1], !arr1d[2])) {
      //   // check if we finded matches
      //   console.log("no matches found");
      //   this.setState({ hasFoundMatches: false });
      //   this.handleErrors(2, "");
      // } else {
      //   this.setState({ hasFoundMatches: true });
      //   this.setState({ activitiesList: arr1d });
      // }
    }
  } catch (error) {
    console.log(error);
  }
};

const activityFetch = async (
  selectedCharacter,
  currentPage,
  isPriv,
  returnedObj
) => {
  try {
    var index = selectedCharacter;
    var mode = isPriv ? 32 : 5;

    const fetchUrl =
      "https://www.bungie.net/Platform/Destiny2/" +
      returnedObj.membershipType +
      "/Account/" +
      returnedObj.firstMembershipId +
      "/Character/" +
      returnedObj.characterIds[index] +
      "/Stats/Activities/?count=200&mode=" +
      mode +
      "&page=" +
      currentPage;

    console.log(fetchUrl);

    const response = await axios.get(fetchUrl, settings);
    console.log("fething data...", response);
    return {
      data: response.data
    };
  } catch (error) {
    console.log(error);
  }
};

app.listen(port, () => console.log(`Listening on port ${port}`));

import React, { Component } from "react";
import "./App.scss";
import Form from "./Components/Form";
import Logo from "./Components/Logo";
import StatBoxs from "./Components/StatBoxs";

const axios = require("axios");
const pLimit = require("p-limit");

// Example Concurrency of 3 promise at once
const limit = pLimit(500);

class App extends Component {
  state = {
    // 0 = Full fetch , 1 = character or isPrivate change
    // 2 = only check second input fastfetch
    typeFetch: 0,
    fullFetch: true,
    btnFetchCount: 0,
    fetchStartEnd: [0, 500],
    isLoading: false,
    isPrivate: false,
    firstInputValue: "",
    secondInputValue: "",
    previousFirstName: "",
    previousSecondName: "",
    firstMembershipId: "",
    secondMembershipId: "",
    membershipType: 0,
    characterIds: [], //titan 0,hunter 1 , warlock 2 ,
    classHashes: [0, 0, 0],
    activitiesList: [],
    activitiesListCount: [0, 0], //0 all , 1 private matches
    hasFoundMatches: false,
    matchEntryPGCR: [{}],
    matchesToShow: [{}],
    selectedCharacter: 0,
    previousCharacter: 0,
    moreMatchesToShow: false,
    canFetchAgain: false,
    foundError: false,
    errorMessage: ""
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isLoading !== prevState.isLoading) {
      if (this.state.isLoading) {
        var settings = {
          method: "GET",
          headers: {
            "x-api-key": "cc8fc21c337a4399b94e9e11e7d908b8"
          }
        };

        // this.FetchBehaviour(settings).then(r => {
        //   if (this.state.matchesToShow.length > 1) {
        //     document.querySelector(".loading-inner").style.opacity = 0;
        //   }
        //   this.setState({ isLoading: false });
        // }); //"auriel#21174" tara#22686

        //Calling the server
        var serverRes = axios
          .get(
            `/getData/${this.state.firstInputValue}/${this.state.secondInputValue}/${this.state.selectedCharacter}/${this.state.isPrivate}`
          )
          .then(r => {
            console.log(r);
            this.setState({ isLoading: false });
          });
      }
    }
  }

  render() {
    return (
      <div>
        <div className="wrapper">
          <div className="main">
            <div className="container" style={{ maxWidth: 1700 }}>
              <div className="row">
                <div className="col-5 title-container">
                  <Logo />
                </div>
                <div className="col-7 form-container loading-outer">
                  <Form
                    onFInputChange={this.onFInputChange}
                    onSInputChange={this.onSInputChange}
                    handleClickFetch={this.handleClickFetch}
                    isLoading={this.state.isLoading}
                    hasFoundResults={this.state.hasFoundResults}
                    onCharacterChange={this.onCharacterChange}
                    onIsPrivateChange={this.onIsPrivateChange}
                  />

                  {this.state.matchesToShow.length > 1 && (
                    <StatBoxs
                      matchesToShow={this.state.matchesToShow}
                      firstMembershipId={this.state.firstMembershipId}
                      secondMembershipId={this.state.secondMembershipId}
                      handleNext500Fetch={this.handleNext500Fetch}
                      activitiesListCount={this.state.activitiesListCount}
                      canFetchAgain={this.state.canFetchAgain}
                    />
                  )}

                  <div className="container loading-inner">
                    {this.state.isLoading && (
                      <div className="centered-spinner">
                        <div className="cm-spinner"></div>
                      </div>
                    )}
                    {!this.state.isLoading &&
                      this.state.matchesToShow.length <= 1 &&
                      this.state.canFetchAgain &&
                      !this.state.foundError && (
                        <div className="centered-spinner">
                          <p>No matches found...</p>
                          <button
                            type="button"
                            className="nxt-mtc-btn"
                            onClick={this.handleNext500Fetch}
                          >
                            Search next 500..
                          </button>
                        </div>
                      )}

                    {!this.state.isLoading && this.state.foundError && (
                      <div className="centered-spinner">
                        <p>{this.state.errorMessage}</p>
                        <button
                          type="button"
                          className="nxt-mtc-btn"
                          onClick={() => {
                            return this.handleGoBack(false);
                          }}
                        >
                          Go back..
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  setPreviousBehaviour = async (name, secName, char, isPriv) => {
    this.setState({
      previousFirstName: name,
      previousSecondName: secName,
      previousCharacter: char,
      previousIsPrivate: isPriv
    });
  };

  FetchBehaviour = async settings => {
    const {
      typeFetch,
      firstInputValue,
      secondInputValue,
      selectedCharacter,
      isPrivate,
      fetchStartEnd,
      activitiesListCount
    } = this.state;

    var actListCount = isPrivate
      ? activitiesListCount[1]
      : activitiesListCount[0];
    if (this.state.fullFetch) {
      switch (typeFetch) {
        case 0:
          await this.setPreviousBehaviour(
            firstInputValue,
            secondInputValue,
            selectedCharacter,
            isPrivate
          );
          await this.getMembershipsId(
            firstInputValue,
            secondInputValue,
            settings
          );
          if (!this.state.foundError) {
            await this.getProfile(settings);
            await this.getHistoricalStats(settings);
            await this.getActivityHistory(settings);

            if (this.state.hasFoundMatches) {
              await this.getPostGameCarnageReport(
                fetchStartEnd[0],
                fetchStartEnd[1],
                settings
              );
              await this.checkIfPlayed();
              if (
                this.state.matchesToShow.length <= 1 &&
                this.state.fetchStartEnd[1] >= actListCount
              ) {
                this.setState({
                  foundError: false,
                  errorMessage:
                    this.state.firstInputValue +
                    " never played against " +
                    this.state.secondInputValue
                });
              }
            }
          }
          break;

        case 1:
          await this.setPreviousBehaviour(
            firstInputValue,
            secondInputValue,
            selectedCharacter,
            isPrivate
          );
          await this.getHistoricalStats(settings);
          await this.getActivityHistory(settings);
          if (this.state.hasFoundMatches) {
            await this.getPostGameCarnageReport(
              fetchStartEnd[0],
              fetchStartEnd[1],
              settings
            );
            await this.checkIfPlayed();
          }
          break;
        case 2:
          await this.setPreviousBehaviour(
            firstInputValue,
            secondInputValue,
            selectedCharacter,
            isPrivate
          );
          await this.getMembershipsId(
            firstInputValue,
            secondInputValue,
            settings
          );
          if (!this.state.foundError) {
            await this.checkIfPlayed();
            if (
              this.state.matchesToShow.length <= 1 &&
              this.state.fetchStartEnd[1] >= actListCount
            ) {
              this.setState({
                foundError: false,
                errorMessage:
                  this.state.firstInputValue +
                  " never played against " +
                  this.state.secondInputValue
              });
            }
          }

          break;
      }
    } else {
      await this.getPostGameCarnageReport(
        fetchStartEnd[0],
        fetchStartEnd[1],
        settings
      );
      await this.checkIfPlayed();
      if (
        this.state.matchesToShow.length <= 1 &&
        this.state.fetchStartEnd[1] >= actListCount
      ) {
        this.setState({
          foundError: true,
          errorMessage:
            this.state.firstInputValue +
            " never played against " +
            this.state.secondInputValue
        });
      }
    }
  };
  getMembershipsId = async (firstInputName, secondInputName, settings) => {
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

    console.log(response);
    console.log(response2);
    if (
      response.data.Response.length > 0 &&
      response2.data.Response.length > 0
    ) {
      this.setState({
        firstMembershipId: response.data.Response[0].membershipId,
        secondMembershipId: response2.data.Response[0].membershipId,
        membershipType: response.data.Response[0].membershipType
      });
    } else {
      if (response.data.Response.length <= 0) {
        this.handleErrors(1, firstInputName);
      } else {
        this.handleErrors(1, secondInputName);
      }
    }
  };

  getProfile = async settings => {
    const fetchUrl =
      "https://www.bungie.net/Platform/Destiny2/" +
      this.state.membershipType +
      "/Profile/" +
      this.state.firstMembershipId +
      "/?components=100,200";

    const response = await axios.get(fetchUrl, settings);
    console.log(response);

    this.setState({
      characterIds: response.data.Response.profile.data.characterIds,
      classHashes: Object.keys(response.data.Response.characters.data).map(
        e => {
          return response.data.Response.characters.data[e].classHash;
        }
      )
    });

    await this.setCharacterOrder(response.data.Response.characters.data);
  };

  setCharacterOrder = async characterObj => {
    console.log(characterObj);
    var copyArr = [...this.state.characterIds];
    Object.keys(characterObj).forEach(e => {
      switch (characterObj[e].classType) {
        case 0:
          if (e !== copyArr[0]) {
            console.log("old copy arr ", copyArr);
            this.insertAndShift(copyArr, copyArr.indexOf(e), 0);
            console.log("new copy arr ", copyArr);
          }
          break;
        case 1:
          if (e !== copyArr[1]) {
            console.log("old copy arr ", copyArr);
            this.insertAndShift(copyArr, copyArr.indexOf(e), 1);
            console.log("new copy arr ", copyArr);
          }
          break;
        case 3:
          if (e !== copyArr[2]) {
            console.log("old copy arr ", copyArr);
            this.insertAndShift(copyArr, copyArr.indexOf(e), 2);
            console.log("new copy arr ", copyArr);
          }
          break;
      }
    });
    this.setState({ characterIds: copyArr });
  };

  insertAndShift = (arr, from, to) => {
    let cutOut = arr.splice(from, 1)[0]; // cut the element at index 'from'
    return arr.splice(to, 0, cutOut); // insert it at index 'to'
  };

  getHistoricalStats = async settings => {
    const fetchUrl =
      "https://www.bungie.net/Platform//Destiny2/" +
      this.state.membershipType +
      "/Account/" +
      this.state.firstMembershipId +
      "/Character/" +
      this.state.characterIds[this.state.selectedCharacter] +
      "/Stats/?modes=5,32";

    const response = await axios.get(fetchUrl, settings);
    console.log("hisroty ", response);
    this.setState({
      activitiesListCount: [
        response.data.Response.allPvP.allTime.activitiesEntered.basic.value,
        response.data.Response.privateMatches.allTime.activitiesEntered.basic
          .value
      ]
    });
  };

  getActivityHistory = async settings => {
    var actListCount = this.state.isPrivate
      ? this.state.activitiesListCount[1]
      : this.state.activitiesListCount[0];
    var arr = Array(actListCount).fill(0);

    if (arr.length <= 200) {
      const res = await this.activityFetch(settings, 0, this.state.isPrivate);
      this.setState({
        activitiesList: res.data.Response.activities,
        hasFoundMatches: true
      });
    } else {
      var requests = [...arr];

      if (requests.length % 200 === 0) {
        console.log("we are here");
        requests = arr.slice(0, arr.length / 200);
      } else {
        requests = arr.slice(0, arr.length / 200 + 1);
      }
      var currPg = 0;
      var req = requests.map(e => {
        currPg++;
        return this.activityFetch(settings, currPg - 1, this.state.isPrivate);
      });

      const response = await Promise.all(req);

      response.forEach(e => {
        this.setState(prevState => ({
          activitiesList: [
            ...prevState.activitiesList,
            e.data.Response.activities
          ]
        }));
      });
      var arr1d = [].concat(...this.state.activitiesList);
      if ((!arr1d[0], !arr1d[1], !arr1d[2])) {
        // check if we finded matches
        console.log("no matches found");
        this.setState({ hasFoundMatches: false });
        this.handleErrors(2, "");
      } else {
        this.setState({ hasFoundMatches: true });
        this.setState({ activitiesList: arr1d });
      }
    }
  };

  activityFetch = async (settings, currentPage, isPriv) => {
    var index = this.state.selectedCharacter;
    var mode = isPriv ? 32 : 5;

    const fetchUrl =
      "https://www.bungie.net/Platform/Destiny2/" +
      this.state.membershipType +
      "/Account/" +
      this.state.firstMembershipId +
      "/Character/" +
      this.state.characterIds[index] +
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
  };

  getPostGameCarnageReport = async (start, end, settings) => {
    var arr = this.state.activitiesList;

    var requests = arr
      .filter(e => {
        return e !== "error";
      })
      .map(f => {
        return limit(() => {
          return this.pgcrFetch(f.activityDetails.instanceId, settings).then(
            a => {
              return a;
            }
          );
        });
      });

    // Only one promise is run at once
    var response = await Promise.all(requests);

    this.setState({
      matchEntryPGCR: response,
      canFetchAgain: false
    });
  };

  pgcrFetch = async (activityId, settings) => {
    const fetchUrl =
      "https://www.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/" +
      activityId +
      "/";
    var response = await axios.get(fetchUrl, settings);

    return {
      data: response.data.Response
    };
  };

  checkIfPlayed = async () => {
    var copyArr = [...this.state.matchEntryPGCR];

    copyArr.forEach(e => {
      if (e !== "error" && e.data) {
        var standingValue = e.data.entries.find(f => {
          return (
            f.player.destinyUserInfo.membershipId ===
            this.state.firstMembershipId
          );
        });

        e.data.entries.forEach(g => {
          if (g.standing !== standingValue.standing) {
            if (
              g.player.destinyUserInfo.membershipId ===
              this.state.secondMembershipId
            ) {
              this.setState(prevState => ({
                matchesToShow: [...prevState.matchesToShow, e.data]
              }));
            }
          }
        });
      }
    });
  };

  onFInputChange = e => {
    this.setState({ firstInputValue: e.target.value });
  };
  onSInputChange = e => {
    this.setState({ secondInputValue: e.target.value });
  };

  onCharacterChange = e => {
    this.setState({ selectedCharacter: e.target.value });
  };

  onIsPrivateChange = e => {
    this.setState({ isPrivate: e.target.checked });
  };

  handleClickFetch = () => {
    // if there is something typed
    if (
      this.state.firstInputValue !== "" &&
      this.state.secondInputValue !== ""
    ) {
      if (this.state.btnFetchCount === 0) {
        // If is the first time we click we will do a FULL FETCH
        this.settingLoadingState(0);
      } else {
        // if the first username remain the same
        if (this.state.previousFirstName === this.state.firstInputValue) {
          // if the second username remain the same
          if (this.state.previousSecondName === this.state.secondInputValue) {
            // if the character changes or IsPrivate changes
            if (
              this.state.previousCharacter !== this.state.selectedCharacter ||
              this.state.previousIsPrivate !== this.state.isPrivate
            ) {
              console.log("changed character or IsPrivate");
              this.setState({
                fetchStartEnd: [0, 500],
                activitiesList: [],
                matchEntryPGCR: [{}],
                matchesToShow: [{}],
                hasFoundMatches: false
              });
              this.settingLoadingState(1);
            } // else they are all the same we return
            else {
              console.log("all same");
              return;
            }
          }
          // else only the second username changes , we do a fastFetch
          else {
            console.log("only the second changes , we do a fast fetch");
            this.setState({ matchesToShow: [{}] });
            this.settingLoadingState(2);
          }
        }
        // else the first username changed , we do a full fetch
        else {
          console.log("first input changed , we do a full fetch");
          this.handleResetState();
          this.settingLoadingState(0);
        }
      }
    }
  };

  settingLoadingState = typeFetch => {
    this.setState({
      isLoading: true,
      btnFetchCount: this.state.btnFetchCount + 1,
      typeFetch: typeFetch
    });
    document.querySelector(".loading-inner").style.opacity = 1;
  };

  handleNext500Fetch = () => {
    this.setState({
      fullFetch: false,
      fetchStartEnd: [
        this.state.fetchStartEnd[0] + 500,
        this.state.fetchStartEnd[1] + 500
      ],

      matchEntryPGCR: [{}],
      isLoading: true
    });
  };

  handleGoBack = fullReset => {
    document.querySelector(".loading-inner").style.opacity = 0;
    if (fullReset) {
      this.setState({
        activitiesList: [],
        matchEntryPGCR: [{}],
        canFetchAgain: false,
        foundError: false,
        errorMessage: ""
      });
    } else {
      this.setState({
        canFetchAgain: false,
        foundError: false,
        errorMessage: ""
      });
    }
  };

  handleResetState = () => {
    this.setState({
      typeFetch: 0,
      fullFetch: true,
      firstMembershipId: "",
      secondMembershipId: "",
      membershipType: 0,
      characterIds: [], //titan 0,hunter 1 , warlock 2 ,
      classHashes: [0, 0, 0],
      activitiesList: [],
      activitiesListCount: [0, 0],
      hasFoundMatches: false,
      matchEntryPGCR: [{}],
      matchesToShow: [{}],
      previousFirstName: "",
      previousSecondName: "",
      fetchStartEnd: [0, 500],
      canFetchAgain: false,
      previousCharacter: 0,
      foundError: false,
      errorMessage: "",
      isPrivate: false
    });
  };
  setDelay = i => {
    setTimeout(i, 3000);
  };

  handleErrors = (typeErr, messErr) => {
    switch (typeErr) {
      case 1:
        this.setState({
          isLoading: false,
          foundError: true,
          errorMessage: "Can't find " + messErr
        });
        break;
      case 2:
        this.setState({
          isLoading: false,
          foundError: true,
          errorMessage: "No matches found.."
        });
    }
  };

  // handleClickNextPage = () => {
  //   var settings = {
  //     method: "GET",
  //     headers: {
  //       "x-api-key": "cc8fc21c337a4399b94e9e11e7d908b8"
  //     }
  //   };
  //   this.setState({ isLoading: true });
  //   this.setState({ noMatchFoundBool: false });
  //   this.setState({ isUpdating: true });
  //   this.setState({ matchesToShow: [{}] });
  //   this.setState({ matchEntryPGCR: [{}] });
  //   this.getActivityHistory(settings);
  //   this.setState({ currentPage: this.state.currentPage + 1 });
  //   };
  //}
}
export default App;

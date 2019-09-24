import React, { Component } from "react";

class MatchEntry extends Component {
  state = {
    KD: 0,
    KDA: 0,
    KILLS: 0,
    DEATHS: 0
  };

  render() {
    const { matchMode, matchDate, matchInstanceId, matchPlayers } = this.props;

    return (
      <React.Fragment>
        <div className="col-8">
          <a
            href={`https://destinytracker.com/d2/pgcr/${matchInstanceId}`}
            className="title"
            target="_blank"
          >
            {this.decodeMap(matchMode)}
          </a>
        </div>
        <div className="col txt-center">
          <span>{this.formatDate(matchDate)}</span>
        </div>
        <div className="w-100 marginNameStatsRow" />

        <div className="col txt-center">
          <div className="row align-items-end">
            <div className="col txt-center">
              <span>KD</span>
            </div>
            <div className="col txt-center">
              <span>KDA</span>
            </div>
            <div className="col txt-center">
              <span>KILLS</span>
            </div>
            <div className="col txt-center">
              <span>DEATHS</span>
            </div>
          </div>
        </div>
        <div className="w-100" />

        <div className="col">
          <div className="row align-items-end">
            <div className="col txt-center">
              <span>
                {this.getStats(matchPlayers, this.returnPlayerOrEnemy(), 0)}
              </span>
            </div>
            <div className="col txt-center">
              <span>
                {this.getStats(matchPlayers, this.returnPlayerOrEnemy(), 1)}
              </span>
            </div>
            <div className="col txt-center">
              <span>
                {this.getStats(matchPlayers, this.returnPlayerOrEnemy(), 2)}
              </span>
            </div>
            <div className="col txt-center">
              <span>
                {this.getStats(matchPlayers, this.returnPlayerOrEnemy(), 3)}
              </span>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  returnPlayerOrEnemy = () => {
    const { isPlayer, firstMembershipId, secondMembershipId } = this.props;
    return isPlayer ? firstMembershipId : secondMembershipId;
  };

  decodeMap = mode => {
    const codedModeList = {
      AllPvP: 5,
      Control: 10,
      Reserved11: 11,
      Clash: 12,
      Reserved13: 13,
      "Crimson - Doubles": 15,
      "Iron - Banner": 19,
      Reserved20: 20,
      Reserved21: 21,
      Reserved22: 22,
      Reserved24: 24,
      AllMayhem: 25,
      Reserved26: 26,
      Reserved27: 27,
      Reserved28: 28,
      Reserved29: 29,
      Reserved30: 30,
      Supremacy: 31,
      "Private - Matches - All": 32,
      Survival: 37,
      Countdown: 38,
      "Trials-Of-The-Nine": 39,
      "Trials - Countdown": 41,
      "Trials - Survival": 42,
      "IronBanner - Control": 43,
      "IronBanner - Clash": 44,
      "IronBanner - Supremacy": 45,
      Rumble: 48,
      "All Doubles": 49,
      Doubles: 50,
      "Private Matches - Clash": 51,
      "Private Matches - Control": 52,
      "Private Matches - Supremacy": 53,
      "Private Matches - Countdown": 54,
      "Private Matches - Survival": 55,
      "Private Matches - Mayhem": 56,
      "Private Matches - Rumble": 57,
      Showdown: 59,
      Lockdown: 60,
      Breakthrough: 65,
      Salvage: 67,
      "Iron Banner - Salvage": 68,
      "PvP - Competitive": 69,
      "PvP - Quickplay": 70,
      "Clash - Quickplay": 71,
      "Clash - Competitive": 72,
      "Control - Quickplay": 73,
      "Control - Competitive": 74
    };
    for (var i in codedModeList) {
      if (codedModeList[i] === mode) {
        return i;
      }
    }
  };

  formatDate = date => {
    return date
      .replace("T", " ")
      .replace("Z", " ")
      .split(" ")[0];
  };

  getStats = (matchMembers, id, typeOfStat) => {
    var filteredMember = matchMembers.find(
      e => e.player.destinyUserInfo.membershipId === id
    );

    switch (typeOfStat) {
      case 0:
        return filteredMember.values.killsDeathsRatio.basic.displayValue;

      case 1:
        return filteredMember.values.killsDeathsAssists.basic.displayValue;

      case 2:
        return filteredMember.values.kills.basic.displayValue;

      case 3:
        return filteredMember.values.deaths.basic.displayValue;
    }
  };
}

export default MatchEntry;

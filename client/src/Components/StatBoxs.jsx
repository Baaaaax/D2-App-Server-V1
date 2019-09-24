import React, { Component } from "react";
import MatchEntry from "./MatchEntry";
import Flickity from "react-flickity-component";

import "../scripts/flickity.css";

class StatBoxs extends Component {
  state = {
    matchesToShowIndexes: [1, 4],
    threeMatches: [],
    isPlayer: true // player:true enemny:false
  };

  render() {
    const { handleNext500Fetch, canFetchAgain, isLoading } = this.props;
    return (
      <div className="container SB">
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={handleNext500Fetch}
          disabled={!canFetchAgain || isLoading}
        >
          {canFetchAgain ? "Next 500 matches" : "No more matches.."}
        </button>

        <div
          className="container main-statsbox"
          style={{
            minWidth: "430",
            borderColor: this.state.isPlayer ? "#a3e725e3" : "#f44336"
          }}
        >
          <Flickity>{this.carouselBehaviour()}</Flickity>
        </div>
      </div>
    );
  }

  handleDoubleClick = e => {
    this.setState({ isPlayer: !this.state.isPlayer });
  };

  carouselBehaviour = () => {
    const { matchesToShow, firstMembershipId, secondMembershipId } = this.props;

    const dividedArr = Array(Math.ceil((matchesToShow.length - 1) / 3)).fill(0);

    var copyMatchArr = [...this.state.matchesToShowIndexes];

    return dividedArr.map((e, i) => {
      if (i !== 0) {
        copyMatchArr[0] += 3;
        copyMatchArr[1] += 3;
      }

      return (
        <div className="col-12" key={i}>
          {matchesToShow
            .slice(copyMatchArr[0], copyMatchArr[1]) //// first 0,4 then 4,8 ecc..
            .map((e, i) => {
              return (
                <div
                  className="row align-items-center"
                  key={i}
                  onDoubleClick={e => this.handleDoubleClick(e)}
                >
                  <MatchEntry
                    matchMode={e.activityDetails.mode}
                    matchDate={e.period}
                    matchInstanceId={e.activityDetails.instanceId}
                    matchPlayers={e.entries}
                    firstMembershipId={firstMembershipId}
                    secondMembershipId={secondMembershipId}
                    isPlayer={this.state.isPlayer}
                  />
                </div>
              );
            })}
        </div>
      );
    });
  };
}

export default StatBoxs;

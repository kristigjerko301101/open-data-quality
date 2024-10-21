import "../App.css";
import React from "react";
import { Tooltip } from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faLayerGroup,
  faTag,
  faBuilding,
  faFolderOpen,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
// import Logo from "../assets/opendatalogo.png";

const Toolbar = ({ selectedDimension, setSelectedDimension }) => {
  return (
    <div className="toolbar">
      {/*<div className="logo">
        <img src={Logo} alt="logo" className="logo-image" />
      </div>*/}
      <div className="buttons">
        <button
          className={`icon-button ${
            selectedDimension === "home"
              ? "selected-icon-button"
              : "normal-icon-button"
          }`}
          data-tooltip-id="homeTip"
          onClick={() => setSelectedDimension("home")}
        >
          <FontAwesomeIcon icon={faHome} />
        </button>
        <Tooltip id="homeTip" place="bottom" className="custom-tooltip" noArrow>
          Home
        </Tooltip>

        <button
          className={`icon-button ${
            selectedDimension === "group"
              ? "selected-icon-button"
              : "normal-icon-button"
          }`}
          data-tooltip-id="groupTip"
          onClick={() => setSelectedDimension("group")}
        >
          <FontAwesomeIcon icon={faLayerGroup} />
        </button>
        <Tooltip
          id="groupTip"
          place="bottom"
          className="custom-tooltip"
          noArrow
        >
          Group
        </Tooltip>

        <button
          className={`icon-button ${
            selectedDimension === "tag"
              ? "selected-icon-button"
              : "normal-icon-button"
          }`}
          data-tooltip-id="tagTip"
          onClick={() => setSelectedDimension("tag")}
        >
          <FontAwesomeIcon icon={faTag} />
        </button>
        <Tooltip id="tagTip" place="bottom" className="custom-tooltip" noArrow>
          Tag
        </Tooltip>

        <button
          className={`icon-button ${
            selectedDimension === "organization"
              ? "selected-icon-button"
              : "normal-icon-button"
          }`}
          data-tooltip-id="organizationTip"
          onClick={() => setSelectedDimension("organization")}
        >
          <FontAwesomeIcon icon={faBuilding} />
        </button>
        <Tooltip
          id="organizationTip"
          place="bottom"
          className="custom-tooltip"
          noArrow
        >
          Organization
        </Tooltip>

        <button
          className={`icon-button ${
            selectedDimension === "dataset"
              ? "selected-icon-button"
              : "normal-icon-button"
          }`}
          data-tooltip-id="datasetTip"
          onClick={() => setSelectedDimension("dataset")}
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </button>
        <Tooltip
          id="datasetTip"
          place="bottom"
          className="custom-tooltip"
          noArrow
        >
          Dataset
        </Tooltip>

        <button
          className={`icon-button ${
            selectedDimension === "resource"
              ? "selected-icon-button"
              : "normal-icon-button"
          }`}
          data-tooltip-id="resourceTip"
          onClick={() => setSelectedDimension("resource")}
        >
          <FontAwesomeIcon icon={faFile} />
        </button>
        <Tooltip
          id="resourceTip"
          place="bottom"
          className="custom-tooltip"
          noArrow
        >
          Resource
        </Tooltip>
      </div>
    </div>
  );
};

export default Toolbar;

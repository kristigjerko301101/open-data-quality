import React, { useState, useEffect } from "react";
import DimensionMeasuresGrid from "./DimensionMeasuresGrid";
import DetailMeasuresGrid from "./DetailMeasuresGrid";
import { Histogram, Boxplot } from "./DimensionMeasuresPlot";
import { Tooltip } from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple } from "@fortawesome/free-solid-svg-icons";

const DataQuality = ({
  selectedDimension,
  dimensionData,
  detailData,
  detailColumnDefs,
  avgData,
}) => {
  const [selectedDimensionRow, setSelectedDimensionRow] = useState(null);
  const [filteredDetailData, setFilteredDetailData] = useState([]);
  const [selectedChart, setSelectedChart] = useState("histogram");

  useEffect(() => {
    setFilteredDetailData([]);
    setFilteredDetailData(
      selectedDimension === "resource"
        ? detailData
        : detailData.filter(
            (item) =>
              item.dimension ===
              (selectedDimensionRow && selectedDimensionRow.dimension)
          )
    );
  }, [selectedDimension, detailData, selectedDimensionRow]);

  return selectedDimension === "resource" ? (
    <div>
      <section style={{ display: "flex", height: "85vh" }}>
        <div
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          <DetailMeasuresGrid
            detailData={filteredDetailData}
            detailColumnDefs={detailColumnDefs}
          />
        </div>
      </section>
    </div>
  ) : (
    <div>
      <section style={{ display: "flex", height: "30vh" }}>
        <div
          style={{ display: "flex", width: "55vw", justifyContent: "center" }}
        >
          <DimensionMeasuresGrid
            selectedDimension={selectedDimension}
            dimensionData={dimensionData}
            setSelectedDimensionRow={setSelectedDimensionRow}
          />
        </div>
        <div
          style={{
            display: "flex",
            width: "45vw",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {selectedChart === "histogram" && (
            <Histogram
              selectedDimension={selectedDimension}
              selectedDimensionRow={selectedDimensionRow}
              avgData={avgData}
            />
          )}
          {selectedChart === "boxplot" && (
            <Boxplot
              selectedDimension={selectedDimension}
              selectedDimensionRow={selectedDimensionRow}
              data={detailData}
              avgData={avgData}
            />
          )}
          <div
            style={{
              position: "absolute",
              right: "5px",
              zIndex: 10,
            }}
          >
            <button
              className={`download-button`}
              data-tooltip-id="distributionTip"
              onClick={() =>
                setSelectedChart((currentChart) =>
                  currentChart === "histogram" ? "boxplot" : "histogram"
                )
              }
            >
              <FontAwesomeIcon icon={faChartSimple} />
            </button>
            <Tooltip
              id="distributionTip"
              place="top-end"
              className="custom-tooltip"
              noArrow
            >
              {selectedChart === "histogram"
                ? "switch to distribution"
                : "switch to average"}
            </Tooltip>
          </div>
        </div>
      </section>
      <section style={{ display: "flex", height: "50vh" }}>
        <div
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          <DetailMeasuresGrid
            detailData={filteredDetailData}
            detailColumnDefs={detailColumnDefs}
          />
        </div>
      </section>
    </div>
  );
};

export default DataQuality;

import React, { useState, useEffect } from "react";
import DimensionMeasuresGrid from "./DimensionMeasuresGrid";
import Histogram from "./Histogram";
import DetailMeasuresGrid from "./DetailMeasuresGrid";

const DataQuality = ({
  selectedDimension,
  dimensionData,
  detailData,
  detailColumnDefs,
}) => {
  const [selectedDimensionRow, setSelectedDimensionRow] = useState(null);
  const [filteredDetailData, setFilteredDetailData] = useState([]);

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
          style={{ display: "flex", width: "45vw", justifyContent: "center" }}
        >
          <Histogram
            selectedDimension={selectedDimension}
            selectedDimensionRow={selectedDimensionRow}
          />
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

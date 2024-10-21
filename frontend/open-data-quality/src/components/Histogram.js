import React, { useEffect } from "react";
import * as echarts from "echarts";

const Histogram = ({ selectedDimension, selectedDimensionRow }) => {
  useEffect(() => {
    const chart = echarts.init(document.getElementById("histogram"));

    const histogramData = selectedDimensionRow
      ? selectedDimensionRow
      : {
          dimension: "",
          total: "0",
          acci3: "0",
          acci4: "0",
          comi1: "0",
          comi5: "0",
          coni2: "0",
          coni3: "0",
          avad1: "0",
        };

    const option = {
      title: {
        text: `${
          selectedDimension
            ? selectedDimension.charAt(0).toUpperCase() +
              selectedDimension.slice(1).toLowerCase()
            : ""
        }: ${histogramData.dimension}`,
        left: "center",
      },
      tooltip: {},
      xAxis: {
        data: Object.keys(histogramData).slice(2), // exclude dimension and total
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 1,
      },
      series: [
        {
          name: "Measures",
          type: "bar",
          data: Object.values(histogramData).slice(2), // exclude dimension and total
          itemStyle: { color: "#003468" },
        },
      ],
      grid: {
        left: "0%",
        right: "0%",
        top: "20%",
        bottom: "0%",
        containLabel: true,
      },
    };

    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [selectedDimensionRow]);

  return <div id="histogram" style={{ height: "100%", width: "100%" }}></div>;
};

export default Histogram;

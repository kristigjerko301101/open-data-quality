import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import * as echarts_transform from "echarts-simple-transform";

export const Histogram = ({ selectedDimension, selectedDimensionRow }) => {
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
        }: ${
          histogramData.dimension && histogramData.dimension.length > 60
            ? histogramData.dimension.substring(0, 60) + "..."
            : histogramData.dimension
        }`,
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

export const Boxplot = ({ selectedDimension, selectedDimensionRow, data }) => {
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
  const measureKeys = [
    "acci3",
    "acci4",
    "avad1",
    "comi1",
    "comi5",
    "coni2",
    "coni3",
    "coni4",
    "coni5",
    "undi1",
  ];
  const rawData = data.flatMap((obj) =>
    Object.entries(obj)
      .filter(([key, _]) => measureKeys.includes(key))
      .map(([key, value]) => [value, key])
  );
  rawData.unshift(["Score", "Measure"]);

  const chartRef = useRef(null);

  useEffect(() => {
    const chartInstance = echarts.init(chartRef.current);
    echarts.registerTransform(echarts_transform.aggregate);

    const option = {
      dataset: [
        {
          id: "raw",
          source: rawData,
        },
        {
          id: "measures_aggregate",
          fromDatasetId: "raw",
          transform: [
            {
              type: "ecSimpleTransform:aggregate",
              config: {
                resultDimensions: [
                  { name: "min", from: "Score", method: "min" },
                  { name: "Q1", from: "Score", method: "Q1" },
                  { name: "median", from: "Score", method: "median" },
                  { name: "Q3", from: "Score", method: "Q3" },
                  { name: "max", from: "Score", method: "max" },
                  { name: "Measure", from: "Measure" },
                ],
                groupBy: "Measure",
              },
            },
            {
              type: "sort",
              config: {
                dimension: "Measure",
                order: "desc",
              },
            },
          ],
        },
      ],
      title: {
        text: `${
          selectedDimension
            ? selectedDimension.charAt(0).toUpperCase() +
              selectedDimension.slice(1).toLowerCase()
            : ""
        }: ${
          histogramData.dimension && histogramData.dimension.length > 60
            ? histogramData.dimension.substring(0, 60) + "..."
            : histogramData.dimension
        }`,
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        confine: true,
      },
      xAxis: {
        name: "",
        type: "category",
        inverse: "true",
      },
      yAxis: {
        type: "value",
      },
      /*grid: {
        bottom: "10%",
        top: "15%",
      },*/
      grid: {
        left: "0%",
        right: "0%",
        top: "20%",
        bottom: "0%",
        containLabel: true,
      },
      series: [
        {
          name: "boxplot",
          type: "boxplot",
          datasetId: "measures_aggregate",
          itemStyle: {
            color: "#b3daff",
          },
          encode: {
            y: ["min", "Q1", "median", "Q3", "max"],
            x: "Measure",
            itemName: ["Measure"],
            tooltip: ["min", "Q1", "median", "Q3", "max"],
          },
        },
      ],
    };

    chartInstance.setOption(option);

    return () => {
      chartInstance.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ height: "100%", width: "100%" }} />;
};

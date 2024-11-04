import React, { useEffect, useRef } from "react";
import "../App.css";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import * as echarts_transform from "echarts-simple-transform";

const StatCard = ({ title, stat }) => {
  return (
    <div className="card">
      <div className="stat">{stat}</div>
      <div className="title">{title}</div>
      {/*<div className="description">{description}</div>*/}
    </div>
  );
};

const StackedLines = ({ title, data }) => {
  // sort the data array by the refdate_orig field in ascending order
  const sortedData = [...data].sort(
    (a, b) => new Date(a.refdate_orig) - new Date(b.refdate_orig)
  );

  const legendData =
    sortedData[0] &&
    Object.keys(sortedData[0]).filter(
      (i) => i !== "refdate" && i !== "refdate_orig"
    );

  const xAxisData = sortedData.map((item) => item.refdate);

  // initialize an object to hold the values for each key
  const seriesMap = {};
  // iterate through each object in the sorted array
  sortedData.forEach((obj) => {
    for (const key of legendData) {
      if (!seriesMap[key]) {
        // if the key doesn't exist in the seriesMap, create it
        seriesMap[key] = { name: key, type: "line", data: [] };
      }
      // push the value into the corresponding array
      seriesMap[key].data.push(obj[key]);
    }
  });
  const seriesData = Object.values(seriesMap);

  const lineColors =
    title === "csv quality process"
      ? ["#3ba272", "#ee6666", "#fac858"]
      : ["#9a60b4", "#5470c6", "#73c0de"];

  const getOption = () => ({
    color: lineColors,
    title: {
      text: title,
      left: "center",
      top: "top",
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
      },
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      orient: "horizontal",
      left: "center",
      bottom: "-1%",
      data: legendData,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series: seriesData,
    grid: {
      top: "15%",
      left: "3%",
      right: "5%",
      bottom: "10%",
      containLabel: true,
    },
  });

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: "30vh", width: "27vw" }}
    />
  );
};

const Histogram = ({ title, data }) => {
  const xAxisData = data.map((i) => i.measure);
  const seriesData = data.map((i) => i.score);

  const getOption = () => ({
    title: {
      text: title,
      left: "center",
      top: "top",
      textStyle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const { name, value } = params[0];
        const currentData = data.find((i) => i.measure === name);

        const measure = currentData && currentData.title;
        const descr = currentData && currentData.descr;
        const score = currentData && currentData.score;
        return `
          <strong>${measure}</strong><br/>
          <strong>Score:</strong> ${score}<br/>
          <strong>Descr:</strong> ${descr.replace("#", "<br/>")}
        `;
      },
    },
    xAxis: {
      data: xAxisData,
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
        data: seriesData,
        itemStyle: { color: "#b3daff", borderColor: "#003468" },
      },
    ],
    grid: {
      left: "2%",
      right: "2%",
      top: "20%",
      bottom: "0%",
      containLabel: true,
    },
  });

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: "50vh", width: "55vw" }}
    />
  );
};

const Boxplot = ({ title, data, avgData }) => {
  const rawData = data.map((obj) => Object.values(obj));
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
        text: title,
        left: "center",
        top: "top",
        textStyle: {
          fontSize: 20,
          fontWeight: "bold",
          color: "#333",
        },
      },
      tooltip: {
        trigger: "axis",
        confine: true,
        formatter: function (params) {
          const { name, value } = params[0];
          const currentData = avgData.find((i) => i.measure === name);

          const measure = currentData && currentData.title;
          return `
          <div style="text-align: left; width: 100px;">
            <strong>${measure}</strong><br>
            <strong>Min:</strong> <span style="float: right;">${value[0].toFixed(
              3
            )}</span><br>
            <strong>Q1:</strong> <span style="float: right;">${value[1].toFixed(
              3
            )}</span><br>
            <strong>Median:</strong> <span style="float: right;">${value[2].toFixed(
              3
            )}</span><br>
            <strong>Q3:</strong> <span style="float: right;">${value[3].toFixed(
              3
            )}</span><br>
            <strong>Max:</strong> <span style="float: right;">${value[4].toFixed(
              3
            )}</span>
          </div>`;
        },
      },
      xAxis: {
        name: "",
        type: "category",
        inverse: "true",
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "boxplot",
          type: "boxplot",
          datasetId: "measures_aggregate",
          itemStyle: { color: "#b3daff", borderColor: "#003468" },
          encode: {
            y: ["min", "Q1", "median", "Q3", "max"],
            x: "Measure",
            itemName: ["Measure"],
            tooltip: ["min", "Q1", "median", "Q3", "max"],
          },
        },
      ],
      grid: {
        left: "2%",
        right: "2%",
        top: "20%",
        bottom: "0%",
        containLabel: true,
      },
    };

    chartInstance.setOption(option);

    return () => {
      chartInstance.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ height: "50vh", width: "40vw" }} />;
};

const Homepage = ({ homeData }) => {
  return (
    <div>
      <div style={{ display: "flex", height: "35vh" }}>
        <section
          style={{
            width: "40vw",
            height: "31vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "15px",
          }}
        >
          <StatCard
            title="discovered datasets"
            stat={
              homeData.overall_numbers &&
              parseFloat(homeData.overall_numbers[0].total_ds).toLocaleString(
                "us"
              )
            }
          />
          <StatCard
            title="discovered resources"
            stat={
              homeData.overall_numbers &&
              parseFloat(homeData.overall_numbers[0].total_res).toLocaleString(
                "us"
              )
            }
          />
          <StatCard
            title="discovered csv"
            stat={
              homeData.overall_numbers &&
              parseFloat(homeData.overall_numbers[0].csv_res).toLocaleString(
                "us"
              )
            }
          />
          <StatCard
            title="processed csv"
            stat={
              homeData.overall_numbers &&
              parseFloat(homeData.overall_numbers[0].csv_ok).toLocaleString(
                "us"
              )
            }
          />
          <StatCard
            title="unavailable csv"
            stat={
              homeData.overall_numbers &&
              parseFloat(
                homeData.overall_numbers[0].csv_unavail
              ).toLocaleString("us")
            }
          />
          <StatCard
            title="invalid format csv"
            stat={
              homeData.overall_numbers &&
              parseFloat(
                homeData.overall_numbers[0].csv_invalid
              ).toLocaleString("us")
            }
          />
        </section>
        <section
          style={{
            width: "56vw",
            height: "31vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr ",
            gap: "15px",
          }}
        >
          <StackedLines
            title={"discovery process"}
            data={homeData.daily_registered || []}
          />
          <StackedLines
            title={"csv quality process"}
            data={homeData.daily_processed || []}
          />
        </section>
      </div>
      <div style={{ display: "flex", height: "55vh" }}>
        <section
          style={{
            width: "40vw",
          }}
        >
          <Boxplot
            title={"quality measures - distribution"}
            data={homeData.measure_distributions || []}
            avgData={homeData.measure_averages || []}
          />
        </section>
        <section
          style={{
            width: "56vw",
          }}
        >
          <Histogram
            title={"quality measures - average"}
            data={homeData.measure_averages || []}
          />
        </section>
      </div>
    </div>
  );
};

export default Homepage;

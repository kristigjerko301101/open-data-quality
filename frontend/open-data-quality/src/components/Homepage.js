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
  // Sort the data array by the refdate_orig field in ascending order
  const sortedData = [...data].sort(
    (a, b) => new Date(a.refdate_orig) - new Date(b.refdate_orig)
  );

  const legendData =
    sortedData[0] &&
    Object.keys(sortedData[0]).filter(
      (i) => i !== "refdate" && i !== "refdate_orig"
    );
  const xAxisData = sortedData.map((item) => item.refdate);

  // Initialize an object to hold the values for each key
  const seriesMap = {};
  // Iterate through each object in the sorted array
  sortedData.forEach((obj) => {
    for (const key of legendData) {
      if (!seriesMap[key]) {
        // If the key doesn't exist in the seriesMap, create it
        seriesMap[key] = { name: key, type: "line", data: [] };
      }
      // Push the value into the corresponding array
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
    grid: {
      top: "15%",
      left: "3%",
      right: "5%",
      bottom: "10%",
      containLabel: true,
    },
    /*toolbox: {
      feature: {
        saveAsImage: {}
      }
    },*/
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series: seriesData,
  });

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: "30vh", width: "27vw" }}
    />
  );
};

const ScoreBars = ({ title, data }) => {
  const headerRow = ["measure", "title", "descr", "score", "amount"];
  const measuresObject = data;
  const sourceData = measuresObject.map((obj) => Object.values(obj));
  sourceData.unshift(headerRow);

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
    grid: {
      containLabel: true,
      left: "2%", // Reduce left space
      right: "4%", // Reduce right space
      top: "10%", // Adjust top space if needed
      bottom: "15%", // Adjust bottom space if needed
    },
    tooltip: {
      trigger: "item", // Trigger on the item (bar)
      formatter: function (params) {
        const measure = params.data[1]; // title
        const descr = params.data[2]; // descr
        const score = params.data[3]; // score
        return `
          <strong>${measure}</strong><br/>
          <strong>Score:</strong> ${score}<br/>
          <strong>Descr:</strong> ${descr.replace("#", "<br/>")}
        `;
      },
      axisPointer: {
        type: "shadow", // Display a shadow pointer
      },
    },
    dataset: {
      source: sourceData,
    },
    xAxis: { name: "" },
    yAxis: { type: "category", inverse: "true" },
    series: [
      {
        type: "bar",
        encode: {
          x: "amount",
          y: "measure",
        },
      },
    ],
    visualMap: {
      orient: "horizontal",
      left: "center",
      min: 0,
      max: 1,
      text: ["1", "0"],
      dimension: 3, //score
      inRange: {
        color: ["#FD665F", "#FFCE34", "#65B581"],
      },
      formatter: (value) => {
        return value.toFixed(3);
      },
    },
  });

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: "50vh", width: "55vw" }}
    />
  );
};

const BoxplotChart = ({ data }) => {
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
        text: "quality measures - distribution",
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
      },
      xAxis: {
        name: "",
      },
      yAxis: {
        type: "category",
      },
      grid: {
        bottom: "15%",
        top: "10%",
      },
      series: [
        {
          name: "boxplot",
          type: "boxplot",
          datasetId: "measures_aggregate",
          itemStyle: {
            color: "#b3daff", //"#b8c5f2",
          },
          encode: {
            x: ["min", "Q1", "median", "Q3", "max"],
            y: "Measure",
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
          {/* <StatCard title="placeholder" stat="x" /> */}
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
          <BoxplotChart data={homeData.distribution_data || []} />
        </section>
        <section
          style={{
            width: "56vw",
          }}
        >
          <ScoreBars
            title={"quality measures - overall average"}
            data={homeData.measure_averages || []}
          />
        </section>
      </div>
    </div>
  );
};

export default Homepage;

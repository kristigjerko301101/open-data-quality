import React from "react";
import "../App.css";

import ReactECharts from "echarts-for-react";

const StatCard = ({ title, stat }) => {
  return (
    <div className="card">
      <div className="stat">{stat}</div>
      <div className="title">{title}</div>
      {/*<div className="description">{description}</div>*/}
    </div>
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
      style={{ height: "50vh", width: "40vw" }}
    />
  );
};

const StackedLinesMeasures = ({ title, data }) => {
  const legendData =
    data[0] && Object.keys(data[0]).filter((i) => i !== "refdate");
  const xAxisData = data.map((item) => item.refdate);

  // Initialize an object to hold the values for each key
  const seriesMap = {};
  // Iterate through each object in the input array
  data.forEach((obj) => {
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

  const allData = seriesData.flatMap((seriesData) => seriesData.data); // Flatten all data into a single array
  const minY = Math.floor(Math.min(...allData) * 10) / 10; // Find the minimum value
  const maxY = Math.max(...allData); // Find the maximum value

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
    },
    legend: {
      orient: "vertical",
      right: "1%",
      top: "15%",
      data: legendData,
    },
    grid: {
      left: "3%",
      right: "12%",
      bottom: "3%",
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
      min: minY,
      max: maxY,
    },
    series: seriesData,
  });

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: "50vh", width: "55vw" }}
    />
  );
};

const StackedLinesProcesses = ({ title, data }) => {
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
          <StackedLinesProcesses
            title={"discovery process"}
            data={homeData.daily_registered || []}
          />
          <StackedLinesProcesses
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
          <ScoreBars
            title={"quality measures - overall average"}
            data={homeData.measure_averages || []}
          />
        </section>
        <section
          style={{
            width: "56vw",
          }}
        >
          <StackedLinesMeasures
            title={"quality measures - cumulative average"}
            data={homeData.cumulative_averages || []}
          />
        </section>
      </div>
    </div>
  );
};

export default Homepage;

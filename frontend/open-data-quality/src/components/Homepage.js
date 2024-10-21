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

const ScoreGauge = ({ name, value, descr }) => {
  const getOption = () => ({
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      formatter: descr,
      textStyle: {
        fontSize: 14,
      },
    },
    series: [
      {
        name: "Quality",
        type: "gauge",
        min: 0,
        max: 1,
        radius: "95%",
        center: ["50%", "50%"],
        pointer: {
          width: 5,
          itemStyle: {
            color: "#0066cc",
          },
        },
        progress: {
          show: true,
          width: 15,
          itemStyle: {
            color: "#0066cc",
          },
        },
        axisLabel: {
          fontSize: 8,
        },
        title: {
          fontSize: 12,
          fontWeight: "bold",
          offsetCenter: [0, "50%"],
        },
        detail: {
          valueAnimation: true,
          formatter: (val) => val.toFixed(3).replace(".", ","),
          fontSize: 14,
          offsetCenter: [0, "70%"],
        },
        data: [
          {
            value: value,
            name: name,
          },
        ],
      },
    ],
  });

  return (
    <ReactECharts
      option={getOption()}
      style={{ height: "25vh", width: "20vw" }}
    />
  );
};

const ProgressLine = ({ title, xAxis, series }) => {
  const getOption = () => ({
    title: {
      text: title,
    },
    tooltip: {
      trigger: "axis",
    },
    /*legend: {
      data: [],
    },*/
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxis,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: title,
        type: "line",
        stack: "Total",
        data: series,
      },
    ],
    toolbox: {
      feature: {
        saveAsImage: {
          show: false,
        },
      },
    },
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
            height: "30vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "15px",
          }}
        >
          <StatCard
            title="total resources"
            stat={
              homeData.overall_numbers &&
              parseFloat(homeData.overall_numbers[0].total_res).toLocaleString(
                "it"
              )
            }
          />
          <StatCard
            title="total csv resources"
            stat={
              homeData.overall_numbers &&
              parseFloat(homeData.overall_numbers[0].csv_res).toLocaleString(
                "it"
              )
            }
          />
          <StatCard title="placeholder" stat="x" />
          <StatCard
            title="processed csv resources"
            stat={
              homeData.overall_numbers &&
              parseFloat(homeData.overall_numbers[0].csv_ok).toLocaleString(
                "it"
              )
            }
          />
          <StatCard
            title="invalid csv resources"
            stat={
              homeData.overall_numbers &&
              parseFloat(homeData.overall_numbers[0].csv_error).toLocaleString(
                "it"
              )
            }
          />
          <StatCard title="placeholder" stat="x" />
        </section>
        <section
          style={{
            width: "55vw",
            height: "30vh",
            display: "grid",
            gridTemplateColumns: "1fr 1fr ",
            gap: "15px",
          }}
        >
          <ProgressLine
            title={"daily registered csv"}
            xAxis={
              homeData.daily_registered &&
              homeData.daily_registered.map((item) => item.x)
            }
            series={
              homeData.daily_registered &&
              homeData.daily_registered.map((item) => item.y)
            }
          />
          <ProgressLine
            title={"daily processed csv"}
            xAxis={
              homeData.daily_processed &&
              homeData.daily_processed.map((item) => item.x)
            }
            series={
              homeData.daily_processed &&
              homeData.daily_processed.map((item) => item.y)
            }
          />
        </section>
      </div>
      <div style={{ display: "flex", height: "55vh" }}>
        <section
          style={{
            width: "60vw",
          }}
        >
          <div style={{ display: "flex" }}>
            <ScoreGauge
              name={"ACC-I-3"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].acci3
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
            <ScoreGauge
              name={"ACC-I-4"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].acci4
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
            <ScoreGauge
              name={"AVA-D-1"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].avad1
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
            <ScoreGauge
              name={"COM-I-1"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].comi1
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
            <ScoreGauge
              name={"COM-I-5"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].comi5
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
          </div>
          <div style={{ display: "flex" }}>
            <ScoreGauge
              name={"CON-I-2"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].coni2
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
            <ScoreGauge
              name={"CON-I-3"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].coni3
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
            <ScoreGauge
              name={"CON-I-4"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].coni4
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
            <ScoreGauge
              name={"CON-I-5"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].coni5
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
            <ScoreGauge
              name={"UND-I-1"}
              value={
                homeData.measure_averages && homeData.measure_averages[0].undi1
              }
              descr={"MEASURE <br/>DESCRIPTION"}
            />
          </div>
        </section>
        <section
          style={{
            width: "40vw",
          }}
        ></section>
      </div>
    </div>
  );
};

export default Homepage;

import React, { useState, useEffect, useMemo } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import "./App.css";
import Toolbar from "./components/Toolbar";
import Homepage from "./components/Homepage";
import DataQuality from "./components/DataQuality";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const detailColumnDefsConfig = [
  {
    headerName: "",
    field: "url",
    cellRenderer: function (params) {
      const handleClick = () => {
        const url = params.data.url; // Access the URL from the row data
        window.open(url, "_blank"); // Open the URL in a new tab
      };
      return (
        <button onClick={handleClick} className="download-button">
          <FontAwesomeIcon icon={faDownload} />
        </button>
      );
    },
    cellStyle: { textAlign: "center" },
    width: 60,
  },
  { headerName: "Resource", field: "resource", sortable: true, filter: true },
  { headerName: "Dataset", field: "dataset", sortable: true, filter: true },
  {
    headerName: "Organization",
    field: "organization",
    sortable: true,
    filter: true,
  },
  {
    headerName: "Format",
    field: "format",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "Description",
    field: "description",
    sortable: true,
    filter: true,
  },
  {
    headerName: "AccI3",
    field: "acci3",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "AccI4",
    field: "acci4",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "AvaD1",
    field: "avad1",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "ComI1",
    field: "comi1",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "ComI5",
    field: "comi5",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "ConI2",
    field: "coni2",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "ConI3",
    field: "coni3",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "ConI4",
    field: "coni4",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "ConI5",
    field: "coni5",
    sortable: true,
    filter: true,
    width: 100,
  },
  {
    headerName: "UndI1",
    field: "undi1",
    sortable: true,
    filter: true,
    width: 100,
  },
];

const App = () => {
  const [selectedDimension, setSelectedDimension] = useState("home");
  const [dimensionData, setDimensionData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [homeData, setHomeData] = useState([]);
  const [detailColumnDefs, setDetailColumnDefs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const minimumLoadingTime = 1000;
    const startTime = Date.now();
    setLoading(true);

    // Fetch the data from backend
    fetch(
      `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/` +
        selectedDimension
    )
      .then((response) => response.json())
      .then((data) => {
        if (selectedDimension === "home") {
          setHomeData(data);
        } else {
          setDimensionData(data.dimension);
          setDetailData(data.detail);
        }

        // Check if minimum loading time has passed
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minimumLoadingTime - elapsedTime;

        // Delay stopping the loading state if minimum loading time is not met
        setTimeout(
          () => {
            setLoading(false);
          },
          remainingTime > 0 ? remainingTime : 0
        );
      })
      .catch((error) => console.error("Error fetching data:", error));

    // remove the dimension column from the detail grid except for "resource" which has only the detail grid
    setDetailColumnDefs(
      selectedDimension !== "resource"
        ? detailColumnDefsConfig.filter(
            (item) => item.field !== selectedDimension
          )
        : detailColumnDefsConfig
    );

    setSelectedDimension(selectedDimension);
  }, [selectedDimension]);

  const renderSelectedDimensionPage = useMemo(() => {
    if (
      ["group", "tag", "organization", "dataset", "resource"].includes(
        selectedDimension
      )
    ) {
      return (
        <DataQuality
          selectedDimension={selectedDimension}
          dimensionData={dimensionData}
          detailData={detailData}
          detailColumnDefs={detailColumnDefs}
          avgData={homeData.measure_averages || []}
        />
      );
    } else if (selectedDimension === "home") {
      return <Homepage homeData={homeData} />;
    } else {
      return (
        <section>
          <h1>default</h1>
        </section>
      );
    }
  }, [detailData, homeData]);

  return (
    <div>
      <Toolbar
        selectedDimension={selectedDimension}
        setSelectedDimension={setSelectedDimension}
      />
      {!loading && (
        <div style={{ height: "90vh" }}>{renderSelectedDimensionPage}</div>
      )}
      {loading && (
        <div className="spinner-overlay">
          <ClipLoader color="#ffffff" loading={loading} size={50} />
        </div>
      )}
    </div>
  );
};

export default App;

import React, { useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const DimensionMeasuresGrid = ({
  selectedDimension,
  dimensionData,
  setSelectedDimensionRow,
}) => {
  const gridApiRef = useRef(null);
  const [selectedRowId, setSelectedRowId] = useState(null); // Track selected row ID

  const columnDefs = [
    // Column definitions
    {
      headerName:
        selectedDimension.charAt(0).toUpperCase() +
        selectedDimension.slice(1).toLowerCase(),
      field: "dimension",
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: "Total",
      field: "total",
      sortable: true,
      filter: false,
      width: 80,
      comparator: (valA, valB, n1, n2, inverse) => {
        const digitsA = parseInt(valA);
        const digitsB = parseInt(valB);
        return digitsA - digitsB;
      },
    },
    {
      headerName: "AccI3",
      field: "acci3",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "AccI4",
      field: "acci4",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "Avad2",
      field: "avad2",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "ComI1",
      field: "comi1",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "ComI5",
      field: "comi5",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "ConI2",
      field: "coni2",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "ConI3",
      field: "coni3",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "ConI4",
      field: "coni4",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "ConI5",
      field: "coni5",
      sortable: true,
      filter: false,
      width: 80,
    },
    {
      headerName: "UndI1",
      field: "undi1",
      sortable: true,
      filter: false,
      width: 80,
    },
  ];

  // Initialize the grid and set the first row as selected
  const onGridReady = (params) => {
    gridApiRef.current = params.api; // Save the gridApi for future usage
  };

  // Handle selection change
  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    if (selectedRows.length > 0) {
      const selectedRow = selectedRows[0];

      // Only trigger update if a new row is selected
      if (selectedRow.dimension !== selectedRowId) {
        setSelectedRowId(selectedRow.dimension); // Update local state
        setSelectedDimensionRow(selectedRow); // Notify parent about the new selection
      }
    }
  };

  // Auto-select the first row
  useEffect(() => {
    if (gridApiRef.current && dimensionData) {
      const firstRowNode = gridApiRef.current.getDisplayedRowAtIndex(0);
      const nodes = [firstRowNode];
      gridApiRef.current.setNodesSelected({ nodes, newValue: true });
    }
  }, [gridApiRef.current, dimensionData]);

  return (
    <div className="ag-theme-alpine" style={{ height: "100%", width: "95%" }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={dimensionData}
        rowSelection="single"
        onSelectionChanged={onSelectionChanged}
        onGridReady={onGridReady}
      />
    </div>
  );
};

export default DimensionMeasuresGrid;

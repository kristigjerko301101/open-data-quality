import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const DetailMeasuresGrid = ({ detailData, detailColumnDefs }) => {
  return (
    <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
      <AgGridReact columnDefs={detailColumnDefs} rowData={detailData} />
    </div>
  );
};

export default DetailMeasuresGrid;

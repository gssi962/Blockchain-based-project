const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No records found",
  onRowClick,
}) => {
  return (
    <div className="table-wrapper">
      <table className="cs-table">

        {/* Table Header */}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  width: column.width || "auto",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>

          {/* Loading */}
          {loading && (
            <tr>
              <td
                colSpan={columns.length}
                className="table-message"
              >
                <div className="table-loading">
                  <span className="table-spinner"></span>
                  Loading...
                </div>
              </td>
            </tr>
          )}

          {/* Empty */}
          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="table-message"
              >
                <div className="table-empty">
                  <div className="empty-symbol">◇</div>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}

          {/* Data */}
          {!loading &&
            data.length > 0 &&
            data.map((row, index) => (
              <tr
                key={
                  row.id ||
                  row._id ||
                  row.transactionId ||
                  index
                }
                onClick={() => {
                  if (onRowClick) {
                    onRowClick(row);
                  }
                }}
                className={
                  onRowClick
                    ? "table-row-clickable"
                    : ""
                }
              >
                {columns.map((column) => (
  <td key={column.key}>
    {column.render
      ? column.render(row[column.key], row)
      : row?.[column.key] ?? "—"}
  </td>
))}
              </tr>
            ))}

        </tbody>
      </table>
    </div>
  );
};

export default Table;
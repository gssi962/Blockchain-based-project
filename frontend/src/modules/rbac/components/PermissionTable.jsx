const PermissionTable = ({ roles = [], permissions = [] }) => {
  return (
    <div className="permission-card">
      <div className="section-label">
        AUTHORIZATION MATRIX
      </div>

      <h2>Permission Overview</h2>

      <div className="table-wrapper">
        <table className="permission-table">
          <thead>
            <tr>
              <th>PERMISSION</th>

              {roles.map((role) => (
                <th key={role.id}>
                  {role.name?.toUpperCase() || "ROLE"}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {permissions.length === 0 ? (
              <tr>
                <td
                  colSpan={roles.length + 1}
                  className="empty-state"
                >
                  No permissions available.
                </td>
              </tr>
            ) : (
              permissions.map((permission) => (
                <tr key={permission.id}>
                  <td>
                    <strong>{permission.name}</strong>
                    <small>
                      {permission.description}
                    </small>
                  </td>

                  {roles.map((role) => {
                    const allowed =
                      Array.isArray(role.permissions) &&
                      role.permissions.includes(permission.id);

                    return (
                      <td key={role.id}>
                        {allowed ? (
                          <span className="permission-yes">
                            ✓
                          </span>
                        ) : (
                          <span className="permission-no">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionTable;
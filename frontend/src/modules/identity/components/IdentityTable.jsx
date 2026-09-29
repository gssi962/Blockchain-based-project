import DIDBadge from "./DIDBadge";

const IdentityTable = ({ identities, onRefresh }) => {
  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <span className="section-label">
            DECENTRALIZED IDENTITY
          </span>

          <h2>Registered Identities</h2>
        </div>

        <button
          className="secondary-btn"
          onClick={onRefresh}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>IDENTITY</th>
              <th>DID</th>
              <th>ROLE</th>
              <th>ORGANIZATION</th>
              <th>VERIFICATION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {identities.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="empty-state"
                >
                  <div className="empty-icon">◇</div>

                  <strong>
                    No identities registered yet.
                  </strong>

                  <p>
                    Add an identity to create a DID.
                  </p>
                </td>
              </tr>
            ) : (
              identities.map((identity) => (
                <tr key={identity.id || identity.did}>
                  <td>
                    <strong>
                      {identity.name}
                    </strong>

                    <small>
                      {identity.email}
                    </small>
                  </td>

                  <td>
                    <DIDBadge did={identity.did} />
                  </td>

                  <td>
                    <span className="role-badge">
                      {identity.role}
                    </span>
                  </td>

                  <td>
                    {identity.organization}
                  </td>

                  <td>
                    {identity.verified ||
                    identity.status === "Verified" ? (
                      <span className="status verified">
                        ● Verified
                      </span>
                    ) : (
                      <span className="status pending">
                        ● Pending
                      </span>
                    )}
                  </td>

                  <td>
                    <button
                      className="action-btn"
                      onClick={() =>
                        navigator.clipboard?.writeText(
                          identity.did || ""
                        )
                      }
                    >
                      Copy DID
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IdentityTable;
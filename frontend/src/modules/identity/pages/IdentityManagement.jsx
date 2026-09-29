import { useEffect, useState } from "react";

import IdentityTable from "../components/identityTable";
import AddIdentity from "../components/AddIdentity";
import { getIdentities } from "../services/didService";

const IdentityManagement = () => {
  const [identities, setIdentities] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadIdentities = async () => {
    setLoading(true);

    const data = await getIdentities();

    setIdentities(Array.isArray(data) ? data : []);

    setLoading(false);
  };

  useEffect(() => {
    loadIdentities();
  }, []);

  const handleCreated = (identity) => {
    setIdentities((prev) => [
      ...prev,
      identity,
    ]);
  };

  const verified = identities.filter(
    (item) =>
      item.verified === true ||
      item.status === "Verified"
  ).length;

  const pending = identities.length - verified;

  return (
    <div className="module-page">

      <div className="page-top">
        <div>
          <span className="section-label">
            CRYPTA SHIELD / IDENTITY
          </span>

          <h1>Identity Management</h1>

          <p>
            Manage decentralized identities,
            verification and access roles.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowAdd(true)}
        >
          + Add Identity
        </button>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <span>Total Identities</span>
          <strong>{identities.length}</strong>
        </div>

        <div className="stat-card">
          <span>Verified</span>
          <strong>{verified}</strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>

        <div className="stat-card">
          <span>DID Network</span>
          <strong className="online">
            ● Active
          </strong>
        </div>

      </div>

      {loading ? (
        <div className="loading-box">
          Loading identities...
        </div>
      ) : (
        <IdentityTable
          identities={identities}
          onRefresh={loadIdentities}
        />
      )}

      <div className="security-info">
        <strong>
          ◆ Decentralized Identity Security
        </strong>

        <p>
          Each registered identity is associated
          with a unique DID and can be verified
          before receiving blockchain permissions.
        </p>
      </div>

      {showAdd && (
        <AddIdentity
          onCreated={handleCreated}
          onClose={() => setShowAdd(false)}
        />
      )}

    </div>
  );
};

export default IdentityManagement;
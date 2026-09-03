import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";

import {
  fetchAssetById,
  transferAsset,
} from "../services/api";

function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [asset, setAsset] = useState(null);

  const [loading, setLoading] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const [transferForm, setTransferForm] = useState({
    newOwner: "",
    reason: "",
  });

  const [transferResult, setTransferResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAsset();
  }, [id]);

  const loadAsset = async () => {
    try {
      setLoading(true);

      const response = await fetchAssetById(id);

      setAsset(
        response?.data ??
        response
      );
    } catch (err) {
      console.error("Asset details error:", err);
      setError(
        "Unable to load asset details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;

    setTransferForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openTransfer = () => {
    setTransferForm({
      newOwner: "",
      reason: "",
    });

    setTransferResult(null);
    setError("");
    setTransferOpen(true);
  };

  const closeTransfer = () => {
    if (transferring) return;

    setTransferOpen(false);
    setTransferResult(null);
    setError("");
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");
    setTransferResult(null);

    if (!transferForm.newOwner.trim()) {
      setError("New owner DID or identity is required.");
      return;
    }

    const currentOwner =
      asset?.ownerDid ||
      asset?.owner ||
      asset?.ownerName ||
      "";

    if (
      transferForm.newOwner.trim() ===
      currentOwner
    ) {
      setError(
        "New owner must be different from current owner."
      );
      return;
    }

    try {
      setTransferring(true);

      const response = await transferAsset(
        id,
        transferForm
      );

      const result =
        response?.data ??
        response;

      setTransferResult(result);

      await loadAsset();

    } catch (err) {
      console.error("Asset transfer error:", err);

      setError(
        err.response?.data?.message ||
        "Asset transfer failed."
      );
    } finally {
      setTransferring(false);
    }
  };

  const getStatusClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (
      value.includes("active") ||
      value.includes("verified") ||
      value.includes("secured") ||
      value.includes("confirmed")
    ) {
      return "status-success";
    }

    if (
      value.includes("pending") ||
      value.includes("processing")
    ) {
      return "status-warning";
    }

    if (
      value.includes("failed") ||
      value.includes("blocked") ||
      value.includes("inactive")
    ) {
      return "status-danger";
    }

    return "status-neutral";
  };

  const shortenHash = (value, start = 12, end = 8) => {
    if (!value) return "—";

    const stringValue = String(value);

    if (stringValue.length <= start + end) {
      return stringValue;
    }

    return `${stringValue.slice(
      0,
      start
    )}...${stringValue.slice(-end)}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="app-layout">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="main-content">

          <Navbar
            title="Asset Details"
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />

          <main className="page-content">
            <div className="asset-loading">
              <div className="loading-spinner"></div>
              <span>
                Loading blockchain asset...
              </span>
            </div>
          </main>

        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="app-layout">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="main-content">

          <Navbar
            title="Asset Details"
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />

          <main className="page-content">

            <div className="asset-not-found">

              <div className="not-found-icon">
                ◈
              </div>

              <h2>Asset Not Found</h2>

              <p>
                The requested blockchain asset
                could not be located.
              </p>

              <Button
                variant="secondary"
                onClick={() =>
                  navigate("/assets")
                }
              >
                ← Back to Assets
              </Button>

            </div>

          </main>
        </div>
      </div>
    );
  }

  const assetId =
    asset.assetId ||
    asset.id ||
    asset._id ||
    id;

  const nftId =
    asset.nftId ||
    asset.nftID ||
    "NFT-PENDING";

  const owner =
    asset.ownerName ||
    asset.owner ||
    "Unassigned";

  const ownerDid =
    asset.ownerDid ||
    asset.ownerDID ||
    "DID-PENDING";

  const status =
    asset.status ||
    "ACTIVE";

  const history =
    asset.ownershipHistory ||
    asset.history ||
    [];

  return (
    <div className="app-layout">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">

        <Navbar
          title="Asset Details"
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="page-content">

          {/* HEADER */}

          <div className="page-header">

            <div>

              <button
                className="back-button"
                onClick={() =>
                  navigate("/assets")
                }
              >
                ← Asset Registry
              </button>

              <div className="page-eyebrow">
                CRYPTA SHIELD / ASSET RECORD
              </div>

              <h1>
                {asset.name || "Blockchain Asset"}
              </h1>

              <p className="asset-header-id">
                Asset ID:{" "}
                <span>{assetId}</span>
              </p>

            </div>

            <div className="asset-header-actions">

              <span
                className={`status-badge ${getStatusClass(
                  status
                )}`}
              >
                <span className="status-dot"></span>
                {status}
              </span>

              <Button
                variant="primary"
                onClick={openTransfer}
              >
                ⇄ Transfer Asset
              </Button>

            </div>

          </div>


          {/* OVERVIEW */}

          <section className="asset-detail-grid">

            <div className="dashboard-card asset-overview-card">

              <div className="card-header">

                <div>
                  <span className="card-eyebrow">
                    ASSET OVERVIEW
                  </span>

                  <h2>Asset Information</h2>
                </div>

                <div className="asset-main-icon">
                  ◈
                </div>

              </div>

              <div className="asset-info-grid">

                <div className="asset-info-item">
                  <span>ASSET ID</span>
                  <strong>{assetId}</strong>
                </div>

                <div className="asset-info-item">
                  <span>CATEGORY</span>
                  <strong>
                    {asset.category ||
                      "Digital Asset"}
                  </strong>
                </div>

                <div className="asset-info-item">
                  <span>ESTIMATED VALUE</span>
                  <strong>
                    {asset.value !== undefined &&
                    asset.value !== null
                      ? asset.value
                      : "—"}
                  </strong>
                </div>

                <div className="asset-info-item">
                  <span>CREATED</span>
                  <strong>
                    {formatDate(
                      asset.createdAt ||
                      asset.createdDate
                    )}
                  </strong>
                </div>

              </div>

              <div className="asset-description">

                <span>DESCRIPTION</span>

                <p>
                  {asset.description ||
                    "No description has been provided for this asset."}
                </p>

              </div>

            </div>


            {/* NFT */}

            <div className="dashboard-card nft-card">

              <div className="card-header">

                <div>
                  <span className="card-eyebrow">
                    DIGITAL OWNERSHIP
                  </span>

                  <h2>NFT Record</h2>
                </div>

                <div className="nft-symbol">
                  ◆
                </div>

              </div>

              <div className="nft-visual">

                <div className="nft-hex">
                  ◆
                </div>

                <div>
                  <span>NFT IDENTIFIER</span>

                  <strong>
                    {shortenHash(nftId)}
                  </strong>

                  <small>
                    Non-fungible ownership token
                  </small>
                </div>

              </div>

              <div className="nft-status">

                <span>
                  MINT STATUS
                </span>

                <strong className="status-success-text">
                  ● Minted & Linked
                </strong>

              </div>

            </div>

          </section>


          {/* OWNER + BLOCKCHAIN */}

          <section className="asset-detail-grid">

            <div className="dashboard-card">

              <div className="card-header">

                <div>
                  <span className="card-eyebrow">
                    OWNERSHIP
                  </span>

                  <h2>Current Owner</h2>
                </div>

              </div>

              <div className="current-owner">

                <div className="owner-large-avatar">
                  {owner
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>{owner}</strong>

                  <span>
                    {shortenHash(ownerDid)}
                  </span>
                </div>

                <span className="verified-owner">
                  ✓ Verified
                </span>

              </div>

              <div className="owner-detail-row">
                <span>OWNER DID</span>
                <strong>{ownerDid}</strong>
              </div>

              <div className="owner-detail-row">
                <span>OWNERSHIP STATUS</span>
                <strong className="status-success-text">
                  Active
                </strong>
              </div>

            </div>


            {/* BLOCKCHAIN */}

            <div className="dashboard-card">

              <div className="card-header">

                <div>
                  <span className="card-eyebrow">
                    DISTRIBUTED LEDGER
                  </span>

                  <h2>Blockchain Record</h2>
                </div>

                <span className="ledger-online">
                  ● ONLINE
                </span>

              </div>

              <div className="blockchain-info-list">

                <div>
                  <span>NETWORK</span>
                  <strong>
                    {asset.network ||
                      "Hyperledger Fabric"}
                  </strong>
                </div>

                <div>
                  <span>CHANNEL</span>
                  <strong>
                    {asset.channel ||
                      "crypta-channel"}
                  </strong>
                </div>

                <div>
                  <span>CHAINCODE</span>
                  <strong>
                    {asset.chaincode ||
                      "AssetContract"}
                  </strong>
                </div>

                <div>
                  <span>TRANSACTION HASH</span>
                  <strong className="hash-value">
                    {shortenHash(
                      asset.transactionId ||
                      asset.txId
                    )}
                  </strong>
                </div>

              </div>

            </div>

          </section>


          {/* OWNERSHIP HISTORY */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>
                <span className="card-eyebrow">
                  OWNERSHIP LEDGER
                </span>

                <h2>Ownership History</h2>
              </div>

              <span className="immutable-label">
                ⛓ IMMUTABLE RECORD
              </span>

            </div>

            {history.length === 0 ? (

              <div className="history-empty">
                <div>◇</div>

                <p>
                  No ownership transfers have
                  been recorded for this asset.
                </p>
              </div>

            ) : (

              <div className="ownership-timeline">

                {history.map((item, index) => (

                  <div
                    className="timeline-item"
                    key={
                      item.id ||
                      item.txId ||
                      index
                    }
                  >

                    <div className="timeline-marker">
                      {index === 0
                        ? "●"
                        : "✓"}
                    </div>

                    <div className="timeline-content">

                      <div className="timeline-top">

                        <strong>
                          {item.ownerName ||
                            item.owner ||
                            "Unknown Owner"}
                        </strong>

                        <span>
                          {formatDate(
                            item.timestamp ||
                            item.createdAt
                          )}
                        </span>

                      </div>

                      <p>
                        {item.action ||
                          "Ownership recorded"}
                      </p>

                      <small>
                        {shortenHash(
                          item.txId ||
                          item.transactionId
                        )}
                      </small>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>


          {/* TRANSFER CTA */}

          <div className="transfer-banner">

            <div className="transfer-banner-icon">
              ⇄
            </div>

            <div>
              <h3>
                Need to change ownership?
              </h3>

              <p>
                Initiate a secure blockchain
                ownership transfer. The operation
                will be recorded permanently on
                the ledger.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={openTransfer}
            >
              Transfer Ownership →
            </Button>

          </div>

        </main>
      </div>


      {/* TRANSFER MODAL */}

      <Modal
        isOpen={transferOpen}
        onClose={closeTransfer}
        title="Transfer Asset Ownership"
        size="medium"
      >

        {transferResult ? (

          <div className="transfer-success">

            <div className="transfer-success-icon">
              ✓
            </div>

            <span className="card-eyebrow">
              BLOCKCHAIN CONFIRMED
            </span>

            <h2>
              Ownership Transferred
            </h2>

            <p>
              The asset ownership transfer has
              been submitted successfully.
            </p>

            <div className="transaction-result">

              <span>TRANSACTION ID</span>

              <strong>
                {transferResult.transactionId ||
                  transferResult.txId ||
                  "Transaction submitted"}
              </strong>

            </div>

            <Button
              variant="primary"
              onClick={closeTransfer}
            >
              Done
            </Button>

          </div>

        ) : (

          <form
            className="transfer-form"
            onSubmit={handleTransfer}
          >

            <div className="transfer-warning">
              <span>!</span>

              <p>
                Ownership transfers are recorded
                on the blockchain and cannot be
                silently reversed.
              </p>
            </div>


            {error && (
              <div className="form-error">
                {error}
              </div>
            )}


            <div className="transfer-owner-box">

              <span>CURRENT OWNER</span>

              <strong>
                {owner}
              </strong>

              <small>
                {ownerDid}
              </small>

            </div>


            <div className="transfer-arrow">
              ↓
            </div>


            <div className="form-group">

              <label>
                NEW OWNER DID / IDENTITY
              </label>

              <input
                type="text"
                name="newOwner"
                value={transferForm.newOwner}
                onChange={handleTransferChange}
                placeholder="did:crypta:..."
              />

            </div>


            <div className="form-group">

              <label>
                TRANSFER REASON
              </label>

              <textarea
                name="reason"
                value={transferForm.reason}
                onChange={handleTransferChange}
                placeholder="Enter reason for ownership transfer"
                rows="3"
              />

            </div>


            <div className="modal-actions">

              <Button
                type="button"
                variant="ghost"
                onClick={closeTransfer}
                disabled={transferring}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                loading={transferring}
              >
                Confirm Transfer
              </Button>

            </div>

          </form>

        )}

      </Modal>

    </div>
  );
}

export default AssetDetails;
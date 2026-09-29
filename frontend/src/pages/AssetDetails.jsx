import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";

import api, {
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

  const [documentLoading, setDocumentLoading] =
    useState(false);

  const [documentError, setDocumentError] =
    useState("");

  const [transferForm, setTransferForm] = useState({
    newOwner: "",
    reason: "",
  });

  const [transferResult, setTransferResult] =
    useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    loadAsset();
  }, [id]);

  const loadAsset = async () => {
    try {
      setLoading(true);

      const response = await fetchAssetById(id);

      const assetData =
        response?.data ??
        response;

      setAsset(assetData);

    } catch (err) {
      console.error(
        "Asset details error:",
        err
      );

      setError(
        "Unable to load asset details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DOCUMENT HELPERS
  // =====================================================

  const getAssetFileName = () => {

    return (
      asset?.fileName ||
      asset?.file_name ||
      asset?.originalFileName ||
      asset?.original_file_name ||
      asset?.storageFileName ||
      asset?.storage_file_name ||
      "Asset Document"
    );

  };

  const getAssetFileType = () => {

    return (
      asset?.fileType ||
      asset?.file_type ||
      "application/octet-stream"
    );

  };

  const getAssetFileSize = () => {

    return (
      asset?.fileSize ??
      asset?.file_size ??
      null
    );

  };

  const getAssetFileHash = () => {

    return (
      asset?.fileHash ||
      asset?.file_hash ||
      ""
    );

  };

  const hasAssetDocument = () => {

    return Boolean(
      asset?.fileName ||
      asset?.file_name ||
      asset?.storageFileName ||
      asset?.storage_file_name ||
      asset?.storageReference ||
      asset?.storage_reference
    );

  };

  const formatFileSize = (bytes) => {

    if (
      bytes === null ||
      bytes === undefined ||
      bytes === ""
    ) {
      return "—";
    }

    const size =
      Number(bytes);

    if (
      Number.isNaN(size) ||
      size < 0
    ) {
      return "—";
    }

    if (size < 1024) {
      return `${size} Bytes`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(2)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
      return `${(
        size /
        (1024 * 1024)
      ).toFixed(2)} MB`;
    }

    return `${(
      size /
      (1024 * 1024 * 1024)
    ).toFixed(2)} GB`;

  };

  const getFileExtension = () => {

    const fileName =
      getAssetFileName();

    if (!fileName) {
      return "FILE";
    }

    const parts =
      String(fileName).split(".");

    if (parts.length <= 1) {
      return "FILE";
    }

    return parts[
      parts.length - 1
    ]
      .toUpperCase();

  };

  // =====================================================
  // FETCH PRIVATE DOCUMENT
  // =====================================================

  const fetchAssetDocument = async () => {

    setDocumentError("");

    try {

      setDocumentLoading(true);

      const response =
        await api.get(
          `/assets/${id}/document`,
          {
            responseType: "blob",
          }
        );

      return response.data;

    } catch (err) {

      console.error(
        "Asset document error:",
        err
      );

      let message =
        "Unable to access the asset document.";

      if (
        err?.response?.data
          instanceof Blob
      ) {

        try {

          const text =
            await err.response.data.text();

          if (text) {

            const parsed =
              JSON.parse(text);

            message =
              parsed?.message ||
              message;

          }

        } catch (_) {
          // Keep default message.
        }

      } else if (
        err?.response?.data?.message
      ) {

        message =
          err.response.data.message;

      }

      setDocumentError(
        message
      );

      return null;

    } finally {

      setDocumentLoading(false);

    }

  };

  // =====================================================
  // VIEW DOCUMENT
  // =====================================================

  const handleViewDocument =
    async () => {

      const blob =
        await fetchAssetDocument();

      if (!blob) {
        return;
      }

      const fileType =
        getAssetFileType();

      const documentBlob =
        new Blob(
          [blob],
          {
            type:
              fileType ||
              blob.type ||
              "application/octet-stream",
          }
        );

      const url =
        window.URL.createObjectURL(
          documentBlob
        );

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      /*
       * Give the browser enough time to open
       * the object URL before releasing it.
       */

      setTimeout(() => {

        window.URL.revokeObjectURL(
          url
        );

      }, 60000);

    };

  // =====================================================
  // DOWNLOAD DOCUMENT
  // =====================================================

  const handleDownloadDocument =
    async () => {

      const blob =
        await fetchAssetDocument();

      if (!blob) {
        return;
      }

      const fileName =
        getAssetFileName();

      const documentBlob =
        new Blob(
          [blob],
          {
            type:
              getAssetFileType() ||
              blob.type ||
              "application/octet-stream",
          }
        );

      const url =
        window.URL.createObjectURL(
          documentBlob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        fileName ||
        "asset-document";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(() => {

        window.URL.revokeObjectURL(
          url
        );

      }, 1000);

    };

  // =====================================================
  // TRANSFER
  // =====================================================

  const handleTransferChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setTransferForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

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

    if (transferring) {
      return;
    }

    setTransferOpen(false);

    setTransferResult(null);

    setError("");

  };

  const handleTransfer =
    async (e) => {

      e.preventDefault();

      setError("");
      setTransferResult(null);

      if (
        !transferForm.newOwner.trim()
      ) {

        setError(
          "New owner DID or identity is required."
        );

        return;

      }

      const currentOwnerDid =
        asset?.ownerDid ||
        asset?.ownerDID ||
        "";

      const currentOwnerId =
        asset?.ownerId ||
        asset?.owner_id ||
        "";

      const currentOwnerName =
        asset?.ownerName ||
        (
          typeof asset?.owner ===
          "string"
            ? asset.owner
            : asset?.owner?.name
        ) ||
        "";

      const newOwnerValue =
        transferForm.newOwner.trim();

      if (
        newOwnerValue ===
        String(currentOwnerDid)
      ) {

        setError(
          "New owner must be different from current owner."
        );

        return;

      }

      if (
        currentOwnerId &&
        newOwnerValue ===
          String(currentOwnerId)
      ) {

        setError(
          "New owner must be different from current owner."
        );

        return;

      }

      if (
        currentOwnerName &&
        newOwnerValue.toLowerCase() ===
          currentOwnerName.toLowerCase()
      ) {

        setError(
          "New owner must be different from current owner."
        );

        return;

      }

      try {

        setTransferring(true);

        const response =
  await transferAsset(
    id,
    {
      toUser: transferForm.newOwner,
      reason: transferForm.reason
    }
  );
        const result =
          response?.data ??
          response;

        setTransferResult(
          result
        );

        await loadAsset();

      } catch (err) {

        console.error(
          "Asset transfer error:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Asset transfer failed."
        );

      } finally {

        setTransferring(false);

      }

    };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusClass = (
    status
  ) => {

    const value =
      String(
        status || ""
      ).toLowerCase();

    if (
      value.includes("active") ||
      value.includes("verified") ||
      value.includes("secured") ||
      value.includes("confirmed") ||
      value.includes("online") ||
      value.includes("connected")
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
      value.includes("inactive") ||
      value.includes("offline") ||
      value.includes("not connected")
    ) {

      return "status-danger";

    }

    return "status-neutral";

  };

  // =====================================================
  // SHORT HASH
  // =====================================================

  const shortenHash = (
    value,
    start = 12,
    end = 8
  ) => {

    if (!value) {
      return "—";
    }

    const stringValue =
      String(value);

    if (
      stringValue.length <=
      start + end
    ) {

      return stringValue;

    }

    return `${stringValue.slice(
      0,
      start
    )}...${stringValue.slice(
      -end
    )}`;

  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return "—";

    }

    return parsedDate.toLocaleString(
      [],
      {
        dateStyle:
          "medium",
        timeStyle:
          "short",
      }
    );

  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="app-layout">

        <Sidebar
          isOpen={
            sidebarOpen
          }
          onClose={() =>
            setSidebarOpen(false)
          }
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
                Loading asset details...
              </span>

            </div>

          </main>

        </div>

      </div>

    );

  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!asset) {

    return (

      <div className="app-layout">

        <Sidebar
          isOpen={
            sidebarOpen
          }
          onClose={() =>
            setSidebarOpen(false)
          }
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

              <h2>
                Asset Not Found
              </h2>

              <p>
                The requested asset could
                not be located.
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

  // =====================================================
  // ASSET DATA
  // =====================================================

  const assetId =
    asset.assetId ||
    asset.id ||
    asset._id ||
    id;

  const nftId =
    asset.nftId ||
    asset.nftID ||
    asset.nft_id ||
    "NFT-PENDING";

  // =====================================================
  // OWNER DETAILS
  // =====================================================

  const ownerObject =
    typeof asset.owner ===
    "object"
      ? asset.owner
      : null;

  const owner =
    asset.ownerName ||
    asset.owner_name ||
    ownerObject?.name ||
    (
      typeof asset.owner ===
      "string"
        ? asset.owner
        : null
    ) ||
    "Unassigned";

  const ownerDid =
    asset.ownerDid ||
    asset.ownerDID ||
    asset.owner_did ||
    ownerObject?.did ||
    "";

  const ownerId =
    asset.ownerId ||
    asset.owner_id ||
    ownerObject?.id ||
    "";

  const ownerEmail =
    asset.ownerEmail ||
    asset.owner_email ||
    ownerObject?.email ||
    "";

  const status =
    asset.status ||
    "ACTIVE";

  const history =
    asset.ownershipHistory ||
    asset.history ||
    [];

  // =====================================================
  // DOCUMENT DETAILS
  // =====================================================

  const documentAvailable =
    hasAssetDocument();

  const documentName =
    getAssetFileName();

  const documentType =
    getAssetFileType();

  const documentSize =
    getAssetFileSize();

  const documentHash =
    getAssetFileHash();

  const documentExtension =
    getFileExtension();

  // =====================================================
  // BLOCKCHAIN STATUS
  // =====================================================

  const nftIsMinted =
    Boolean(nftId) &&
    String(nftId)
      .trim()
      .toUpperCase() !==
      "NFT-PENDING" &&
    String(nftId)
      .trim()
      .toUpperCase() !==
      "PENDING" &&
    String(nftId)
      .trim()
      .toUpperCase() !==
      "NULL" &&
    String(nftId)
      .trim()
      .toUpperCase() !==
      "UNDEFINED";

  const rawBlockchainStatus =
    String(
      asset.blockchainStatus ||
      asset.blockchain_status ||
      asset.statusBlockchain ||
      ""
    )
      .trim()
      .toUpperCase();

  const blockchainConnected =
    asset.blockchainConnected ===
      true ||
    asset.connected === true ||
    asset.operational === true ||
    rawBlockchainStatus ===
      "CONNECTED" ||
    rawBlockchainStatus ===
      "ONLINE";

  const blockchainStatus =
    blockchainConnected
      ? "CONNECTED"
      : "NOT CONNECTED";

  const mintStatus =
    nftIsMinted
      ? "Minted & Linked"
      : "Mint Pending";

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="app-layout">

      <Sidebar
        isOpen={
          sidebarOpen
        }
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="main-content">

        <Navbar
          title="Asset Details"
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="page-content">

          {/* =================================================
              HEADER
          ================================================= */}

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
                {asset.name ||
                  "Digital Asset"}
              </h1>

              <p className="asset-header-id">
                Asset ID:{" "}
                <span>
                  {assetId}
                </span>
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
                onClick={
                  openTransfer
                }
              >
                ⇄ Transfer Asset
              </Button>

            </div>

          </div>


          {/* =================================================
              ASSET OVERVIEW + NFT
          ================================================= */}

          <section className="asset-detail-grid">

            <div className="dashboard-card asset-overview-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    ASSET OVERVIEW
                  </span>

                  <h2>
                    Asset Information
                  </h2>

                </div>

                <div className="asset-main-icon">
                  ◈
                </div>

              </div>

              <div className="asset-info-grid">

                <div className="asset-info-item">

                  <span>
                    ASSET ID
                  </span>

                  <strong>
                    {assetId}
                  </strong>

                </div>

                <div className="asset-info-item">

                  <span>
                    CATEGORY
                  </span>

                  <strong>
                    {asset.category ||
                      "Digital Asset"}
                  </strong>

                </div>

                <div className="asset-info-item">

                  <span>
                    ESTIMATED VALUE
                  </span>

                  <strong>
                    {asset.value !==
                      undefined &&
                    asset.value !==
                      null
                      ? asset.value
                      : "—"}
                  </strong>

                </div>

                <div className="asset-info-item">

                  <span>
                    CREATED
                  </span>

                  <strong>
                    {formatDate(
                      asset.createdAt ||
                      asset.createdDate
                    )}
                  </strong>

                </div>

              </div>

              <div className="asset-description">

                <span>
                  DESCRIPTION
                </span>

                <p>
                  {asset.description ||
                    "No description has been provided for this asset."}
                </p>

              </div>

            </div>


            {/* =================================================
                NFT
            ================================================= */}

            <div className="dashboard-card nft-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    DIGITAL OWNERSHIP
                  </span>

                  <h2>
                    NFT Record
                  </h2>

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

                  <span>
                    NFT IDENTIFIER
                  </span>

                  <strong>
                    {shortenHash(
                      nftId
                    )}
                  </strong>

                  <small>
                    Non-fungible ownership
                    token
                  </small>

                </div>

              </div>

              <div className="nft-status">

                <span>
                  MINT STATUS
                </span>

                <strong
                  className={
                    nftIsMinted
                      ? "status-success-text"
                      : "status-warning-text"
                  }
                >
                  ● {mintStatus}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              DOCUMENT
          ================================================= */}

          <section className="dashboard-card asset-document-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">
                  DIGITAL FILE
                </span>

                <h2>
                  Asset Document
                </h2>

              </div>

              <span className="immutable-label">
                PRIVATE STORAGE
              </span>

            </div>

            {documentAvailable ? (

              <div className="asset-document-container">

                <div className="asset-document-icon">
                  📄
                </div>

                <div className="asset-document-details">

                  <strong>
                    {documentName}
                  </strong>

                  <div className="asset-document-meta">

                    <span>
                      {documentExtension}
                    </span>

                    <span>
                      {formatFileSize(
                        documentSize
                      )}
                    </span>

                    <span>
                      {documentType}
                    </span>

                  </div>

                  {documentHash && (

                    <div className="asset-document-hash">

                      <span>
                        SHA-256
                      </span>

                      <strong>
                        {shortenHash(
                          documentHash,
                          18,
                          12
                        )}
                      </strong>

                    </div>

                  )}

                </div>

                <div className="asset-document-actions">

                  <Button
                    variant="secondary"
                    onClick={
                      handleViewDocument
                    }
                    disabled={
                      documentLoading
                    }
                  >

                    {documentLoading
                      ? "Opening..."
                      : "View Document"}

                  </Button>

                  <Button
                    variant="primary"
                    onClick={
                      handleDownloadDocument
                    }
                    disabled={
                      documentLoading
                    }
                  >

                    {documentLoading
                      ? "Preparing..."
                      : "Download"}

                  </Button>

                </div>

              </div>

            ) : (

              <div className="asset-document-empty">

                <div className="document-empty-icon">
                  ◫
                </div>

                <h3>
                  No Document Available
                </h3>

                <p>
                  No uploaded document is
                  associated with this asset.
                </p>

              </div>

            )}

            {documentError && (

              <div className="form-error">

                {documentError}

              </div>

            )}

            <div className="asset-document-security">

              <span>
                🔐
              </span>
            </div>

          </section>


          {/* =================================================
              OWNER + BLOCKCHAIN
          ================================================= */}

          <section className="asset-detail-grid">

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    OWNERSHIP
                  </span>

                  <h2>
                    Current Owner
                  </h2>

                </div>

              </div>

              <div className="current-owner">

                <div className="owner-large-avatar">

                  {String(owner)
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div className="owner-main-details">

                  <strong>
                    {owner}
                  </strong>

                  {ownerDid ? (

                    <span>
                      {shortenHash(
                        ownerDid
                      )}
                    </span>

                  ) : (

                    <span>
                      DID not available
                    </span>

                  )}

                </div>

                <span className="verified-owner">
                  ✓ Verified
                </span>

              </div>

              <div className="owner-detail-row">

                <span>
                  OWNER NAME
                </span>

                <strong>
                  {owner}
                </strong>

              </div>

              <div className="owner-detail-row">

                <span>
                  OWNER DID
                </span>

                <strong>
                  {ownerDid || "—"}
                </strong>

              </div>

              {ownerEmail && (

                <div className="owner-detail-row">

                  <span>
                    OWNER EMAIL
                  </span>

                  <strong>
                    {ownerEmail}
                  </strong>

                </div>

              )}

              {ownerId && (

                <div className="owner-detail-row">

                  <span>
                    OWNER ID
                  </span>

                  <strong>
                    {ownerId}
                  </strong>

                </div>

              )}

              <div className="owner-detail-row">

                <span>
                  OWNERSHIP STATUS
                </span>

                <strong className="status-success-text">
                  Active
                </strong>

              </div>

            </div>


            {/* =================================================
                BLOCKCHAIN
            ================================================= */}

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    DISTRIBUTED LEDGER
                  </span>

                  <h2>
                    Blockchain Record
                  </h2>

                </div>

                <span
                  className={
                    blockchainConnected
                      ? "ledger-online"
                      : "ledger-pending"
                  }
                >

                  ● {blockchainStatus}

                </span>

              </div>

              <div className="blockchain-info-list">

                <div>

                  <span>
                    NETWORK
                  </span>

                  <strong>
                    {asset.network ||
                      "Hyperledger Fabric"}
                  </strong>

                </div>

                <div>

                  <span>
                    CHANNEL
                  </span>

                  <strong>
                    {asset.channel ||
                      "crypta-channel"}
                  </strong>

                </div>

                <div>

                  <span>
                    CHAINCODE
                  </span>

                  <strong>
                    {asset.chaincode ||
                      "crypta-contract"}
                  </strong>

                </div>

                <div>

                  <span>
                    TRANSACTION HASH
                  </span>

                  <strong className="hash-value">

                    {asset.transactionId ||
                    asset.txId
                      ? shortenHash(
                          asset.transactionId ||
                          asset.txId
                        )
                      : "—"}

                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              OWNERSHIP HISTORY
          ================================================= */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">
                  OWNERSHIP LEDGER
                </span>

                <h2>
                  Ownership History
                </h2>

              </div>

              <span className="immutable-label">
                OWNERSHIP HISTORY
              </span>

            </div>

            {history.length === 0 ? (

              <div className="history-empty">

                <div>
                  ◇
                </div>

                <p>
                  No ownership transfers
                  have been recorded
                  for this asset.
                </p>

              </div>

            ) : (

              <div className="ownership-timeline">

                {history.map(
                  (item, index) => (

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

                  )
                )}

              </div>

            )}

          </section>

        </main>

      </div>


      {/* =====================================================
          TRANSFER MODAL
      ===================================================== */}

      <Modal
        isOpen={
          transferOpen
        }
        onClose={
          closeTransfer
        }
        title="Transfer Asset Ownership"
        size="medium"
      >

        {transferResult ? (

          <div className="transfer-success">

            <div className="transfer-success-icon">
              ✓
            </div>

            <span className="card-eyebrow">
              TRANSFER PROCESSED
            </span>

            <h2>
              Ownership Transferred
            </h2>

            <p>
              The asset ownership transfer
              has been submitted successfully.
            </p>

            <div className="transaction-result">

              <span>
                TRANSACTION ID
              </span>

              <strong>
                {transferResult.transactionId ||
                  transferResult.txId ||
                  transferResult.blockchainTxId ||
                  "Transaction submitted"}
              </strong>

            </div>

            <Button
              variant="primary"
              onClick={
                closeTransfer
              }
            >
              Done
            </Button>

          </div>

        ) : (

          <form
            className="transfer-form"
            onSubmit={
              handleTransfer
            }
          >

            <div className="transfer-warning">

              <span>
                !
              </span>

              <p>

                Ownership transfer will be
                recorded in the application
                transaction history. Permanent
                blockchain recording is enabled
                on Hyperledger Fabric.

              </p>

            </div>

            {error && (

              <div className="form-error">

                {error}

              </div>

            )}

            <div className="transfer-owner-box">

              <span>
                CURRENT OWNER
              </span>

              <strong>
                {owner}
              </strong>

              <small>
                {ownerDid ||
                  "DID not available"}
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
                value={
                  transferForm.newOwner
                }
                onChange={
                  handleTransferChange
                }
                placeholder="did:crypta:..."
              />

            </div>

            <div className="form-group">

              <label>
                TRANSFER REASON
              </label>

              <textarea
                name="reason"
                value={
                  transferForm.reason
                }
                onChange={
                  handleTransferChange
                }
                placeholder="Enter reason for ownership transfer"
                rows="3"
              />

            </div>

            <div className="modal-actions">

              <Button
                type="button"
                variant="ghost"
                onClick={
                  closeTransfer
                }
                disabled={
                  transferring
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                loading={
                  transferring
                }
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
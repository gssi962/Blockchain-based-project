import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Table from "../components/Table";

import { AuthContext } from "../context/AuthContext";

import {
  fetchAssets,
  createAsset,
} from "../services/api";

function AssetManagement() {

  const navigate =
    useNavigate();

  const { user } =
    useContext(AuthContext);

  const fileInputRef =
    useRef(null);

  const [
    sidebarOpen,
    setSidebarOpen
  ] = useState(false);

  const [
    assets,
    setAssets
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    search,
    setSearch
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter
  ] = useState("ALL");

  const [
    modalOpen,
    setModalOpen
  ] = useState(false);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    dragActive,
    setDragActive
  ] = useState(false);

  const [
    selectedFile,
    setSelectedFile
  ] = useState(null);

  const emptyForm = {

    name: "",

    description: "",

    category:
      "Digital Asset",

    owner: "",

    value: "",
  };

  const [
    form,
    setForm
  ] = useState(emptyForm);

  const allowedFileTypes = [

    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "image/jpeg",

    "image/png",

    "image/webp",

    "text/plain",

    "video/mp4",

    "video/webm",

  ];

  const maxFileSize =
    50 * 1024 * 1024;

  const categories = [

    "Digital Asset",

    "Document",

    "Certificate",

    "Legal Document",

    "Identity / Credential",

    "License",

    "Contract",

    "Intellectual Property",

    "Research / Data",

    "Financial Record",

    "Image",

    "Video",

    "Software / Code",

    "Other",

  ];

  useEffect(() => {

    loadAssets();

  }, []);

  // ---------------------------------------------------------
  // CHECK WHETHER NFT IS ACTUALLY MINTED
  // ---------------------------------------------------------

  const isNftMinted =
    (asset) => {

      const nftId =
        String(
          asset?.nftId ??
          asset?.nft_id ??
          ""
        ).trim();

      if (!nftId) {
        return false;
      }

      const normalized =
        nftId.toUpperCase();

      return (

        normalized !==
        "NFT-PENDING" &&

        normalized !==
        "PENDING" &&

        normalized !==
        "NULL" &&

        normalized !==
        "UNDEFINED"

      );

    };

  // ---------------------------------------------------------
  // LOAD ONLY NFT-MINTED ASSETS
  // ---------------------------------------------------------

  const loadAssets =
    async () => {

      try {

        setLoading(true);

        const response =
          await fetchAssets();

        const responseAssets =
          response?.data?.assets ||
          response?.data ||
          response?.assets ||
          response ||
          [];

        const allAssets =
          Array.isArray(
            responseAssets
          )
            ? responseAssets
            : [];

        /*
         * IMPORTANT:
         *
         * Database may contain old/test/pending assets.
         * Asset Management must show ONLY assets whose
         * NFT has actually been created.
         */

        const mintedAssets =
          allAssets

            .filter(
              isNftMinted
            )

            .map(
              (asset) => ({

                ...asset,

                assetId:
                  asset?.assetId ??
                  asset?.asset_id ??
                  asset?.id,

                nftId:
                  asset?.nftId ??
                  asset?.nft_id,

                ownerId:
                  asset?.ownerId ??
                  asset?.owner_id,

                ownerDid:
                  asset?.ownerDid ??
                  asset?.owner_did,

                ownerName:
                  asset?.ownerName ??
                  asset?.owner_name ??
                  (
                    typeof asset?.owner ===
                    "string"
                      ? asset.owner
                      : asset?.owner?.name
                  ),

                ownerEmail:
                  asset?.ownerEmail ??
                  asset?.owner_email ??
                  asset?.owner?.email,

                blockchainStatus:
                  asset?.blockchainStatus ||
                  asset?.blockchain_status ||
                  "CONNECTED",

                nftStatus:
                  "MINTED",

                status:
                  asset?.status ||
                  "ACTIVE",

              })
            );

        setAssets(
          mintedAssets
        );

      } catch (err) {

        console.error(
          "Asset loading error:",
          err
        );

        setAssets([]);

      } finally {

        setLoading(false);

      }

    };

  // ---------------------------------------------------------
  // FILTER
  // ---------------------------------------------------------

  const filteredAssets =
    useMemo(() => {

      return assets.filter(
        (asset) => {

          const query =
            search
              .toLowerCase()
              .trim();

          const ownerValue =
            asset.ownerName ||
            asset.owner ||
            asset.ownerDid ||
            asset.ownerId ||
            "";

          const ownerDidValue =
            asset.ownerDid ||
            asset.owner_did ||
            "";

          const matchesSearch =

            !query ||

            String(
              asset.name ||
              ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              asset.assetId ||
              asset.id ||
              ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              asset.nftId ||
              ""
            )
              .toLowerCase()
              .includes(query) ||

            String(
              ownerValue
            )
              .toLowerCase()
              .includes(query) ||

            String(
              ownerDidValue
            )
              .toLowerCase()
              .includes(query);

          const status =
            String(
              asset.status ||
              "ACTIVE"
            ).toUpperCase();

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            status ===
              statusFilter;

          return (

            matchesSearch &&
            matchesStatus

          );

        }
      );

    }, [

      assets,

      search,

      statusFilter,

    ]);

  // ---------------------------------------------------------
  // FORM
  // ---------------------------------------------------------

  const handleChange =
    (e) => {

      const {
        name,
        value
      } = e.target;

      setForm(
        (prev) => ({

          ...prev,

          [name]:
            value,

        })
      );

    };

  const formatFileSize =
    (bytes) => {

      if (!bytes) {
        return "0 KB";
      }

      const units = [

        "Bytes",

        "KB",

        "MB",

        "GB",

      ];

      const index =
        Math.min(

          Math.floor(
            Math.log(bytes) /
            Math.log(1024)
          ),

          units.length - 1

        );

      return (

        `${(
          bytes /
          Math.pow(
            1024,
            index
          )
        ).toFixed(
          index === 0
            ? 0
            : 2
        )} ${
          units[index]
        }`

      );

    };

  const validateFile =
    (file) => {

      if (!file) {
        return false;
      }

      if (

        allowedFileTypes.length &&

        !allowedFileTypes.includes(
          file.type
        )

      ) {

        setError(

          "Unsupported file type. Please upload PDF, DOC, DOCX, JPG, PNG, WEBP, TXT, MP4 or WEBM."

        );

        return false;

      }

      if (
        file.size >
        maxFileSize
      ) {

        setError(
          "File size must be 50 MB or less."
        );

        return false;

      }

      return true;

    };

  const handleFileSelect =
    (file) => {

      setError("");

      if (
        !validateFile(file)
      ) {

        setSelectedFile(
          null
        );

        return;

      }

      setSelectedFile(
        file
      );

      if (
        !form.name.trim()
      ) {

        const fileNameWithoutExtension =
          file.name.replace(
            /\.[^/.]+$/,
            ""
          );

        setForm(
          (prev) => ({

            ...prev,

            name:
              fileNameWithoutExtension,

          })
        );

      }

    };

  const handleFileInput =
    (e) => {

      const file =
        e.target.files?.[0];

      if (file) {

        handleFileSelect(
          file
        );

      }

      e.target.value =
        "";

    };

  const handleDragOver =
    (e) => {

      e.preventDefault();

      e.stopPropagation();

      setDragActive(
        true
      );

    };

  const handleDragLeave =
    (e) => {

      e.preventDefault();

      e.stopPropagation();

      setDragActive(
        false
      );

    };

  const handleDrop =
    (e) => {

      e.preventDefault();

      e.stopPropagation();

      setDragActive(
        false
      );

      const file =
        e.dataTransfer.files?.[0];

      if (file) {

        handleFileSelect(
          file
        );

      }

    };

  const removeSelectedFile =
    () => {

      setSelectedFile(
        null
      );

      setError("");

    };

  // ---------------------------------------------------------
  // CREATE MODAL
  // ---------------------------------------------------------

  const openCreateModal =
    () => {

      if (

        user?.role ===
          "AUDITOR" ||

        user?.role ===
          "USER"

      ) {

        return;

      }

      setForm(
        emptyForm
      );

      setSelectedFile(
        null
      );

      setError("");

      setDragActive(
        false
      );

      setModalOpen(
        true
      );

    };

  const closeCreateModal =
    () => {

      if (submitting) {
        return;
      }

      setModalOpen(
        false
      );

      setForm(
        emptyForm
      );

      setSelectedFile(
        null
      );

      setError("");

      setDragActive(
        false
      );

    };

  const resetAfterSubmit =
    () => {

      setModalOpen(
        false
      );

      setForm(
        emptyForm
      );

      setSelectedFile(
        null
      );

      setError("");

      setDragActive(
        false
      );

    };

  // ---------------------------------------------------------
  // CREATE ASSET
  // ---------------------------------------------------------

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      if (

        user?.role ===
          "AUDITOR" ||

        user?.role ===
          "USER"

      ) {

        setError(
          "You do not have permission to create assets."
        );

        return;

      }

      if (!selectedFile) {

        setError(
          "Please upload an asset file."
        );

        return;

      }

      if (!form.name.trim()) {

        setError(
          "Asset name is required."
        );

        return;

      }

      if (!form.owner.trim()) {

        setError(
          "Owner DID is required."
        );

        return;

      }

      try {

        setSubmitting(
          true
        );

        // -------------------------------------------------
        // ACTUAL MULTIPART FORM DATA
        // -------------------------------------------------
        //
        // The actual file bytes are sent using:
        //
        // formData.append("file", selectedFile)
        //
        // Backend multer receives this as req.file.
        // -------------------------------------------------

        const formData =
          new FormData();

        formData.append(
          "name",
          form.name.trim()
        );

        formData.append(
          "description",
          form.description.trim()
        );

        formData.append(
          "category",
          form.category
        );

        formData.append(
          "value",
          form.value
            ? Number(
                form.value
              )
            : 0
        );

        formData.append(
          "ownerDid",
          form.owner.trim()
        );

        formData.append(
          "file",
          selectedFile
        );

        await createAsset(
          formData
        );

        resetAfterSubmit();

        await loadAssets();

      } catch (err) {

        console.error(
          "Create asset error:",
          err
        );

        setError(

          err?.response?.data?.message ||

          err?.message ||

          "Unable to create asset."

        );

      } finally {

        setSubmitting(
          false
        );

      }

    };

  // ---------------------------------------------------------
  // STATUS
  // ---------------------------------------------------------

  const getStatusClass =
    (status) => {

      const value =
        String(
          status ||
          "ACTIVE"
        ).toLowerCase();

      if (

        value.includes(
          "active"
        ) ||

        value.includes(
          "verified"
        ) ||

        value.includes(
          "secured"
        )

      ) {

        return "status-success";

      }

      if (

        value.includes(
          "pending"
        ) ||

        value.includes(
          "processing"
        )

      ) {

        return "status-warning";

      }

      if (

        value.includes(
          "blocked"
        ) ||

        value.includes(
          "failed"
        ) ||

        value.includes(
          "inactive"
        )

      ) {

        return "status-danger";

      }

      return "status-neutral";

    };

  // ---------------------------------------------------------
  // TABLE
  // ---------------------------------------------------------

  const columns = [

    {

      key:
        "asset",

      label:
        "ASSET",

      render:
        (_, asset) => (

          <div className="asset-cell">

            <div className="asset-icon">
              ◈
            </div>

            <div>

              <strong>

                {asset.name ||
                  "Unnamed Asset"}

              </strong>

              <span>

                {asset.assetId ||
                  asset.id ||
                  "ASSET"}

              </span>

            </div>

          </div>

        ),

    },

    // -------------------------------------------------------
    // NFT ID
    // -------------------------------------------------------

    {
      key:
        "nftId",

      label:
        "NFT ID",

      render:
        (_, asset) => (

          <div className="nft-cell">

            <span className="nft-value">

              {asset.nftId}

            </span>

          </div>

        ),

    },

    // -------------------------------------------------------
    // CURRENT OWNER
    // -------------------------------------------------------

    {

      key:
        "owner",

      label:
        "CURRENT OWNER",

      render:
        (_, asset) => {

          const ownerName =

            asset.ownerName ||

            (

              typeof asset.owner ===
              "string"

                ? asset.owner

                : asset.owner?.name

            ) ||

            "Unknown";

          const ownerDid =

            asset.ownerDid ||

            asset.owner_did ||

            (

              typeof asset.owner ===
              "object"

                ? asset.owner?.did

                : null

            ) ||

            "";

          const avatarLetter =

            String(
              ownerName
            )
              .trim()
              .charAt(0)
              .toUpperCase() ||

            "?";

          return (

            <div className="owner-cell">

              <span className="owner-avatar">

                {avatarLetter}

              </span>

              <div
                className="owner-details"
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap:
                    "5px",
                }}
              >

                <strong>

                  {ownerName}

                </strong>

                {ownerDid && (

                  <span
                    className="owner-did"
                    style={{
                      display:
                        "block",
                      marginTop:
                        "2px",
                    }}
                  >

                    {ownerDid}

                  </span>

                )}

              </div>

            </div>

          );

        },

    },

    // -------------------------------------------------------
    // CATEGORY
    // -------------------------------------------------------

    {

      key:
        "category",

      label:
        "CATEGORY",

      render:
        (value) => (

          <span>

            {value ||
              "Digital Asset"}

          </span>

        ),

    },

    // -------------------------------------------------------
    // STATUS
    // -------------------------------------------------------

    {

      key:
        "status",

      label:
        "STATUS",

      render:
        (value) => {

          const status =
            value ||
            "ACTIVE";

          return (

            <span
              className={`status-badge ${getStatusClass(
                status
              )}`}
            >

              <span className="status-dot"></span>

              {String(
                status
              ).toUpperCase()}

            </span>

          );

        },

    },

    // -------------------------------------------------------
    // ACTION
    // -------------------------------------------------------

    {

      key:
        "actions",

      label:
        "ACTION",

      render:
        (_, asset) => (

          <button
            className="table-action"
            onClick={(e) => {

              e.stopPropagation();

              navigate(
                `/assets/${
                  asset.assetId ||
                  asset.id ||
                  asset._id
                }`
              );

            }}
          >

            View →

          </button>

        ),

    },

  ];

  // ---------------------------------------------------------
  // SUMMARY COUNTS
  // ---------------------------------------------------------

  const activeCount =
    assets.filter(
      (asset) =>

        String(
          asset.status ||
          "ACTIVE"
        ).toUpperCase() ===
        "ACTIVE"

    ).length;

  const nftCount =
    assets.length;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (

    <div className="app-layout">

      <Sidebar
        isOpen={
          sidebarOpen
        }
        onClose={() =>
          setSidebarOpen(
            false
          )
        }
      />

      <div className="main-content">

        <Navbar
          title="Asset Management"
          onMenuClick={() =>
            setSidebarOpen(
              true
            )
          }
        />

        <main className="page-content">

          <div className="page-header">

            <div>

              <div className="page-eyebrow">

                CRYPTA SHIELD / DIGITAL ASSETS

              </div>

              <h1>
                Asset Management
              </h1>

              <p>

                Register, monitor and secure
                blockchain-backed digital assets.

              </p>

            </div>

            {user?.role !==
              "AUDITOR" &&

              user?.role !==
                "USER" && (

                <Button
                  variant="primary"
                  onClick={
                    openCreateModal
                  }
                >

                  + Create Asset

                </Button>

              )}

          </div>

          {/* ------------------------------------------------
              SUMMARY
          ------------------------------------------------ */}

          <div className="asset-summary">

            <div className="asset-summary-card">

              <span>
                Total Assets
              </span>

              <strong>
                {assets.length}
              </strong>

            </div>

            <div className="asset-summary-card">

              <span>
                Active
              </span>

              <strong className="asset-success">

                {activeCount}

              </strong>

            </div>

            <div className="asset-summary-card">

              <span>
                NFT Linked
              </span>

              <strong className="asset-cyan">

                {nftCount}

              </strong>

            </div>

            <div className="asset-summary-card">

              <span>
                Ledger
              </span>

              <strong className="asset-success">

                ● Fabric Online

              </strong>

            </div>

          </div>

          {/* ------------------------------------------------
              REGISTERED ASSETS
          ------------------------------------------------ */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">

                  BLOCKCHAIN REGISTRY

                </span>

                <h2>
                  Registered Assets
                </h2>

              </div>

              <Button
                variant="ghost"
                size="small"
                onClick={
                  loadAssets
                }
                loading={
                  loading
                }
              >

                ↻ Refresh

              </Button>

            </div>

            {/* ------------------------------------------------
                SEARCH + FILTER
            ------------------------------------------------ */}

            <div className="asset-toolbar">

              <div className="asset-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search asset, NFT, owner..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              <select
                className="asset-filter"
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

              </select>

            </div>

            {/* ------------------------------------------------
                ASSET TABLE
            ------------------------------------------------ */}

            <Table
              columns={
                columns
              }
              data={
                filteredAssets
              }
              loading={
                loading
              }
              emptyMessage={
                "No NFT-minted blockchain assets found."
              }
              onRowClick={
                (asset) =>
                  navigate(
                    `/assets/${
                      asset.assetId ||
                      asset.id ||
                      asset._id
                    }`
                  )
              }
            />

          </div>

          {/* ------------------------------------------------
              SECURITY CARD
          ------------------------------------------------ */}

          <div className="asset-security-card">

            <div className="security-icon">
              ⛓
            </div>

            <div>

              <h3>
                Secure Asset Architecture
              </h3>

              <p>

                Digital files are stored off-chain,
                while asset identity, ownership,
                file hash and blockchain references
                are designed for tamper-resistant
                verification.

              </p>

            </div>

            <div className="asset-ledger-status">

              <span className="status-dot"></span>

              Fabric Network Online

            </div>

          </div>

        </main>

      </div>

      {/* =====================================================
          CREATE ASSET MODAL
      ===================================================== */}

      <Modal
        isOpen={
          modalOpen
        }
        onClose={
          closeCreateModal
        }
        title="Create New Asset"
        size="medium"
      >

        <form
          className="asset-form asset-create-form"
          onSubmit={
            handleSubmit
          }
        >

          {error && (

            <div className="form-error">

              {error}

            </div>

          )}

          {/* ------------------------------------------------
              DIGITAL ASSET FILE
          ------------------------------------------------ */}

          <div className="asset-create-section">

            <div className="asset-create-section-title">

              <div>

                <strong>
                  DIGITAL ASSET FILE
                </strong>

                <span>

                  Upload the file you want to register.

                </span>

              </div>

            </div>

            {!selectedFile ? (

              <div
                className={`asset-upload-zone ${
                  dragActive
                    ? "drag-active"
                    : ""
                }`}
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <div className="upload-icon">
                  ↑
                </div>

                <strong>

                  Drag & drop your file here

                </strong>

                <span>

                  or{" "}

                  <button
                    type="button"
                    className="upload-browse-button"
                    onClick={(e) => {

                      e.stopPropagation();

                      fileInputRef.current?.click();

                    }}
                  >

                    Browse Files

                  </button>

                </span>

                <small>

                  Supported files • Max 50 MB

                </small>

              </div>

            ) : (

              <div className="selected-file-card">

                <div className="selected-file-icon">
                  📄
                </div>

                <div className="selected-file-info">

                  <strong>

                    {selectedFile.name}

                  </strong>

                  <span>

                    {formatFileSize(
                      selectedFile.size
                    )}

                    {" • "}

                    {selectedFile.type ||
                      "Unknown file type"}

                  </span>

                </div>

                <button
                  type="button"
                  className="remove-file-button"
                  onClick={
                    removeSelectedFile
                  }
                  disabled={
                    submitting
                  }
                  title="Remove file"
                >

                  ×

                </button>

              </div>

            )}

            <input
              ref={
                fileInputRef
              }
              type="file"
              hidden
              accept="*/*"
              onChange={
                handleFileInput
              }
            />

          </div>

          {/* ------------------------------------------------
              ASSET DETAILS
          ------------------------------------------------ */}

          <div className="asset-create-section">

            <div className="asset-create-section-title">

              <div>

                <strong>
                  ASSET DETAILS
                </strong>

                <span>

                  Define the identity and classification
                  of this asset.

                </span>

              </div>

            </div>

            <div className="form-group">

              <label>
                ASSET NAME
              </label>

              <input
                type="text"
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter asset name"
              />

            </div>

            <div className="form-group">

              <label>
                DESCRIPTION
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe the asset"
                rows="3"
              />

            </div>

            <div className="form-row">

              <div className="form-group">

                <label>
                  CATEGORY
                </label>

                <select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleChange
                  }
                >

                  {categories.map(
                    (category) => (

                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >

                        {category}

                      </option>

                    )
                  )}

                </select>

              </div>

              <div className="form-group">

                <label>

                  ESTIMATED VALUE

                  <span className="optional-label">

                    Optional

                  </span>

                </label>

                <input
                  type="number"
                  name="value"
                  value={
                    form.value
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                  min="0"
                />

              </div>

            </div>

            <div className="form-group">

              <label>
                CURRENT OWNER DID
              </label>

              <input
                type="text"
                name="owner"
                value={
                  form.owner
                }
                onChange={
                  handleChange
                }
                placeholder="Enter the owner's valid DID"
              />

              <small>

                The entered DID will be verified
                against the registered user identity.

              </small>

            </div>

          </div>

          {/* ------------------------------------------------
              STORAGE INFO
          ------------------------------------------------ */}

          <div className="asset-storage-info">

            <div className="storage-info-icon">
              🔐
            </div>

            <div>

              <strong>
                Secure Off-Chain Storage
              </strong>

              <span>

                The actual file will be stored
                separately from the blockchain.
                Its cryptographic hash and ownership
                metadata can be linked to the blockchain.

              </span>

            </div>

          </div>

          {/* ------------------------------------------------
              NFT INFO
          ------------------------------------------------ */}

          <div className="asset-generation-info">

            <div className="asset-mini-icon">
              ◈
            </div>

            <div>

              <strong>
                NFT & Asset ID
              </strong>

              <span>

                Asset ID and NFT ID are generated
                after successful blockchain asset
                creation and NFT minting.

              </span>

            </div>

          </div>

          {/* ------------------------------------------------
              MODAL ACTIONS
          ------------------------------------------------ */}

          <div className="modal-actions">

            <Button
              type="button"
              variant="ghost"
              onClick={
                closeCreateModal
              }
              disabled={
                submitting
              }
            >

              Cancel

            </Button>

            <Button
              type="submit"
              variant="primary"
              loading={
                submitting
              }
            >

              Register Asset

            </Button>

          </div>

        </form>

      </Modal>

    </div>

  );

}

export default AssetManagement;
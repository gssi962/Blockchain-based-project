import { useState } from "react";
import { createIdentity } from "../services/didService";

const AddIdentity = ({ onCreated, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "User",
    organization: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.organization) {
      alert("Name, email and organization are required");
      return;
    }

    setLoading(true);

    try {
      const identity = await createIdentity(form);

      if (onCreated) {
        onCreated(identity);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Create identity error:", error);
      alert(error?.message || "Failed to create identity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <h2>Create New Identity</h2>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter full name"
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />

          <div className="form-row">

            <div>
              <label>Role</label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="User">User</option>
                <option value="Manager">Manager</option>
                <option value="Auditor">Auditor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label>Organization</label>

              <input
                type="text"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                placeholder="Enter organization"
              />
            </div>

          </div>

          <div className="did-info">
            <span>◆</span>

            <div>
              <strong>DID will be generated automatically</strong>
              <p>
                A decentralized identifier will be created during registration.
              </p>
            </div>
          </div>

          <div className="modal-actions">

            <button
              type="button"
              onClick={onClose}
              className="secondary-btn"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? "Creating..." : "Create Identity"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddIdentity;
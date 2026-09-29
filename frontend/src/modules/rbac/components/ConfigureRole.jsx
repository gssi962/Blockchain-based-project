import { useState } from "react";

const ConfigureRole = ({
  role,
  permissions,
  onSave,
  onClose,
}) => {
  const [selected, setSelected] =
    useState(role.permissions);

  const togglePermission = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(role.id, selected);
    onClose();
  };

  return (
    <div className="modal-overlay">

      <div className="modal-box">

        <div className="modal-header">

          <div>
            <span className="section-label">
              ROLE CONFIGURATION
            </span>

            <h2>{role.name}</h2>
          </div>

          <button onClick={onClose}>
            ×
          </button>

        </div>

        <p>
          Select permissions for this role.
        </p>

        <div className="permission-list">

          {permissions.map((permission) => {

            const checked =
              selected.includes(permission.id);

            return (
              <label
                className="permission-option"
                key={permission.id}
              >

                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    togglePermission(
                      permission.id
                    )
                  }
                />

                <div>
                  <strong>
                    {permission.name}
                  </strong>

                  <small>
                    {permission.description}
                  </small>
                </div>

              </label>
            );
          })}

        </div>

        <button
          className="primary-btn"
          onClick={handleSave}
        >
          Save Permissions
        </button>

      </div>
    </div>
  );
};

export default ConfigureRole;
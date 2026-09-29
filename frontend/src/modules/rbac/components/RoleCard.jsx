const RoleCard = ({
  role,
  selected,
  onClick,
}) => {
  return (
    <div
      className={`role-card ${
        selected ? "selected" : ""
      }`}
      onClick={onClick}
    >
      <div className="role-card-top">
        <div className="role-icon">
          ◆
        </div>

        <span className="role-tag">
          {role.name}
        </span>
      </div>

      <h3>{role.name}</h3>

      <p>{role.description}</p>

      <div className="role-card-bottom">
        <span>
          {role.permissions.length} permissions
        </span>

        <button>
          Configure →
        </button>
      </div>
    </div>
  );
};

export default RoleCard;
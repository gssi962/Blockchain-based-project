const DIDBadge = ({ did }) => {
  if (!did) {
    return (
      <span className="did-badge pending">
        DID Pending
      </span>
    );
  }

  return (
    <span
      className="did-badge"
      title={did}
    >
      {did.length > 25
        ? `${did.substring(0, 22)}...`
        : did}
    </span>
  );
};

export default DIDBadge;
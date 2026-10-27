import Icon from "./Icon";

// Shows a skeleton while loading, an error box with a retry button if the
// request failed, and the real content once the data is ready.
export default function AsyncState({ status, error, onRetry, skeleton, children }) {
  if (status === "loading") return skeleton || <div className="skeleton-block" />;

  if (status === "error") {
    return (
      <div className="state-box state-error" role="alert">
        <Icon name="alert" size={28} />
        <h2>Couldn't load vehicles</h2>
        <p>{error || "Something went wrong."}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          <Icon name="refresh" size={16} /> Try again
        </button>
      </div>
    );
  }
  return children;
}

export function VehicleSkeletons({ count = 6 }) {
  return (
    <div className="vehicle-grid" aria-busy="true" aria-label="Loading vehicles">
      {Array.from({ length: count }, (_, i) => (
        <div className="vehicle-card skeleton-card" key={i}>
          <div className="skeleton-block" style={{ height: 170 }} />
          <div style={{ padding: 16, display: "grid", gap: 10 }}>
            <div className="skeleton-block" style={{ height: 16, width: "70%" }} />
            <div className="skeleton-block" style={{ height: 12, width: "50%" }} />
            <div className="skeleton-block" style={{ height: 36 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

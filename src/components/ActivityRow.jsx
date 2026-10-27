import Icon from "./Icon";

const icons = { booking: "calendar", listing: "key", ride: "users" };

export default function ActivityRow({ item, children }) {
  return (
    <article className="activity-row">
      <div className={`activity-icon kind-${item.kind}`}>
        <Icon name={icons[item.kind]} size={18} />
      </div>
      <div className="activity-info">
        <h3>
          {item.title}
          <span className={`status status-${item.status.toLowerCase()}`}>{item.status}</span>
        </h3>
        <p>{item.detail}</p>
      </div>
      <div className="activity-side">
        <strong className={`activity-amount${item.amount.startsWith("+") ? " is-income" : ""}`}>{item.amount}</strong>
        {children}
      </div>
    </article>
  );
}

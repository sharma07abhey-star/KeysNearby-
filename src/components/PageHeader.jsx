import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

export default function PageHeader({ eyebrow, title, subtitle, actions, back }) {
  const navigate = useNavigate();
  return (
    <header className="page-header">
      <div>
        {back && (
          <button type="button" className="back-button" onClick={() => navigate(back.to)}>
            <Icon name="arrow-left" size={16} />
            <span>{back.label}</span>
          </button>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissToast } from "../store/uiSlice";
import Icon from "./Icon";

const icons = { success: "check", error: "alert", info: "info" };

function Toast({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), 4200);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <span className="toast-icon">
        <Icon name={icons[toast.type] || "info"} size={16} />
      </span>
      <div>
        <strong>{toast.title}</strong>
        {toast.message && <p>{toast.message}</p>}
      </div>
      <button type="button" aria-label="Dismiss" onClick={() => dispatch(dismissToast(toast.id))}>
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}

export default function Toaster() {
  const toasts = useSelector((state) => state.ui.toasts);
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

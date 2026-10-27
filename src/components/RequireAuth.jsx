import { Navigate } from "react-router-dom";
import { useDemo } from "../hooks/useDemo";

// Route guard: wrap any route element in <RequireAuth> and visitors who are
// not signed in are sent to /login (and returned here afterwards).
//
// authReady is false until the session-restore check on startup finishes
// (either finds a valid user or clears the stale id). While it's false we
// show the spinner so a page refresh never briefly flashes /login for a
// user who IS already signed in.
export default function RequireAuth({ children }) {
  const { user, authReady } = useDemo();

  if (!authReady) {
    // Session is still being restored — show a full-page spinner
    return (
      <div className="page-loading" aria-label="Restoring session…">
        <span className="spinner" />
        <span>Restoring session…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

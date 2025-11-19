import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children, loading }) {
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-6 bg-[var(--color-loading-bg)]">
        <div className="bg-[var(--color-loading-surface)] text-[var(--color-loading-text)] font-dongle text-6xl font-bold rounded-3xl px-10 py-6 shadow-lg">
          Loading...
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

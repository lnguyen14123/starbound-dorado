import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children, loading }) {
  if (loading) {
    // Show a loading spinner or blank screen while auth state is being checked
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  // If user exists, render the page; otherwise redirect to login
  return user ? children : <Navigate to="/login" />;
}

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const loggedInUserId = sessionStorage.getItem("email"); 

  if (!loggedInUserId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

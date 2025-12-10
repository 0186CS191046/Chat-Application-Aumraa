import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const loggedInUserId = sessionStorage.getItem("phone"); 

  if (!loggedInUserId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !localStorage.getItem('token')) {
      return <Navigate to="/login" />;
    }
    
    if (roles && !roles.includes(user.role)) {
      return <Navigate to="/unauthorized" />;
    }
    
    return children;
  };
  
  export default ProtectedRoute;  
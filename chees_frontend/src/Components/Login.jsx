import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './config/axiosInstance';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Making login request with:", { email, password });

      const response = await axiosInstance.post("/login", { email, password });
      console.log("Login response:", response.data); 

      const { token, user } = response.data;

      if (!user || !token) {
        throw new Error("No user or token found in the response.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
console.log(user)
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'member') {
        navigate('/member/dashboard');
      } else if (user.role === 'coach') {
        navigate('/coach/dashboard');
      } else {
        navigate('/'); 
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="sr-only">Logging in...</span>
            </>
          ) : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
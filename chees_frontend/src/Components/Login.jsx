import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './config/axiosInstance';
import { FaUser, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import "./Login.css"
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');




    if (!email.trim()) {
      setError("L'e-mail est requis.");
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Le mot de passe est requis.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }
    
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
      if (err.response?.status === 401) {
        setError("Email or password is incorrect.");
      } else {
        setError(err.response?.data?.error || "Login failed. Please try again.");
      }
            setLoading(false);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
      <div className="image-container">
      <img src="./loginchees.jpg" alt="" className="login-image"/>
      </div>
      <div className='login-form-container'>
<h2>Login</h2>   
   {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleLogin} className='login-form'>
        <div className="form-group-login">
          <label  className="labellogin" htmlFor="">Email</label>
        <div className='form-container'>
        <FaUser className="input-icon" /> 
        <hr className='line' />
        <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder='Entere Email'
          />
 </div>
        </div>
        
       <div className="form-group-login ">
       <label className="labellogin" htmlFor="">Password</label>

        <div className='form-container'>
       <span 
       className="input-icon"
        onClick={() => setShowPassword(!showPassword)}
    >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
    </span>  
    <hr className='line' />
      <input
        type={showPassword ? "text" : "password"} 
        className="input-field"
        value={password}
        placeholder='Enterer Password'
        onChange={(e) => setPassword(e.target.value)}
        required

    />
 </div>
</div>
        
        <button 
          type="submit" 
          className="login-button"
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
      <p className="signup-link">Don't have an account? <a href="/register">Sign Up here</a></p>
      </div>
    </div>
    </div>
  );
};

export default Login;
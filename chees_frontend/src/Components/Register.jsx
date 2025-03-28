import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './config/axiosInstance';
import "./Register.css"
import { FaUpload } from 'react-icons/fa';
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    chess_rating: '',
    bio: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city:'',
    profile_picture: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profile_picture: file
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const response = await axiosInstance.post("/register", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/login', { state: { registrationSuccess: true } });

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="register-container">
      <h2>Create Your Account</h2>
      {/* {error && <div className="alert alert-danger">{error}</div>} */}

      <form onSubmit={handleSubmit}>
        
      <div className="form-register">
  <div className="form-row">
    <div className="form-group form-col">
      <label>Username*</label>
      <input
        type="text"
        name="username"
        className="form-control"
        value={formData.username}
        onChange={handleChange}
        required
      />
    </div>
    <div className="form-group form-col">
      <label>Email*</label>
      <input
        type="email"
        name="email"
        className="form-control"
        value={formData.email}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group form-col">
      <label>Password*</label>
      <input
        type="password"
        name="password"
        className="form-control"
        value={formData.password}
        onChange={handleChange}
        required
        minLength="6"
      />
    </div>
    <div className="form-group form-col">
      <label>Phone</label>
      <input
        type="tel"
        name="phone"
        className="form-control"
        value={formData.phone}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group form-col">
      <label>First Name</label>
      <input
        type="text"
        name="first_name"
        className="form-control"
        value={formData.first_name}
        onChange={handleChange}
      />
    </div>
    <div className="form-group form-col">
      <label>Last Name</label>
      <input
        type="text"
        name="last_name"
        className="form-control"
        value={formData.last_name}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="form-row">
    <div className="form-group form-col">
      <label>City</label>
      <input
        type="text"
        name="city"
        className="form-control"
        value={formData.city}
        onChange={handleChange}
      />
    </div>
    <div className="form-group form-col">
      <label>Address</label>
      <input
        type="text"
        name="address"
        className="form-control"
        value={formData.address}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="form-group profile-upload">
  <label className="upload-label">Profile Picture*</label>
  <div className="file-upload-wrapper">
    <FaUpload className="upload-icon" /> 
    <input
      type="file"
      name="profile_picture"
      className="file-input"
      onChange={handleFileChange}
      accept="image/*"
    />
  </div>

  {previewImage && (
    <div className="image-preview">
      <img src={previewImage} alt="Preview" />
    </div>
  )}
</div>
</div>


        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
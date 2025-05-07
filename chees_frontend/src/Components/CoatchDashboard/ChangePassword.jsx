import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';
import "./ChangePassword.css"
const ChangePassword = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!passwords.current_password) newErrors.current_password = 'Current password is required';
    if (passwords.new_password.length < 6) newErrors.new_password = 'Password must be at least 6 characters';
    if (passwords.new_password !== passwords.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      await axiosInstance.post('/change-password', passwords);
      setSuccess('Password changed successfully!');
      setTimeout(() => navigate(-1), 2000); 
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Password change failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-user-container">
      <h2 className="create-user-title">Change Password</h2>
      
      {success && <SuccessAlert message={success} />}
      {errors.general && <ErrorAlert message={errors.general} />}

      <form onSubmit={handleSubmit} className="formpassword">
        <div className='grouppassword'>
          <label className="labelpassword">Current Password</label>
          <input
            type="password"
            name="current_password"
            value={passwords.current_password}
            onChange={handleChange}
            className="inputpassword"
            autoComplete="current-password"
          />
          {errors.current_password && <span className="errorpassword">{errors.current_password}</span>}
        </div>

        <div className='grouppassword'>
          <label className="labelpassword">New Password</label>
          <input
            type="password"
            name="new_password"
            value={passwords.new_password}
            onChange={handleChange}
            className="inputpassword"
            autoComplete="new-password"
          />
          {errors.new_password && <span className="errorpassword">{errors.new_password}</span>}
        </div>

        <div className='grouppassword'>
          <label className="labelpassword">Confirm New Password</label>
          <input
            type="password"
            name="new_password_confirmation"
            value={passwords.new_password_confirmation}
            onChange={handleChange}
            className="inputpassword"
            autoComplete="new-password"
          />
          {errors.new_password_confirmation && (
            <span className="errorpassword">{errors.new_password_confirmation}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button password"
        >
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
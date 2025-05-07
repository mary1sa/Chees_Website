import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';

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
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>
      
      {success && <SuccessAlert message={success} />}
      {errors.general && <ErrorAlert message={errors.general} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            name="current_password"
            value={passwords.current_password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            autoComplete="current-password"
          />
          {errors.current_password && <span className="text-red-500 text-sm">{errors.current_password}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            name="new_password"
            value={passwords.new_password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            autoComplete="new-password"
          />
          {errors.new_password && <span className="text-red-500 text-sm">{errors.new_password}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            name="new_password_confirmation"
            value={passwords.new_password_confirmation}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            autoComplete="new-password"
          />
          {errors.new_password_confirmation && (
            <span className="text-red-500 text-sm">{errors.new_password_confirmation}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
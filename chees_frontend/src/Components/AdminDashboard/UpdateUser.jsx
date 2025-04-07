import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';

const UpdateUser = () => {
  const { id } = useParams();
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
    first_name: '',
    last_name: '',
    profile_picture: null,
    chess_rating: '',
    bio: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axiosInstance.get(`/users/${id}`);
        const user = userResponse.data;

        const rolesResponse = await axiosInstance.get('/roles');
        setRoles(rolesResponse.data);

        setUserForm({
          username: user.username || '',
          email: user.email || '',
          password: '',
          role_id: user.role_id || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          profile_picture: null,
          chess_rating: user.chess_rating || '',
          bio: user.bio || '',
          phone: user.phone || '',
          date_of_birth: user.date_of_birth?.split('T')[0] || '',
          address: user.address || '',
          city: user.city || '',
          is_active: user.is_active ?? true,
        });

        if (user.profile_picture) {
          setPreviewImage(`${axiosInstance.defaults.baseURL}/storage/${user.profile_picture}`);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({
          form: error.response?.data?.message || 'Failed to load data'
        });
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUserForm(prev => ({ ...prev, profile_picture: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!userForm.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!userForm.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (userForm.password && userForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!userForm.role_id) {
      newErrors.role_id = 'Role is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      Object.keys(userForm).forEach(key => {
        if (key === 'password' && !userForm[key]) return;
        if (userForm[key] !== null && userForm[key] !== undefined) {
          formData.append(key, userForm[key]);
        }
      });

      const response = await axiosInstance.post(`/users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          _method: 'PUT'
        }
      });

      setSuccessMessage('User updated successfully!');
      setErrors({});

      if (response.data.user.profile_picture) {
        setPreviewImage(`${axiosInstance.defaults.baseURL}/storage/${response.data.user.profile_picture}`);
      }

    } catch (error) {
      console.error('Update error:', error);
      
      if (error.response) {
        if (error.response.status === 422) {
          const serverErrors = {};
          Object.keys(error.response.data.errors).forEach(key => {
            serverErrors[key] = error.response.data.errors[key][0];
          });
          setErrors(serverErrors);
        } else if (error.response.status === 409) {
          if (error.response.data.message.includes('email')) {
            setErrors({ ...errors, email: 'This email is already in use' });
          } else if (error.response.data.message.includes('username')) {
            setErrors({ ...errors, username: 'This username is already taken' });
          }
        } else {
          setErrors({ form: error.response.data?.message || 'Failed to update user' });
        }
      } else {
        setErrors({ form: 'Network error. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading user data...</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Update User</h2>
        </div>
        <div className="card-body">
          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}
          
          {errors.form && (
            <div className="alert alert-danger">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    name="username"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    value={userForm.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && <div className="error-message">{errors.username}</div>}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={userForm.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={userForm.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    minLength="6"
                  />
                  {errors.password && <div className="error-message">{errors.password}</div>}
                  <small className="form-text text-muted">Minimum 6 characters</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
            name="role_id"
            value={userForm.role_id}
            onChange={handleChange}
            className={`form-select ${errors.role_id ? 'is-invalid' : ''}`}
          >
            <option value="">Sélectionner un rôle</option>
            {roles
              .filter(role => role.name === 'coach' || role.name === 'member')
              .map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name === 'coach' ? 'Entraîneur' : 'Membre'}
                </option>
              ))}
          </select>
                  {errors.role_id && <div className="error-message">{errors.role_id}</div>}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={userForm.first_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={userForm.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Chess Rating</label>
                  <input
                    type="number"
                    name="chess_rating"
                    className="form-control"
                    value={userForm.chess_rating}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={userForm.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  className="form-control"
                  value={userForm.bio}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    className="form-control"
                    value={userForm.date_of_birth}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={userForm.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={userForm.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Active Status</label>
                  <div className="form-check form-switch mt-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      className="form-check-input"
                      checked={userForm.is_active}
                      onChange={handleChange}
                      role="switch"
                      id="isActiveSwitch"
                    />
                    <label className="form-check-label" htmlFor="isActiveSwitch">
                      {userForm.is_active ? 'Active' : 'Inactive'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-group">
                <label className="form-label">Profile Picture</label>
                {previewImage && (
                  <div className="mb-2">
                    <img 
                      src={previewImage} 
                      alt="Profile preview" 
                      className="img-thumbnail"
                      style={{ maxWidth: '200px', maxHeight: '200px' }} 
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="profile_picture"
                  className="form-control"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <small className="form-text text-muted">Accepted formats: JPEG, PNG, JPG, GIF (Max 2MB)</small>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;
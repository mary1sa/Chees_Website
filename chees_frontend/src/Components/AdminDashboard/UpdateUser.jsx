import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import"./CreateUser.css"
import PageLoading from '../PageLoading/PageLoading';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';

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
  const [showAlert, setShowAlert] = useState(true);
const navigate=useNavigate()
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
          profile_picture: user.profile_picture,
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
          _method: ''
        }
      });

      setSuccessMessage('User updated successfully!');
      setErrors({});
navigate("/admin/dashboard/fetchusers")
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
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  if (loading) return <PageLoading/>; 
   return (
    <div className="create-user-container">
      <h1 className="create-user-title">Modifier l'Utilisateur</h1>
      
      {successMessage && <SuccessAlert message={successMessage}  onClose={handleCloseAlert}           iconType="check"
 />}
{errors.form && <ErrorAlert message={errors.form}  onClose={handleCloseAlert}         
/>}

      <form onSubmit={handleSubmit} className="create-user-form" encType="multipart/form-data">
        <div className="imageuploadsection">
          <label 
            htmlFor="profile_picture" 
            className={`filelabel ${previewImage ? 'has-image' : ''}`}
          >
            <input
              type="file"
              name="profile_picture"
              id="profile_picture"
              onChange={handleFileChange}
              className="file-input"
              accept="image/*"
            />
            
            
              <div className="image-preview">
              <img
       src={
        userForm.profile_picture
          ? `http://localhost:8000/storage/${userForm.profile_picture}`
          : '/anony.jpg'
      }
      alt={`${userForm.first_name} ${userForm.last_name}`}
      className="profile-image"
    />
              </div>
          

            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
          </label>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={userForm.username}
            onChange={handleChange}
            className={`form-input ${errors.username ? 'is-invalid' : ''}`}
          />
          {errors.username && <div className="error-message">{errors.username}</div>}
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={userForm.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={userForm.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? 'is-invalid' : ''}`}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        <div className="form-group">
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

        <div className="form-group">
          <input
            type="text"
            name="first_name"
            placeholder="Prénom"
            value={userForm.first_name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            value={userForm.last_name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            name="chess_rating"
            placeholder="Classement aux échecs"
            value={userForm.chess_rating}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <textarea
            name="bio"
            placeholder="Biographie"
            value={userForm.bio}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phone"
            placeholder="Téléphone"
            value={userForm.phone}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="date"
            name="date_of_birth"
            value={userForm.date_of_birth}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="address"
            placeholder="Adresse"
            value={userForm.address}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="city"
            placeholder="Ville"
            value={userForm.city}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-switch">
            <input
              type="checkbox"
              name="is_active"
              checked={userForm.is_active}
              onChange={handleChange}
            />
            <span className="slider round"></span>
            <span className="switch-label">Utilisateur actif</span>
          </label>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner_button"></span>
              Mise à jour...
            </>
          ) : 'Mettre à jour'}
        </button>
      </form>
    </div>
  );
};

export default UpdateUser;
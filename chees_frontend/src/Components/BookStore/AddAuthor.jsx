import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';

const AddAuthor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));

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
    setSuccessMessage('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio);
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      const response = await axiosInstance.post('/authors', formDataToSend);
      setSuccessMessage('Author created successfully!');
      setTimeout(() => {
        navigate('/admin/dashboard/authors');
      }, 1500);
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ form: 'An error occurred while creating the author' });
        console.error('Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setSuccessMessage('');
    setErrors({});
  };

  return (
    <div className="create-book-container">
      <h1 className="create-book-title">Add New Author</h1>
      
      {successMessage && (
        <SuccessAlert 
          message={successMessage} 
          onClose={handleCloseAlert}
          iconType="check"
        />
      )}
      
      {errors.form && (
        <ErrorAlert 
          message={errors.form} 
          onClose={handleCloseAlert}
        />
      )}

      <form onSubmit={handleSubmit} className="create-book-form">
        <div className="image-upload-section">
          <label 
            htmlFor="photo" 
            className={`file-label ${previewImage ? 'has-image' : ''}`}
          >
            <input
              type="file"
              name="photo"
              id="photo"
              onChange={handleFileChange}
              className="file-input"
              accept="image/*"
            />
            
            {!previewImage && (
              <div className="default-cover">
                <svg className="book-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <span>Upload Author Photo</span>
              </div>
            )}

            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Author preview" />
              </div>
            )}
          </label>
          {errors.photo && <div className="error-message">{errors.photo}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Name*"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'is-invalid' : ''}`}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <textarea
            name="bio"
            placeholder="Biography"
            value={formData.bio}
            onChange={handleChange}
            className={`form-textarea ${errors.bio ? 'is-invalid' : ''}`}
            rows="4"
          />
          {errors.bio && <div className="error-message">{errors.bio}</div>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-button">
              <span className="spinner_button"></span> Saving...
            </span>
          ) : (
            "Save Author"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddAuthor;
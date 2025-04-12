import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import PageLoading from '../PageLoading/PageLoading';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';
import { FiX, FiSave } from 'react-icons/fi';
import '../AdminDashboard/UserTable.css';

const EditAuthor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await axiosInstance.get(`/authors/${id}`);
        setFormData({
          name: response.data.name,
          bio: response.data.bio,
          photo: null
        });
        if (response.data.photo) {
          setPreviewImage(`http://localhost:8000/storage/${response.data.photo}`);
        }
      } catch (error) {
        console.error('Error fetching author:', error);
        setErrors({ fetch: 'Failed to load author data' });
      } finally {
        setLoading(false);
      }
    };
    fetchAuthor();
  }, [id]);

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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        photo: file
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseAlert = () => {
    setSuccessMessage('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrors({});
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio);
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      await axiosInstance.put(`/authors/${id}`, formDataToSend);
      setSuccessMessage('Author updated successfully!');
      setTimeout(() => {
        navigate('/admin/dashboard/authors');
      }, 1500);
    } catch (error) {
      if (error.response?.status === 422) {
        const validationErrors = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          validationErrors[field] = Array.isArray(messages) ? messages.join(', ') : messages;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ 
          form: error.response?.data?.message || 'An error occurred while updating the author' 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (errors.fetch) {
    return (
      <div className="error-container">
        <ErrorAlert message={errors.fetch} onClose={() => setErrors({})} />
        <button onClick={() => navigate('/admin/dashboard/authors')} className="btn-secondary">
          Back to Authors
        </button>
      </div>
    );
  }

  return (
    <div className="create-book-container">
      <div className="modal-header">
        <h1>Edit Author</h1>
        <button onClick={() => navigate('/admin/dashboard/authors')} className="close-btn">
          <FiX />
        </button>
      </div>
      
      {successMessage && <SuccessAlert message={successMessage} onClose={handleCloseAlert} />}
      {errors.form && <ErrorAlert message={errors.form} onClose={handleCloseAlert} />}

      <form onSubmit={handleSubmit} className="create-book-form">
        {/* Image Upload */}
        <div className="image-upload-section">
          <label htmlFor="photo" className={`file-label ${previewImage ? 'has-image' : ''}`}>
            <input
              type="file"
              id="photo"
              onChange={handleFileChange}
              accept="image/*"
            />
            {previewImage ? (
              <div className="image-preview">
                <img src={previewImage} alt="Author" />
              </div>
            ) : (
              <div className="default-cover">
                <svg className="book-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <span>Upload Author Photo</span>
              </div>
            )}
          </label>
          {errors.photo && <div className="error-message">{errors.photo}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Author Name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'is-invalid' : ''}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <textarea
            name="bio"
            placeholder="Biography"
            value={formData.bio}
            onChange={handleChange}
            className={errors.bio ? 'is-invalid' : ''}
            rows="6"
          />
          {errors.bio && <div className="error-message">{errors.bio}</div>}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/dashboard/authors')} 
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={submitting}
          >
            {submitting ? 'Saving...' : <><FiSave /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuthor;
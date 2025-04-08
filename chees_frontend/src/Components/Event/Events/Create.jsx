import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import "../../AdminDashboard/CreateUser.css";
import PageLoading from '../../PageLoading/PageLoading';

const CreateEvent = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    venue: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postal_code: '',
    latitude: '',
    longitude: '',
    max_participants: '',
    registration_fee: '',
    registration_deadline: '',
    prize_pool: '',
    is_featured: false,
    is_active: true,
    image: null
  });

  const [eventTypes, setEventTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const response = await axiosInstance.get('/event-types');
        setEventTypes(response.data);
      } catch (error) {
        console.error('Error fetching event types:', error);
      }
    };
    fetchEventTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
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
    setErrors({});
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key !== 'image') {
          if (key === 'is_featured' || key === 'is_active') {
            formDataToSend.append(key, formData[key] ? '1' : '0');
          } else if (formData[key] !== null && formData[key] !== '') {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axiosInstance.post('/events', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Event created successfully!');
      
      // Reset form
      setFormData({
        type_id: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        venue: '',
        address: '',
        city: '',
        region: '',
        country: '',
        postal_code: '',
        latitude: '',
        longitude: '',
        max_participants: '',
        registration_fee: '',
        registration_deadline: '',
        prize_pool: '',
        is_featured: false,
        is_active: true,
        image: null
      });
      setPreviewImage(null);

      if (onSave) onSave(response.data);

    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: ['An unexpected error occurred. Please try again.'] });
        console.error('Error creating event:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-user-container">
      <h1 className="create-user-title">Create New Event</h1>
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      
      {errors.general && (
        <div className="alert alert-danger">
          {errors.general[0]}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="create-user-form">
        {/* Keep all the existing form fields exactly as they are */}
        
        <div className="upload-container">
  <label htmlFor="image-upload" className="upload-box">
    <input
      type="file"
      id="image-upload"
      className="upload-input"
      accept="image/*"
      onChange={handleFileChange}
    />
    
    {!previewImage ? (
      <>
        <div className="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
            <line x1="16" y1="5" x2="22" y2="5"></line>
            <line x1="19" y1="2" x2="19" y2="8"></line>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
          </svg>
        </div>
        <p className="upload-text">Click to upload image</p>
      </>
    ) : (
      <img src={previewImage} alt="Preview" className="upload-preview" />
    )}
    
    <div className="upload-hover-text">
      Click to change image
    </div>
  </label>
  
  {errors.image && (
    <p className="upload-error">{errors.image[0]}</p>
  )}
</div>

        <div className="form-group">
          <select
            name="type_id" 
            value={formData.type_id} 
            onChange={handleChange}
            className={`form-select ${errors.type_id ? 'is-invalid' : ''}`}
            required
          >
            <option value="">Select Event Type</option>
            {eventTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {errors.type_id && <div className="error-message">{errors.type_id[0]}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            className={`form-input ${errors.title ? 'is-invalid' : ''}`}
            required
            maxLength={255}
          />
          {errors.title && <div className="error-message">{errors.title[0]}</div>}
        </div>

        <div className="form-group">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className={`form-textarea ${errors.description ? 'is-invalid' : ''}`}
            required
          />
          {errors.description && <div className="error-message">{errors.description[0]}</div>}
        </div>

        <div className="form-group">
          <input
            type="date"
            name="start_date"
            placeholder="Start Date"
            value={formData.start_date}
            onChange={handleChange}
            className={`form-input ${errors.start_date ? 'is-invalid' : ''}`}
            required
          />
          {errors.start_date && <div className="error-message">{errors.start_date[0]}</div>}
        </div>

        <div className="form-group">
          <input
            type="date"
            name="end_date"
            placeholder="End Date"
            value={formData.end_date}
            onChange={handleChange}
            className={`form-input ${errors.end_date ? 'is-invalid' : ''}`}
            required
          />
          {errors.end_date && <div className="error-message">{errors.end_date[0]}</div>}
        </div>

        <div className="form-group">
          <input
            type="time"
            name="start_time"
            placeholder="Start Time"
            value={formData.start_time}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="time"
            name="end_time"
            placeholder="End Time"
            value={formData.end_time}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="venue"
            placeholder="Venue"
            value={formData.venue}
            onChange={handleChange}
            className="form-input"
            maxLength={255}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="form-input"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="region"
            placeholder="Region"
            value={formData.region}
            onChange={handleChange}
            className="form-input"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            className="form-input"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="postal_code"
            placeholder="Postal Code"
            value={formData.postal_code}
            onChange={handleChange}
            className="form-input"
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            step="any"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="form-input"
            min="-90"
            max="90"
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            step="any"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="form-input"
            min="-180"
            max="180"
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            name="max_participants"
            placeholder="Max Participants"
            value={formData.max_participants}
            onChange={handleChange}
            className="form-input"
            min="1"
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            step="0.01"
            name="registration_fee"
            placeholder="Registration Fee"
            value={formData.registration_fee}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>

        <div className="form-group">
          <input
            type="date"
            name="registration_deadline"
            placeholder="Registration Deadline"
            value={formData.registration_deadline}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="number"
            step="0.01"
            name="prize_pool"
            placeholder="Prize Pool"
            value={formData.prize_pool}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="checkbox-input"
            />
            Featured Event
          </label>
       
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="checkbox-input"
            />
            Active Event
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
          <button 
            type="button" 
            className="submit-button cancel-button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
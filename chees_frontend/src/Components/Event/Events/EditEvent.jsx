import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import "../../AdminDashboard/CreateUser.css";
import PageLoading from '../../PageLoading/PageLoading';

const EditEvent = ({ eventId, onSave, onCancel }) => {
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
  const [currentImagePath, setCurrentImagePath] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event types
        const typesResponse = await axiosInstance.get('/event-types');
        setEventTypes(typesResponse.data);

        // Fetch event data if editing
        if (eventId) {
          const eventResponse = await axiosInstance.get(`/events/${eventId}`);
          const eventData = eventResponse.data;
          
          // Format dates for input fields
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };

          // Format time to HH:mm (24-hour format)
          const formatTime = (timeString) => {
            if (!timeString) return '';
            const [hours, minutes] = timeString.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
          };

          setFormData({
            type_id: eventData.type_id,
            title: eventData.title,
            description: eventData.description,
            start_date: formatDate(eventData.start_date),
            end_date: formatDate(eventData.end_date),
            start_time: formatTime(eventData.start_time) || '',
            end_time: formatTime(eventData.end_time) || '',
            venue: eventData.venue || '',
            address: eventData.address || '',
            city: eventData.city || '',
            region: eventData.region || '',
            country: eventData.country || '',
            postal_code: eventData.postal_code || '',
            latitude: eventData.latitude || '',
            longitude: eventData.longitude || '',
            max_participants: eventData.max_participants || '',
            registration_fee: eventData.registration_fee || '',
            registration_deadline: formatDate(eventData.registration_deadline),
            prize_pool: eventData.prize_pool || '',
            is_featured: eventData.is_featured || false,
            is_active: eventData.is_active !== undefined ? eventData.is_active : true,
            image: null
          });

          if (eventData.image) {
            setCurrentImagePath(eventData.image);
            setPreviewImage(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/storage/${eventData.image}`);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ general: ['Failed to load  data.'] });
      }
    };

    fetchData();
  }, [eventId]);

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
    } else {
      // If file input is cleared, reset to original image
      setPreviewImage(currentImagePath ? 
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/storage/${currentImagePath}` : 
        null
      );
      setFormData(prev => ({
        ...prev,
        image: null
      }));
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

      const response = await axiosInstance.put(`/events/${eventId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Event updated successfully!');
      if (onSave) onSave(response.data);

    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: ['An unexpected error occurred. Please try again.'] });
        console.error('Error updating event:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-user-container">
      <h1 className="create-user-title">Edit Event</h1>
      
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

<div className="image-upload-edit">
  <label 
    htmlFor="edit-image" 
    className={`edit-file-label ${previewImage ? 'has-edit-image' : ''}`}
  >
    <input
      type="file"
      name="edit-image"
      id="edit-image"
      onChange={handleFileChange}
      className="edit-file-input"
      accept="image/*"
    />
    
    {!previewImage ? (
      <div className="edit-default-preview">
        {previewImage ? (
          <img src={previewImage} alt="Current" className="edit-current-image" />
        ) : (
          <svg className="edit-placeholder-icon" viewBox="0 0 24 24">
            <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
          </svg>
        )}
      </div>
    ) : (
      <div className="edit-image-preview">
        <img src={previewImage} alt="Preview" />
      </div>
    )}
    
    <div className="edit-hover-overlay">
      <span className="edit-hover-text">Change Image</span>
    </div>
  </label>
  {errors.image && <div className="edit-error-message">{errors.image[0]}</div>}
</div>

        <div className="form-group">
          <select
            name="type_id" 
            value={formData.type_id} 
            onChange={handleChange}
            className={`form-select ${errors.type_id ? 'is-invalid' : ''}`}
            
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
            {isSubmitting ? 'Updating...' : 'Update Event'}
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

export default EditEvent;
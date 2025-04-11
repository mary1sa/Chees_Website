import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import "../../AdminDashboard/CreateUser.css";

import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';

const EditEvent = ({ eventId, onSave, onCancel }) => {
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImagePath, setCurrentImagePath] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typesResponse = await axiosInstance.get('/event-types');
        setEventTypes(typesResponse.data);

        if (eventId) {
          const eventResponse = await axiosInstance.get(`/events/${eventId}`);
          const eventData = eventResponse.data;
          
          const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };

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
            setImagePreview(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/storage/${eventData.image}`);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ general: ['Failed to load required data.'] });
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

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = value.padStart(5, '0');
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(currentImagePath ? 
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
    setIsSubmitting(true);
  
    try {
      const dataToSend = {
        ...formData,
        image: formData.image ? 
          (formData.image.startsWith('data:image') ? formData.image : null) : 
          currentImagePath
      };
  
      let response;
      if (eventId) {
        response = await axiosInstance.put(`/events/${eventId}`, dataToSend);
        setSuccessAlert({ message: 'Event updated successfully!' });
      } else {
        response = await axiosInstance.post('/events', dataToSend);
        setSuccessAlert({ message: 'Event created successfully!' });
      }
  
      setTimeout(() => {
        if (onSave) onSave(response.data);
      }, 2000); // 2 seconds delay
    } catch (error) {
      console.error('Error saving event:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrorAlert({ message: 'Failed to save event. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-user-container">
      {successAlert && (
      <SuccessAlert
        message={successAlert.message}
        onClose={() => setSuccessAlert(null)}
      />
    )}

    {errorAlert && (
      <ErrorAlert
        message={errorAlert.message}
        onClose={() => setErrorAlert(null)}
      />
    )}
    
      
      <h1 className="create-user-title">Edit Event</h1>
      
      {errors.general && <div className="error-message">{errors.general[0]}</div>}
      
      <form onSubmit={handleSubmit} className="create-user-form">
      <div className="upload-container">
  <label htmlFor="image-upload" className="upload-box">
    <input
      type="file"
      id="image-upload"
      className="upload-input"
      accept="image/*"
      onChange={handleImageChange}
    />

    {!imagePreview ? (
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
      <img src={imagePreview} alt="Preview" className="upload-preview" />
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
          <label className="form-label">Event Type *</label>
          <select 
            name="type_id" 
            value={formData.type_id} 
            onChange={handleChange}
            required
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
          <label className="form-label">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`form-input ${errors.title ? 'is-invalid' : ''}`}
            required
            maxLength={255}
          />
          {errors.title && <div className="error-message">{errors.title[0]}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`form-textarea ${errors.description ? 'is-invalid' : ''}`}
            required
          />
          {errors.description && <div className="error-message">{errors.description[0]}</div>}
        </div>

          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={`form-input ${errors.start_date ? 'is-invalid' : ''}`}
              required
            />
            {errors.start_date && <div className="error-message">{errors.start_date[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">End Date *</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={`form-input ${errors.end_date ? 'is-invalid' : ''}`}
              required
            />
            {errors.end_date && <div className="error-message">{errors.end_date[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Start Time *</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleTimeChange}
              step="60"
              className={`form-input ${errors.start_time ? 'is-invalid' : ''}`}
              required
            />
            {errors.start_time && <div className="error-message">{errors.start_time[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">End Time *</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleTimeChange}
              step="60"
              className={`form-input ${errors.end_time ? 'is-invalid' : ''}`}
              required
            />
            {errors.end_time && <div className="error-message">{errors.end_time[0]}</div>}
          </div>

        <div className="form-group">
          <label className="form-label">Venue</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            className={`form-input ${errors.venue ? 'is-invalid' : ''}`}
            maxLength={255}
          />
          {errors.venue && <div className="error-message">{errors.venue[0]}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`form-input ${errors.address ? 'is-invalid' : ''}`}
          />
          {errors.address && <div className="error-message">{errors.address[0]}</div>}
        </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`form-input ${errors.city ? 'is-invalid' : ''}`}
              maxLength={100}
            />
            {errors.city && <div className="error-message">{errors.city[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className={`form-input ${errors.region ? 'is-invalid' : ''}`}
              maxLength={100}
            />
            {errors.region && <div className="error-message">{errors.region[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`form-input ${errors.country ? 'is-invalid' : ''}`}
              maxLength={100}
            />
            {errors.country && <div className="error-message">{errors.country[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className={`form-input ${errors.postal_code ? 'is-invalid' : ''}`}
              maxLength={20}
            />
            {errors.postal_code && <div className="error-message">{errors.postal_code[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className={`form-input ${errors.latitude ? 'is-invalid' : ''}`}
              min="-90"
              max="90"
            />
            {errors.latitude && <div className="error-message">{errors.latitude[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className={`form-input ${errors.longitude ? 'is-invalid' : ''}`}
              min="-180"
              max="180"
            />
            {errors.longitude && <div className="error-message">{errors.longitude[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Max Participants</label>
            <input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              className={`form-input ${errors.max_participants ? 'is-invalid' : ''}`}
              min="1"
            />
            {errors.max_participants && <div className="error-message">{errors.max_participants[0]}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Registration Fee</label>
            <input
              type="number"
              step="0.01"
              name="registration_fee"
              value={formData.registration_fee}
              onChange={handleChange}
              className={`form-input ${errors.registration_fee ? 'is-invalid' : ''}`}
              min="0"
            />
            {errors.registration_fee && <div className="error-message">{errors.registration_fee[0]}</div>}
          </div>

        <div className="form-group">
          <label className="form-label">Registration Deadline</label>
          <input
            type="date"
            name="registration_deadline"
            value={formData.registration_deadline}
            onChange={handleChange}
            className={`form-input ${errors.registration_deadline ? 'is-invalid' : ''}`}
          />
          {errors.registration_deadline && <div className="error-message">{errors.registration_deadline[0]}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Prize Pool</label>
          <input
            type="number"
            step="0.01"
            name="prize_pool"
            value={formData.prize_pool}
            onChange={handleChange}
            className={`form-input ${errors.prize_pool ? 'is-invalid' : ''}`}
            min="0"
          />
          {errors.prize_pool && <div className="error-message">{errors.prize_pool[0]}</div>}
        </div>

        <div className="form-group checkbox-group">
        <label className="form-label">Status</label>

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
          {errors.is_featured && <div className="error-message">{errors.is_featured[0]}</div>}
       
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
          {errors.is_active && <div className="error-message">{errors.is_active[0]}</div>}
        </div>

        {/* Image upload section - left as is without additional styling */}


        <div className="form-actions">
      

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Event'}
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
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';

const CreateEvent = () => {
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

  // Fetch event types on component mount
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
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append all fields to FormData
      Object.keys(formData).forEach(key => {
        if (key !== 'image') {
          // Handle boolean fields (convert to '1'/'0' for Laravel)
          if (key === 'is_featured' || key === 'is_active') {
            formDataToSend.append(key, formData[key] ? '1' : '0');
          } 
          // Only append if value exists (skip null/empty)
          else if (formData[key] !== null && formData[key] !== '') {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Append image if exists
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
    <div>
      <h1>Create New Event</h1>
      
      {/* Success Message */}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
      
      {/* General Error */}
      {errors.general && <div style={{ color: 'red' }}>{errors.general[0]}</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Event Type Dropdown */}
        <div>
          <label>
            Event Type:
            <select 
              name="type_id" 
              value={formData.type_id} 
              onChange={handleChange}
              required
            >
              <option value="">Select Event Type</option>
              {eventTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </label>
          {errors.type_id && <div style={{ color: 'red' }}>{errors.type_id[0]}</div>}
        </div>

        {/* Title */}
        <div>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={255}
            />
          </label>
          {errors.title && <div style={{ color: 'red' }}>{errors.title[0]}</div>}
        </div>

        {/* Description */}
        <div>
          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </label>
          {errors.description && <div style={{ color: 'red' }}>{errors.description[0]}</div>}
        </div>

        {/* Dates */}
        <div>
          <label>
            Start Date:
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </label>
          {errors.start_date && <div style={{ color: 'red' }}>{errors.start_date[0]}</div>}
        </div>

        <div>
          <label>
            End Date:
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </label>
          {errors.end_date && <div style={{ color: 'red' }}>{errors.end_date[0]}</div>}
        </div>

        {/* Times */}
        <div>
          <label>
            Start Time:
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
            />
          </label>
          {errors.start_time && <div style={{ color: 'red' }}>{errors.start_time[0]}</div>}
        </div>

        <div>
          <label>
            End Time:
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
            />
          </label>
          {errors.end_time && <div style={{ color: 'red' }}>{errors.end_time[0]}</div>}
        </div>

        {/* Location Information */}
        <div>
          <label>
            Venue:
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              maxLength={255}
            />
          </label>
          {errors.venue && <div style={{ color: 'red' }}>{errors.venue[0]}</div>}
        </div>

        <div>
          <label>
            Address:
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </label>
          {errors.address && <div style={{ color: 'red' }}>{errors.address[0]}</div>}
        </div>

        <div>
          <label>
            City:
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              maxLength={100}
            />
          </label>
          {errors.city && <div style={{ color: 'red' }}>{errors.city[0]}</div>}
        </div>

        <div>
          <label>
            Region:
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              maxLength={100}
            />
          </label>
          {errors.region && <div style={{ color: 'red' }}>{errors.region[0]}</div>}
        </div>

        <div>
          <label>
            Country:
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              maxLength={100}
            />
          </label>
          {errors.country && <div style={{ color: 'red' }}>{errors.country[0]}</div>}
        </div>

        <div>
          <label>
            Postal Code:
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              maxLength={20}
            />
          </label>
          {errors.postal_code && <div style={{ color: 'red' }}>{errors.postal_code[0]}</div>}
        </div>

        <div>
          <label>
            Latitude:
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              min="-90"
              max="90"
            />
          </label>
          {errors.latitude && <div style={{ color: 'red' }}>{errors.latitude[0]}</div>}
        </div>

        <div>
          <label>
            Longitude:
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              min="-180"
              max="180"
            />
          </label>
          {errors.longitude && <div style={{ color: 'red' }}>{errors.longitude[0]}</div>}
        </div>

        {/* Event Details */}
        <div>
          <label>
            Max Participants:
            <input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              min="1"
            />
          </label>
          {errors.max_participants && <div style={{ color: 'red' }}>{errors.max_participants[0]}</div>}
        </div>

        <div>
          <label>
            Registration Fee:
            <input
              type="number"
              step="0.01"
              name="registration_fee"
              value={formData.registration_fee}
              onChange={handleChange}
              min="0"
            />
          </label>
          {errors.registration_fee && <div style={{ color: 'red' }}>{errors.registration_fee[0]}</div>}
        </div>

        <div>
          <label>
            Registration Deadline:
            <input
              type="date"
              name="registration_deadline"
              value={formData.registration_deadline}
              onChange={handleChange}
            />
          </label>
          {errors.registration_deadline && <div style={{ color: 'red' }}>{errors.registration_deadline[0]}</div>}
        </div>

        <div>
          <label>
            Prize Pool:
            <input
              type="number"
              step="0.01"
              name="prize_pool"
              value={formData.prize_pool}
              onChange={handleChange}
              min="0"
            />
          </label>
          {errors.prize_pool && <div style={{ color: 'red' }}>{errors.prize_pool[0]}</div>}
        </div>

        {/* Checkboxes */}
        <div>
          <label>
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
            />
            Featured Event
          </label>
          {errors.is_featured && <div style={{ color: 'red' }}>{errors.is_featured[0]}</div>}
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active Event
          </label>
          {errors.is_active && <div style={{ color: 'red' }}>{errors.is_active[0]}</div>}
        </div>

        {/* Image Upload */}
        <div>
          <label>
            Event Image:
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/jpg,image/gif"
            />
          </label>
          {errors.image && <div style={{ color: 'red' }}>{errors.image[0]}</div>}
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
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
    // Ensure time is in HH:MM format
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
      // If file input is cleared, reset to original image
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
        // If no new image was uploaded, keep the existing image path
        image: formData.image ? 
          (formData.image.startsWith('data:image') ? formData.image : null) : 
          currentImagePath
      };

      let response;
      if (eventId) {
        response = await axiosInstance.put(`/events/${eventId}`, dataToSend);
      } else {
        response = await axiosInstance.post('/events', dataToSend);
      }

      if (onSave) onSave(response.data);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: ['An unexpected error occurred. Please try again.'] });
        console.error('Error saving event:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>{eventId ? 'Edit Event' : 'Create Event'}</h2>
      
      {errors.general && <div>{errors.general[0]}</div>}
      
      <form onSubmit={handleSubmit}>
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
          {errors.type_id && <div>{errors.type_id[0]}</div>}
        </div>

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
          {errors.title && <div>{errors.title[0]}</div>}
        </div>

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
          {errors.description && <div>{errors.description[0]}</div>}
        </div>

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
          {errors.start_date && <div>{errors.start_date[0]}</div>}
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
          {errors.end_date && <div>{errors.end_date[0]}</div>}
        </div>

        <div>
          <label>
            Start Time:
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleTimeChange}
              step="60"
              required
            />
          </label>
          {errors.start_time && <div>{errors.start_time[0]}</div>}
        </div>

        <div>
          <label>
            End Time:
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleTimeChange}
              step="60"
              required
            />
          </label>
          {errors.end_time && <div>{errors.end_time[0]}</div>}
        </div>

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
          {errors.venue && <div>{errors.venue[0]}</div>}
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
          {errors.address && <div>{errors.address[0]}</div>}
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
          {errors.city && <div>{errors.city[0]}</div>}
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
          {errors.region && <div>{errors.region[0]}</div>}
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
          {errors.country && <div>{errors.country[0]}</div>}
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
          {errors.postal_code && <div>{errors.postal_code[0]}</div>}
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
          {errors.latitude && <div>{errors.latitude[0]}</div>}
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
          {errors.longitude && <div>{errors.longitude[0]}</div>}
        </div>

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
          {errors.max_participants && <div>{errors.max_participants[0]}</div>}
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
          {errors.registration_fee && <div>{errors.registration_fee[0]}</div>}
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
          {errors.registration_deadline && <div>{errors.registration_deadline[0]}</div>}
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
          {errors.prize_pool && <div>{errors.prize_pool[0]}</div>}
        </div>

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
          {errors.is_featured && <div>{errors.is_featured[0]}</div>}
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
          {errors.is_active && <div>{errors.is_active[0]}</div>}
        </div>

        <div>
          <label>
            Event Image:
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
            />
          </label>
          {imagePreview && (
            <div>
              <img 
                src={imagePreview} 
                alt="Event Preview" 
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            </div>
          )}
          {errors.image && <div>{errors.image[0]}</div>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditEvent;
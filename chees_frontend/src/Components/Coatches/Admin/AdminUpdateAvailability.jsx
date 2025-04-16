import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';
import PageLoading from '../../PageLoading/PageLoading';
import Select from 'react-select';

const AdminUpdateAvailability = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coach_id: '',
    date: '',
    start_time: '',
    end_time: '',
    availability_type: 'regular',
    max_students: '',
    location: '',
    booking_notes: '',
    is_bookable: true
  });
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await axiosInstance.get('/fetchcoaches');
        setCoaches(response.data);
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    const fetchAvailability = async () => {
      try {
        const response = await axiosInstance.get(`/show_availability/${id}`);
        const availability = response.data;

        setFormData({
          ...availability,
          date: availability.date.split('T')[0],
          start_time: availability.start_time.substring(0, 5),
          end_time: availability.end_time.substring(0, 5),
        });
      } catch (error) {
        console.error('Error fetching availability:', error);
        setErrors({ form: 'Failed to load availability data' });
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
    fetchAvailability();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.coach_id) newErrors.coach_id = 'Coach is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (formData.max_students && formData.max_students < 0) newErrors.max_students = 'Max students must be positive';
    if (!formData.location) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    if (!validateForm()) return;

    try {
      setLoading(true);
      await axiosInstance.put(`/coach_availability/${id}`, formData);
      
      setSuccessMessage('Availability updated successfully!');
      setTimeout(() => {
        navigate("/admin/dashboard/coachavailability")
    }, 1500);
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ form: 'Error updating availability. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSelectChange = (selectedOption) => {
    setFormData({
      ...formData,
      coach_id: selectedOption ? selectedOption.value : '',
    });
    if (errors.coach_id) {
      setErrors({ ...errors, coach_id: '' });
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  if (loading) return <PageLoading />;

  const coachOptions = coaches.map(coach => ({
    value: coach.user.id,
    label: `${coach.user.first_name} ${coach.user.last_name}`,
  }));

  return (
    <div className="create-user-container">
      <h1 className="create-user-title">Update Availability</h1>
      
      {successMessage && <SuccessAlert message={successMessage} onClose={handleCloseAlert} />}
      {errors.form && <ErrorAlert message={errors.form} onClose={handleCloseAlert} />}

      <form onSubmit={handleSubmit} className="create-user-form">
        <div className="form-group">
          <label>Select Coach</label>
          <Select
            name="coach_id"
            value={coachOptions.find(option => option.value === formData.coach_id) || ''}
            onChange={handleSelectChange}
            options={coachOptions}
            className={`form-select ${errors.coach_id ? 'is-invalid' : ''}`}
          />
          {errors.coach_id && <div className="error-message">{errors.coach_id}</div>}
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`form-input ${errors.date ? 'is-invalid' : ''}`}
          />
          {errors.date && <div className="error-message">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label>Start Time</label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className={`form-input ${errors.start_time ? 'is-invalid' : ''}`}
          />
          {errors.start_time && <div className="error-message">{errors.start_time}</div>}
        </div>

        <div className="form-group">
          <label>End Time</label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className={`form-input ${errors.end_time ? 'is-invalid' : ''}`}
          />
          {errors.end_time && <div className="error-message">{errors.end_time}</div>}
        </div>

        <div className="form-group">
          <label>Availability Type</label>
          <select
            name="availability_type"
            value={formData.availability_type}
            onChange={handleChange}
            className={`form-input ${errors.availability_type ? 'is-invalid' : ''}`}
          >
            <option value="regular">Regular Session</option>
            <option value="workshop">Workshop</option>
            <option value="event">Special Event</option>
          </select>
          {errors.availability_type && <div className="error-message">{errors.availability_type}</div>}
        </div>

        <div className="form-group">
          <label>Max Students</label>
          <input
            type="number"
            name="max_students"
            value={formData.max_students}
            onChange={handleChange}
            className={`form-input ${errors.max_students ? 'is-invalid' : ''}`}
            min="1"
          />
          {errors.max_students && <div className="error-message">{errors.max_students}</div>}
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`form-input ${errors.location ? 'is-invalid' : ''}`}
            placeholder="Online or Physical Location"
          />
          {errors.location && <div className="error-message">{errors.location}</div>}
        </div>

        <div className="form-group">
          <label>Booking Notes</label>
          <textarea
            name="booking_notes"
            value={formData.booking_notes}
            onChange={handleChange}
            className={`form-textarea ${errors.booking_notes ? 'is-invalid' : ''}`}
            placeholder="Additional instructions for students"
          />
          {errors.booking_notes && <div className="error-message">{errors.booking_notes}</div>}
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="is_bookable"
              checked={formData.is_bookable}
              onChange={handleChange}
            />
            Available for Booking
          </label>
          {errors.is_bookable && <div className="error-message">{errors.is_bookable}</div>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-button">
              <span className="spinner_button"></span> Updating...
            </span>
          ) : (
            "Update Availability"
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminUpdateAvailability;

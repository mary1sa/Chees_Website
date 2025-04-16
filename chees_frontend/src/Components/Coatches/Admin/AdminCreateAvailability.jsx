import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';  
import { FiTrash2 } from 'react-icons/fi';

const AdminCreateAvailability = () => {
  const [availabilityForm, setAvailabilityForm] = useState({
    coach_id: '', 
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    availability_type: '',
    max_students: '',
    booking_notes: '',
    is_bookable: true,   
     current_bookings: 0, 

  });

  const [coaches, setCoaches] = useState([]); 
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await axiosInstance.get('/fetchcoaches');
        console.log('Fetched Coaches:', response.data); 
        setCoaches(response.data); 
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
    };

    fetchCoaches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAvailabilityForm({ ...availabilityForm, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (selectedOption) => {
    console.log('Selected Option:', selectedOption);  
    setAvailabilityForm({
      ...availabilityForm,
      coach_id: selectedOption ? selectedOption.value : '',
    });
    if (errors.coach_id) {
      setErrors({ ...errors, coach_id: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!availabilityForm.coach_id) {
      newErrors.coach_id = 'Coach selection is required';
      isValid = false;
    }

    if (!availabilityForm.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    if (!availabilityForm.start_time) {
      newErrors.start_time = 'Start time is required';
      isValid = false;
    }

    if (!availabilityForm.end_time) {
      newErrors.end_time = 'End time is required';
      isValid = false;
    }

    if (!availabilityForm.location) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    if (!availabilityForm.max_students) {
      newErrors.max_students = 'Max students is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateAvailability = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const formData = {
        ...availabilityForm,
      };

      console.log('Form Data:', formData);  

      await axiosInstance.post('/coach_availability', formData);
      setTimeout(() => {
        navigate("/admin/dashboard/coachavailability")
    }, 1500);
      setSuccessMessage('Availability created successfully!');
      setErrors({});
      setAvailabilityForm({
        coach_id: '',
        date: '',
        start_time: '',
        end_time: '',
        location: '',
        max_students: '',
        booking_notes: '',
      });
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data);  
        if (error.response.status === 422) {
          const serverErrors = {};
          Object.keys(error.response.data.errors).forEach(key => {
            serverErrors[key] = error.response.data.errors[key][0];
          });
          setErrors(serverErrors);
        } else {
          setErrors({ ...errors, form: 'Error creating availability' });
        }
      } else {
        setErrors({ ...errors, form: 'Network error. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const coachOptions = coaches.map(coach => ({
    value: coach.user.id,  
    label: `${coach.user.first_name} ${coach.user.last_name}`, 
  }));

  return (
    <div className="create-user-container">
      <h1 className="create-user-title">Create Availability</h1>
      
      {successMessage && <SuccessAlert message={successMessage} onClose={handleCloseAlert} />}
      {errors.form && <ErrorAlert message={errors.form} onClose={handleCloseAlert} />}

      <form onSubmit={handleCreateAvailability} className="create-user-form">
        <div className="form-group">
          <label>Select Coach</label>
          <Select
            name="coach_id"
            value={coachOptions.find(option => option.value === availabilityForm.coach_id) || ''}
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
            value={availabilityForm.date}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Start Time</label>
          <input
            type="time"
            name="start_time"
            value={availabilityForm.start_time}
            onChange={handleChange}
            className="form-input"
          />
          {errors.start_time && <div className="error-message">{errors.start_time}</div>}
        </div>

        <div className="form-group">
          <label>End Time</label>
          <input
            type="time"
            name="end_time"
            value={availabilityForm.end_time}
            onChange={handleChange}
            className="form-input"
          />
          {errors.end_time && <div className="error-message">{errors.end_time}</div>}
        </div>

        <div className="form-group">
          <select
            name="availability_type"
            value={availabilityForm.availability_type}
            onChange={handleChange}
            className={`form-select ${errors.availability_type ? 'is-invalid' : ''}`}
          >
            <option value="">Sélectionner le type de disponibilité</option>
            <option value="regular">Régulière</option>
            <option value="special">Spéciale</option>
            <option value="blocked">Bloquée</option>
            <option value="holiday">Fériée</option>
            <option value="limited">Limitée</option>
          </select>
          {errors.availability_type && <div className="error-message">{errors.availability_type}</div>}
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={availabilityForm.location}
            onChange={handleChange}
            className="form-input"
          />
          {errors.location && <div className="error-message">{errors.location}</div>}
        </div>

        <div className="form-group">
          <label>Max Students</label>
          <input
            type="number"
            name="max_students"
            value={availabilityForm.max_students}
            onChange={handleChange}
            className="form-input"
          />
          {errors.max_students && <div className="error-message">{errors.max_students}</div>}
        </div>

        <div className="form-group">
          <label>Booking Notes</label>
          <textarea
            name="booking_notes"
            value={availabilityForm.booking_notes}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label>
            Disponible pour réservation
            <input
              type="checkbox"
              name="is_bookable"
              checked={availabilityForm.is_bookable}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: e.target.name,
                    type: 'checkbox',
                    checked: e.target.checked,
                  },
                })
              }
            />
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-button">
              <span className="spinner_button"></span> Creating...
            </span>
          ) : (
            "Create Availability"
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminCreateAvailability;

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import SuccessAlert from '../../Alerts/SuccessAlert';  
import ErrorAlert from '../../Alerts/ErrorAlert';
import { useNavigate } from 'react-router-dom';

const CreateCoachAvailability = () => {
  const [availabilityForm, setAvailabilityForm] = useState({
    coach_id: '',
    date: '',
    start_time: '',
    end_time: '',
    availability_type: '',
    max_students: '',
    current_bookings: 0, 
    location: '',
    booking_notes: '',
    is_bookable: true,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    if (!loggedInUser || loggedInUser.role !== 'coach') {
      navigate('/login');
      return;
    }

    const fetchCoachId = async () => {
      try {
        const response = await axiosInstance.get(`/coachby-user/${loggedInUser.id}`);
        const coachId = response.data.id;
        setAvailabilityForm((prevForm) => ({
          ...prevForm,
          coach_id: coachId,
        }));
      } catch (error) {
        console.error("Error fetching coach:", error);
        navigate('/login');
      }
    };

    fetchCoachId();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAvailabilityForm({
      ...availabilityForm,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!availabilityForm.coach_id) {
      newErrors.coach_id = 'Le coach est requis';
      isValid = false;
    }

    if (!availabilityForm.date) {
      newErrors.date = 'La date est requise';
      isValid = false;
    }

    if (!availabilityForm.start_time || !availabilityForm.end_time) {
      newErrors.time = 'L\'heure de début et de fin sont requises';
      isValid = false;
    }

    if (!availabilityForm.availability_type) {
      newErrors.availability_type = 'Le type de disponibilité est requis';
      isValid = false;
    }

    if (!availabilityForm.max_students) {
      newErrors.max_students = 'Le nombre maximum d\'élèves est requis';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateAvailability = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    console.log("Form data being sent:", availabilityForm); 

    try {
      setLoading(true);

      await axiosInstance.post('/coach_availability', {
        coach_id: availabilityForm.coach_id,
        date: availabilityForm.date,
        start_time: availabilityForm.start_time,
        end_time: availabilityForm.end_time,
        availability_type: availabilityForm.availability_type,
        max_students: availabilityForm.max_students,
        current_bookings: availabilityForm.current_bookings, 
        location: availabilityForm.location,
        booking_notes: availabilityForm.booking_notes,
        is_bookable: availabilityForm.is_bookable,
      });

      setSuccessMessage('Disponibilité créée avec succès !');
      setErrors({});

      navigate("/admin/dashboard/fetchavailabilities");

      setAvailabilityForm((prevForm) => ({
        ...prevForm,
        date: '',
        start_time: '',
        end_time: '',
        availability_type: '',
        max_students: '',
        current_bookings: 0, 
        location: '',
        booking_notes: '',
        is_bookable: true,
      }));
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach((key) => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({
          ...errors,
          form: 'Une erreur est survenue lors de la création de la disponibilité',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => setShowAlert(false);

  return (
    <div className="create-user-container">
      <h1 className="create-user-title">Create Availability </h1>

      {successMessage && <SuccessAlert message={successMessage} onClose={handleCloseAlert} iconType="check" />}
      {errors.form && <ErrorAlert message={errors.form} onClose={handleCloseAlert} />}

      <form onSubmit={handleCreateAvailability} className="create-user-form">

        <input type="hidden" name="coach_id" value={availabilityForm.coach_id} />

        <div className="form-group">
          <input
            type="date"
            name="date"
            value={availabilityForm.date}
            onChange={handleChange}
            className={`form-input ${errors.date ? 'is-invalid' : ''}`}
          />
          {errors.date && <div className="error-message">{errors.date}</div>}
        </div>

        <div className="form-group">
          <input
            type="time"
            name="start_time"
            value={availabilityForm.start_time}
            onChange={handleChange}
            className={`form-input ${errors.time ? 'is-invalid' : ''}`}
          />
          <input
            type="time"
            name="end_time"
            value={availabilityForm.end_time}
            onChange={handleChange}
            className={`form-input ${errors.time ? 'is-invalid' : ''}`}
          />
          {errors.time && <div className="error-message">{errors.time}</div>}
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
          <input
            type="number"
            name="max_students"
            value={availabilityForm.max_students}
            onChange={handleChange}
            className={`form-input ${errors.max_students ? 'is-invalid' : ''}`}
            placeholder="Nombre maximum d'élèves"
          />
          {errors.max_students && <div className="error-message">{errors.max_students}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="location"
            value={availabilityForm.location}
            onChange={handleChange}
            className="form-input"
            placeholder="Emplacement"
          />
        </div>

        <div className="form-group">
          <textarea
            name="booking_notes"
            value={availabilityForm.booking_notes}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Notes de réservation"
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

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Chargement...' : 'Créer la disponibilité'}
        </button>
      </form>
    </div>
  );
};

export default CreateCoachAvailability;

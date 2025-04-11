import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';  

const CreateCoach = () => {
  const [coachForm, setCoachForm] = useState({
    user_id: '',
    title: '',
    fide_id: '',
    national_title: '',
    certification_level: '',
    rating: '',
    peak_rating: '',
    years_teaching_experience: '',
    primary_specialization_id: '', 
    secondary_specialization_id: '',
    hourly_rate: '',
    preferred_languages: [],
    teaching_formats: [],
    communication_methods: [],
    professional_bio: '',
    video_introduction_url: '',
    social_media_links: [''], 
  });

  const [users, setUsers] = useState([]);
  const [specializations, setSpecializations] = useState([]); 
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const status = user && user.role === 'admin' ? 'approved' : 'pending';

  useEffect(() => {
    const fetchCoachUsers = async () => {
      try {
        const response = await axiosInstance.get('/coaches');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching coach users:', error);
      }
    };

    const fetchSpecializations = async () => { 
      try {
        const response = await axiosInstance.get('/specializations');
        setSpecializations(response.data);
      } catch (error) {
        console.error('Error fetching specializations:', error);
      }
    };

    fetchCoachUsers();
    fetchSpecializations(); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCoachForm({ ...coachForm, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (selectedOption) => {
    setCoachForm({ ...coachForm, user_id: selectedOption ? selectedOption.value : '' });
    if (errors.user_id) {
      setErrors({ ...errors, user_id: '' });
    }
  };

  const handleArrayChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setCoachForm({ ...coachForm, [name]: selectedValues });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!coachForm.user_id) {
      newErrors.user_id = 'User selection is required';
      isValid = false;
    }

    if (!coachForm.rating) {
      newErrors.rating = 'Rating is required';
      isValid = false;
    }

    if (!coachForm.years_teaching_experience) {
      newErrors.years_teaching_experience = 'Teaching experience is required';
      isValid = false;
    }

    if (!coachForm.hourly_rate) {
      newErrors.hourly_rate = 'Hourly rate is required';
      isValid = false;
    }

    if (!coachForm.professional_bio) {
      newErrors.professional_bio = 'Professional bio is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateCoach = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const formData = {
        ...coachForm,
        preferred_languages: coachForm.preferred_languages,
        teaching_formats: coachForm.teaching_formats,
        communication_methods: coachForm.communication_methods,
        social_media_links: coachForm.social_media_links,
      };

      await axiosInstance.post('/coaches', {
        ...formData,
        status: status,
      });

      setSuccessMessage('Coach profile created successfully!');
      setErrors({});
      navigate("/admin/dashboard/coaches");

      setCoachForm({
        user_id: '',
        title: '',
        fide_id: '',
        national_title: '',
        certification_level: '',
        rating: '',
        peak_rating: '',
        years_teaching_experience: '',
        primary_specialization_id: '', 
        secondary_specialization_id: '', 
        hourly_rate: '',
        preferred_languages: [],
        teaching_formats: [],
        communication_methods: [],
        professional_bio: '',
        video_introduction_url: '',
        social_media_links: [''], 
      });

    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          const serverErrors = {};
          Object.keys(error.response.data.errors).forEach(key => {
            serverErrors[key] = error.response.data.errors[key][0];
          });
          setErrors(serverErrors);
        } else {
          setErrors({ ...errors, form: 'Error creating coach profile' });
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

  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name} (${user.email})`
  }));

  const specializationOptions = specializations.map(spec => ({
    value: spec.id,
    label: spec.name,
  }));

  const handleSocialMediaChange = (index, value) => {
    const updatedLinks = [...coachForm.social_media_links];
    updatedLinks[index] = value;
    setCoachForm({ ...coachForm, social_media_links: updatedLinks });
  };

  const addSocialMediaLink = () => {
    setCoachForm({ ...coachForm, social_media_links: [...coachForm.social_media_links, ''] });
  };

  const removeSocialMediaLink = (index) => {
    const updatedLinks = coachForm.social_media_links.filter((_, i) => i !== index);
    setCoachForm({ ...coachForm, social_media_links: updatedLinks });
  };

  return (
    <div className="create-coach-container">
      <h1 className="create-coach-title">Create Coach Profile</h1>
      
      {successMessage && <SuccessAlert message={successMessage} onClose={handleCloseAlert} />}
      {errors.form && <ErrorAlert message={errors.form} onClose={handleCloseAlert} />}

      <form onSubmit={handleCreateCoach} className="create-coach-form">
        <div className="form-group">
          <label>Select Coach User</label>
          <Select
            name="user_id"
            value={userOptions.find(option => option.value === coachForm.user_id)}
            onChange={handleSelectChange}
            options={userOptions}
            className={`form-select ${errors.user_id ? 'is-invalid' : ''}`}
          />
          {errors.user_id && <div className="error-message">{errors.user_id}</div>}
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={coachForm.title}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>FIDE ID</label>
          <input
            type="text"
            name="fide_id"
            value={coachForm.fide_id}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>National Title</label>
          <input
            type="text"
            name="national_title"
            value={coachForm.national_title}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Certification Level</label>
          <input
            type="text"
            name="certification_level"
            value={coachForm.certification_level}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Rating</label>
          <input
            type="number"
            name="rating"
            value={coachForm.rating}
            onChange={handleChange}
            className="form-input"
          />
          {errors.rating && <div className="error-message">{errors.rating}</div>}
        </div>

        <div className="form-group">
          <label>Peak Rating</label>
          <input
            type="number"
            name="peak_rating"
            value={coachForm.peak_rating}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Years of Teaching Experience</label>
          <input
            type="number"
            name="years_teaching_experience"
            value={coachForm.years_teaching_experience}
            onChange={handleChange}
            className="form-input"
          />
          {errors.years_teaching_experience && <div className="error-message">{errors.years_teaching_experience}</div>}
        </div>

        <div className="form-group">
          <label>Hourly Rate</label>
          <input
            type="number"
            name="hourly_rate"
            value={coachForm.hourly_rate}
            onChange={handleChange}
            className="form-input"
          />
          {errors.hourly_rate && <div className="error-message">{errors.hourly_rate}</div>}
        </div>

        <div className="form-group">
          <label>Primary Specialization</label>
          <Select
            name="primary_specialization_id"
            value={specializationOptions.find(option => option.value === coachForm.primary_specialization_id)}
            onChange={selectedOption => setCoachForm({ ...coachForm, primary_specialization_id: selectedOption ? selectedOption.value : '' })}
            options={specializationOptions}
            className={`form-select ${errors.primary_specialization_id ? 'is-invalid' : ''}`}
          />
          {errors.primary_specialization_id && <div className="error-message">{errors.primary_specialization_id}</div>}
        </div>

        <div className="form-group">
          <label>Secondary Specialization</label>
          <Select
            name="secondary_specialization_id"
            value={specializationOptions.find(option => option.value === coachForm.secondary_specialization_id)}
            onChange={selectedOption => setCoachForm({ ...coachForm, secondary_specialization_id: selectedOption ? selectedOption.value : '' })}
            options={specializationOptions}
            className={`form-select ${errors.secondary_specialization_id ? 'is-invalid' : ''}`}
          />
          {errors.secondary_specialization_id && <div className="error-message">{errors.secondary_specialization_id}</div>}
        </div>

        <div className="form-group">
          <label>Preferred Languages</label>
          <Select
            isMulti
            name="preferred_languages"
            value={coachForm.preferred_languages.map(lang => ({ value: lang, label: lang }))}
            onChange={selectedOptions => setCoachForm({ ...coachForm, preferred_languages: selectedOptions.map(option => option.value) })}
            options={[
              { value: 'English', label: 'English' },
              { value: 'French', label: 'French' },
            ]}
            className="form-select"
          />
        </div>

        <div className="form-group">
          <label>Social Media Links</label>
          {coachForm.social_media_links.map((link, index) => (
            <div key={index} className="social-media-link">
              <input
                type="text"
                value={link}
                onChange={(e) => handleSocialMediaChange(index, e.target.value)}
                className="form-input"
                placeholder="Social Media URL"
              />
              <button type="button" onClick={() => removeSocialMediaLink(index)} className="remove-link-button">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addSocialMediaLink} className="add-link-button">
            Add Social Media Link
          </button>
        </div>

        <div className="form-group">
          <textarea
            name="professional_bio"
            placeholder="Professional Bio"
            value={coachForm.professional_bio}
            onChange={handleChange}
            className={`form-textarea ${errors.professional_bio ? 'is-invalid' : ''}`}
          />
          {errors.professional_bio && <div className="error-message">{errors.professional_bio}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="video_introduction_url"
            placeholder="Video Introduction URL"
            value={coachForm.video_introduction_url}
            onChange={handleChange}
            className="form-input"
          />
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
            "Create Coach Profile"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCoach;

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { FiTrash2 } from 'react-icons/fi';

const UpdateCoach = () => {
  const { id } = useParams();
  const [coachForm, setCoachForm] = useState({
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

  const [specializations, setSpecializations] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const specsResponse = await axiosInstance.get('/specializations');
        setSpecializations(specsResponse.data);

        const coachResponse = await axiosInstance.get(`/coaches/${id}`);
        const coachData = coachResponse.data;
        console.log(coachResponse.data)
        setCoachForm({
          ...coachData,
          preferred_languages: Array.isArray(coachData.preferred_languages) ? coachData.preferred_languages : [],
          teaching_formats: Array.isArray(coachData.teaching_formats) ? coachData.teaching_formats : [],
          communication_methods: Array.isArray(coachData.communication_methods) ? coachData.communication_methods : [],
          social_media_links: Array.isArray(coachData.social_media_links) ? coachData.social_media_links : [''],
          primary_specialization_id: coachData.primary_specialization_id || '',
          secondary_specialization_id: coachData.secondary_specialization_id || '',
        });
        

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCoachForm({ ...coachForm, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

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

  const handleUpdateCoach = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      const formData = {
        ...coachForm,
        preferred_languages: coachForm.preferred_languages,
        teaching_formats: coachForm.teaching_formats,
        communication_methods: coachForm.communication_methods,
        social_media_links: coachForm.social_media_links,
      };

      await axiosInstance.put(`/coaches/${id}`, formData);
      setSuccessMessage('Coach profile updated successfully!');
      setErrors({});
      navigate("/admin/dashboard/FetchCoatches");

    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ form: error.response?.data?.message || 'An error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

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
  const teachingFormatOptions = [
    { value: 'One-on-One', label: 'One-on-One Lessons' },
    { value: 'Group', label: 'Group Classes' },
    { value: 'Video Lessons', label: 'Video Lessons' },
    { value: 'Tournament Preparation', label: 'Tournament Preparation' }
  ];
  
  const communicationMethodOptions = [
    { value: 'Email', label: 'Email' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Video Call', label: 'Video Call' },
    { value: 'In-Person', label: 'In-Person' }
  ];
  return (
    <div className="create-user-container">
      <h1 className="create-user-title">Update Coach Profile</h1>
      
      {successMessage && <SuccessAlert message={successMessage} />}
      {errors.form && <ErrorAlert message={errors.form} />}

      <form onSubmit={handleUpdateCoach} className="create-user-form">
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
          <label>Years of Experience</label>
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
            value={specializationOptions.find(opt => opt.value === coachForm.primary_specialization_id)}
            onChange={opt => setCoachForm({ ...coachForm, primary_specialization_id: opt?.value || '' })}
            options={specializationOptions}
            className="form-select"
            isClearable
          />
        </div>

        <div className="form-group">
          <label>Secondary Specialization</label>
          <Select
            value={specializationOptions.find(opt => opt.value === coachForm.secondary_specialization_id)}
            onChange={opt => setCoachForm({ ...coachForm, secondary_specialization_id: opt?.value || '' })}
            options={specializationOptions}
            className="form-select"
            isClearable
          />
        </div>

        <div className="form-group">
          <label>Preferred Languages</label>
          <Select
  isMulti
  name="preferred_languages"
  value={(coachForm.preferred_languages || []).map(lang => ({ value: lang, label: lang }))}
  onChange={selected =>
    setCoachForm({
      ...coachForm,
      preferred_languages: selected.map(option => option.value),
    })
  }
  options={[
    { value: 'English', label: 'English' },
    { value: 'French', label: 'French' },
    { value: 'Arabic', label: 'Arabic' },

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
              <button 
                type="button" 
                onClick={() => removeSocialMediaLink(index)} 
                className="remove-link-button"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={addSocialMediaLink} 
            className="add-link-button"
          >
            Add Link
          </button>
        </div>
        <div className="form-group">
  <label>Teaching Formats</label>
  <Select
    isMulti
    name="teaching_formats"
    value={coachForm.teaching_formats.map(format => ({ value: format, label: format }))}
    onChange={selected => setCoachForm({ 
      ...coachForm, 
      teaching_formats: selected.map(option => option.value) 
    })}
    options={teachingFormatOptions}
    className="form-select"
  />
</div>

<div className="form-group">
  <label>Communication Methods</label>
  <Select
    isMulti
    name="communication_methods"
    value={coachForm.communication_methods.map(method => ({ value: method, label: method }))}
    onChange={selected => setCoachForm({ 
      ...coachForm, 
      communication_methods: selected.map(option => option.value) 
    })}
    options={communicationMethodOptions}
    className="form-select"
  />
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
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default UpdateCoach;
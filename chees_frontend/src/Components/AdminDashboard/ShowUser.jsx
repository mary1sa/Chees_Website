import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import './ShowUser.css';
import PageLoading from '../PageLoading/PageLoading';
import { FaBirthdayCake, FaPhoneAlt, FaLocationArrow, FaEnvelope, FaRegUser, FaChessPawn } from 'react-icons/fa';

const ShowUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [coachDetails, setCoachDetails] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        setUser(response.data);
        
        if (response.data.role.name === 'coach') {
          const coachResponse = await axiosInstance.get(`/coachby-user/${id}`);
          setCoachDetails(coachResponse.data);
          console.log(coachResponse.data)
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) return <PageLoading />;

  return (
    <>
      <div className="profile-dashboard">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-container">
              <img
                src={user.profile_picture ? `http://localhost:8000/storage/${user.profile_picture}` : '/anony.jpg'}
                alt={user.username}
                className="profile-avatar"
              />
              <span className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}></span>
            </div>
            <div className="profile-titles">
              <h1 className="profile-name">
                {user.first_name} {user.last_name}
              </h1>
              <p className="profile-role">{user.role.name}</p>
              <p className="profile-username">@{user.username}</p>
            </div>
            <div className="rating-badge">
              <span className="rating-value">{user.chess_rating}</span>
              <span className="rating-label">Rating</span>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            <div className="info-section">
              <h2 className="section-title">Personal Information</h2>
              <InfoField icon={<FaEnvelope />} label="Email" value={user.email} />
              <InfoField icon={<FaPhoneAlt />} label="Phone" value={user.phone} />
              <InfoField icon={<FaBirthdayCake />} label="Date of Birth" value={user.date_of_birth} />
              <InfoField icon={<FaLocationArrow />} label="Location" value={`${user.city}, ${user.address}`} />
            </div>

            <div className="info-section">
              <h2 className="section-title">About Me</h2>
              <div className="bio-content">{user.bio || 'No biography available'}</div>
            </div>

            {coachDetails && (
  <div className="info-section coach-details-section">
    <h2 className="section-title">Coach Details</h2>
    <div className="coach-detail-field">
      <span className="coach-detail-label">Title:</span>
      <span className="coach-detail-value">{coachDetails.title}</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">FIDE ID:</span>
      <span className="coach-detail-value">{coachDetails.fide_id}</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">National Title:</span>
      <span className="coach-detail-value">{coachDetails.national_title}</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">Certification Level:</span>
      <span className="coach-detail-value">{coachDetails.certification_level}</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">Rating:</span>
      <span className="coach-detail-value">{coachDetails.rating}</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">Peak Rating:</span>
      <span className="coach-detail-value">{coachDetails.peak_rating}</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">Teaching Experience:</span>
      <span className="coach-detail-value">{coachDetails.years_teaching_experience} years</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">Hourly Rate:</span>
      <span className="coach-detail-value">{coachDetails.hourly_rate}</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">Professional Bio:</span>
      <span className="coach-detail-value">{coachDetails.professional_bio}</span>
    </div>
    <div className="coach-detail-field">
      <span className="coach-detail-label">Video URL:</span>
      <span className="coach-detail-value">{coachDetails.video_introduction_url}</span>
    </div>

        <div className="coach-detail-field">
      <span className="coach-detail-label">Primary Specialization:</span>
      <span className="coach-detail-value">
        {coachDetails.primary_specialization?.name || coachDetails.primary_specialization_id || '—'}
      </span>
    </div>

    <div className="coach-detail-field">
      <span className="coach-detail-label">Secondary Specialization:</span>
      <span className="coach-detail-value">
        {coachDetails.secondary_specialization?.name || coachDetails.secondary_specialization_id || '—'}
      </span>
    </div>

    <div className="coach-detail-field">
      <span className="coach-detail-label">Preferred Languages:</span>
       <span className="coach-detail-value">
    {(coachDetails.preferred_languages && coachDetails.preferred_languages.length > 0)
      ? coachDetails.preferred_languages.join(', ')
      : '—'}
  </span>
    </div>

    <div className="coach-detail-field">
      <span className="coach-detail-label">Teaching Formats:</span>
      <span className="coach-detail-value">
        {(coachDetails.teaching_formats || []).join(', ') || '—'}
      </span>
    </div>

    <div className="coach-detail-field">
      <span className="coach-detail-label">Communication Methods:</span>
      <span className="coach-detail-value">
        {(coachDetails.communication_methods || []).join(', ') || '—'}
      </span>
    </div>

    <div className="coach-detail-field">
      <span className="coach-detail-label">Social Media Links:</span>
      <span className="coach-detail-value">
        {coachDetails.social_media_links
          ? Object.entries(coachDetails.social_media_links).map(([platform, url]) => (
              <div key={platform}>
                <strong>{platform}:</strong> <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              </div>
            ))
          : '—'}
      </span>
    </div>

    

   

  </div>
)}

          </div>
        </div>
      </div>
      <button className="back-button" onClick={() => window.history.back()}>
        &larr; Back to List
      </button>
    </>
  );
};

const InfoField = ({ label, value, icon }) => (
  <div className="info-field">
    {icon && <span className="info-icon">{icon}</span>}
    <div className="info-content">
      <label className="info-label">{label}</label>
      <p className="info-value">{value || '—'}</p>
    </div>
  </div>
);

export default ShowUser;

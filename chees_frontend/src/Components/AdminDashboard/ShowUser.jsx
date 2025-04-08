import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import './ShowUser.css'; 
import PageLoading from '../PageLoading/PageLoading';

const ShowUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [id]);


    if (!user) return <PageLoading/>;   

  return (
    <div className="profile-dashboard">
      <button className="back-button" onClick={() => window.history.back()}>
        &larr; Back to List
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            <img
              src={user.profile_picture    ? `http://localhost:8000/storage/${user.profile_picture}`
          : '/anony.jpg'}
              alt={user.username}
              className="profile-avatar"
            />
            <span className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}></span>
          </div>
          <div className="profile-titles">
            <h1 className="profile-name">{user.first_name} {user.last_name}</h1>
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
            <InfoField label="Email" value={user.email} />
            <InfoField label="Phone" value={user.phone} />
            <InfoField label="Date of Birth" value={user.date_of_birth} />
            <InfoField label="Location" value={`${user.city}, ${user.address}`} />
          </div>

          <div className="info-section">
            <h2 className="section-title">About Me</h2>
            <div className="bio-content">
              {user.bio || 'No biography available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div className="info-field">
    <label className="info-label">{label}</label>
    <p className="info-value">{value || '—'}</p>
  </div>
);

export default ShowUser;
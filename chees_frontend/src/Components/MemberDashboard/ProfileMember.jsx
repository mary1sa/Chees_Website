import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import '../CoatchDashboard/ProfileCoach.css';

import PageLoading from '../PageLoading/PageLoading';
import { FaBirthdayCake, FaPhoneAlt, FaLocationArrow, FaEnvelope, FaUser, FaLink } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ProfileMember = () => {
  const [user, setUser] = useState(null);

  const getItems = () => {
    return JSON.parse(localStorage.getItem('user')) || null;
  };

  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUser = getItems();
      if (!fetchedUser) return;
      setUser(fetchedUser);
    };

    loadUserData();
  }, []);

  if (!user) return <PageLoading />;

  return (
    <div className="coach-profiles">
      <div className="coach-profile-cards">
        <div className="coach-profile-header">
          <div className="coach-avatar-container">
            <img
              src={user.profile_picture ? `http://localhost:8000/storage/${user.profile_picture}` : '/anony.jpg'}
              alt={user.username}
              className="coach-avatar-img"
            />
            <span className={`coach-status-dot ${user.is_active ? 'active' : 'inactive'}`}></span>
          </div>
          
          <div className="coach-titles">
            <h1 className="coach-name">{user.first_name} {user.last_name}</h1>
            <p className="coach-role">{user.role.name}</p>
            <div className="coach-username">
              <FaUser className="coach-icon" />
              <span>@{user.username}</span>
              <div>
                <Link
                style={{color:"white"}}
                  to={`/member/dashboard/UpdateMemberProfile`}
                  className="update-user"
                  title="Update"
                >
                  <FiEdit className="icon" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="coach-profile-content">
          <div className="coach-personal-info">
            <h3 className="coach-section-title">Personal Details  
              <Link style={{color:"black"}}
                to={`/member/dashboard/UpdateMemberProfile/`}
                className="update-coach"
                title="Update"
              >
                <FiEdit className="icon" />
              </Link>
            </h3>

            <div className="coach-info-grid">
              <div className="coach-info-item">
                <FaEnvelope className="info-icon" />
                <div>
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="coach-info-item">
                <FaPhoneAlt className="info-icon" />
                <div>
                  <label>Phone</label>
                  <p>{user.phone}</p>
                </div>
              </div>
              <div className="coach-info-item">
                <FaBirthdayCake className="info-icon" />
                <div>
                  <label>Date of Birth</label>
                  <p>{user.date_of_birth}</p>
                </div>
              </div>
              <div className="coach-info-item">
                <FaLocationArrow className="info-icon" />
                <div>
                  <label>Location</label>
                  <p>{`${user.city}, ${user.address}`}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="coach-biography">
            <h3 className="coach-section-title">Biography</h3>
            <p className="coach-bio">{user.bio || 'No biography available'}</p>
          </div>

          <div className="coach-social-media">
            <h3 className="coach-section-title">Social Media Links</h3>
            <div className="social-links-container">
              {user.social_media_links && user.social_media_links.length > 0 ? (
                user.social_media_links.map((url, index) => {
                  const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
                  return (
                    <a
                      key={index}
                      href={cleanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <FaLink className="social-icon" />
                      <span>{cleanUrl}</span>
                    </a>
                  );
                })
              ) : (
                <span className="detail-value">No social links provided</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileMember;

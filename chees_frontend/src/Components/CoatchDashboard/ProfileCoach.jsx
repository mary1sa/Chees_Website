import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import './ProfileCoach.css';

import PageLoading from '../PageLoading/PageLoading';
import { FaBirthdayCake, FaPhoneAlt, FaLocationArrow, FaEnvelope, FaChessKing, FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaLink, FaComments, FaChalkboardTeacher, FaGlobe } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ProfileCoach = () => {
  const [user, setUser] = useState(null);
  const [coachDetails, setCoachDetails] = useState(null);
  const [primarySpec, setPrimarySpec] = useState('');
  const [secondarySpec, setSecondarySpec] = useState('');

  const getItems = () => {
    return JSON.parse(localStorage.getItem('user')) || null;
  };
  useEffect(() => {
    if (coachDetails) {
      console.log('Teaching Formats:', coachDetails.teaching_formats);
      console.log('Preferred Languages:', coachDetails.preferred_languages);
      console.log('Social Media Links:', coachDetails.social_media_links);
    }
  }, [coachDetails]);
  useEffect(() => {
    const loadUserData = async () => {
      const fetchedUser = getItems();
      if (!fetchedUser) return;
      setUser(fetchedUser);

      try {
        const response = await axiosInstance.get(`/coachby-user/${fetchedUser.id}`);
        setCoachDetails(response.data);

        if (response.data.primary_specialization_id) {
          const primary = await axiosInstance.get(`/specializations/${response.data.primary_specialization_id}`);
          setPrimarySpec(primary.data.name);
        }

        if (response.data.secondary_specialization_id) {
          const secondary = await axiosInstance.get(`/specializations/${response.data.secondary_specialization_id}`);
          setSecondarySpec(secondary.data.name);
        }
      } catch (error) {
        console.error('Error loading coach details:', error);
      }
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
              <FaChessKing className="chess-icon" />
              <span>@{user.username}</span>
              {coachDetails &&(<div><Link
                        to={`/coach/dashboard/UpdateCoachProfile/${coachDetails.id}`}
                        className="update-coach"
                        title="Update"
                      >
                        <FiEdit className="icon" />
                      </Link></div>)}
            </div>
          </div>

          <div className="coach-rating-badge">
            <span className="rating-value">{user.chess_rating}</span>
            <span className="rating-label">ELO Rating</span>
          </div>
        </div>

       
        <div className="coach-profile-content">
        
          <div className="coach-personal-info">
            <h3 className="coach-section-title">Personal Details</h3>
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

          
          <div className="coach-professional-info">
            <div className="coach-about-section">
              <h3 className="coach-section-title">Biography</h3>
              <p className="coach-bio">{user.bio || 'No biography available'}</p>
            </div>
            <h3 className="coach-section-title">Professional Information</h3>

            {coachDetails && (
                
              <div className="coach-details-grid">
                   
                <div className="coach-detail-item">
                  <span className="detail-label">Title</span>
                  <span className="detail-value rate">{coachDetails.title}</span>
                </div>
                <div className="coach-detail-item">
                  <span className="detail-label">Fide Id</span>
                  <span className="detail-value rate">#{coachDetails.fide_id}</span>
                </div>
                <div className="coach-detail-item">
                  <span className="detail-label">Peak rating</span>
                  <span className="detail-value rate">{coachDetails.peak_rating}</span>
                </div>
                <div className="coach-detail-item">
                  <span className="detail-label">Certification Level</span>
                  <span className="detail-value premium">{coachDetails.certification_level}</span>
                </div>
                
                <div className="coach-detail-item">
                  <span className="detail-label">Hourly Rate</span>
                  <span className="detail-value rate">${coachDetails.hourly_rate}/hr</span>
                </div>

                <div className="coach-detail-item">
                  <span className="detail-label">Experience</span>
                  <span className="detail-value">{coachDetails.years_teaching_experience} Years</span>
                </div>

                <div className="coach-detail-item full-width">
                  <span className="detail-label">Specializations</span>
                  <div className="specializations">
                    <span className="specialization-badge primary">{primarySpec}</span>
                    <span className="specialization-badge secondary">{secondarySpec}</span>
                  </div>
                </div>

               

                <div className="coach-detail-item full-width">
                  <span className="detail-label">Video Introduction</span>
                  <a href={coachDetails.video_introduction_url} 
                     className="video-link"
                     target="_blank" 
                     rel="noopener noreferrer">
                    Watch Introduction
                  </a>
                </div>


                <div className="coach-detail-item full-width">
  <span className="detail-label">communication methode</span>
  <div className="format-container">
    {(
      Array.isArray(coachDetails.communication_methods
) 
        ? coachDetails.communication_methods
            .filter(item => item != null) 
            .map(item => String(item).trim()) 
        : (coachDetails.communication_methods || '') 
            .replace(/[\[\]']+/g, '')
            .split(',')
            .map(item => item ? item.trim() : '') 
            .filter(Boolean)
    ).map((format, index) => (
      <span key={index} className="format-badge">
        <FaChalkboardTeacher className="format-icon" />
        {format}
      </span>
    ))}
    {!coachDetails.teaching_formats?.length && ( 
      <span className="detail-value">Not specified</span>
    )}
  </div>
</div>

               
                
                <div className="coach-detail-item full-width">
  <span className="detail-label">Teaching Formats</span>
  <div className="format-container">
    {(
      Array.isArray(coachDetails.teaching_formats) 
        ? coachDetails.teaching_formats
            .filter(item => item != null) 
            .map(item => String(item).trim()) 
        : (coachDetails.teaching_formats || '') 
            .replace(/[\[\]']+/g, '')
            .split(',')
            .map(item => item ? item.trim() : '') 
            .filter(Boolean)
    ).map((format, index) => (
      <span key={index} className="format-badge">
        <FaChalkboardTeacher className="format-icon" />
        {format}
      </span>
    ))}
    {!coachDetails.teaching_formats?.length && ( 
      <span className="detail-value">Not specified</span>
    )}
  </div>
</div>

<div className="coach-detail-item full-width">
  <span className="detail-label">Preferred Languages</span>
  <div className="language-container">
    {(
      Array.isArray(coachDetails.preferred_languages)
        ? coachDetails.preferred_languages
            .filter(item => item != null) 
            .map(item => String(item).trim()) 
        : (coachDetails.preferred_languages || '') 
            .replace(/[\[\]']+/g, '')
            .split(',')
            .map(item => item ? item.trim() : '')
            .filter(Boolean)
    ).map((lang, index) => (
      <span key={index} className="language-badge">
        <FaGlobe className="language-icon" />
        {lang}
      </span>
    ))}
    {!coachDetails.preferred_languages?.length && ( 
      <span className="detail-value">Not specified</span>
    )}
  </div>
</div>
<div className="coach-detail-item full-width">
  <span className="detail-label">Social Media Links</span>
  <div className="social-links-container">
    {(() => {
     
      if (!coachDetails.social_media_links) {
        return <span className="detail-value">No social links provided</span>;
      }

      let links = [];
      
      try {
        if (typeof coachDetails.social_media_links === 'string') {
          links = JSON.parse(coachDetails.social_media_links);
        } else {
          links = Array.isArray(coachDetails.social_media_links) 
            ? coachDetails.social_media_links 
            : [];
        }
      } catch (e) {
        links = (coachDetails.social_media_links || '')
          .split(',')
          .map(url => url ? url.trim() : '');
      }

      const validLinks = links
        .filter(url => url !== null && url !== undefined) 
        .map(url => String(url).trim())
        .filter(url => url.length > 0) 
        .map(url => url.replace(/[\[\]']+/g, '')); 

      return validLinks.length > 0 ? (
        validLinks.map((url, index) => {
          const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
          let platform = '';
          
          if(cleanUrl.includes('twitter.com')) platform = 'Twitter';
          if(cleanUrl.includes('facebook.com')) platform = 'Facebook';
          if(cleanUrl.includes('instagram.com')) platform = 'Instagram';
          if(cleanUrl.includes('linkedin.com')) platform = 'LinkedIn';

          return (
            <a
              key={index}
              href={cleanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              {platform === 'Twitter' && <FaTwitter className="social-icon twitter" />}
              {platform === 'Facebook' && <FaFacebook className="social-icon facebook" />}
              {platform === 'Instagram' && <FaInstagram className="social-icon instagram" />}
              {platform === 'LinkedIn' && <FaLinkedin className="social-icon linkedin" />}
              {!platform && <FaLink className="social-icon" />}
              <span>{cleanUrl}</span>
            </a>
          );
        })
      ) : (
        <span className="detail-value">No social links provided</span>
      );
    })()}
  </div>

</div>
              </div>
            )}
          </div>
          
        </div>
      </div>
   
    </div>
  );
};

export default ProfileCoach;

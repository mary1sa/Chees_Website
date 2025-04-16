import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiClock, FiUser, FiCalendar, FiMap, FiVideo, FiX, FiLink, FiKey, FiInfo } from 'react-icons/fi';
import './Sessions.css';

const SessionCard = ({ session, onJoin, isPastSession = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isUpcoming = !isPastSession && new Date(session.start_datetime) > new Date();
  const canJoin = isUpcoming && new Date(session.start_datetime) <= new Date(Date.now() + 15 * 60 * 1000); // Can join 15 minutes before
  const isOnline = !!session.zoom_link;
  
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  return (
    <div className={`session-card ${canJoin ? 'can-join' : ''}`}>
      <div className="session-header">
        <h3>{session.title}</h3>
        {isOnline ? (
          <div className="session-badge online">
            <FiVideo /> Online
          </div>
        ) : (
          <div className="session-badge in-person">
            <FiMap /> In-Person
          </div>
        )}
      </div>
      
      <div className="session-details">
        <div className="session-detail">
          <FiCalendar className="session-icon" />
          <span>{formatDate(session.start_datetime)}</span>
        </div>
        <div className="session-detail">
          <FiClock className="session-icon" />
          <span>{formatTime(session.start_datetime)} - {formatTime(session.end_datetime)}</span>
        </div>
        <div className="session-detail">
          <FiUser className="session-icon" />
          <span>Coach: {session.coach ? `${session.coach.first_name} ${session.coach.last_name}` : 'TBA'}</span>
        </div>
        {!isOnline && (
          <div className="session-detail">
            <FiMap className="session-icon" />
            <span>Location: {session.location}</span>
          </div>
        )}
      </div>
      
      <div className="session-footer">
        <div className="session-actions">
          {canJoin && isOnline && (
            <button 
              className="join-session-btn" 
              onClick={() => onJoin(session)}
            >
              Join Now
            </button>
          )}
          <button 
            className="view-more-btn" 
            onClick={() => setShowDetails(true)}
          >
            View More
          </button>
        </div>
        {isUpcoming && !canJoin && (
          <div className="session-countdown">
            Starts in: {getTimeUntilStart(session.start_datetime)}
          </div>
        )}
        {!isUpcoming && (
          <div className="session-completed">
            {session.recording_url ? (
              <a href={session.recording_url} target="_blank" rel="noopener noreferrer" className="recording-link">
                <FiVideo /> Watch Recording
              </a>
            ) : (
              'Completed'
            )}
          </div>
        )}
      </div>

      {showDetails && createPortal(
        <div className="session-details-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="session-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{session.title}</h3>
              <button className="close-btn" onClick={() => setShowDetails(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-content">
              <div className="detail-item">
                <FiCalendar />
                <div>
                  <strong>Date</strong>
                  <p>{formatDate(session.start_datetime)}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiClock />
                <div>
                  <strong>Time</strong>
                  <p>{formatTime(session.start_datetime)} - {formatTime(session.end_datetime)}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiUser />
                <div>
                  <strong>Coach</strong>
                  <p>{session.coach ? `${session.coach.first_name} ${session.coach.last_name}` : 'TBA'}</p>
                </div>
              </div>
              {session.description && (
                <div className="detail-item">
                  <FiInfo />
                  <div>
                    <strong>Description</strong>
                    <p>{session.description}</p>
                  </div>
                </div>
              )}
              {isOnline ? (
                <>
                  {!isPastSession ? (
                    <>
                      <div className="detail-item">
                        <FiLink />
                        <div>
                          <strong>Zoom Link</strong>
                          <p><a href={session.zoom_link} target="_blank" rel="noopener noreferrer">{session.zoom_link}</a></p>
                        </div>
                      </div>
                      {session.meeting_id && (
                        <div className="detail-item">
                          <FiKey />
                          <div>
                            <strong>Meeting ID</strong>
                            <p>{session.meeting_id}</p>
                          </div>
                        </div>
                      )}
                      {session.meeting_password && (
                        <div className="detail-item">
                          <FiKey />
                          <div>
                            <strong>Meeting Password</strong>
                            <p>{session.meeting_password}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : session.recording_link && (
                    <div className="detail-item">
                      <FiVideo />
                      <div>
                        <strong>Recording</strong>
                        <p><a href={session.recording_link} target="_blank" rel="noopener noreferrer">Watch Recording</a></p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="detail-item">
                  <FiMap />
                  <div>
                    <strong>Location</strong>
                    <p>{session.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const getTimeUntilStart = (startTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const diffMs = start - now;
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default SessionCard;

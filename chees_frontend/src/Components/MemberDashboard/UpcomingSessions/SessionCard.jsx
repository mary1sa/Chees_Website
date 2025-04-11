import React from 'react';
import { FiClock, FiUser, FiCalendar, FiMap, FiVideo } from 'react-icons/fi';
import './Sessions.css';

const SessionCard = ({ session, onJoin }) => {
  const isUpcoming = new Date(session.start_time) > new Date();
  const canJoin = isUpcoming && new Date(session.start_time) <= new Date(Date.now() + 15 * 60 * 1000); // Can join 15 minutes before
  
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
        {session.is_online ? (
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
          <span>{formatDate(session.start_time)}</span>
        </div>
        <div className="session-detail">
          <FiClock className="session-icon" />
          <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
        </div>
        <div className="session-detail">
          <FiUser className="session-icon" />
          <span>Coach: {session.coach?.name || 'TBA'}</span>
        </div>
        {!session.is_online && (
          <div className="session-detail">
            <FiMap className="session-icon" />
            <span>Location: {session.location}</span>
          </div>
        )}
      </div>
      
      <div className="session-footer">
        {canJoin && session.is_online && (
          <button 
            className="join-session-btn" 
            onClick={() => onJoin(session)}
          >
            Join Now
          </button>
        )}
        {isUpcoming && !canJoin && (
          <div className="session-countdown">
            Starts in: {getTimeUntilStart(session.start_time)}
          </div>
        )}
        {!isUpcoming && (
          <div className="session-completed">
            Completed
          </div>
        )}
      </div>
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

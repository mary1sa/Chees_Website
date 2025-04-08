import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import EventRegistrationStatus from './EventRegistrationStatus';
import TournamentRoundsManager from './TournamentRoundsManager';
import { FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import PageLoading from '../../PageLoading/PageLoading';
import '../../AdminDashboard/CreateUser.css';

const ViewEvent = ({ eventId, onClose }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRounds, setShowRounds] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/events/${eventId}`);
        setEvent(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) return <PageLoading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!event) return <div className="error-message">Event not found.</div>;

  return (
    <div className="event-detail-container">
      <div className="event-header">
        <h1 className="event-title">{event.title}</h1>
        <button onClick={onClose} className="close-btn">
          <FiX />
        </button>
      </div>

      <div className="event-content">
        {event.image && (
          <div className="event-image-container">
            <img
              src={
                event.image.startsWith('http')
                  ? event.image
                  : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/storage/${event.image}`
              }
              alt={event.title}
              className="event-image"
            />
          </div>
        )}

        <div className="event-detail-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{event.type?.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{event.description}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Dates:</span>
              <span className="detail-value">
                {new Date(event.start_date).toLocaleDateString()} to {new Date(event.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Times:</span>
              <span className="detail-value">
                {event.start_time || 'N/A'} to {event.end_time || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="event-detail-section">
          <h2 className="section-title">Location</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Venue:</span>
              <span className="detail-value">{event.venue}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{event.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">City/Region:</span>
              <span className="detail-value">{event.city}, {event.region}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Country:</span>
              <span className="detail-value">{event.country} {event.postal_code}</span>
            </div>
            {event.latitude && event.longitude && (
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">{event.latitude}, {event.longitude}</span>
              </div>
            )}
          </div>
        </div>

        <div className="event-detail-section">
          <h2 className="section-title">Event Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Max Participants:</span>
              <span className="detail-value">{event.max_participants || 'Unlimited'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Registration Fee:</span>
              <span className="detail-value">${event.registration_fee || 'Free'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Registration Deadline:</span>
              <span className="detail-value">
                {event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString() : 'None'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Prize Pool:</span>
              <span className="detail-value">${event.prize_pool || '0'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                <span className={`status-badge ${event.is_active ? 'active' : 'inactive'}`}>
                  {event.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={`status-badge ${event.is_featured ? 'featured' : 'regular'}`}>
                  {event.is_featured ? 'Featured' : 'Regular'}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="event-detail-section">
          <h2 className="section-title">Registration Status</h2>
          <EventRegistrationStatus eventId={eventId} />
        </div>

        <div className="event-detail-section">
          <button 
            onClick={() => setShowRounds(!showRounds)} 
            className="toggle-rounds-btn"
          >
            {showRounds ? (
              <>
                <FiChevronUp className="icon" /> Hide Tournament Rounds
              </>
            ) : (
              <>
                <FiChevronDown className="icon" /> Show Tournament Rounds
              </>
            )}
          </button>
          {showRounds && (
            <div className="rounds-container">
              <TournamentRoundsManager eventId={eventId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;
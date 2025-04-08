import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import PageLoading from '../../PageLoading/PageLoading';
import '../../AdminDashboard/CreateUser.css';

const EventRegistrationStatus = ({ eventId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/events/${eventId}/registration-status`);
        setStatus(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching registration status:", err);
        setError("Failed to load registration status");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationStatus();
  }, [eventId]);

  if (loading) return <PageLoading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!status) return <div className="no-results">No registration data available</div>;

  return (
    <div className="status-container">
      <h3 className="section-title">Registration Status</h3>
      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">Registration Status:</span>
          <span className={`status-value ${status.is_registration_open ? 'status-open' : 'status-closed'}`}>
            {status.is_registration_open ? 'Open' : 'Closed'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Registration Deadline:</span>
          <span className="status-value">{new Date(status.registration_deadline).toLocaleString()}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Current Time:</span>
          <span className="status-value">{new Date(status.current_time).toLocaleString()}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Available Slots:</span>
          <span className="status-value">{status.available_slots}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Max Participants:</span>
          <span className="status-value">{status.max_participants}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Registered Participants:</span>
          <span className="status-value">{status.registered_participants}</span>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationStatus;
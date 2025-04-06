import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';

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

  if (loading) return <div>Loading registration status...</div>;
  if (error) return <div>{error}</div>;
  if (!status) return <div>No registration data available</div>;

  return (
    <div>
      <h3>Registration Status</h3>
      <div>
        <p><strong>Registration Status:</strong> {status.is_registration_open ? 'Open' : 'Closed'}</p>
        <p><strong>Registration Deadline:</strong> {new Date(status.registration_deadline).toLocaleString()}</p>
        <p><strong>Current Time:</strong> {new Date(status.current_time).toLocaleString()}</p>
        <p><strong>Available Slots:</strong> {status.available_slots}</p>
        <p><strong>Max Participants:</strong> {status.max_participants}</p>
        <p><strong>Registered Participants:</strong> {status.registered_participants}</p>
      </div>
    </div>
  );
};

export default EventRegistrationStatus;
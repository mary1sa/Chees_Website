import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../../../config/axiosInstance';

const EventRegistration = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch events and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsRes, usersRes] = await Promise.all([
          axiosInstance.get('/events'),
          axiosInstance.get('/users')
        ]);

        // Handle different response structures
        setEvents(eventsRes.data.data || eventsRes.data || []);
        setUsers(usersRes.data.data || usersRes.data || []);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Fetch error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setError(null);
    setSuccess(null);
  };

  const handleRegister = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(`/events/${selectedEvent.id}/register`, {
        user_id: selectedUserId
      });

      setSuccess('Registration successful!');
      setError(null);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err.response?.data || err.message);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Event Registration</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {loading && <div>Loading...</div>}

      {!selectedEvent ? (
        <div>
          <h2>Available Events</h2>
          {events.length > 0 ? (
            <ul>
              {events.map(event => (
                <li key={event.id} style={{ marginBottom: '10px' }}>
                  <button onClick={() => handleEventSelect(event)}>
                    {event.title}
                  </button>
                  <div>Date: {new Date(event.start_date).toLocaleDateString()}</div>
                  <div>Fee: ${event.registration_fee || 'Free'}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No events available</p>
          )}
        </div>
      ) : (
        <div>
          <h2>Register for: {selectedEvent.title}</h2>
          <div>
            <h3>Event Details</h3>
            <p>Date: {new Date(selectedEvent.start_date).toLocaleDateString()}</p>
            <p>Fee: ${selectedEvent.registration_fee || 'Free'}</p>
            {selectedEvent.registration_deadline && (
              <p>Deadline: {new Date(selectedEvent.registration_deadline).toLocaleDateString()}</p>
            )}
          </div>

          <div>
            <h3>Registration Form</h3>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ marginBottom: '10px', display: 'block' }}
            >
              <option value="">Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name || user.name} {user.last_name} ({user.email})
                </option>
              ))}
            </select>

            <button
              onClick={handleRegister}
              disabled={!selectedUserId}
              style={{ marginRight: '10px' }}
            >
              Register
            </button>
            <button onClick={() => setSelectedEvent(null)}>
              Back to Events
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistration;
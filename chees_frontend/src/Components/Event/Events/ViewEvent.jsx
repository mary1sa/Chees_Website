import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import EventRegistrationStatus from './EventRegistrationStatus';
import EventRounds from './EventRounds';
import TournamentRoundsManager from './TournamentRoundsManager';

const ViewEvent = ({ eventId, onClose }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading event details...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>Event not found.</div>;

  return (
    <div>
      <h2>Event Details</h2>
      <button onClick={onClose}>Close</button>
      
      <div>
        {event.image && (
          <div style={{ marginBottom: '20px' }}>
            <img
              src={
                event.image.startsWith('http')
                  ? event.image
                  : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/storage/${event.image}`
              }
              alt={event.title}
              style={{
                width: "300px",
                height: "auto",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}
            />
          </div>
        )}
        
        <h3>{event.title}</h3>
        <p><strong>Type:</strong> {event.type?.name || 'N/A'}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <p><strong>Dates:</strong> {new Date(event.start_date).toLocaleDateString()} to {new Date(event.end_date).toLocaleDateString()}</p>
        <p><strong>Times:</strong> {event.start_time || 'N/A'} to {event.end_time || 'N/A'}</p>
        
        <h4>Location</h4>
        <p>{event.venue}</p>
        <p>{event.address}</p>
        <p>{event.city}, {event.region}, {event.country} {event.postal_code}</p>
        <p>Coordinates: {event.latitude}, {event.longitude}</p>
        
        <h4>Event Details</h4>
        <p><strong>Max Participants:</strong> {event.max_participants || 'Unlimited'}</p>
        <p><strong>Registration Fee:</strong> ${event.registration_fee || 'Free'}</p>
        <p><strong>Registration Deadline:</strong> {event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString() : 'None'}</p>
        <p><strong>Prize Pool:</strong> ${event.prize_pool || '0'}</p>
        <p><strong>Status:</strong> {event.is_active ? 'Active' : 'Inactive'} | {event.is_featured ? 'Featured' : 'Regular'}</p>
        <hr></hr>
        <div style={{ marginBottom: '30px' }}>
        <EventRegistrationStatus eventId={eventId} />
      </div>
      <hr />
      <div>
        <TournamentRoundsManager eventId={eventId} />
      </div>
      </div>
    </div>
  );
};

export default ViewEvent;
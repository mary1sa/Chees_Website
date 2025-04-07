import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import ViewEvent from './ViewEvent';
import EditEvent from './EditEvent';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewingEvent, setViewingEvent] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/events');
            setEvents(response.data.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("Failed to load events. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        
        try {
            await axiosInstance.delete(`/events/${eventId}`);
            fetchEvents(); // Refresh the list
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event.");
        }
    };

    const handleEditSuccess = () => {
        setEditingEvent(null);
        fetchEvents(); // Refresh the list
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        fetchEvents(); // Refresh the list
    };

    if (loading) return <div>Loading events...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Event List</h1>
            
            <button onClick={() => setShowCreateForm(true)}>Create New Event</button>
            
            {showCreateForm && (
                <EditEvent 
                    onSave={handleCreateSuccess}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}
            
            {viewingEvent && (
                <ViewEvent 
                    eventId={viewingEvent} 
                    onClose={() => setViewingEvent(null)}
                />
            )}
            
            {editingEvent && (
                <EditEvent 
                    eventId={editingEvent}
                    onSave={handleEditSuccess}
                    onCancel={() => setEditingEvent(null)}
                />
            )}
            
            {events.length === 0 ? (
                <p>No events found.</p>
            ) : (
                events.map((event) => (
                    <div key={event.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                        <h2>{event.title}</h2>
                        <p>Description: {event.description}</p>
                        <p>Date: {new Date(event.start_date).toLocaleDateString()} to {new Date(event.end_date).toLocaleDateString()}</p>
                        <p>Location: {event.venue}, {event.city}, {event.region}, {event.country}</p>
                        <p>Type: {event.type?.name || 'N/A'}</p>
                        
                        <div>
                            <button onClick={() => setViewingEvent(event.id)}>View</button>
                            <button onClick={() => setEditingEvent(event.id)}>Edit</button>
                            <button onClick={() => handleDelete(event.id)}>Delete</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default EventList;
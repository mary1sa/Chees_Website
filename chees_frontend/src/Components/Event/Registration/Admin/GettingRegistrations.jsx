import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

const GettingRegistrations = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'event', 'user'
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const params = useParams();

  // Check URL params for initial tab
  useEffect(() => {
    if (params.eventId) {
      setActiveTab('event');
      setSelectedEvent(params.eventId);
    } else if (params.userId) {
      setActiveTab('user');
      setSelectedUser(params.userId);
    }
  }, [params]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [eventsRes, usersRes] = await Promise.all([
          axiosInstance.get('/events'),
          axiosInstance.get('/users')
        ]);
        setEvents(eventsRes.data.data || eventsRes.data || []);
        setUsers(usersRes.data.data || usersRes.data || []);
      } catch (err) {
        handleApiError(err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch registrations based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        
        if (activeTab === 'event' && selectedEvent) {
          response = await axiosInstance.get(`/events/${selectedEvent}/registrations`);
          setRegistrations(response.data.registrations || []);
        } 
        else if (activeTab === 'user' && selectedUser) {
          response = await axiosInstance.get(`/users/${selectedUser}/registrations`);
          setRegistrations(response.data.data.data || response.data.data || []);
        } 
        else {
          response = await axiosInstance.get('/registrations');
          setRegistrations(response.data.data.data || []);
          setPagination({
            current_page: response.data.data.current_page,
            total: response.data.data.total,
            per_page: response.data.data.per_page
          });
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedEvent, selectedUser]);

  // Handle API errors
  const handleApiError = (err) => {
    console.error('API Error:', err);
    if (err.response?.status === 401) {
      navigate('/login');
    } else {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedEvent(null);
    setSelectedUser(null);
  };

  if (loading) return <div>Loading registrations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin Registration Management</h1>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => handleTabChange('all')}
          style={{ fontWeight: activeTab === 'all' ? 'bold' : 'normal' }}
        >
          All Registrations
        </button>
        <button 
          onClick={() => handleTabChange('event')}
          style={{ fontWeight: activeTab === 'event' ? 'bold' : 'normal' }}
        >
          Event Registrations
        </button>
        <button 
          onClick={() => handleTabChange('user')}
          style={{ fontWeight: activeTab === 'user' ? 'bold' : 'normal' }}
        >
          User Registrations
        </button>
      </div>

      {/* Event Selection (for event registrations tab) */}
      {activeTab === 'event' && (
        <div style={{ marginBottom: '20px' }}>
          <label>Select Event: </label>
          <select
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Select an event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} (ID: {event.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* User Selection (for user registrations tab) */}
      {activeTab === 'user' && (
        <div style={{ marginBottom: '20px' }}>
          <label>Select User: </label>
          <select
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} (ID: {user.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Results Count */}
      <h2>
        {activeTab === 'all' && `All Registrations (${pagination.total || registrations.length})`}
        {activeTab === 'event' && selectedEvent && `Event Registrations (${registrations.length})`}
        {activeTab === 'user' && selectedUser && `User Registrations (${registrations.length})`}
      </h2>

      {/* Registrations Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            {activeTab !== 'event' && <th>Event</th>}
            {activeTab !== 'user' && <th>User</th>}
            <th>Status</th>
            <th>Payment</th>
            <th>Reg Number</th>
            <th>Reg Date</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map(reg => (
            <tr key={reg.id}>
              <td>{reg.id}</td>
              {activeTab !== 'event' && <td>{reg.event?.title || 'N/A'}</td>}
              {activeTab !== 'user' && (
                <td>
                  {reg.user?.name || `${reg.user?.first_name || ''} ${reg.user?.last_name || ''}`.trim() || 'N/A'}
                </td>
              )}
              <td>{reg.status}</td>
              <td>{reg.payment_status}</td>
              <td>{reg.registration_number}</td>
              <td>{new Date(reg.registration_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GettingRegistrations;
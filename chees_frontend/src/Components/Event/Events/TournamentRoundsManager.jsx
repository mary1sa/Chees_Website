import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import TournamentMatchesManager from './TournamentMatchesManager';

const TournamentRoundsManager = ({eventId}) => {
  // const { eventId } = useParams();
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);
  const [formData, setFormData] = useState({
    round_number: '',
    start_datetime: '',
    end_datetime: '',
    status: 'scheduled'
  });
  const [selectedRound, setSelectedRound] = useState(null);


  // Fetch rounds for the event
  const fetchRounds = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/events/${eventId}/rounds`);
      setRounds(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch rounds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, [eventId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new round
  const handleCreate = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/events/${eventId}/rounds`, formData);
      setShowCreateModal(false);
      setFormData({
        round_number: '',
        start_datetime: '',
        end_datetime: '',
        status: 'scheduled'
      });
      await fetchRounds();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create round');
    } finally {
      setLoading(false);
    }
  };

  // Edit round
  const handleEdit = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/rounds/${currentRound.id}`, formData);
      setShowEditModal(false);
      await fetchRounds();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update round');
    } finally {
      setLoading(false);
    }
  };

  // Delete round
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this round?')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/rounds/${id}`);
        await fetchRounds();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete round');
      } finally {
        setLoading(false);
      }
    }
  };

  // Start round
  const handleStartRound = async (round) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/rounds/${round.id}/start`);
      await fetchRounds();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start round');
    } finally {
      setLoading(false);
    }
  };

  // Complete round
  const handleCompleteRound = async (round) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/rounds/${round.id}/complete`);
      await fetchRounds();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete round');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (round) => {
    setCurrentRound(round);
    setFormData({
      round_number: round.round_number,
      start_datetime: round.start_datetime,
      end_datetime: round.end_datetime,
      status: round.status
    });
    setShowEditModal(true);
  };

  if (loading) return <div>Loading rounds...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Tournament Rounds</h1>
        <button onClick={() => setShowCreateModal(true)}>Create New Round</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Round #</th>
            <th>Start Date/Time</th>
            <th>End Date/Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {rounds.map(round => (
  <tr key={round.id}>
    <td>{round.round_number}</td>
    <td>{new Date(round.start_datetime).toLocaleString()}</td>
    <td>{new Date(round.end_datetime).toLocaleString()}</td>
    <td>{round.status}</td>
    <td>
      <button onClick={() => openEditModal(round)}>Edit</button>
      <button onClick={() => handleDelete(round.id)}>Delete</button>
      {round.status === 'scheduled' && (
        <button onClick={() => handleStartRound(round)}>Start Round</button>
      )}
      {round.status === 'in-progress' && (
        <button onClick={() => handleCompleteRound(round)}>Complete Round</button>
      )}
      {/* Add this button to view matches */}
      <button onClick={() => setSelectedRound(round.id)}>View Matches</button>
    </td>
  </tr>
))}
        </tbody>
      </table>

      {/* Create Round Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            width: '400px'
          }}>
            <h2>Create New Round</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Round Number:</label>
              <input
                type="number"
                name="round_number"
                value={formData.round_number}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Start Date/Time:</label>
              <input
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>End Date/Time:</label>
              <input
                type="datetime-local"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Round Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            width: '400px'
          }}>
            <h2>Edit Round #{currentRound?.round_number}</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Round Number:</label>
              <input
                type="number"
                name="round_number"
                value={formData.round_number}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Start Date/Time:</label>
              <input
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>End Date/Time:</label>
              <input
                type="datetime-local"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
      {selectedRound && (
  <TournamentMatchesManager
    roundId={selectedRound} 
    onClose={() => setSelectedRound(null)}
  />
)}
    </div>
  );
};

export default TournamentRoundsManager;
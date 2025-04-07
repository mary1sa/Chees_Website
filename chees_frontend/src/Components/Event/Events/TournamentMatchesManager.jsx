import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { useParams } from 'react-router-dom';

const TournamentMatchesManager = ({ roundId, onClose }) => {
    const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    white_player_id: '',
    black_player_id: '',
    start_datetime: '',
    end_datetime: '',
    table_number: '',
    status: 'scheduled'
  });
  const [resultData, setResultData] = useState({
    result: '',
    pgn: ''
  });

  // Fetch matches for the round
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/rounds/${roundId}/matches`);
      setMatches(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch registered players for the event
  const fetchPlayers = async () => {
    try {
      // Assuming we can get the event ID from the round or another source
      const roundResponse = await axiosInstance.get(`/rounds/${roundId}`);
      const eventId = roundResponse.data.event_id;
      
      const response = await axiosInstance.get(`/events/${eventId}/registrations?status=confirmed`);
      setPlayers(response.data.map(reg => reg.user));
    } catch (err) {
      console.error('Failed to fetch players', err);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, [roundId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle result input changes
  const handleResultChange = (e) => {
    const { name, value } = e.target;
    setResultData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new match
  const handleCreate = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/rounds/${roundId}/matches`, formData);
      setShowCreateModal(false);
      setFormData({
        white_player_id: '',
        black_player_id: '',
        start_datetime: '',
        end_datetime: '',
        table_number: '',
        status: 'scheduled'
      });
      await fetchMatches();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  // Edit match
  const handleEdit = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/matches/${currentMatch.id}`, formData);
      setShowEditModal(false);
      await fetchMatches();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update match');
    } finally {
      setLoading(false);
    }
  };

  // Delete match
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/matches/${id}`);
        await fetchMatches();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete match');
      } finally {
        setLoading(false);
      }
    }
  };

  // Start match
  const handleStartMatch = async (match) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/matches/${match.id}/start`);
      await fetchMatches();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start match');
    } finally {
      setLoading(false);
    }
  };

  // Record result
  const handleRecordResult = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(`/matches/${currentMatch.id}/record-result`, resultData);
      setShowResultModal(false);
      setResultData({
        result: '',
        pgn: ''
      });
      await fetchMatches();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record result');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (match) => {
    setCurrentMatch(match);
    setFormData({
      white_player_id: match.white_player_id,
      black_player_id: match.black_player_id,
      start_datetime: match.start_datetime,
      end_datetime: match.end_datetime || '',
      table_number: match.table_number || '',
      status: match.status
    });
    setShowEditModal(true);
  };

  // Open result modal
  const openResultModal = (match) => {
    setCurrentMatch(match);
    setShowResultModal(true);
  };

  if (loading) return <div>Loading matches...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Tournament Matches</h1>
        <button onClick={() => setShowCreateModal(true)}>Create New Match</button>
                  <button onClick={onClose} style={{ marginLeft: '10px' }}>Close</button>

      </div>

      <table>
        <thead>
          <tr>
            <th>White Player</th>
            <th>Black Player</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Table</th>
            <th>Status</th>
            <th>Result</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => (
            <tr key={match.id}>
              <td>{match.white_player?.name || 'Unknown'}</td>
              <td>{match.black_player?.name || 'Unknown'}</td>
              <td>{match.start_datetime ? new Date(match.start_datetime).toLocaleString() : '-'}</td>
              <td>{match.end_datetime ? new Date(match.end_datetime).toLocaleString() : '-'}</td>
              <td>{match.table_number || '-'}</td>
              <td>{match.status}</td>
              <td>{match.result || '-'}</td>
              <td>
                <button onClick={() => openEditModal(match)}>Edit</button>
                <button onClick={() => handleDelete(match.id)}>Delete</button>
                {match.status === 'scheduled' && (
                  <button onClick={() => handleStartMatch(match)}>Start Match</button>
                )}
                {match.status === 'in-progress' && (
                  <button onClick={() => openResultModal(match)}>Record Result</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Match Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Match</h2>
            
            <div className="form-group">
              <label>White Player:</label>
              <select
                name="white_player_id"
                value={formData.white_player_id}
                onChange={handleInputChange}
              >
                <option value="">Select Player</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Black Player:</label>
              <select
                name="black_player_id"
                value={formData.black_player_id}
                onChange={handleInputChange}
              >
                <option value="">Select Player</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Start Date/Time:</label>
              <input
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Table Number:</label>
              <input
                type="number"
                name="table_number"
                value={formData.table_number}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={handleCreate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Match Modal */}
      {showEditModal && currentMatch && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Match #{currentMatch.id}</h2>
            
            <div className="form-group">
              <label>White Player:</label>
              <select
                name="white_player_id"
                value={formData.white_player_id}
                onChange={handleInputChange}
              >
                <option value="">Select Player</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Black Player:</label>
              <select
                name="black_player_id"
                value={formData.black_player_id}
                onChange={handleInputChange}
              >
                <option value="">Select Player</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Start Date/Time:</label>
              <input
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>End Date/Time:</label>
              <input
                type="datetime-local"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Table Number:</label>
              <input
                type="number"
                name="table_number"
                value={formData.table_number}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Result Modal */}
      {showResultModal && currentMatch && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Record Result for Match #{currentMatch.id}</h2>
            <h3>{currentMatch.white_player?.name || 'Unknown'} vs {currentMatch.black_player?.name || 'Unknown'}</h3>
            
            <div className="form-group">
              <label>Result:</label>
              <select
                name="result"
                value={resultData.result}
                onChange={handleResultChange}
              >
                <option value="">Select Result</option>
                <option value="1-0">1-0 (White wins)</option>
                <option value="0-1">0-1 (Black wins)</option>
                <option value="1/2-1/2">½-½ (Draw)</option>
                <option value="*">* (No result)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>PGN:</label>
              <textarea
                name="pgn"
                value={resultData.pgn}
                onChange={handleResultChange}
                rows="5"
                placeholder="Paste PGN notation here..."
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowResultModal(false)}>Cancel</button>
              <button onClick={handleRecordResult}>Save Result</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        button {
          margin-right: 5px;
          padding: 5px 10px;
          cursor: pointer;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          width: 500px;
          max-width: 90%;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default TournamentMatchesManager;
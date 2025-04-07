import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
// import './TournamentMatchesManager.css'; // Create this CSS file for styling

const TournamentMatchesManager = ({ roundId, eventId }) => {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [showResultForm, setShowResultForm] = useState(false);
  const [result, setResult] = useState('');
  const [pgn, setPgn] = useState('');

  const [formData, setFormData] = useState({
    white_player_id: '',
    black_player_id: '',
    start_datetime: new Date().toISOString().slice(0, 16),
    table_number: '',
    status: 'scheduled'
  });

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/rounds/${roundId}/matches`);
      setMatches(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setError('Failed to load matches. Please try again later.');
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}/confirmed-players`);
      setPlayers(response.data);
    } catch (err) {
      console.error('Failed to fetch players:', err);
      setError('Failed to load player list. Please try again later.');
    }
  };

  useEffect(() => {
    if (roundId) {
      fetchMatches();
      fetchPlayers();
    }
  }, [roundId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openForm = (match = null) => {
    if (match) {
      setCurrentMatch(match);
      setFormData({
        white_player_id: match.white_player_id,
        black_player_id: match.black_player_id,
        start_datetime: match.start_datetime,
        table_number: match.table_number,
        status: match.status
      });
    } else {
      setCurrentMatch(null);
      setFormData({
        white_player_id: '',
        black_player_id: '',
        start_datetime: new Date().toISOString().slice(0, 16),
        table_number: '',
        status: 'scheduled'
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setCurrentMatch(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMatch) {
        await axiosInstance.put(`/matches/${currentMatch.id}`, formData);
      } else {
        await axiosInstance.post(`/rounds/${roundId}/matches`, formData);
      }
      fetchMatches();
      closeForm();
    } catch (err) {
      console.error('Failed to save match:', err);
      setError('Failed to save match. Please try again.');
    }
  };

  const handleDelete = async (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await axiosInstance.delete(`/matches/${matchId}`);
        fetchMatches();
      } catch (err) {
        console.error('Failed to delete match:', err);
        setError('Failed to delete match. Please try again.');
      }
    }
  };

  const handleStartMatch = async (matchId) => {
    try {
      await axiosInstance.post(`/matches/${matchId}/start`);
      fetchMatches();
    } catch (err) {
      console.error('Failed to start match:', err);
      setError('Failed to start match. Please try again.');
    }
  };

  const openResultForm = (match) => {
    setCurrentMatch(match);
    setResult(match.result || '');
    setPgn(match.pgn || '');
    setShowResultForm(true);
  };

  const closeResultForm = () => {
    setShowResultForm(false);
    setCurrentMatch(null);
    setResult('');
    setPgn('');
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/matches/${currentMatch.id}/result`, {
        result,
        pgn
      });
      fetchMatches();
      closeResultForm();
    } catch (err) {
      console.error('Failed to record result:', err);
      setError('Failed to record result. Please try again.');
    }
  };

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : 'Unknown';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading matches...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="matches-manager">
      <div className="header">
        <h2>Matches Management</h2>
        <button className="btn add-btn" onClick={() => openForm()}>
          Add New Match
        </button>
      </div>

      <table className="matches-table">
        <thead>
          <tr>
            <th>White Player</th>
            <th>Black Player</th>
            <th>Start Time</th>
            <th>Table</th>
            <th>Status</th>
            <th>Result</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.id}>
              <td>{getPlayerName(match.white_player_id)}</td>
              <td>{getPlayerName(match.black_player_id)}</td>
              <td>{new Date(match.start_datetime).toLocaleString()}</td>
              <td>{match.table_number || '-'}</td>
              <td className={getStatusClass(match.status)}>{match.status}</td>
              <td>{match.result || '-'}</td>
              <td className="actions">
                <button className="btn edit-btn" onClick={() => openForm(match)}>
                  Edit
                </button>
                <button className="btn delete-btn" onClick={() => handleDelete(match.id)}>
                  Delete
                </button>
                {match.status === 'scheduled' && (
                  <button className="btn start-btn" onClick={() => handleStartMatch(match.id)}>
                    Start
                  </button>
                )}
                {match.status === 'in-progress' && (
                  <button className="btn result-btn" onClick={() => openResultForm(match)}>
                    Record Result
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add/Edit Match Form */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentMatch ? 'Edit Match' : 'Add New Match'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>White Player:</label>
                <select
                  name="white_player_id"
                  value={formData.white_player_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select White Player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Black Player:</label>
                <select
                  name="black_player_id"
                  value={formData.black_player_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Black Player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date & Time:</label>
                <input
                  type="datetime-local"
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleInputChange}
                  required
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
              <div className="form-buttons">
                <button type="button" className="btn cancel-btn" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn submit-btn">
                  {currentMatch ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Result Form */}
      {showResultForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Record Match Result</h3>
            <p>
              {getPlayerName(currentMatch?.white_player_id)} vs {getPlayerName(currentMatch?.black_player_id)}
            </p>
            <form onSubmit={handleSubmitResult}>
              <div className="form-group">
                <label>Result:</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  required
                >
                  <option value="">Select Result</option>
                  <option value="1-0">1-0 (White wins)</option>
                  <option value="0-1">0-1 (Black wins)</option>
                  <option value="1/2-1/2">½-½ (Draw)</option>
                  <option value="*">* (No result)</option>
                </select>
              </div>
              <div className="form-group">
                <label>PGN (Optional):</label>
                <textarea
                  value={pgn}
                  onChange={(e) => setPgn(e.target.value)}
                  rows="4"
                />
              </div>
              <div className="form-buttons">
                <button type="button" className="btn cancel-btn" onClick={closeResultForm}>
                  Cancel
                </button>
                <button type="submit" className="btn submit-btn">
                  Submit Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentMatchesManager;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { FiEdit, FiTrash2, FiPlay, FiFlag, FiChevronLeft, FiChevronRight, FiSearch, FiX, FiPlus } from 'react-icons/fi';
import ConfirmDelete from '../../Confirm/ConfirmDelete';
import PageLoading from '../../PageLoading/PageLoading';
import '../../AdminDashboard/CreateUser.css';

const TournamentMatchesManager = ({ roundId, eventId, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchToDelete, setMatchToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    white_player_id: '',
    black_player_id: '',
    start_datetime: new Date().toISOString().slice(0, 16),
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
      setFilteredMatches(response.data);
      setError(null);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch players for the event
  const fetchPlayers = async () => {
    try {
      const response = await axiosInstance.get(`/events/${eventId}/confirmed-players`);
      setPlayers(response.data);
    } catch (err) {
      handleApiError(err);
    }
  };

  // Filter matches based on search term
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = matches.filter(match => {
        const whitePlayer = getPlayerName(match.white_player_id).toLowerCase();
        const blackPlayer = getPlayerName(match.black_player_id).toLowerCase();
        return (
          whitePlayer.includes(term) ||
          blackPlayer.includes(term) ||
          (match.table_number && match.table_number.toString().includes(term)) ||
          (match.status && match.status.toLowerCase().includes(term)) ||
          (match.result && match.result.toLowerCase().includes(term))
        );
      });
      setFilteredMatches(filtered);
    } else {
      setFilteredMatches(matches);
    }
    setCurrentPage(1);
  }, [searchTerm, matches]);

  useEffect(() => {
    if (roundId) {
      fetchMatches();
      fetchPlayers();
    }
  }, [roundId]);

  // Handle API errors
  const handleApiError = (err) => {
    console.error('API Error:', err);
    setError(err.response?.data?.error || 'An error occurred');
  };

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
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post(`/rounds/${roundId}/matches`, formData);
      setShowCreateModal(false);
      setFormData({
        white_player_id: '',
        black_player_id: '',
        start_datetime: new Date().toISOString().slice(0, 16),
        table_number: '',
        status: 'scheduled'
      });
      await fetchMatches();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Edit match
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.put(`/matches/${currentMatch.id}`, formData);
      setShowEditModal(false);
      await fetchMatches();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete match
  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/matches/${matchToDelete.id}`);
      await fetchMatches();
    } catch (err) {
      handleApiError(err);
    } finally {
      setShowDeleteModal(false);
      setMatchToDelete(null);
    }
  };

  // Start match
  const handleStartMatch = async (matchId) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/matches/${matchId}/start`);
      await fetchMatches();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit result
  const handleSubmitResult = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post(`/matches/${currentMatch.id}/result`, resultData);
      setShowResultModal(false);
      await fetchMatches();
    } catch (err) {
      handleApiError(err);
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
      table_number: match.table_number,
      status: match.status
    });
    setShowEditModal(true);
  };

  // Open result modal
  const openResultModal = (match) => {
    setCurrentMatch(match);
    setResultData({
      result: match.result || '',
      pgn: match.pgn || ''
    });
    setShowResultModal(true);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get player name by ID
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : 'Unknown';
  };

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMatches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pages = [];
    const visiblePages = 3;

    if (totalPages > 0) {
      pages.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
        >
          1
        </button>
      );
    }

    if (currentPage > visiblePages + 1) {
      pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          >
            {i.toString().padStart(2, '0')}
          </button>
        );
      }
    }

    if (currentPage < totalPages - visiblePages) {
      pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
        >
          {totalPages.toString().padStart(2, '0')}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-button pagination-nav"
        >
          <FiChevronLeft className="icon" />
          <span>Previous</span>
        </button>
        
        {pages}
        
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="pagination-button pagination-nav"
        >
          <span>Next</span>
          <FiChevronRight className="icon" />
        </button>
      </div>
    );
  };

  if (loading) return <PageLoading />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="table-container">
      <ConfirmDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteMatch}
        itemName={matchToDelete ? `match between ${getPlayerName(matchToDelete.white_player_id)} and ${getPlayerName(matchToDelete.black_player_id)}` : 'this match'}
      />

      <div className="header-with-close">
        <h1 className="table-title">Matches Management</h1>
        <button onClick={onClose} className="close-btn">
          &times;
        </button>
      </div>
      
      <div className="filter-controls">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search matches..."
            className="search-input"
          />
          {searchTerm && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="clear-search-btn"
            >
              <FiX />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="add-new-btn"
        >
          <FiPlus className="icon" />
          Add Match
        </button>
      </div>

      <div className="results-count">
        Showing {filteredMatches.length} matches
      </div>

      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">White Player</div>
          <div className="header-cell">Black Player</div>
          <div className="header-cell">Start Time</div>
          <div className="header-cell">Table</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Result</div>
          <div className="header-cell actions-header">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map(match => (
            <div key={match.id} className="table-row">
              <div className="table-cell">
                {getPlayerName(match.white_player_id)}
              </div>
              <div className="table-cell">
                {getPlayerName(match.black_player_id)}
              </div>
              <div className="table-cell">
                {match.start_datetime ? new Date(match.start_datetime).toLocaleString() : 'N/A'}
              </div>
              <div className="table-cell">
                {match.table_number || '-'}
              </div>
              <div className="table-cell">
                <span className={`status-badge ${match.status?.toLowerCase().replace('-', '')}`}>
                  {match.status}
                </span>
              </div>
              <div className="table-cell">
                {match.result || '-'}
              </div>
              <div className="table-cell actions">
                <button 
                  onClick={() => openEditModal(match)} 
                  className="action-btn update-btn"
                  title="Edit"
                >
                  <FiEdit className="icon" />
                </button>
                <button 
                  onClick={() => {
                    setMatchToDelete(match);
                    setShowDeleteModal(true);
                  }}
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 className="icon" />
                </button>
                {match.status === 'scheduled' && (
                  <button 
                    onClick={() => handleStartMatch(match.id)}
                    className="action-btn start-btn"
                    title="Start Match"
                  >
                    <FiPlay className="icon" />
                  </button>
                )}
                {match.status === 'in-progress' && (
                  <button 
                    onClick={() => openResultModal(match)}
                    className="action-btn result-btn"
                    title="Record Result"
                  >
                    <FiFlag className="icon" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No matches found matching your criteria
          </div>
        )}
      </div>
      
      {filteredMatches.length > itemsPerPage && renderPagination()}

      {/* Create Match Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Match</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">White Player *</label>
                <select
                  name="white_player_id"
                  value={formData.white_player_id}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select White Player</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group form-groupp">
                <label className="form-label">Black Player *</label>
                <select
                  name="black_player_id"
                  value={formData.black_player_id}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select Black Player</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group form-groupp">
                <label className="form-label">Start Date/Time *</label>
                <input
                  type="datetime-local"
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group form-groupp">
                <label className="form-label">Table Number</label>
                <input
                  type="number"
                  name="table_number"
                  value={formData.table_number}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Optional"
                />
              </div>
              
              <div className="form-group form-groupp">
                <label className="form-label">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="modal-footer form-groupp">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span> Creating...
                    </>
                  ) : 'Create Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Match Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h3>Edit Match</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEdit} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">White Player *</label>
                <select
                  name="white_player_id"
                  value={formData.white_player_id}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select White Player</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <div className="form-group form-groupp">
                                      <label className="form-label">Black Player *</label>
                                      <select
                                        name="black_player_id"
                                        value={formData.black_player_id}
                                        onChange={handleInputChange}
                                        required
                                        className="form-select"
                                      >
                                        <option value="">Select Black Player</option>
                                        {players.map(player => (
                                          <option key={player.id} value={player.id}>
                                            {player.first_name} {player.last_name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <div className="form-group form-groupp">
                                      <label className="form-label">Start Date/Time *</label>
                                      <input
                                        type="datetime-local"
                                        name="start_datetime"
                                        value={formData.start_datetime}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                      />
                                    </div>
                                    
                                    <div className="form-group form-groupp">
                                      <label className="form-label">Table Number</label>
                                      <input
                                        type="number"
                                        name="table_number"
                                        value={formData.table_number}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Optional"
                                      />
                                    </div>
                                    
                                    <div className="form-group form-groupp">
                                      <label className="form-label">Status *</label>
                                      <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                        className="form-select"
                                      >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                    
                                    <div className="modal-footer form-groupp">
                                      <button 
                                        type="button" 
                                        onClick={() => setShowEditModal(false)}
                                        className="btn btn-secondary"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                      >
                                        {loading ? (
                                          <>
                                            <span className="loading-spinner"></span> Updating...
                                          </>
                                        ) : 'Save Changes'}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            )}
                      
                            {/* Result Modal */}
                            {showResultModal && (
                              <div className="modal-overlay">
                                <div className="modal result-modal">
                                  <div className="modal-header">
                                    <h3>Record Match Result</h3>
                                    <button 
                                      onClick={() => setShowResultModal(false)} 
                                      className="modal-close-btn"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                  <div className="modal-body">
                                    <div className="match-info">
                                      <h4>
                                        {getPlayerName(currentMatch?.white_player_id)} vs {getPlayerName(currentMatch?.black_player_id)}
                                      </h4>
                                    </div>
                                    <form onSubmit={handleSubmitResult} className="modal-form">
                                      <div className="form-group form-groupp">
                                        <label className="form-label">Result *</label>
                                        <select
                                          name="result"
                                          value={resultData.result}
                                          onChange={handleResultChange}
                                          required
                                          className="form-select"
                                        >
                                          <option value="">Select Result</option>
                                          <option value="1-0">1-0 (White wins)</option>
                                          <option value="0-1">0-1 (Black wins)</option>
                                          <option value="1/2-1/2">½-½ (Draw)</option>
                                          <option value="*">* (No result)</option>
                                        </select>
                                      </div>
                                      
                                      <div className="form-group form-groupp">
                                        <label className="form-label">PGN (Optional)</label>
                                        <textarea
                                          name="pgn"
                                          value={resultData.pgn}
                                          onChange={handleResultChange}
                                          rows="4"
                                          className="form-textarea"
                                          placeholder="Enter PGN notation..."
                                        />
                                      </div>
                                      
                                      <div className="modal-footer form-groupp">
                                        <button 
                                          type="button" 
                                          onClick={() => setShowResultModal(false)}
                                          className="btn btn-secondary"
                                        >
                                          Cancel
                                        </button>
                                        <button 
                                          type="submit" 
                                          className="btn btn-primary"
                                          disabled={loading}
                                        >
                                          {loading ? (
                                            <>
                                              <span className="loading-spinner"></span> Saving...
                                            </>
                                          ) : 'Submit Result'}
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      };
                      
                      export default TournamentMatchesManager;
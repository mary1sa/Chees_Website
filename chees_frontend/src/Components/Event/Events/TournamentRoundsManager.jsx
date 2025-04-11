import React, { useState, useEffect } from 'react'; 
import axiosInstance from '../../config/axiosInstance'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { FiEdit, FiTrash2, FiEye, FiPlay, FiCheck, FiChevronLeft, FiChevronRight, FiSearch, FiX, FiPlus } from 'react-icons/fi'; 
import TournamentMatchesManager from './TournamentMatchesManager'; 
import ConfirmDelete from '../../Confirm/ConfirmDelete'; 
import PageLoading from '../../PageLoading/PageLoading'; 
import '../../AdminDashboard/CreateUser.css'; 
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';

const TournamentRoundsManager = ({ eventId }) => { 
  const navigate = useNavigate(); 
  const [rounds, setRounds] = useState([]); 
  const [filteredRounds, setFilteredRounds] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 10; 
  
  const [showCreateModal, setShowCreateModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [currentRound, setCurrentRound] = useState(null); 
  const [roundToDelete, setRoundToDelete] = useState(null); 
  const [selectedRound, setSelectedRound] = useState(null); 
  
  const [formData, setFormData] = useState({ 
    round_number: '', 
    start_datetime: '', 
    end_datetime: '', 
    status: 'scheduled' 
  });

  // Alert states
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);

  // Fetch rounds for the event 
  const fetchRounds = async () => { 
    try { 
      setLoading(true); 
      const response = await axiosInstance.get(`/events/${eventId}/rounds`); 
      setRounds(response.data); 
      setFilteredRounds(response.data); 
      setError(null); 
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  // Filter rounds based on search term 
  useEffect(() => { 
    if (searchTerm) { 
      const term = searchTerm.toLowerCase(); 
      const filtered = rounds.filter(round => { 
        return ( 
          (round.round_number && round.round_number.toString().includes(term)) || 
          (round.status && round.status.toLowerCase().includes(term)) || 
          (round.start_datetime && new Date(round.start_datetime).toLocaleString().toLowerCase().includes(term)) || 
          (round.end_datetime && new Date(round.end_datetime).toLocaleString().toLowerCase().includes(term) )
        ); 
      }); 
      setFilteredRounds(filtered); 
    } else { 
      setFilteredRounds(rounds); 
    } 
    setCurrentPage(1); 
  }, [searchTerm, rounds]); 

  useEffect(() => { 
    fetchRounds(); 
  }, [eventId]); 

  // Handle API errors 
  const handleApiError = (err) => { 
    console.error('API Error:', err); 
    if (err.response?.status === 401) { 
      navigate('/login'); 
    } else { 
      setError(err.response?.data?.error || 'Failed to fetch rounds'); 
      setErrorAlert({ message: err.response?.data?.error || 'An error occurred' });
    } 
  }; 

  // Handle input changes 
  const handleInputChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    })); 
  }; 

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setErrorAlert(null);
    
    // Validate form
    if (!formData.round_number || isNaN(formData.round_number)) {
      setErrorAlert({ message: 'Please enter a valid round number' });
      return;
    }
    if (!formData.start_datetime) {
      setErrorAlert({ message: 'Please select a start date/time' });
      return;
    }
    if (!formData.end_datetime) {
      setErrorAlert({ message: 'Please select an end date/time' });
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Creating round with data:', formData);
      const response = await axiosInstance.post(`/events/${eventId}/rounds`, formData);
      console.log('Create response:', response);
      
      if (response.status >= 200 && response.status < 300) {
        setSuccessAlert({ message: 'Round created successfully!' });
        setShowCreateModal(false);
        setFormData({
          round_number: '',
          start_datetime: '',
          end_datetime: '',
          status: 'scheduled'
        });
        
        // Small delay to ensure backend is ready
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchRounds();
      } else {
        throw new Error(response.data?.message || 'Failed to create round');
      }
    } catch (err) {
      console.error('Create round error:', err);
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      'Failed to create round. Please try again.';
      setErrorAlert({ message: errorMsg });
      
      // Specific handling for common errors
      if (err.response?.status === 409) {
        setErrorAlert({ message: 'This round number already exists' });
      } else if (err.response?.status === 400) {
        setErrorAlert({ message: 'Invalid date range or round data' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit round 
 // Edit round 
const handleEdit = async (e) => { 
  e.preventDefault(); 
  try { 
    setLoading(true); 
    // Prepare the data with properly formatted dates
    const dataToSend = {
      ...formData,
      start_datetime: parseDateFromInput(formData.start_datetime),
      end_datetime: parseDateFromInput(formData.end_datetime)
    };
    
    await axiosInstance.put(`/rounds/${currentRound.id}`, dataToSend); 
    setShowEditModal(false); 
    setSuccessAlert({ message: 'Round updated successfully!' });
    await fetchRounds(); 
  } catch (err) { 
    handleApiError(err); 
  } finally { 
    setLoading(false); 
  } 
};  

  // Delete round 
  const confirmDeleteRound = async () => { 
    if (!roundToDelete) return; 
    try { 
      setLoading(true); 
      await axiosInstance.delete(`/rounds/${roundToDelete.id}`); 
      setSuccessAlert({ message: 'Round deleted successfully!' });
      await fetchRounds(); 
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setShowDeleteModal(false); 
      setRoundToDelete(null); 
    } 
  }; 

  // Start round 
  const handleStartRound = async (round) => { 
    try { 
      setLoading(true); 
      await axiosInstance.post(`/rounds/${round.id}/start`); 
      setSuccessAlert({ message: 'Round started successfully!' });
      await fetchRounds(); 
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  // Complete round 
  const handleCompleteRound = async (round) => { 
    try { 
      setLoading(true); 
      await axiosInstance.post(`/rounds/${round.id}/complete`); 
      setSuccessAlert({ message: 'Round completed successfully!' });
      await fetchRounds(); 
    } catch (err) { 
      handleApiError(err); 
    } finally { 
      setLoading(false); 
    } 
  }; 
  // Add these helper functions at the top of your component
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseDateFromInput = (inputString) => {
  if (!inputString) return null;
  return new Date(inputString).toISOString();
};

  // Open edit modal 
 // Open edit modal 
const openEditModal = (round) => { 
  setCurrentRound(round); 
  setFormData({ 
    round_number: round.round_number, 
    start_datetime: formatDateForInput(round.start_datetime), 
    end_datetime: formatDateForInput(round.end_datetime), 
    status: round.status 
  }); 
  setShowEditModal(true); 
}; 

  // Clear search 
  const clearSearch = () => { 
    setSearchTerm(''); 
  }; 

  // Pagination functions 
  const indexOfLastItem = currentPage * itemsPerPage; 
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; 
  const currentItems = filteredRounds.slice(indexOfFirstItem, indexOfLastItem); 
  const totalPages = Math.ceil(filteredRounds.length / itemsPerPage); 

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
      {/* Add alerts at the top */}
      {successAlert && (
        <SuccessAlert
          message={successAlert.message}
          onClose={() => setSuccessAlert(null)}
        />
      )}

      {errorAlert && (
        <ErrorAlert
          message={errorAlert.message}
          onClose={() => setErrorAlert(null)}
        />
      )}

      <ConfirmDelete 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={confirmDeleteRound} 
        itemName={roundToDelete ? `round #${roundToDelete.round_number}` : 'this round'} 
      /> 

      <h1 className="table-title">Tournament Rounds Management</h1> 

      <div className="filter-controls"> 
        <div className="search-container"> 
          <FiSearch className="search-icon" /> 
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search rounds..." 
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
          Create Round 
        </button> 
      </div> 

      <div className="results-count"> 
        Showing {filteredRounds.length} rounds 
      </div> 

      <div className="data-table"> 
        <div className="table-header"> 
          <div className="header-cell">Round #</div> 
          <div className="header-cell">Start Date/Time</div> 
          <div className="header-cell">End Date/Time</div> 
          <div className="header-cell">Status</div> 
          <div className="header-cell actions-header">Actions</div> 
        </div> 
                
        {currentItems.length > 0 ? ( 
          currentItems.map(round => ( 
            <div key={round.id} className="table-row"> 
              <div className="table-cell"> 
                <span className="type-id">#{round.round_number}</span> 
              </div> 
              <div className="table-cell"> 
                {round.start_datetime ? new Date(round.start_datetime).toLocaleString() : 'N/A'} 
              </div> 
              <div className="table-cell"> 
                {round.end_datetime ? new Date(round.end_datetime).toLocaleString() : 'N/A'} 
              </div> 
              <div className="table-cell"> 
                <span className={`status-badge ${round.status?.toLowerCase().replace('-', '')}`}> 
                  {round.status} 
                </span> 
              </div> 
              <div className="table-cell actions"> 
                <button  
                  onClick={() => setSelectedRound(round.id)} 
                  className="action-btn view-btn" 
                  title="View Matches" 
                > 
                  <FiEye className="icon" /> 
                </button> 
                <button  
                  onClick={() => openEditModal(round)} 
                  className="action-btn update-btn" 
                  title="Edit" 
                > 
                  <FiEdit className="icon" /> 
                </button> 
                <button  
                  onClick={() => { 
                    setRoundToDelete(round); 
                    setShowDeleteModal(true); 
                  }} 
                  className="action-btn delete-btn" 
                  title="Delete" 
                > 
                  <FiTrash2 className="icon" /> 
                </button> 
                {round.status === 'scheduled' && ( 
                  <button  
                    onClick={() => handleStartRound(round)} 
                    className="action-btn confirm-btn" 
                    title="Start Round" 
                  > 
                    <FiPlay className="icon" /> 
                  </button> 
                )} 
                {round.status === 'in-progress' && ( 
                  <button  
                    onClick={() => handleCompleteRound(round)} 
                    className="action-btn complete-btn" 
                    title="Complete Round" 
                  > 
                    <FiCheck className="icon" /> 
                  </button> 
                )} 
              </div> 
            </div> 
          )) 
        ) : ( 
          <div className="no-results"> 
            No rounds found matching your criteria 
          </div> 
        )} 
      </div> 
            
      {filteredRounds.length > itemsPerPage && renderPagination()} 

      {/* Create Round Modal */} 
      {showCreateModal && ( 
        <div className="modal-overlay"> 
          <div className="modal"> 
            <div className="modal-header"> 
              <h3>Create New Round</h3> 
              <button  
                onClick={() => setShowCreateModal(false)} 
                className="modal-close-btn" 
              > 
                &times; 
              </button> 
            </div> 
            <form onSubmit={handleCreate} className="modal-form"> 
              <div className="form-group form-groupp"> 
                <label className="form-label">Round Number *</label> 
                <input 
                  type="number" 
                  name="round_number" 
                  value={formData.round_number} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
                  placeholder="Enter round number" 
                /> 
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
                <label className="form-label">End Date/Time *</label> 
                <input 
                  type="datetime-local" 
                  name="end_datetime" 
                  value={formData.end_datetime} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input" 
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
                  ) : 'Create Round'} 
                </button> 
              </div> 
            </form> 
          </div> 
        </div> 
      )} 

      {/* Edit Round Modal */} 
   {/* Edit Round Modal */} 
{showEditModal && ( 
  <div className="modal-overlay"> 
    <div className="modal edit-modal"> 
      <div className="modal-header"> 
        <h3>Edit Round #{currentRound?.round_number}</h3> 
        <button  
          onClick={() => setShowEditModal(false)} 
          className="modal-close-btn" 
        > 
          &times; 
        </button> 
      </div> 
      <form onSubmit={handleEdit} className="modal-form"> 
        <div className="form-group form-groupp"> 
          <label className="form-label">Round Number *</label> 
          <input 
            type="number" 
            name="round_number" 
            value={formData.round_number} 
            onChange={handleInputChange} 
            required 
            className="form-input" 
          /> 
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
          <label className="form-label">End Date/Time *</label> 
          <input 
            type="datetime-local" 
            name="end_datetime" 
            value={formData.end_datetime} 
            onChange={handleInputChange} 
            required 
            className="form-input" 
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

      {selectedRound && ( 
        <TournamentMatchesManager 
          roundId={selectedRound} 
          eventId={eventId} 
          onClose={() => setSelectedRound(null)} 
        /> 
      )} 
    </div> 
  ); 
}; 

export default TournamentRoundsManager;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import '../../AdminDashboard/CreateUser.css';
import PageLoading from '../../PageLoading/PageLoading';
import ConfirmDelete from '../../Confirm/ConfirmDelete';

const EventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [filteredEventTypes, setFilteredEventTypes] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventTypeToDelete, setEventTypeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchEventTypes();
  }, []);

  useEffect(() => {
    filterEventTypes();
  }, [eventTypes, nameFilter]);

  const fetchEventTypes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/event-types');
      setEventTypes(response.data);
      setFilteredEventTypes(response.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventTypes = () => {
    let result = eventTypes;
    
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      result = result.filter(type => 
        type.name.toLowerCase().includes(searchTerm) ||
        (type.description && type.description.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredEventTypes(result);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/event-types', formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchEventTypes();
    } catch (error) {
      console.error('Error creating event type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (eventType) => {
    setSelectedEventType(eventType);
    setShowViewModal(true);
  };

  const handleEditClick = (eventType) => {
    setSelectedEventType(eventType);
    setFormData({
      name: eventType.name,
      description: eventType.description || ''
    });
    setShowEditModal(true);
  };

  const confirmDeleteEventType = async () => {
    if (!eventTypeToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/event-types/${eventTypeToDelete.id}`);
      setEventTypes(prev => prev.filter(t => t.id !== eventTypeToDelete.id));
      setFilteredEventTypes(prev => prev.filter(t => t.id !== eventTypeToDelete.id));
    } catch (error) {
      console.error('Error deleting event type:', error);
    } finally {
      setShowDeleteModal(false);
      setEventTypeToDelete(null);
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put(`/event-types/${selectedEventType.id}`, formData);
      setShowEditModal(false);
      fetchEventTypes();
    } catch (error) {
      console.error('Error updating event type:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setNameFilter('');
  };

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEventTypes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEventTypes.length / itemsPerPage);

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

  if (loading) return <PageLoading/>;

  return (
    <div className="table-container">
      <ConfirmDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteEventType}
        itemName={eventTypeToDelete ? eventTypeToDelete.name : 'this event type'}
      />

      <h1 className="table-title">Event Types Management</h1>
      
      <div className="filter-controls">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Search by name or description..."
            className="search-input"
          />
          {nameFilter && (
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
          Add New 
        </button>
      </div>
      
      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">ID</div>
          <div className="header-cell">Name</div>
          {/* <div className="header-cell">Description</div> */}
          <div className="header-cell">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map((type) => (
            <div key={type.id} className="table-row">
              <div className="table-cell">
                <span className="type-id">#{type.id}</span>
              </div>
              <div className="table-cell">{type.name}</div>
              {/* <div className="table-cell">{type.description.substring(0, 5)}..</div> */}
              <div className="table-cell actions">
                <button 
                  onClick={() => handleView(type)} 
                  className="action-btn view-btn"
                  title="View"
                >
                  <FiEye className="icon" />
                </button>
                <button 
                  onClick={() => handleEditClick(type)} 
                  className="action-btn update-btn"
                  title="Edit"
                >
                  <FiEdit className="icon" />
                </button>
                <button 
                  onClick={() => {
                    setEventTypeToDelete(type); 
                    setShowDeleteModal(true); 
                  }}                 
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 className="icon" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No event types found matching your criteria
          </div>
        )}
      </div>
      
      {renderPagination()}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header ">
              <h3>Create New Event Type</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength="100"
                  className="form-input"
                  placeholder="Enter event type name"
                />
              </div>
              <div className="form-group form-groupp">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className="form-textarea"
                  placeholder="Enter description (optional)"
                ></textarea>
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
                  ) : 'Create Event Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="modal-overlay">
          <div className="modal view-modal">
            <div className="modal-header">
              <h3>Event Type Details</h3>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">#{selectedEventType?.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedEventType?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Description:</span>
                  <div className="detail-text">
                    {selectedEventType?.description || 'No description provided'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedEventType);
                }}
                className="btn btn-edit"
              >
                <FiEdit className="icon" /> Edit
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="btn btn-close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h3>Edit Event Type</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength="100"
                  className="form-input"
                  placeholder="Enter event type name"
                />
              </div>
              <div className="form-group form-groupp">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className="form-textarea"
                  placeholder="Enter description (optional)"
                ></textarea>
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
    </div>
  );
};

export default EventTypes;
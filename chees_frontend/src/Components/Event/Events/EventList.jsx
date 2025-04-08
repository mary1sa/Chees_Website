import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import '../../AdminDashboard/UserTable.css';
import PageLoading from '../../PageLoading/PageLoading';
import ConfirmDelete from '../../Confirm/ConfirmDelete';
import ViewEvent from './ViewEvent';
import EditEvent from './EditEvent';
import CreateEvent from './Create';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [titleFilter, setTitleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = events;
    
    if (titleFilter) {
      result = result.filter(event => 
        event.title?.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }
    
    if (locationFilter) {
      result = result.filter(event => 
        `${event.venue} ${event.city} ${event.region} ${event.country}`
          .toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(event => 
        event.type?.name === typeFilter
      );
    }
    
    setFilteredEvents(result);
    setCurrentPage(1);
  }, [events, titleFilter, locationFilter, typeFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/events');
      setEvents(response.data.data);
      setFilteredEvents(response.data.data);
      
      const types = [...new Set(response.data.data.map(event => event.type?.name).filter(Boolean))];
      setUniqueTypes(types);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/events/${eventToDelete.id}`);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setFilteredEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditingEvent(null);
    fetchEvents();
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchEvents();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

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
        onConfirm={confirmDeleteEvent}
        itemName={eventToDelete ? eventToDelete.title : 'this event'}
      />

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
      
      {showCreateForm && (
        <CreateEvent 
          onSave={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <h1 className="table-title">Events List</h1>
      
      <div className="filter-controls">
        <div className="filter-group">
          <input
            type="text"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            placeholder="Event Title"
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Location"
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setShowCreateForm(true)}
          className="add-new-btn"

        >
          <FiPlus className="icon" />
          Create Event
        </button>
      </div>
      
      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">Event</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Location</div>
          <div className="header-cell">Type</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map((event) => (
            <div key={event.id} className="table-row">
              <div className="table-cell">
                <div className="profile-image-container">
                  {/* <img
                    src={event.image_url || '/default-event.jpg'}
                    alt={event.title}
                    className="profile-image"
                  /> */}
                  <div className="user-info">
                    <div className="name-container">
                      <span className="user-name">
                        {event.title}
                      </span>
                    </div>
                    <span className="user-id">ID: #{event.id}</span>
                    <p className="event-description">{event.description.substring(0, 50)}...</p>
                  </div>
                </div>
              </div>
              
              <div className="table-cell">
                {new Date(event.start_date).toLocaleDateString()} - 
                {new Date(event.end_date).toLocaleDateString()}
              </div>
              <div className="table-cell">
                {event.venue}, {event.city}, {event.region}, {event.country}
              </div>
              <div className="table-cell">{event.type?.name || 'N/A'}</div>
              <div className="table-cell">
                <span className={`status-badge ${(event.status || 'inactive').toLowerCase().replace(' ', '-')}`}>
                  {event.status || 'Inactive'}
                </span>
              </div>
              <div className="table-cell actions">
                <button
                  onClick={() => setEditingEvent(event.id)} 
                  className="action-btn update-btn"
                  title="Edit"
                >
                  <FiEdit className="icon" />
                </button>
                <button 
                  onClick={() => {
                    setEventToDelete(event); 
                    setShowDeleteModal(true); 
                  }}                 
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 className="icon" />
                </button>
                <button
                  onClick={() => setViewingEvent(event.id)} 
                  className="action-btn view-btn"
                  title="View"
                >
                  <FiEye className="icon" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No events found matching your criteria
          </div>
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default EventList;
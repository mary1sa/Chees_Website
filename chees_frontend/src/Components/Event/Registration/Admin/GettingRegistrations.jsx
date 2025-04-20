import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiSearch, FiX } from 'react-icons/fi';
import '../../../AdminDashboard/CreateUser.css';
import PageLoading from '../../../PageLoading/PageLoading';

const GettingRegistrations = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'event', 'user'
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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

  // Filter registrations based on search term
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = registrations.filter(reg => {
        return (
          (reg.id && reg.id.toString().includes(term)) ||
          (reg.event?.title && reg.event.title.toLowerCase().includes(term)) ||
          (reg.user?.name && reg.user.name.toLowerCase().includes(term)) ||
          (reg.user?.first_name && `${reg.user.first_name} ${reg.user.last_name}`.toLowerCase().includes(term)) ||
          (reg.status && reg.status.toLowerCase().includes(term)) ||
          (reg.payment_status && reg.payment_status.toLowerCase().includes(term)) ||
          (reg.registration_number && reg.registration_number.toLowerCase().includes(term))
        );
      });
      setFilteredRegistrations(filtered);
    } else {
      setFilteredRegistrations(registrations);
    }
    setCurrentPage(1);
  }, [searchTerm, registrations]);

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
    setSearchTerm('');
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

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

      <h1 className="table-title">Registration Management</h1>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          onClick={() => handleTabChange('all')}
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}` }
        >
          All Registrations
        </button>
        <button 
          onClick={() => handleTabChange('event')}
          className={`tab-button ${activeTab === 'event' ? 'active' : ''}`}
        >
          Event Registrations
        </button>
        <button 
          onClick={() => handleTabChange('user')}
          className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
        >
          User Registrations
        </button>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        {/* Event Selection (for event registrations tab) */}
        {activeTab === 'event' && (
          <div className="select-container">
            <label>Select Event: </label>
            <select
              value={selectedEvent || ''}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="form-select"
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
          <div className="select-container">
            <label>Select User: </label>
            <select
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="form-select"
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

        {/* Search Input */}
        <div className="search-container">
          {/* <FiSearch className="search-icon" /> */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search registrations..."
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
      </div>

      {/* Results Count */}
      <div className="results-count">
        {activeTab === 'all' && `Showing ${filteredRegistrations.length} of ${pagination.total || registrations.length} registrations`}
        {activeTab === 'event' && selectedEvent && `Showing ${filteredRegistrations.length} registrations for selected event`}
        {activeTab === 'user' && selectedUser && `Showing ${filteredRegistrations.length} registrations for selected user`}
      </div>

      {/* Registrations Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">ID</div>
          {activeTab !== 'event' && <div className="header-cell">Event</div>}
          {activeTab !== 'user' && <div className="header-cell">User</div>}
          <div className="header-cell">Status</div>
          <div className="header-cell">Payment</div>
          <div className="header-cell">Reg Number</div>
          <div className="header-cell">Reg Date</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map(reg => (
            <div key={reg.id} className="table-row">
              <div className="table-cell">
                <span className="type-id">#{reg.id}</span>
              </div>
              {activeTab !== 'event' && (
                <div className="table-cell">
                  {reg.event?.title || 'N/A'}
                </div>
              )}
              {activeTab !== 'user' && (
                <div className="table-cell">
                  {reg.user?.name || `${reg.user?.first_name || ''} ${reg.user?.last_name || ''}`.trim() || 'N/A'}
                </div>
              )}
              <div className="table-cell">
                <span className={`status-badge ${reg.status?.toLowerCase()}`}>
                  {reg.status}
                </span>
              </div>
              <div className="table-cell">
                <span className={`payment-badge ${reg.payment_status?.toLowerCase()}`}>
                  {reg.payment_status}
                </span>
              </div>
              <div className="table-cell">
                {reg.registration_number || 'N/A'}
              </div>
              <div className="table-cell">
                {new Date(reg.registration_date).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No registrations found matching your criteria
          </div>
        )}
      </div>
      
      {filteredRegistrations.length > itemsPerPage && renderPagination()}
    </div>
  );
};

export default GettingRegistrations;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import '../../../AdminDashboard/CreateUser.css';
import PageLoading from '../../../PageLoading/PageLoading';
import ConfirmDelete from '../../../Confirm/ConfirmDelete';
import GettingRegistrations from './GettingRegistrations';


import SuccessAlert from '../../../Alerts/SuccessAlert'; // Adjust path as needed
import ErrorAlert from '../../../Alerts/ErrorAlert';     // Adjust path as needed


const AdminEventRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [editModal, setEditModal] = useState({
    show: false,
    registration: null,
    formData: {
      status: '',
      payment_status: '',
      notes: ''
    }
  });
  
  const [detailView, setDetailView] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState(null);
  const navigate = useNavigate();

  
    const [successAlert, setSuccessAlert] = useState(null);
    const [errorAlert, setErrorAlert] = useState(null);
  

  // Fetch registrations
 

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

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/registrations');
      
      if (response.data && response.data.data) {
        const regs = response.data.data.data || [];
        setRegistrations(regs);
        setFilteredRegistrations(regs);
        setPagination({
          current_page: response.data.data.current_page,
          total: response.data.data.total,
          per_page: response.data.data.per_page
        });
      }
    } catch (err) {
      setErrorAlert({ message: err.response?.data?.message || 'Failed to fetch registrations' });
    } finally {
      setLoading(false);
    }
  };

 

  // Delete registration
  const confirmDeleteRegistration = async () => {
    if (!registrationToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/registrations/${registrationToDelete.id}`);
      setSuccessAlert({ message: 'Registration deleted successfully!' });
      await fetchRegistrations();
    } catch (err) {
      setErrorAlert({ message: err.response?.data?.message || 'Failed to delete registration' });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setRegistrationToDelete(null);
    }
  };

  // Submit updated registration
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.put(
        `/registrations/${editModal.registration.id}`,
        editModal.formData
      );
      setSuccessAlert({ message: 'Registration updated successfully!' });
      await fetchRegistrations();
      setEditModal({ show: false, registration: null, formData: {} });
    } catch (err) {
      setErrorAlert({ message: err.response?.data?.message || 'Failed to update registration' });
    } finally {
      setLoading(false);
    }
  };


  // Show registration details
  const showDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/registrations/${id}`);
      
      setDetailView(response.data.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (registration) => {
    setEditModal({
      show: true,
      registration,
      formData: {
        status: registration.status,
        payment_status: registration.payment_status,
        notes: registration.notes || ''
      }
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      }
    }));
  };

  // Submit updated registration
 

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
           {/* Add alerts at the top */}
    
    
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

  useEffect(() => {
    fetchRegistrations();
  }, []);

  if (loading) return <PageLoading />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="table-container">
      {/* Alerts should be placed at the top of the main container */}
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

      <GettingRegistrations />
      <ConfirmDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteRegistration}
        itemName={registrationToDelete ? `registration #${registrationToDelete.id}` : 'this registration'}
      />
      
      <div className="filter-controls">
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

      <div className="results-count">
        Showing {filteredRegistrations.length} of {pagination.total || registrations.length} registrations
      </div>

      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">ID</div>
          <div className="header-cell">Event</div>
          <div className="header-cell">User</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Payment</div>
          <div className="header-cell actions-header">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map(reg => (
            <div key={reg.id} className="table-row">
              <div className="table-cell">
                <span className="type-id">#{reg.id}</span>
              </div>
              <div className="table-cell">{reg.event?.title || 'N/A'}</div>
              <div className="table-cell">
                {reg.user?.name || `${reg.user?.first_name || ''} ${reg.user?.last_name || ''}`.trim() || 'N/A'}
              </div>
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
              <div className="table-cell actions">
                <button 
                  onClick={() => showDetails(reg.id)} 
                  className="action-btn view-btn"
                  title="View Details"
                >
                  <FiEye className="icon" />
                </button>
                <button 
                  onClick={() => openEditModal(reg)} 
                  className="action-btn update-btn "
                  title="Edit"
                >
                  <FiEdit className="icon" />
                </button>
                <button 
                  onClick={() => {
                    setRegistrationToDelete(reg);
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
            No registrations found matching your criteria
          </div>
        )}
      </div>
      
      {filteredRegistrations.length > itemsPerPage && renderPagination()}

      {/* Detail View Modal */}
      {detailView && (
        <div className="modal-overlay">
          <div className="modal view-modal">
            <div className="modal-header">
              <h3>Registration Details #{detailView.id}</h3>
              <button 
                onClick={() => setDetailView(null)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-card">
                <div className="detail-section">
                  <h4>Event Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{detailView.event?.title || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {detailView.event?.start_date ? 
                        new Date(detailView.event.start_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Venue:</span>
                    <span className="detail-value">{detailView.event?.venue || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>User Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {detailView.user?.name || 
                       `${detailView.user?.first_name || ''} ${detailView.user?.last_name || ''}`.trim() || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{detailView.user?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Registration Details</h4>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-badge ${detailView.status?.toLowerCase()}`}>
                      {detailView.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`detail-value payment-badge ${detailView.payment_status?.toLowerCase()}`}>
                      {detailView.payment_status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registration Number:</span>
                    <span className="detail-value">{detailView.registration_number || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registration Date:</span>
                    <span className="detail-value">
                      {detailView.registration_date ? 
                        new Date(detailView.registration_date).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  {detailView.notes && (
                    <div className="detail-item">
                      <span className="detail-label">Notes:</span>
                      <div className="detail-text">{detailView.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setDetailView(null);
                  openEditModal(detailView);
                }}
                className="btn btn-edit"
              >
                <FiEdit className="icon" /> Edit
              </button>
              <button 
                onClick={() => setDetailView(null)}
                className="btn btn-close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h3>Edit Registration #{editModal.registration.id}</h3>
              <button 
                onClick={() => setEditModal({ show: false, registration: null, formData: {} })} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">Status *</label>
                <select
                  name="status"
                  value={editModal.formData.status}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="attended">Attended</option>
                </select>
              </div>
              
              <div className="form-group form-groupp">
                <label className="form-label">Payment Status *</label>
                <select
                  name="payment_status"
                  value={editModal.formData.payment_status}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <div className="form-group form-groupp">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  value={editModal.formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-textarea"
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="modal-footer form-groupp">
                <button 
                  type="button" 
                  onClick={() => setEditModal({ show: false, registration: null, formData: {} })}
                  className="btn btn-secondary submit-button cancel-button "
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary submit-button "
                  disabled={loading}
                >
                  {loading ?
                              <p>  <span className="loading-spinner"></span> Updating...</p>
                                            : 'Save Changes'}

                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminEventRegistrations;




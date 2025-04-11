
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiX, FiCalendar, FiChevronLeft, FiChevronRight, FiPlus, FiCheck, FiPrinter } from 'react-icons/fi';
import PageLoading from '../../../PageLoading/PageLoading';
import SuccessAlert from '../../../Alerts/SuccessAlert';
import ErrorAlert from '../../../Alerts/ErrorAlert';
import { useReactToPrint } from 'react-to-print';
import PdfDocument from './PdfDocument';
import { PDFDownloadLink } from '@react-pdf/renderer';
// import { jsPDF } from 'jspdf';
// Remove the react-to-print import since we won't need it




const UserEventRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailView, setDetailView] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [registrationToCancel, setRegistrationToCancel] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || null;
  const [allEvents, setAllEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [toggleForm, setToggleForm] = useState(false);
  const [formData, setFormData] = useState({
    event_id: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
 
 
  const fetchAllEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/events');
      
      const responseData = response.data?.data || response.data;
      const events = Array.isArray(responseData) ? responseData : [];
      
      setAllEvents(events);
      filterAvailableEvents(events);
    } catch (err) {
      console.error('Error fetching events:', err);
      setErrorAlert({ message: 'Failed to fetch events' });
      setAllEvents([]);
      setAvailableEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterAvailableEvents = useCallback((events) => {
    const now = new Date();
    const registeredEventIds = registrations.map(reg => reg.event_id);

    const filtered = events.filter(event => {
      if (registeredEventIds.includes(event.id)) return false;
      if (event.registration_deadline) {
        const deadline = new Date(event.registration_deadline);
        if (deadline <= now) return false;
      }
      if (event.max_participants && event.registrations_count >= event.max_participants) {
        return false;
      }
      return true;
    });

    setAvailableEvents(filtered);
  }, [registrations]);

  const fetchUserRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/${userId}/registrations`);
      
      const responseData = response.data?.data || response.data;
      
      if (Array.isArray(responseData)) {
        setRegistrations(responseData);
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        setRegistrations(responseData.data);
      } else if (responseData?.registrations) {
        setRegistrations(responseData.registrations);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      setErrorAlert({ message: err.response?.data?.message || 'Failed to fetch your registrations' });
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserRegistrations();
    fetchAllEvents();
  }, [fetchUserRegistrations, fetchAllEvents]);
  
  useEffect(() => {
    if (allEvents.length > 0) {
      filterAvailableEvents(allEvents);
    }
  }, [allEvents, registrations, filterAvailableEvents]);

  const handleAddReg = () => {
    setToggleForm(!toggleForm);
    setFormData({
      event_id: '',
      notes: ''
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.event_id) errors.event_id = 'Please select an event';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/events/${formData.event_id}/register`, {
        ...formData,
        user_id: userId
      });
      
      setSuccessAlert({ message: 'Registration created successfully!' });
      setToggleForm(false);
      await fetchUserRegistrations();
    } catch (err) {
      console.log(err);
      setErrorAlert({ 
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to create registration' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/registrations/${id}/confirm-payment`);
      setSuccessAlert({ message: 'Payment confirmed successfully!' });
      await fetchUserRegistrations();
      if (detailView && detailView.id === id) {
        const response = await axiosInstance.get(`/registrations/${id}`);
        setDetailView(response.data.data);
      }
    } catch (err) {
      setErrorAlert({ message: err.response?.data?.message || 'Failed to confirm payment' });
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/registrations/${id}`);
      setDetailView(response.data.data);
    } catch (err) {
      setErrorAlert({ message: err.response?.data?.message || 'Failed to load registration details' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'attended': return 'status-attended';
      default: return 'status-default';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'payment-completed';
      case 'pending': return 'payment-pending';
      case 'failed': return 'payment-failed';
      case 'refunded': return 'payment-refunded';
      default: return 'payment-default';
    }
  };


  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = registrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(registrations.length / itemsPerPage);

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

  // useEffect(() => {
  //   if (detailViewRef.current) {
  //     console.log("Print ref content:", detailViewRef.current.innerHTML);
  //   }
  // }, [detailView]);
    return (
        <div className="table-container">
          {/* Alerts */}
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
    
          <h2 className="user-registrations-header">My Event Registrations</h2>
    
          <button 
        onClick={handleAddReg} 
        style={{width:'fit-content'}}
        className={`btn ${toggleForm ? 'btn-secondary' : 'btn-primary'}`}
        disabled={availableEvents.length === 0}
      >
        Create Registration<FiPlus className="icon" />
      </button>
      
      {availableEvents.length === 0 && !loading && (
        <div className="info-message">
          {registrations.length > 0 
            ? "You're already registered for all available events or registration deadlines have passed"
            : "No events available for registration (either registration deadlines have passed or events are full)"}
        </div>
      )}
      
      <div className="results-count">
        Showing {registrations.length} registrations
      </div>
    
          <div className="data-table">
        <div className="table-header">
          <div className="header-cell">Event</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Venue</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Payment</div>
          <div className="header-cell actions-header">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map(reg => (
            <div key={reg.id} className="table-row">
              <div className="table-cell">{reg.event?.title || 'N/A'}</div>
              <div className="table-cell">
                <FiCalendar className="icon" />
                {formatDate(reg.event?.start_date)}
              </div>
              <div className="table-cell">{reg.event?.venue || 'N/A'}</div>
              <div className="table-cell">
                <span className={`status-badge ${getStatusClass(reg.status)}`}>
                  {reg.status}
                </span>
              </div>
              <div className="table-cell">
                <span className={`payment-badge ${getPaymentStatusClass(reg.payment_status)}`}>
                  {reg.payment_status}
                </span>
              </div>
              <div className="table-cell actions">
                <button 
                  onClick={() => viewDetails(reg.id)} 
                  className="action-btn view-btn"
                  title="View Details"
                >
                  <FiEye className="icon" />
                </button>
                <PDFDownloadLink
    document={<PdfDocument
      detailView={reg}
      formatDate={formatDate}
      getStatusClass={getStatusClass}
      getPaymentStatusClass={getPaymentStatusClass}
    />}
    fileName={`registration_${reg.id}.pdf`}
    className="action-btn pdf-btn"
    title="Download PDF"
  >
    {({ loading }) => (
      loading ? <span className="icon">...</span> : <FiPrinter className="icon" />
    )}
  </PDFDownloadLink>
  
  {/* Payment Confirmation Icon (only show if pending) */}
  {reg.payment_status === 'pending' && (
    <button 
      onClick={() => handleConfirmPayment(reg.id)}
      className="action-btn confirm-btn"
      title="Confirm Payment"
    >
      <FiCheck className="icon" />
    </button>
  )}
             
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No registrations found
          </div>
        )}
      </div>
          
          {registrations.length > itemsPerPage && renderPagination()}
    
      
    
          {/* Create Registration Modal */}
          {toggleForm && (
            <div className="modal-overlay">
              <div className="modal create-modal">
                <div className="modal-header">
                  <h3>Create New Registration</h3>
                  <button 
                    onClick={handleAddReg} 
                    className="modal-close-btn"
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit} className="registration-form">
                  <div className="form-group form-groupp">
                  <label htmlFor="event_id">Event *</label>
                  <select
                    id="event_id"
                    name="event_id"
                    value={formData.event_id}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.event_id ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select an event</option>
                    {availableEvents.map(event => (
                  <option 
                  key={event.id} 
                  value={event.id}
                  title={registrations.some(reg => reg.event_id === event.id) ? "You're already registered for this event" : ""}
                >
                  {event.title} - {formatDate(event.start_date)}
                  {event.registration_deadline && (
                    ` (Register by: ${formatDate(event.registration_deadline)})`
                  )}
                  {event.max_participants && (
                    ` (${event.registrations_count || 0}/${event.max_participants} spots)`
                  )}
                </option>
                    ))}
                  </select>
                  {formErrors.event_id && (
                    <div className="invalid-feedback">{formErrors.event_id}</div>
                  )}
                </div>
                    
                    <div className="form-group form-groupp">
                      <label htmlFor="notes">Additional Notes</label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="form-control"
                        rows="3"
                        placeholder="Any special requirements or notes..."
                      />
                    </div>
                  </form>
                </div>
                <div className="modal-footer form-groupp">
                  <button 
                    onClick={handleAddReg}
                    className="btn btn-secondary"
                    // style={{width:'fit-content'}}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    className="btn btn-primary"
                    // style={{width:'fit-content'}}
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
      {/* Registration Detail Modal */}
      {detailView && (
  <div className="modal-overlay">
    <div className="modal view-modal">
      <div className="modal-header">
        <h3>Registration Details #{detailView.id}</h3>
        <button onClick={() => setDetailView(null)} className="modal-close-btn">
          &times;
        </button>
      </div>
      
      <div className="modal-body">
        <div className="detail-card">
          {/* <h2>Registration Details #{detailView.id}</h2> */}
          
          {/* Event Information Section */}
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
                  formatDate(detailView.event.start_date) : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Venue:</span>
              <span className="detail-value">{detailView.event?.venue || 'N/A'}</span>
            </div>
          </div>

          {/* Registration Details Section */}
          <div className="detail-section">
            <h4>Registration Details</h4>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-badge ${getStatusClass(detailView.status)}`}>
                {detailView.status}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Payment Status:</span>
              <span className={`detail-value payment-badge ${getPaymentStatusClass(detailView.payment_status)}`}>
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
                  formatDate(detailView.registration_date) : 'N/A'}
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
                onClick={() => setDetailView(null)}
                className="btn btn-close"
              >
                Close
              </button>
        
        {/* ... other buttons ... */}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default UserEventRegistrations;
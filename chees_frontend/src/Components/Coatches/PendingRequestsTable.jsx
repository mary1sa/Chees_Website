import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { FiCheck, FiX, FiChevronLeft, FiChevronRight, FiInfo } from 'react-icons/fi';
import PageLoading from '../PageLoading/PageLoading';
import { Link } from 'react-router-dom';
import ConfirmAction from '../Confirm/ConfirmAction';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';

const PendingCoachesTable = () => {
  const [pendingCoaches, setPendingCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCoachDetails, setSelectedCoachDetails] = useState(null);

  useEffect(() => {
    fetchPendingCoaches();
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchPendingCoaches = async () => {
    try {
      const response = await axiosInstance.get('/pending-coaches');
      setPendingCoaches(response.data.data);
    } catch (error) {
      console.error('Error fetching pending coaches:', error);
      setErrorMessage('Failed to load pending coaches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const approveCoach = async (coachId) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/approve-coach/${coachId}`);
      setPendingCoaches(prev => prev.filter(coach => coach.id !== coachId));
      setSuccessMessage('Coach approved successfully!');
    } catch (error) {
      console.error('Error approving coach:', error);
      setErrorMessage('Failed to approve coach. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rejectCoach = async (coachId) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/reject-coach/${coachId}`);
      setPendingCoaches(prev => prev.filter(coach => coach.id !== coachId));
      setSuccessMessage('Coach rejected successfully!');
    } catch (error) {
      console.error('Error rejecting coach:', error);
      setErrorMessage('Failed to reject coach. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = (action, coachId) => {
    setActionType(action);
    setSelectedCoachId(coachId);
    setShowConfirm(true);
  };

  const openDetailsModal = async (coach) => {
    try {
      // You might want to fetch more detailed information here if needed
      setSelectedCoachDetails(coach);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching coach details:', error);
      setErrorMessage('Failed to load coach details.');
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCoachDetails(null);
  };

  const indexOfLastCoach = currentPage * itemsPerPage;
  const indexOfFirstCoach = indexOfLastCoach - itemsPerPage;
  const currentCoaches = pendingCoaches.slice(indexOfFirstCoach, indexOfLastCoach);
  const totalPages = Math.ceil(pendingCoaches.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatArrayField = (field) => {
    if (!field) return 'N/A';
    return Array.isArray(field) ? field.join(', ') : field;
  };

  if (loading) return <PageLoading />;

  return (
    <div className="table-container">
      {successMessage && (
        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
      {errorMessage && (
        <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      <h1 className="table-title">Pending Coach Requests</h1>

      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">Profile</div>
          <div className="header-cell">Title</div>
          <div className="header-cell">NatlTitle</div>
          <div className="header-cell">Rating</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>

        {currentCoaches.length > 0 ? (
          currentCoaches.map((coach) => (
            <div className="table-row" key={coach.id}>
              <div className="table-cell">
                <div className="profile-image-container">
                  <img
                    src={coach.user.profile_picture ? `http://localhost:8000/storage/${coach.user.profile_picture}` : '/anony.jpg'}
                    alt={`${coach.first_name} ${coach.last_name}`}
                    className="profile-image"
                  />
                  <div className="user-info">
                    <div className="name-container">
                      <span className="user-name">{coach.user.first_name} {coach.user.last_name}</span>
                    </div>
                    <span className="user-id">ID: #{coach.id}</span>
                  </div>
                </div>
              </div>
              <div className="table-cell">{coach.title || 'N/A'}</div>
              <div className="table-cell">{coach.national_title || 'N/A'}</div>
              <div className="table-cell">{coach.rating}</div>
              <div className="table-cell">
                <span className="status-badge pending">{coach.status}</span>
              </div>
              <div className="table-cell actions">
                <button
                  onClick={() => openDetailsModal(coach)}
                  className="action-btn details-btn"
                  title="Details"
                >
                  <FiInfo className="icon" />
                </button>
                <button
                  onClick={() => handleConfirmAction('approve', coach.id)}
                  className="action-btn approve-btn"
                  title="Approve"
                >
                  <FiCheck className="icon" />
                </button>
                <button
                  onClick={() => handleConfirmAction('reject', coach.id)}
                  className="action-btn reject-btn"
                  title="Reject"
                >
                  <FiX className="icon" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No pending requests found.
          </div>
        )}
      </div>

      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-button pagination-nav"
        >
          <FiChevronLeft className="icon" />
          <span>Previous</span>
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="pagination-button pagination-nav"
        >
          <span>Next</span>
          <FiChevronRight className="icon" />
        </button>
      </div>

      {showConfirm && (
        <ConfirmAction
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            if (actionType === 'approve') {
              approveCoach(selectedCoachId);
            } else if (actionType === 'reject') {
              rejectCoach(selectedCoachId);
            }
            setShowConfirm(false);
          }}
          actionDescription={actionType === 'approve' ? 'approve this coach' : 'reject this coach'}
        />
      )}

      {/* Coach Details Modal */}
{showDetailsModal && selectedCoachDetails && (
  <div className="modal-overlay">
    <div className="modal-content">
      <button className="modal-close-btn" onClick={closeDetailsModal}>X</button>
      <div className="view-modal-content">
        <h3 className="modaltitle">Coach  Details</h3>

        <div className="reviewsection">
          <div className="infocard">
            <div className="profile-image-container">
              <img
                src={selectedCoachDetails.user.profile_picture ? `http://localhost:8000/storage/${selectedCoachDetails.user.profile_picture}` : '/anony.jpg'}
                alt={`${selectedCoachDetails.user.first_name} ${selectedCoachDetails.user.last_name}`}
                className="profile-image-large"
              />
              <div className="user-info">
                <h4>{selectedCoachDetails.user.first_name} {selectedCoachDetails.user.last_name}</h4>
                <p>ID: #{selectedCoachDetails.id} | Email: {selectedCoachDetails.user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="reviewsection">
          <h4>Basic Information</h4>
          <div className="details-grid">
            <div className="detail-item"><strong>Title:</strong> {selectedCoachDetails.title || 'N/A'} | <strong>FIDE ID:</strong> {selectedCoachDetails.fide_id || 'N/A'}</div>
            <div className="detail-item"><strong>National Title:</strong> {selectedCoachDetails.national_title || 'N/A'} | <strong>Certification:</strong> {selectedCoachDetails.certification_level || 'N/A'}</div>
          </div>
        </div>

        <div className="reviewsection">
          <h4>Rating Information</h4>
          <div className="details-grid">
            <div className="detail-item"><strong>Rating:</strong> {selectedCoachDetails.rating} | <strong>Peak:</strong> {selectedCoachDetails.peak_rating || 'N/A'}</div>
            <div className="detail-item"><strong>Experience:</strong> {selectedCoachDetails.years_teaching_experience} years | <strong>Rate:</strong> ${selectedCoachDetails.hourly_rate}/hr</div>
          </div>
        </div>

        <div className="reviewsection">
          <h4>Specialization</h4>
          <div className="details-grid">
            <div className="detail-item"><strong>Primary:</strong> {selectedCoachDetails.primary_specialization?.name || 'N/A'} | <strong>Secondary:</strong> {selectedCoachDetails.secondary_specialization?.name || 'N/A'}</div>
          </div>
        </div>

        <div className="reviewsection">
          <h4>Preferences</h4>
          <div className="details-grid">
            <div className="detail-item"><strong>Languages:</strong> {formatArrayField(selectedCoachDetails.preferred_languages)}</div>
            <div className="detail-item"><strong>Formats:</strong> {formatArrayField(selectedCoachDetails.teaching_formats)} | <strong>Communication:</strong> {formatArrayField(selectedCoachDetails.communication_methods)}</div>
          </div>
        </div>

        <div className="reviewsection">
          <h4>Additional Information</h4>
          <div className="details-grid">
            <div className="detail-item"><strong>Video Intro:</strong> {selectedCoachDetails.video_introduction_url ? (
              <a href={selectedCoachDetails.video_introduction_url} target="_blank" rel="noopener noreferrer">View</a>
            ) : 'N/A'} | <strong>Social Media:</strong> {formatArrayField(selectedCoachDetails.social_media_links) || 'N/A'}</div>
            <div className="detail-item full-width"><strong>Bio:</strong> {selectedCoachDetails.professional_bio || 'N/A'}</div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={() => {
              closeDetailsModal();
              handleConfirmAction('approve', selectedCoachDetails.id);
            }}
            className="action-btn approve-btn"
          >
            <FiCheck className="icon" /> 
          </button>
          <button
            onClick={() => {
              closeDetailsModal();
              handleConfirmAction('reject', selectedCoachDetails.id);
            }}
            className="action-btn reject-btn"
          >
            <FiX className="icon" /> 
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default PendingCoachesTable;
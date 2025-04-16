import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { FiCheck, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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

  const indexOfLastCoach = currentPage * itemsPerPage;
  const indexOfFirstCoach = indexOfLastCoach - itemsPerPage;
  const currentCoaches = pendingCoaches.slice(indexOfFirstCoach, indexOfLastCoach);
  const totalPages = Math.ceil(pendingCoaches.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            <div key={coach.id} className="table-row">
              <div className="table-cell">
                <div className="profile-image-container">
                  <img
                    src={coach.profile_picture ? `http://localhost:8000/storage/${coach.profile_picture}` : '/anony.jpg'}
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
              <div className="table-cell">{coach.title}</div>
              <div className="table-cell">{coach.national_title}</div>
              <div className="table-cell">{coach.rating}</div>
              <div className="table-cell">
                <span className="status-badge pending">{coach.status}</span>
              </div>
              <div className="table-cell actions">
                <Link
                  to="#"
                  onClick={() => handleConfirmAction('approve', coach.id)}
                  className="action-btn approve-btn"
                  title="Approve"
                >
                  <FiCheck className="icon" />
                </Link>
                <Link
                  to="#"
                  onClick={() => handleConfirmAction('reject', coach.id)}
                  className="action-btn reject-btn"
                  title="Reject"
                >
                  <FiX className="icon" />
                </Link>
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
    </div>
  );
};

export default PendingCoachesTable;
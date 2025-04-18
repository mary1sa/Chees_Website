import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { StarIcon } from '@heroicons/react/24/solid';
import './CoachReview.css';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';
import PageLoading from '../../PageLoading/PageLoading';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import ConfirmDelete from '../../Confirm/ConfirmDelete';

const CoachReviewForm = () => {
  const [coaches, setCoaches] = useState([]);
  const [reviews, setReviews] = useState({});
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null); 
  const [expandedReview, setExpandedReview] = useState({});
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalCoachId, setModalCoachId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/fetchcoaches');
      const coachesData = response?.data || [];
      setCoaches(coachesData);

      const initialFormData = {};
      await Promise.all(
        coachesData.map(async (coach) => {
          if (coach?.id) {
            initialFormData[coach.id] = {
              review_text: '',
              rating: 5,
              teaching_clarity_rating: 5,
              communication_rating: 5,
              knowledge_depth_rating: 5,
            };
            await fetchReviews(coach.id);
          }
        })
      );
      setFormData(initialFormData);
    } catch (error) {
      setMessage('Failed to load coaches.');
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (coachId) => {
    try {
      const response = await axiosInstance.get(`/reviews/${coachId}`);
      setReviews(prev => ({ ...prev, [coachId]: response?.data || [] }));
    } catch (error) {
      setMessage('Failed to load reviews.');
      setAlertType('error');
    }
  };

  const handleSubmit = async (coachId, e) => {
    e.preventDefault();
    if (!user) return setMessage('You must be logged in to submit a review.');

    try {
      if (editingReviewId) {
        await axiosInstance.put(`/reviewsupdate/${editingReviewId}`, {
          coach_id: coachId,
          user_id: user?.id,
          ...formData[coachId],
        });
        setMessage('Review updated successfully!');
      } else {
        await axiosInstance.post('/reviews', {
          coach_id: coachId,
          user_id: user?.id,
          ...formData[coachId],
        });
        setMessage('Review submitted successfully!');
      }

      setAlertType('success');
      fetchReviews(coachId);
      resetForm(coachId);
      closeModal();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error submitting review.');
      setAlertType('error');
    }
  };

  const resetForm = (coachId) => {
    setFormData(prev => ({
      ...prev,
      [coachId]: {
        review_text: '',
        rating: 5,
        teaching_clarity_rating: 5,
        communication_rating: 5,
        knowledge_depth_rating: 5,
      },
    }));
    setEditingReviewId(null);
  };

  const RatingDropdown = ({ coachId, label, ratingType }) => (
    <div className="rating-group">
      <label className="rating-label">{label}</label>
      <div className="relative">
        <select
          className="rating-select"
          value={formData[coachId]?.[ratingType] || 5}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              [coachId]: {
                ...(prev[coachId] || {}),
                [ratingType]: parseInt(e.target.value),
              },
            }))
          }>
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>{r} Stars</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <StarIcon className="star-icon text-amber-400" />
        </div>
      </div>
    </div>
  );

  const openModal = (coachId) => {
    setSelectedCoachId(coachId);
    setShowForm(true);
    setEditingReviewId(null); 
  };

  const closeModal = () => {
    setShowForm(false);
    setSelectedCoachId(null);
    setEditingReviewId(null);
  };

  const openAllReviewsModal = (coachId) => {
    setModalCoachId(coachId);
    setShowAllModal(true);
  };

  const closeAllReviewsModal = () => {
    setModalCoachId(null);
    setShowAllModal(false);
  };

  const closeAlert = () => {
    setMessage('');
    setAlertType('');
  };

  const startEditReview = (coachId, review) => {
    setFormData(prev => ({
      ...prev,
      [coachId]: {
        review_text: review.review_text,
        rating: review.rating,
        teaching_clarity_rating: review.teaching_clarity_rating,
        communication_rating: review.communication_rating,
        knowledge_depth_rating: review.knowledge_depth_rating,
      },
    }));
    setEditingReviewId(review.id);
    setSelectedCoachId(coachId);
    setShowForm(true);
  };
  const handleDeleteClick = (coachId, coachName) => {
    setReviewToDelete({ coachId, coachName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete || !user) return;
    
    try {
      await axiosInstance.delete('/coach-reviews', {
        data: {
          coach_id: reviewToDelete.coachId,
          user_id: user.id
        }
      });

      setMessage('Review deleted successfully!');
      setAlertType('success');
      fetchReviews(reviewToDelete.coachId);
      setShowDeleteModal(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error deleting review.');
      setAlertType('error');
      setShowDeleteModal(false);
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="coach-review-container">
      <h2 className="coach-review-title">Coach Reviews</h2>

      {coaches?.length > 0 ? (
        <div className="coach-grid">
          {coaches.map((coach) => (
            coach?.id && (
              <div key={coach.id} className="coach-card">
                <div className="coach-header">
                  <div className="coach-avatar">
                    <span className="coach-initials">
                      {coach.user?.first_name?.[0] || 'N'}
                      {coach.user?.last_name?.[0] || 'A'}
                    </span>
                  </div>
                  <div>
                    <h3 className="coach-info">
                      {coach.user?.first_name || 'Unknown'} {coach.user?.last_name || 'User'}
                    </h3>
                    <p className="coach-specialization">
                      {coach.specialization || 'No specialization listed'}
                    </p>
                  </div>
                </div>

                <div className="reviews-section">
                  <h4 className="reviews-title">
                    <StarIcon className="star-icon" />
                    Recent Feedback
                  </h4>
                  <div className="reviews-list">
                    {reviews[coach.id]?.length > 0 ? (
                      reviews[coach.id]
                        .slice(0, 1)
                        .map(review => {
                          const isExpanded = expandedReview[review.id];
                          const isMyReview = user && review.user_id === user.id;

                          return (
                            <div
                              key={review?.id}
                              className={`review-item clickable ${isMyReview ? 'my-review' : ''}`}
                              onClick={() =>
                                setExpandedReview(prev => ({
                                  ...prev,
                                  [review.id]: !prev[review.id],
                                }))}>
                              <div className="review-rating">
                              <h3 className='namemember'>{review?.user.first_name} {review?.user.last_name}</h3>
                                <div className="review-stars">
                                  {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                      key={i}
                                      className={`star-icon ${i < (review?.rating || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                                    />
                                  ))}
                                </div>
                                <span className="review-date">
                                  {review?.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }) : '--/--/----'}
                                </span>
                              </div>
                             

                              <p className="review-text">"{review?.review_text}"</p>
                              {isExpanded && (
                                <div className="review-breakdown">
                                  <p>Teaching Clarity: {review?.teaching_clarity_rating} / 5</p>
                                  <p>Communication: {review?.communication_rating} / 5</p>
                                  <p>Knowledge Depth: {review?.knowledge_depth_rating} / 5</p>
                                </div>
                              )}
                              {isMyReview && (
  <div className="review-actions">
    <button
      className="edit-btn"
      onClick={(e) => {
        e.stopPropagation();
        startEditReview(coach.id, review);
      }}
      title="Edit Review"
    >
      <FiEdit className="pen-icon-with-border" />
    </button>
    <button
    className="delete_btn"
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteClick(
        coach.id,
        `${coach.user?.first_name} ${coach.user?.last_name}`
      );
    }}
    title="Delete Review"
  >
    <FiTrash2 className="trash-icon-with-border" />
  </button>
  </div>
)}
                            </div>
                          );
                        })
                    ) : (
                      <div className="empty-reviews">No reviews yet</div>
                    )}
                  </div>

                  {reviews[coach.id]?.length > 1 && (
                    <button className="show-more-btn" onClick={() => openAllReviewsModal(coach.id)}>
                      Show More Reviews ...
                    </button>
                  )}
                </div>

                <button
                  className="toggle-form-btn"
                  onClick={() => openModal(coach.id)}>
                  Write a Review
                </button>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <StarIcon className="empty-icon" />
          </div>
          <h3 className="empty-state-title">No Coaches Available</h3>
          <p className="empty-state-text">Please check back later</p>
        </div>
      )}

      {alertType === 'success' && message && (
        <SuccessAlert message={message} onClose={closeAlert} />
      )}

      {alertType === 'error' && message && (
        <ErrorAlert message={message} onClose={closeAlert} />
      )}

      {showForm && selectedCoachId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeModal}>X</button>
            <form onSubmit={(e) => handleSubmit(selectedCoachId, e)} className="review-form">
              <textarea
                className="review-textarea"
                placeholder="Share your experience..."
                value={formData[selectedCoachId]?.review_text || ''}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    [selectedCoachId]: {
                      ...(prev[selectedCoachId] || {}),
                      review_text: e.target.value,
                    },
                  }))
                }
                rows="3"
              />

              <div className="ratings-container">
                <RatingDropdown coachId={selectedCoachId} label="Overall Rating" ratingType="rating" />
                <div className="rating-columns">
                  <RatingDropdown coachId={selectedCoachId} label="Teaching Clarity" ratingType="teaching_clarity_rating" />
                  <RatingDropdown coachId={selectedCoachId} label="Communication" ratingType="communication_rating" />
                </div>
                <RatingDropdown coachId={selectedCoachId} label="Knowledge Depth" ratingType="knowledge_depth_rating" />
              </div>

              <button type="submit" className="submit-button-review">
                {editingReviewId ? 'Update Review' : 'Submit Review'}
                <StarIcon className="submit-icon" />
              </button>
            </form>
          </div>
        </div>
      )}

      
      {showAllModal && modalCoachId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeAllReviewsModal}>X</button>
            <h3 className="modal-title">All Reviews</h3>
            {reviews[modalCoachId]?.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-rating">
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`star-icon ${i < (review?.rating || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="review-date">
                    {review?.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : '--/--/----'}
                  </span>
                </div>
                <p className="review-text">"{review?.review_text}"</p>
                <div className="review-breakdown">
                  <p>Teaching Clarity: {review.teaching_clarity_rating} / 5</p>
                  <p>Communication: {review.communication_rating} / 5</p>
                  <p>Knowledge Depth: {review.knowledge_depth_rating} / 5</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      )}

{showDeleteModal && (
  <ConfirmDelete
    isOpen={showDeleteModal}
    onClose={() => setShowDeleteModal(false)}
    onConfirm={confirmDelete}
    itemName={`your review for ${reviewToDelete?.coachName || 'this coach'}`}
  />
)}
    </div>
    
  );
  
};

export default CoachReviewForm;

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi';
import { StarIcon } from '@heroicons/react/24/solid';
import PageLoading from '../../PageLoading/PageLoading';
import ConfirmDelete from '../../Confirm/ConfirmDelete';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';
const ReviewTable = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedViewReview, setSelectedViewReview] = useState(null);
  const [formData, setFormData] = useState({
    review_text: '',
    rating: 5,
    teaching_clarity_rating: 5,
    communication_rating: 5,
    knowledge_depth_rating: 5,
  });

  
  const [coachFilter, setCoachFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchCoaches();
  }, []);

  useEffect(() => {
    let result = [...reviews];
    
    if (coachFilter !== 'all') {
      result = result.filter(review => 
        review.coach_id?.toString() === coachFilter
      );
    }
    
    if (ratingFilter !== 'all') {
      result = result.filter(review => 
        review.rating?.toString() === ratingFilter
      );
    }
    
    if (dateFilter) {
      result = result.filter(review => 
        new Date(review.created_at).toISOString().split('T')[0] === dateFilter
      );
    }
    
    setFilteredReviews(result);
    setCurrentPage(1);
  }, [reviews, coachFilter, ratingFilter, dateFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/adminreviews');
      const reviewsData = Array.isArray(response.data) ? response.data : [];
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setErrorMessage('Failed to load reviews');

      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await axiosInstance.get('/fetchcoaches');
      setCoaches(response.data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      setErrorMessage('Failed to load coaches');

    }
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/admin/reviews/${reviewToDelete.id}`);
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      setFilteredReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      setSuccessMessage('Review deleted successfully!');

    } catch (error) {
      console.error('Error deleting review:', error);
      setErrorMessage('Failed to delete review');

    } finally {
      setShowDeleteModal(false);
      setReviewToDelete(null);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  const openViewModal = async (review) => {
    try {
      const response = await axiosInstance.get(`/showreview/${review.id}`);
      setSelectedViewReview(response.data);
      console.log(response.data)
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching review details:', error);
      setErrorMessage('Failed to load review details');

    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedViewReview(null);
  };

  
  const openEditModal = (review) => {
    setSelectedReview(review);
    setFormData({
      review_text: review.review_text,
      rating: review.rating,
      teaching_clarity_rating: review.teaching_clarity_rating,
      communication_rating: review.communication_rating,
      knowledge_depth_rating: review.knowledge_depth_rating,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedReview(null);
    setFormData({
      review_text: '',
      rating: 5,
      teaching_clarity_rating: 5,
      communication_rating: 5,
      knowledge_depth_rating: 5,
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      await axiosInstance.put(`/admin/reviews/${selectedReview.id}`, formData);
      fetchReviews();
      closeEditModal();
      setSuccessMessage('Review updated successfully!');

    } catch (error) {
      console.error('Error updating review:', error);
      setErrorMessage('Failed to update review');

    }
  };

  const RatingDropdown = ({ label, name, value }) => (
    <div className="rating-group">
      <label className="rating-label">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            [name]: parseInt(e.target.value)
          }))}
          className="rating-select"
        >
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderStars = (rating) => {
    return [...Array(rating)].map((_, i) => (
      <StarIcon
        key={i}
        className="star-icon text-amber-400"
      />
    ));
  };

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

  return (
    <div className="table-container">

{successMessage && (
        <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />
      )}
      {errorMessage && (
        <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
      )}
      <ConfirmDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteReview}
        itemName={reviewToDelete ? `review by ${reviewToDelete.user?.first_name}` : 'this review'}
      />

      {/* View Review Modal */}
      {showViewModal && selectedViewReview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeViewModal}>X</button>
            <div className="view-modal-content">
              <h3 className="modaltitle">Review Details</h3>

              <div className="reviewsection">
  <div className="infocard">
    {selectedViewReview.coach?.user ? (
      <>
        <p>
          <strong>Coach Name:</strong> {selectedViewReview.coach.user.first_name} {selectedViewReview.coach.user.last_name}
        </p>
        <p>
          <strong>Specialization:</strong> {selectedViewReview.coach.specialization || 'N/A'}
        </p>
      </>
    ) : (
      <p className="textmuted">Coach information not available</p>
    )}

    <hr style={{ margin: '12px 0', borderTop: '1px solid #e5e7eb' }} />

    {selectedViewReview.user ? (
      <>
        <p>
          <strong>Reviewer Name:</strong> {selectedViewReview.user.first_name} {selectedViewReview.user.last_name}
        </p>
        <p>
          <strong>Reviewer Email:</strong> {selectedViewReview.user.email}
        </p>
      </>
    ) : (
      <p className="textmuted">Reviewer information not available</p>
    )}
  </div>
</div>


              <div className="reviewsection">
                <h4>Ratings</h4>
                <div className="ratingsgrid">
                  <div className="ratingitem">
                    <span>Overall Rating:</span>
                    <div className="starss">
                      {renderStars(selectedViewReview.rating)}
                      <span>({selectedViewReview.rating}/5)</span>
                    </div>
                  </div>
                  <div className="ratingitem">
                    <span>Teaching Clarity:</span>
                    <div className="starss">
                      {renderStars(selectedViewReview.teaching_clarity_rating)}
                      <span>({selectedViewReview.teaching_clarity_rating}/5)</span>
                    </div>
                  </div>
                  <div className="ratingitem">
                    <span>Communication:</span>
                    <div className="starss">
                      {renderStars(selectedViewReview.communication_rating)}
                      <span>({selectedViewReview.communication_rating}/5)</span>
                    </div>
                  </div>
                  <div className="ratingitem">
                    <span>Knowledge Depth:</span>
                    <div className="starss">
                      {renderStars(selectedViewReview.knowledge_depth_rating)}
                      <span>({selectedViewReview.knowledge_depth_rating}/5)</span>
                    </div>
                    
                  </div>
                </div>
              </div>

              {selectedViewReview.review_text && (
                <div className="reviewsection">
                  <h4>Review Content</h4>
                  <div className="reviewcontent">
                    <p>"{selectedViewReview.review_text}"</p>
                  </div>
                </div>
              )}

              <div className="reviewmeta">
                <p>
                  <strong>Reviewed on:</strong>{' '}
                  {new Date(selectedViewReview.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeEditModal}>X</button>
            <form onSubmit={handleUpdateSubmit} className="review-form">
              <h3 className="modal-title">Edit Review</h3>

              <textarea
                className="review-textarea"
                placeholder="Edit review text..."
                value={formData.review_text}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  review_text: e.target.value
                }))}
                rows="3"
              />

              <div className="ratings-container">
                <RatingDropdown 
                  label="Overall Rating"
                  name="rating"
                  value={formData.rating}
                />
                <div className="rating-columns">
                  <RatingDropdown
                    label="Teaching Clarity"
                    name="teaching_clarity_rating"
                    value={formData.teaching_clarity_rating}
                  />
                  <RatingDropdown
                    label="Communication"
                    name="communication_rating"
                    value={formData.communication_rating}
                  />
                </div>
                <RatingDropdown
                  label="Knowledge Depth"
                  name="knowledge_depth_rating"
                  value={formData.knowledge_depth_rating}
                />
              </div>

              <button type="submit" className="submit-button-review">
                Update Review
                <StarIcon className="submit-icon" />
              </button>
            </form>
          </div>
        </div>
      )}

      <h1 className="table-title">Reviews Management</h1>
      
      <div className="filter-controls">
        <div className="filter-group">
          <select
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Coaches</option>
            {coaches.map(coach => (
              <option key={coach.id} value={coach.id}>
                {coach.user?.first_name} {coach.user?.last_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map(rating => (
              <option key={rating} value={rating}>
                {rating} Stars
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>
      
      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">Coach</div>
          <div className="header-cell">Reviewer</div>
          <div className="header-cell">Rating</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map((review) => (
            <div key={review.id} className="table-row">
              <div className="table-cell">
                {review.coach?.user?.first_name} {review.coach?.user?.last_name}
              </div>
              
              <div className="table-cell">
                {review.user?.first_name} {review.user?.last_name}
              </div>
              
              <div className="table-cell">
                <div className="rating-stars">
                {/* {renderStars(review.rating)} */}
                  <span className="rating-text">({review.rating}/5)</span>
                </div>
              </div>
              
              <div className="table-cell">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              
              <div className="table-cell actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => openViewModal(review)}
                >
                  <FiEye className="icon" />
                </button>
                <button 
                    className="action-btn update-btn"
                  onClick={() => openEditModal(review)}
                >
                  <FiEdit className="icon" />
                </button>
                <button 
                  onClick={() => {
                    setReviewToDelete(review); 
                    setShowDeleteModal(true); 
                  }} 
                  className="action-btn delete-btn"
                  >
                  <FiTrash2 className="icon" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No reviews found matching your criteria
          </div>
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default ReviewTable;
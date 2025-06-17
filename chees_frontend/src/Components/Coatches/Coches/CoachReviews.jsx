import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { StarIcon } from '@heroicons/react/24/solid';
import PageLoading from '../../PageLoading/PageLoading';
import './CoachReviewscss.css';

const CoachReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchCoachReviews = async () => {
      try {
        setLoading(true);
        
        const coachesResponse = await axiosInstance.get('/fetchcoaches');
        const coachProfile = coachesResponse.data.find(
          coach => coach.user_id === user.id
        );

        if (!coachProfile?.id) {
          setError('Coach profile not found');
          setLoading(false);
          return;
        }

        const reviewsResponse = await axiosInstance.get(`/reviews/${coachProfile.id}`);
        setReviews(reviewsResponse.data);
        setFilteredReviews(reviewsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchCoachReviews();
  }, [user?.id]);

  useEffect(() => {
    const filterResults = () => {
      let results = [...reviews];

      
      if (searchTerm) {
        results = results.filter(review =>
          `${review.user.first_name} ${review.user.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      }

     
      if (searchDate) {
        results = results.filter(review => 
          new Date(review.created_at).toISOString().split('T')[0] === searchDate
        );
      }

      setFilteredReviews(results);
    };

    filterResults();
  }, [searchTerm, searchDate, reviews]);


   const renderStars = (rating) => {
      return [...Array(rating)].map((_, i) => (
        <StarIcon
          key={i}
          className="star-icon text-amber-400"
        />
      ));
    };
  if (loading) return <PageLoading />;

  return (
    <div className="coach-review-container">
      <h2 className="coach-review-title">Member Feedback</h2>

      <div className="filter-controls">
        <div className="filter-group">
        <input
          type="text"
          placeholder="Search by  name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
           className="filter-input"
        />
        </div>
        <div className="filter-group">
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
           className="filter-input"
        />
      </div>
      </div>
      {error && (
        <div className="error-message">
          <StarIcon className="error-icon" />
          {error}
        </div>
      )}

      {filteredReviews.length > 0 ? (
        <div className="review-list-container">
          {filteredReviews.map((review) => (
            <div key={review.id} className="coach-review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">
                    {review.user.first_name} {review.user.last_name}
                  </span>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="overall-rating">
                 {renderStars(review.rating)}
                </div>
              </div>

              {review.review_text && (
                <p className="review-content">"{review.review_text}"</p>
              )}

              <div className="detailed-ratings">
                <div className="rating-category">
                  <span>Teaching Clarity:</span>
                  
                  <div className="category-stars">
                  {renderStars(review.teaching_clarity_rating)}
                  </div>
                </div>
                <div className="rating-category">
                  <span>Communication:</span>
                  <div className="category-stars">
                  {renderStars(review.communication_rating)}
                  </div>
                </div>
                <div className="rating-category">
                  <span>Knowledge Depth:</span>
                  <div className="category-stars">
                  {renderStars(review.knowledge_depth_rating)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-reviews">
          <StarIcon className="empty-icon" />
          <p>
            {reviews.length === 0 
              ? 'No reviews available yet' 
              : 'No reviews match your search criteria'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CoachReviews;
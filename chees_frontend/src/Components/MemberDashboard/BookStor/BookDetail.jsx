import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import './Books.css';
import PageLoading from '../../PageLoading/PageLoading';
import { FaStar, FaRegStar } from 'react-icons/fa';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [newRating, setNewRating] = useState({ rating: 0, review: '' });
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        // Fetch book details
        const bookResponse = await axiosInstance.get(`/books/${id}`);
        setBook(bookResponse.data);
        
        // Fetch ratings
        await fetchRatings();
        
        // Check if user has already rated this book
        const token = localStorage.getItem('token');
        if (token) {
          const ratingsResponse = await axiosInstance.get(`/books/${id}/ratings`);
          const userRatings = ratingsResponse.data.filter(r => r.user_id === JSON.parse(localStorage.getItem('user')).id);
          if (userRatings.length > 0) {
            setUserRating(userRatings[0]);
            setNewRating({
              rating: userRatings[0].rating,
              review: userRatings[0].review || ''
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load book');
        console.error('Error fetching book:', err);
      }
    };

    fetchBookData();
  }, [id]);

  const fetchRatings = async () => {
    setLoadingRatings(true);
    try {
      const response = await axiosInstance.get(`/books/${id}/ratings`);
      setRatings(response.data);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/books/${id}` } });
        return;
      }

      if (userRating) {
        // Update existing rating
        await axiosInstance.put(`/ratings/${userRating.id}`, {
          rating: newRating.rating,
          review: newRating.review
        });
      } else {
        // Create new rating
        await axiosInstance.post(`/books/${id}/ratings`, {
          rating: newRating.rating,
          review: newRating.review
        });
      }
      await fetchRatings();
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  const handleRatingDelete = async () => {
    try {
      await axiosInstance.delete(`/ratings/${userRating.id}`);
      setUserRating(null);
      setNewRating({ rating: 0, review: '' });
      await fetchRatings();
    } catch (err) {
      console.error('Error deleting rating:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!book && !error) return <PageLoading />;

  if (error) {
    return (
      <div className="profile-dashboard">
        <button className="back-button" onClick={() => navigate(-1)}>
          &larr; Back to Books
        </button>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to Books
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            {book.cover_image ? (
              <img
                src={`/storage/${book.cover_image}`}
                alt={book.title}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar placeholder">
                <i className="fas fa-book"></i>
              </div>
            )}
            <span className={`status-dot ${book.stock > 0 ? 'active' : 'inactive'}`}></span>
          </div>
          <div className="profile-titles">
            <h1 className="profile-name">{book.title}</h1>
            <p className="profile-role">by {book.author?.name || 'Unknown Author'}</p>
            <div className="rating-badge">
              <span className="rating-value">
                {book.sale_price ? formatPrice(book.sale_price) : formatPrice(book.price)}
              </span>
              {book.sale_price && (
                <span className="rating-label discount">
                  {Math.round((1 - book.sale_price / book.price) * 100)}% OFF
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="info-section">
            <h2 className="section-title">Book Information</h2>
            
            <h2 className="section-title">Description</h2>
            <div className="bio-content">
              {book.description || 'No description available'}
            </div>
              <br />
              <hr />
            <InfoField label="Category" value={book.category?.name} />
            <InfoField label="ISBN" value={book.isbn} />
            <InfoField label="Publisher" value={book.publisher} />
            <InfoField label="Publication Date" value={formatDate(book.publication_date)} />
            <InfoField label="Pages" value={book.pages} />
            <InfoField label="Language" value={book.language} />
            <InfoField label="Format" value={book.format} />
            <InfoField 
              label="Availability" 
              value={`${book.stock} ${book.stock === 1 ? 'copy' : 'copies'} available`}
            />

          </div>

          <div className="info-section">
          <h2 className="section-title">Ratings & Reviews</h2>
            
            {/* Rating Form */}
            <div className="rating-form">
              <h3>Rate this book</h3>
              <form onSubmit={handleRatingSubmit}>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating({...newRating, rating: star})}
                    >
                      {star <= newRating.rating ? <FaStar /> : <FaRegStar />}
                    </button>
                  ))}
                </div>
                <textarea
                  value={newRating.review}
                  onChange={(e) => setNewRating({...newRating, review: e.target.value})}
                  placeholder="Share your thoughts about this book..."
                  rows="4"
                />
                <div className="rating-buttons">
                  <button type="submit" className="submit-button">
                    {userRating ? 'Update Rating' : 'Submit Rating'}
                  </button>
                  {userRating && (
                    <button 
                      type="button" 
                      onClick={handleRatingDelete}
                      className="delete-button"
                    >
                      Delete Rating
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Ratings List */}
            {loadingRatings ? (
              <div className="loading-ratings">Loading ratings...</div>
            ) : (
              <div className="ratings-list">
                {ratings.length === 0 ? (
                  <p>No ratings yet. Be the first to review!</p>
                ) : (
                  ratings.map((rating) => (
                    <div key={rating.id} className="rating-item">
                      <div className="rating-header">
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            i < rating.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                          ))}
                        </div>
                        <span className="rating-user">
                          {rating.user?.name || 'Anonymous'}
                        </span>
                        <span className="rating-date">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.review && (
                        <div className="rating-review">
                          {rating.review}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value }) => (
  <div className="info-field">
    <label className="info-label">{label}</label>
    <p className="info-value">{value || '—'}</p>
  </div>
);

export default BookDetail;
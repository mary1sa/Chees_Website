import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import './Books.css';
import PageLoading from '../../PageLoading/PageLoading';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axiosInstance.get(`/books/${id}`);
        setBook(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load book');
        console.error('Error fetching book:', err);
      }
    };

    fetchBook();
  }, [id]);

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
            <h2 className="section-title">Description</h2>
            <div className="bio-content">
              {book.description || 'No description available'}
            </div>
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
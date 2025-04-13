import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import '../AdminDashboard/ShowUser.css';
import PageLoading from '../PageLoading/PageLoading';

const ViewBook = ({ bookId, onClose }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axiosInstance.get(`/books/${bookId}`);
        setBook(response.data);
      } catch (error) {
        console.error('Error fetching book:', error);
      }
    };
    fetchBook();
  }, [id]);

  if (!book) return <PageLoading />;

  return (
    <div className="profile-dashboard">
      <button className="back-button" onClick={() => window.history.back()}>
        &larr; Back to List
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            {book.cover_image ? (
              <img
                src={`http://localhost:8000/storage/${book.cover_image}`}
                alt={book.title}
                className="profile-avatar"
              />
            ) : (
              <img src="/book-default.png" alt="No cover" className="profile-avatar" />
            )}
          </div>
          <div className="profile-titles">
            <h1 className="profile-name">{book.title}</h1>
            <p className="profile-role">{book.author?.name || 'Unknown Author'}</p>
            <p className="profile-username">{book.category?.name || 'Uncategorized'}</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="info-section">
            <h2 className="section-title">Book Information</h2>
            <InfoField label="ISBN" value={book.isbn} />
            <InfoField label="Pages" value={book.pages} />
            <InfoField label="Publisher" value={book.publisher} />
            <InfoField label="Publication Date" value={new Date(book.publication_date).toDateString()} />
            <InfoField label="Language" value={book.language} />
            <InfoField label="Format" value={book.format} />
            <InfoField label="Dimensions" value={book.dimensions} />
            <InfoField label="Weight" value={`${book.weight} kg`} />
            <InfoField label="Price" value={`$${parseFloat(book.price).toFixed(2)}`} />
            <InfoField label="Sale Price" value={`$${parseFloat(book.sale_price).toFixed(2)}`} />
            <InfoField label="Stock" value={book.stock} />
            <InfoField label="Featured" value={book.is_featured ? 'Yes' : 'No'} />
            <InfoField label="Active" value={book.is_active ? 'Yes' : 'No'} />
          </div>

          <div className="info-section">
            <h2 className="section-title">Description</h2>
            <div className="bio-content">
              {book.description || 'No description available.'}
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

export default ViewBook;

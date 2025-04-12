import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { FiX } from 'react-icons/fi';
import '../AdminDashboard/UserTable.css';

const ViewBook = ({ bookId, onClose }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axiosInstance.get(`/books/${bookId}`);
        setBook(response.data);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  if (loading) return <div className="loading">Loading book details...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Book Details</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        {book && (
          <div className="book-details">
            <div className="book-cover-container">
              {book.cover_image && (
                <img
                  src={`http://localhost:8000/storage/${book.cover_image}`}
                  alt={book.title}
                  className="large-book-cover"
                />
              )}
            </div>

            <div className="book-info">
              <h3>{book.title}</h3>
              <p><strong>Author:</strong> {book.author?.name || 'Unknown'}</p>
              <p><strong>Category:</strong> {book.category?.name || 'Uncategorized'}</p>
              <p><strong>ISBN:</strong> {book.isbn || 'N/A'}</p>
              <p><strong>Price:</strong> ${book.price?.toFixed(2) || '0.00'}</p>
              <p><strong>Stock:</strong> {book.stock}</p>
              <p><strong>Description:</strong></p>
              <div className="book-description">
                {book.description || 'No description available'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBook;
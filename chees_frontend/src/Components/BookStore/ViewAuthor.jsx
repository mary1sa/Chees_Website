import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import '../AdminDashboard/ShowUser.css';
import PageLoading from '../PageLoading/PageLoading';
import { format } from 'date-fns';

const ViewAuthor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await axiosInstance.get(`/authors/${id}`);
        setAuthor(response.data);
      } catch (error) {
        console.error('Error fetching author:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthor();
  }, [id]);

  if (loading) return <PageLoading />;
  if (!author) return <div className="error-message">Author not found</div>;

  return (
    <div className="profile-dashboard">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to List
      </button>

      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            <img
              src={
                author.photo
                  ? `http://localhost:8000/storage/${author.photo}`
                  : '/default-author.jpg'
              }
              alt={author.name}
              className="profile-avatar"
            />
          </div>
          <div className="profile-titles">
            <h1 className="profile-name">{author.name}</h1>
            <p className="profile-meta">
              <span>ID: #{author.id}</span>
              <span>Books Published: {author.books_count}</span>
            </p>
          </div>
        </div>

        <div className="profile-content">
          <div className="info-section">
            <h2 className="section-title">Author Information</h2>
            <div className="info-grid">
              <InfoField label="Biography" value={author.bio || 'No biography available'} />
              <InfoField label="Created At" value={format(new Date(author.created_at), 'MMMM d, yyyy')} />
              <InfoField label="Last Updated" value={format(new Date(author.updated_at), 'MMMM d, yyyy')} />
            </div>
          </div>

          <div className="info-section">
            <h2 className="section-title">Published Books ({author.books?.length || 0})</h2>
            {author.books && author.books.length > 0 ? (
              <div className="books-list">
                {author.books.map(book => (
                  <div key={book.id} className="book-card">
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <div className="book-meta">
                        <span>ISBN: {book.isbn}</span>
                        <span>${book.price}</span>
                        <span>Pages: {book.pages}</span>
                      </div>
                      <div className="book-details">
                        <InfoField label="Publisher" value={book.publisher} />
                        <InfoField 
                          label="Publication Date" 
                          value={format(new Date(book.publication_date), 'MMMM d, yyyy')} 
                        />
                        <InfoField label="Language" value={book.language} />
                        <InfoField label="Format" value={book.format} />
                      </div>
                    </div>
                    <div className="book-stock">
                      <span className={`stock-status ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {book.stock > 0 ? `in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-books">No books found for this author</div>
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

export default ViewAuthor;
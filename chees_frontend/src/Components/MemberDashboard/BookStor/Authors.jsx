import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import PageLoading from '../../PageLoading/PageLoading';
import './Books.css';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axiosInstance.get('/authors');
        setAuthors(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <PageLoading />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="authors-container">
      <div className="authors-header">
        <h2>Authors</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="authors-grid">
        {filteredAuthors.length > 0 ? (
          filteredAuthors.map(author => (
            <div key={author.id} className="author-card">
              <div className="author-image">
                {author.image ? (
                  <img src={`/storage/${author.image}`} alt={author.name} />
                ) : (
                  <div className="author-image-placeholder">
                    {author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="author-details">
                <h3>
                  <Link to={`/member/dashboard/authors/${author.id}`}>
                    {author.name}
                  </Link>
                </h3>
                <p className="bio">{author.bio?.substring(0, 100)}...</p>
                <div className="books-count">
                  {author.books_count} {author.books_count === 1 ? 'book' : 'books'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No authors found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Authors;
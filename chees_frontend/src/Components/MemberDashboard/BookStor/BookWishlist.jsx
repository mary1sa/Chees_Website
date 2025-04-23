import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import './Books.css';
import { FiHeart, FiShoppingCart, FiBook } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import PageLoading from '../../PageLoading/PageLoading';

const BookWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // Get the user ID from localStorage
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id;
      
      if (!token || !userId) {
        setError('Please log in to view your wishlist');
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.get(`/users/${userId}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      if (response.data.success) {
        // Filter for book items only
        const bookWishlist = response.data.data.filter(item => item.item_type === 'book');
        setWishlistItems(bookWishlist);
        
      } else {
        setError('Failed to fetch wishlist: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Please log in to view your wishlist');
      } else {
        setError('Error fetching wishlist: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user?.id) {
        setError('Please log in to modify your wishlist');
        return;
      }
      
      const response = await axiosInstance.post(`/wishlists/toggle/${bookId}`, {
        item_type: 'book',
        item_id: parseInt(bookId)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Remove the item from the local state
        setWishlistItems(wishlistItems.filter(item => item.item_id !== parseInt(bookId)));
      } else {
        setError('Failed to remove from wishlist: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Please log in to modify your wishlist');
      } else {
        setError('Failed to remove from wishlist: ' + (err.message || 'Unknown error'));
      }
    }
  };

  if (loading) {
    return <PageLoading text="Loading your wishlist..." />;
  }

  if (error) {
    return <div className="book-error">{error}</div>;
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>My Book Wishlist</h1>
        <p>Books you've saved for later</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <FiBook className="wishlist-icon" />
          <h3>Your book wishlist is empty</h3>
          <p>Browse our book collection and add books to your wishlist to save them for later.</p>
          <Link to="/member/dashboard/books" className="browse-books-button">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map(item => (
            <div key={item.id} className="wishlist-card">
              <div className="card-image">
                {item.book?.cover_image ? (
                  <img src={`/storage/${item.book.cover_image}`} alt={item.book.title} />
                ) : (
                  <div className="book-cover-placeholder">
                    <FiBook size={48} />
                  </div>
                )}
                <button 
                  className="remove-wishlist-button"
                  onClick={() => removeFromWishlist(item.item_id)}
                >
                  <FaHeart className="filled-heart" />
                </button>
              </div>
              
              <div className="card-content">
                <h3>
                  <Link to={`/member/dashboard/books/${item.item_id}`}>
                    {item.book?.title || 'Untitled Book'}
                  </Link>
                </h3>
                <p className="card-description">
                  {item.book?.description?.substring(0, 100) || 'No description available'}...
                </p>
                <div className="card-meta">
                  <span className="card-price">
                    ${Number(item.book?.price).toFixed(2) || '0.00'}
                  </span>
                  <span className="card-format">
                    {item.book?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="card-actions">
                  <Link 
                    to={`/member/dashboard/books/${item.item_id}`}
                    className="view-details-button"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/member/dashboard/books/${item.item_id}/order`}
                    className={`order-button ${item.book?.stock <= 0 ? 'disabled' : ''}`}
                  >
                    <FiShoppingCart /> Order Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookWishlist;
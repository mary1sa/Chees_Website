import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';

const CourseWishlist = () => {
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
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      
      if (!userId) {
        setError('User information not found');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`/api/users/${userId}/wishlist`);
      if (response.data.success) {
        setWishlistItems(response.data.data);
      } else {
        setError('Failed to fetch wishlist');
      }
    } catch (err) {
      setError('Error fetching wishlist: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (courseId) => {
    try {
      const response = await axios.post(`/api/wishlists/toggle/${courseId}`);
      if (response.data.success) {
        // Remove the item from the local state
        setWishlistItems(wishlistItems.filter(item => item.course_id !== courseId));
      }
    } catch (err) {
      setError('Failed to remove from wishlist');
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      const response = await axios.post('/api/courses/enroll', {
        course_ids: [courseId]
      });
      
      if (response.data.success) {
        // Remove from wishlist and redirect
        removeFromWishlist(courseId);
        // You can add navigation to enrolled courses here
      }
    } catch (err) {
      setError('Failed to enroll in course: ' + err.message);
    }
  };

  if (loading) {
    return <div className="wishlist-loading">Loading your wishlist...</div>;
  }

  if (error) {
    return <div className="wishlist-error">{error}</div>;
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>Courses you've saved for later</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <FiHeart className="wishlist-icon" />
          <h3>Your wishlist is empty</h3>
          <p>Browse our course catalog and add courses to your wishlist to save them for later.</p>
          <Link to="/member/courses/catalog" className="browse-courses-button">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map(item => (
            <div key={item.id} className="wishlist-card">
              <div className="card-image">
                <img src={item.course.thumbnail || '/course-placeholder.jpg'} alt={item.course.title} />
                <button 
                  className="remove-wishlist-button"
                  onClick={() => removeFromWishlist(item.course_id)}
                >
                  <FiHeart />
                </button>
              </div>
              
              <div className="card-content">
                <h3>{item.course.title}</h3>
                <p className="card-description">{item.course.description.substring(0, 100)}...</p>
                <div className="card-meta">
                  <span className="card-price">${item.course.price.toFixed(2)}</span>
                  <span className="card-format">{item.course.is_online ? 'Online' : 'In-Person'}</span>
                </div>
                
                <div className="card-actions">
                  <Link 
                    to={`/member/courses/${item.course_id}`}
                    className="view-details-button"
                  >
                    View Details
                  </Link>
                  <button 
                    className="enroll-button"
                    onClick={() => enrollInCourse(item.course_id)}
                  >
                    <FiShoppingCart /> Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseWishlist;

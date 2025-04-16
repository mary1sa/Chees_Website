import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import './Courses.css';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import PageLoading from '../PageLoading/PageLoading';

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
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id;
      
      if (!token || !userId) {
        setError('Please log in to view your wishlist');
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.get(`/api/users/${userId}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setWishlistItems(response.data.data);
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

  const removeFromWishlist = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to modify your wishlist');
        return;
      }
      
      const response = await axiosInstance.post(`/api/wishlists/toggle/${courseId}`, {
        item_type: 'course',
        item_id: parseInt(courseId)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Remove the item from the local state
        setWishlistItems(wishlistItems.filter(item => item.item_id !== parseInt(courseId)));
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

  const enrollInCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to enroll in courses');
        return;
      }
      
      const response = await axiosInstance.post('/api/courses/enroll', {
        course_ids: [parseInt(courseId)]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Remove from wishlist and redirect
        removeFromWishlist(courseId);
        // You can add navigation to enrolled courses here
      } else {
        setError('Failed to enroll in course: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Please log in to enroll in courses');
      } else {
        setError('Failed to enroll in course: ' + (err.message || 'Unknown error'));
      }
    }
  };

  if (loading) {
    return <PageLoading text="Loading your wishlist..." />;
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
                <img src={item.course.thumbnail_url || '/course-placeholder.jpg'} alt={item.course.title} />
                <button 
                  className="remove-wishlist-button"
                  onClick={() => removeFromWishlist(item.item_id)}
                >
                  <FiHeart />
                </button>
              </div>
              
              <div className="card-content">
                <h3>{item.course.title}</h3>
                <p className="card-description">{item.course.description?.substring(0, 100) || ''}...</p>
                <div className="card-meta">
                  <span className="card-price">{item.course.price?.toFixed(2) || '0.00'} MAD</span>
                  <span className="card-format">{item.course.is_online ? 'Online' : 'In-Person'}</span>
                </div>
                
                <div className="card-actions">
                  <Link 
                    to={`/member/dashboard/courses/${item.item_id}`}
                    className="view-details-button"
                  >
                    View Details
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

export default CourseWishlist;

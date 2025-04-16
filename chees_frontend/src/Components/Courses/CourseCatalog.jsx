import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import './Courses.css';
import { FiSearch, FiFilter, FiArrowRight } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import PageLoading from '../PageLoading/PageLoading';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseLevels, setCourseLevels] = useState([]);
  const [filters, setFilters] = useState({
    level: '',
    priceRange: [0, 10000]
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [wishlistUpdating, setWishlistUpdating] = useState(false);

  // Fetch courses when component mounts or filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // If user is logged in, get their wishlist status
        if (token && user && user.id) {
          const wishlistResponse = await axiosInstance.get(`/api/users/${user.id}/wishlist`);
          if (wishlistResponse.data.success) {
            const wishlistedIds = wishlistResponse.data.data
              .filter(item => item.item_type === 'course')
              .map(item => item.item_id);

            // Now fetch courses with wishlist info
            await fetchCourseLevels();
            await fetchCourses(wishlistedIds);
          }
        } else {
          // If not logged in, just fetch courses
          await fetchCourseLevels();
          await fetchCourses([]);
        }
      } catch (err) {
        setError('Error loading courses: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchTerm, filters, sortBy, sortDirection]);

  // Toggle course wishlist status
  const toggleWishlist = async (courseId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (wishlistUpdating) return;
    
    try {
      setWishlistUpdating(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !user || !user.id) {
        setError('Please log in to wishlist courses');
        return;
      }

      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      // Optimistically update UI
      setCourses(prevCourses => 
        prevCourses.map(c => 
          c.id === courseId 
            ? { ...c, is_wishlisted: !c.is_wishlisted }
            : c
        )
      );

      // Make API call
      const endpoint = `/api/wishlists/toggle/${courseId}`;
      await axiosInstance.post(endpoint, {
        item_type: 'course'
      });
    } catch (err) {
      setError('Error updating wishlist');
      // Revert on error by refetching
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (token && user && user.id) {
        const wishlistResponse = await axiosInstance.get(`/api/users/${user.id}/wishlist`);
        if (wishlistResponse.data.success) {
          const wishlistedIds = wishlistResponse.data.data
            .filter(item => item.item_type === 'course')
            .map(item => item.item_id);
          await fetchCourses(wishlistedIds);
        }
      }
    } finally {
      setWishlistUpdating(false);
    }
  };

  const fetchCourseLevels = async () => {
    try {
      const response = await axiosInstance.get('/api/course-levels');
      if (response.data.success) {
        setCourseLevels(response.data.data);
      } else {
        console.error('Failed to fetch course levels');
      }
    } catch (err) {
      console.error('Error fetching course levels:', err.message);
    }
  };

  const fetchCourses = async (wishlistedIds = []) => {
    try {
      let queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filters.level) {
        queryParams.append('level_id', filters.level);
      }
      
      queryParams.append('sort_by', sortBy);
      queryParams.append('sort_direction', sortDirection);
      
      const response = await axiosInstance.get(`/api/courses?${queryParams.toString()}`);
      
      if (response.data.success) {
        const coursesData = response.data.data.data.map(course => ({
          ...course,
          is_wishlisted: wishlistedIds.includes(course.id)
        }));
        setCourses(coursesData);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      setError('Error fetching courses: ' + err.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [field, direction] = value.split('-');
    setSortBy(field);
    setSortDirection(direction);
  };


  if (loading) {
    return <PageLoading text="Loading courses..." />;
  }

  if (error) {
    return <div className="courses-error">{error}</div>;
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1>Course Catalog</h1>
        <p>Explore our wide range of chess courses for all skill levels</p>
      </div>

      <div className="courses-controls">
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-section">
          <div className="filter-label">
            <FiFilter />
            <span>Filters</span>
          </div>
          
          <select 
            onChange={(e) => handleFilterChange('level', e.target.value)}
            value={filters.level}
          >
            <option value="">All Levels</option>
            {courseLevels.map(level => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          
          <select
            onChange={handleSortChange}
            value={`${sortBy}-${sortDirection}`}
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="title-asc">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="no-courses">
          <p>No courses found matching your criteria.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card-wrapper">
              <Link 
                to={`/member/dashboard/courses/${course.id}`} 
                className="course-card"
              >
                <div className="course-image">
                  <img src={course.thumbnail_url || '/course-placeholder.jpg'} alt={course.title} />
                  <div className="course-overlay">
                    <button 
                      className={`heart-button ${course.is_wishlisted ? 'active' : ''}`}
                      onClick={(e) => toggleWishlist(course.id, e)}
                    >
                      <FaHeart size={30} />
                    </button>
                  </div>
                </div>
              <div className="course-content">
                <div className="course-level">
                  {course.level && course.level.name ? (
                    course.level.name
                  ) : (
                    <span className="course-level-placeholder">Level not specified</span>
                  )}
                </div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description.substring(0, 100)}...</p>
                <div className="course-details">
                  <span className="course-price">{course.price.toFixed(2)} MAD</span>
                  <span className="course-duration">{course.duration} hours</span>
                </div>
                <div className="course-format">{course.is_online ? 'Online' : 'In-Person'}</div>
                <div className="view-course">
                  <span>View Details</span>
                  <FiArrowRight />
                </div>
              </div>
            </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';
import { FiHeart, FiSearch, FiFilter, FiArrowRight } from 'react-icons/fi';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    isOnline: null,
    priceRange: [0, 10000]
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, filters, sortBy, sortDirection]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filters.level) {
        queryParams.append('level_id', filters.level);
      }
      
      if (filters.isOnline !== null) {
        queryParams.append('is_online', filters.isOnline);
      }
      
      queryParams.append('sort_by', sortBy);
      queryParams.append('sort_direction', sortDirection);
      
      const response = await axios.get(`/api/courses?${queryParams.toString()}`);
      if (response.data.success) {
        setCourses(response.data.data.data);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      setError('Error fetching courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (courseId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      const response = await axios.post(`/api/wishlists/toggle/${courseId}`);
      if (response.data.success) {
        // Refresh the courses list to update wishlist status
        fetchCourses();
      }
    } catch (err) {
      setError('Failed to update wishlist');
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
    return <div className="courses-loading">Loading courses...</div>;
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
            <option value="1">Beginner</option>
            <option value="2">Intermediate</option>
            <option value="3">Advanced</option>
          </select>
          
          <select 
            onChange={(e) => handleFilterChange('isOnline', e.target.value === '' ? null : e.target.value === 'true')}
            value={filters.isOnline === null ? '' : filters.isOnline.toString()}
          >
            <option value="">All Formats</option>
            <option value="true">Online</option>
            <option value="false">In-Person</option>
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
            <Link 
              to={`/member/courses/${course.id}`} 
              key={course.id}
              className="course-card"
            >
              <div className="course-image">
                <img src={course.thumbnail || '/course-placeholder.jpg'} alt={course.title} />
                <button 
                  className={`wishlist-button ${course.is_wishlisted ? 'wishlisted' : ''}`}
                  onClick={(e) => toggleWishlist(course.id, e)}
                >
                  <FiHeart />
                </button>
              </div>
              <div className="course-content">
                <div className="course-level">{course.level?.name || 'All Levels'}</div>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description.substring(0, 100)}...</p>
                <div className="course-details">
                  <span className="course-price">${course.price.toFixed(2)}</span>
                  <span className="course-duration">{course.duration} hours</span>
                </div>
                <div className="course-format">{course.is_online ? 'Online' : 'In-Person'}</div>
                <div className="view-course">
                  <span>View Details</span>
                  <FiArrowRight />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;

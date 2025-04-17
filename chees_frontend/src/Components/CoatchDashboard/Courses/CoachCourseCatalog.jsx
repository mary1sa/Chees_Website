import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import '../../Courses/Courses.css';
import './CoachCourses.css';
import { FiSearch, FiFilter, FiArrowRight, FiBook, FiCalendar, FiUsers } from 'react-icons/fi';
import PageLoading from '../../PageLoading/PageLoading';

const CoachCourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseLevels, setCourseLevels] = useState([]);
  const [filters, setFilters] = useState({
    level: '',
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch courses when component mounts or filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch course levels and courses data
        await fetchCourseLevels();
        await fetchCourses();
      } catch (err) {
        setError('Error loading courses: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchTerm, filters, sortBy, sortDirection]);

  const fetchCourseLevels = async () => {
    try {
      const response = await axiosInstance.get('/api/course-levels');
      if (response.data.success) {
        setCourseLevels(response.data.data);
      }
    } catch (err) {
      setError('Error fetching course levels: ' + err.message);
    }
  };

  const fetchCourses = async () => {
    try {
      // Build query parameters using URLSearchParams for consistency
      let queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filters.level) {
        queryParams.append('level_id', filters.level);
      }
      
      queryParams.append('sort_by', sortBy);
      queryParams.append('sort_direction', sortDirection);
      
      // Fetch all courses without purchase restrictions
      const response = await axiosInstance.get(`/api/courses?${queryParams.toString()}`);
      console.log('API Response:', response.data); // Debug log
      
      if (response.data.success && response.data.data) {
        // Access the nested data structure correctly for paginated response
        // Format: response.data.data.data where data.data contains pagination metadata
        const paginatedData = response.data.data;
        const coursesData = paginatedData.data;
        
        if (Array.isArray(coursesData)) {
          setCourses(coursesData);
          console.log('Loaded courses:', coursesData.length);
        } else {
          console.warn('Courses data is not an array:', coursesData);
          setCourses([]);
        }
      } else {
        console.warn('API request not successful or missing data');
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Error fetching courses: ' + err.message);
      setCourses([]); // Set empty array on error
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
    <div className="coach-courses-container">
      <div className="courses-header">
        <h1>All Courses</h1>
        <p>Access all courses and materials as a coach</p>
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
                to={`/coach/dashboard/courses/${course.id}`} 
                className="course-card"
              >
                <div className="course-image">
                  <img src={course.thumbnail_url || '/course-placeholder.jpg'} alt={course.title} />
                  <div className="coach-course-badge">
                    <FiBook /> Coach Access
                  </div>
                </div>

                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  
                  <div className="course-meta">
                    <span className="course-level">
                      {course.level?.name || 'All Levels'}
                    </span>
                  </div>
                  
                  <div className="view-details">
                    View Course <FiArrowRight />
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

export default CoachCourseCatalog;

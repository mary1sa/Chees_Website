import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiGrid, FiList, FiFileText } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './CourseManagement.css';
import '../../AdminDashboard/UserTable.css';
import PageLoading from '../../PageLoading/PageLoading';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [levels, setLevels] = useState([]);
  
  useEffect(() => {
    fetchLevels();
    fetchCourses();
  }, [searchTerm, filterStatus, filterLevel, currentPage]);
  
  const fetchLevels = async () => {
    try {
      const response = await axiosInstance.get('/api/course-levels');
      if (response.data.success) {
        setLevels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filterStatus !== 'all') {
        queryParams.append('is_active', filterStatus === 'active' ? 1 : 0);
      }
      
      if (filterLevel !== 'all') {
        queryParams.append('level_id', filterLevel);
      }
      
      queryParams.append('page', currentPage);
      
      const response = await axiosInstance.get(`/api/courses?${queryParams.toString()}`);
      if (response.data.success) {
        console.log('Courses data:', response.data.data.data);
        setCourses(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Error loading courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }
    
    try {
      const response = await axiosInstance.delete(`/api/courses/${courseId}`);
      if (response.data.success) {
        // Refresh the courses list
        fetchCourses();
      } else {
        setError('Failed to delete course');
      }
    } catch (err) {
      setError(`Error deleting course: ${err.message}`);
    }
  };
  
  const handleStatusToggle = async (courseId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(`/api/courses/${courseId}`, {
        is_active: !currentStatus
      });
      
      if (response.data.success) {
        // Update the course in the list
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course.id === courseId 
              ? { ...course, is_active: !currentStatus } 
              : course
          )
        );
      }
    } catch (err) {
      setError(`Error updating course status: ${err.message}`);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };
  
  const handleLevelFilterChange = (e) => {
    setFilterLevel(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  if (loading) {
    return (
      <PageLoading text="Loading courses..." />
    );
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="table-container">
      <h1 className="table-title">Course Management</h1>
      
      
      <div>
        <div className="filter-controls">
          <div className="filter-group">
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <select 
              value={filterStatus} 
              onChange={handleStatusFilterChange}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select 
              value={filterLevel} 
              onChange={handleLevelFilterChange}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {courses.length === 0 ? (
          <div className="no-results">
            <FiGrid />
            <h3>No courses found</h3>
            <p>There are no courses matching your search criteria. Try adjusting your filters or create a new course.</p>
            <Link to="/admin/dashboard/createcourse" className="action-button primary-button">
              <FiPlus /> Create Course
            </Link>
          </div>
        ) : (
          <>
            <div className="data-table">
              <div className="table-header">
                <div className="header-cell">Title</div>
                <div className="header-cell">Level</div>
                <div className="header-cell">Price</div>
                <div className="header-cell">Enrollments</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Actions</div>
              </div>
              
              {courses.map(course => (
                <div className="table-row" key={course.id}>
                  <div className="table-cell">
                    <div className="profile-image-container">
                      <div className="user-info">
                        <div className="name-container">
                          <Link to={`/admin/dashboard/courses/${course.id}`} className="user-name" style={{ textDecoration: 'none' }}>
                        {course.title}
                      </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    {course.level?.name || 
                     levels.find(l => l.id === course.level_id)?.name || 
                     'Not set'}
                  </div>
                  
                  <div className="table-cell">
                    {course.price.toFixed(2)} MAD
                  </div>
                  
                  <div className="table-cell">
                    {course.enrollments_count || 0}
                  </div>
                  
                  <div className="table-cell">
                    <span 
                      className={`status-badge ${course.is_active ? 'active' : 'inactive'}`}
                      onClick={() => handleStatusToggle(course.id, course.is_active)}
                      style={{ cursor: 'pointer' }}
                    >
                      {course.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="table-cell actions">
                    <Link 
                      to={`/admin/dashboard/courses/${course.id}`}
                      className="action-btn view-btn"
                      title="View Course"
                    >
                      <FiEye className="action-icon-button-view" />
                    </Link>
                    
                    <Link 
                        to={`/admin/dashboard/courses/${course.id}/edit`}
                        className="action-btn update-btn"
                        title="Edit Course"
                      >
                        <FiEdit className="icon" />
                      </Link>
                    
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(course.id)}
                      title="Delete Course"
                    >
                      <FiTrash2 className="icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pagination">
              <button 
                className="pagination-button pagination-nav"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <FiChevronLeft className="icon" /> Previous
              </button>
              
              {/* First page is always shown */}
              {totalPages > 0 && (
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
                >
                  1
                </button>
              )}
              
              {/* Show ellipsis if there's a gap between first page and other visible pages */}
              {currentPage > 3 && (
                <span className="pagination-ellipsis">...</span>
              )}
              
              {/* Show pages before and after current page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show pages adjacent to current, but not first or last page (we handle those separately)
                  return page !== 1 && page !== totalPages && Math.abs(page - currentPage) <= 1;
                })
                .map(page => (
                  <button 
                    key={page}
                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              
              {/* Show ellipsis if there's a gap between last page and other visible pages */}
              {currentPage < totalPages - 2 && (
                <span className="pagination-ellipsis">...</span>
              )}
              
              {/* Last page is always shown if there are multiple pages */}
              {totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                >
                  {totalPages}
                </button>
              )}
              
              <button 
                className="pagination-button pagination-nav"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight className="icon" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseList;

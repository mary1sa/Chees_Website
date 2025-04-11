import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiUserCheck, FiDownload, FiX } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './EnrollmentManagement.css';
import PageLoading from '../../PageLoading/PageLoading';

const EnrollmentList = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [searchTerm, filterCourse, filterStatus, currentPage]);
  
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/api/courses');
      if (response.data.success) {
        setCourses(response.data.data.data || response.data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };
  
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filterCourse) {
        queryParams.append('course_id', filterCourse);
      }
      
      if (filterStatus) {
        queryParams.append('status', filterStatus);
      }
      
      queryParams.append('page', currentPage);
      
      const response = await axiosInstance.get(`/api/enrollments?${queryParams.toString()}`);
      
      if (response.data.success) {
        setEnrollments(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      } else {
        setError('Failed to fetch enrollments');
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError(`Error loading enrollments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }
    
    try {
      const response = await axiosInstance.delete(`/api/enrollments/${enrollmentId}`);
      
      if (response.data.success) {
        // Refresh the enrollments list
        fetchEnrollments();
      } else {
        setError(response.data.message || 'Failed to delete enrollment');
      }
    } catch (err) {
      console.error('Error deleting enrollment:', err);
      setError(`Error deleting enrollment: ${err.message}`);
    }
  };
  
  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`/api/enrollments/${enrollmentId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        // Refresh the enrollments list
        fetchEnrollments();
      } else {
        setError(response.data.message || 'Failed to update enrollment status');
      }
    } catch (err) {
      console.error('Error updating enrollment status:', err);
      setError(`Error updating status: ${err.message}`);
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get('/api/enrollments/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'enrollments.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting enrollments:', err);
      setError(`Error exporting data: ${err.message}`);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCourse('');
    setFilterStatus('');
    setCurrentPage(1);
  };
  
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };
  
  return (
    <div className="enrollment-list-container">
      <div className="enrollment-list-header">
        <h2><FiUserCheck /> Course Enrollments</h2>
        <div className="header-actions">
          <button 
            className="filter-toggle-btn" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button 
            className="export-btn" 
            onClick={handleExportCSV}
          >
            <FiDownload /> Export CSV
          </button>
          <Link to="/admin/dashboard/createenrollment" className="add-enrollment-btn">
            <FiPlus /> Add Enrollment
          </Link>
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by student name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Course</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>&nbsp;</label>
              <button 
                className="clear-filters-btn" 
                onClick={clearFilters}
              >
                <FiX /> Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <PageLoading text="Loading enrollments..." />
      ) : (
        <div className="enrollment-grid">
          {enrollments.length === 0 ? (
            <div className="no-enrollments-message">
              <p>No enrollments found.</p>
              {(searchTerm || filterCourse || filterStatus) && (
                <p>Try clearing your filters or adding a new enrollment.</p>
              )}
            </div>
          ) : (
            <>
              <table className="enrollment-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Enrollment Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.user?.first_name} {enrollment.user?.last_name}</td>
                      <td>{enrollment.course?.title}</td>
                      <td>{new Date(enrollment.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="status-dropdown">
                          <select
                            className={getStatusClass(enrollment.status)}
                            value={enrollment.status}
                            onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        {enrollment.payment_status === 'paid' ? (
                          <span className="status-active">Paid</span>
                        ) : (
                          <span className="status-pending">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{enrollment.progress || 0}%</span>
                      </td>
                      <td className="action-buttons">
                        <Link
                          to={`/admin/dashboard/enrollments/edit/${enrollment.id}`}
                          className="edit-button"
                          title="Edit Enrollment"
                        >
                          <FiEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(enrollment.id)}
                          className="delete-button"
                          title="Delete Enrollment"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrollmentList;

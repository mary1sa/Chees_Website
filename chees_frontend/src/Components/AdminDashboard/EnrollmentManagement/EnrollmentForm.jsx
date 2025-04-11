import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiUserCheck } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './EnrollmentManagement.css';

const EnrollmentForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { enrollmentId } = useParams();
  
  const [formData, setFormData] = useState({
    user_id: '',
    course_id: '',
    status: 'active',
    payment_status: 'paid',
    payment_method: 'cash',
    payment_amount: 0,
  });
  
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    fetchUsers();
    fetchCourses();
    
    if (isEditing && enrollmentId) {
      fetchEnrollmentDetails();
    }
  }, [isEditing, enrollmentId]);
  
  useEffect(() => {
    if (formData.course_id && courses.length > 0) {
      const course = courses.find(c => c.id === parseInt(formData.course_id));
      setSelectedCourse(course);
      if (course) {
        setFormData(prev => ({
          ...prev,
          payment_amount: course.price
        }));
      }
    }
  }, [formData.course_id, courses]);
  
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/users?role=member');
      if (response.data.success) {
        setUsers(response.data.data.data || response.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };
  
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/api/courses?is_active=1');
      if (response.data.success) {
        setCourses(response.data.data.data || response.data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };
  
  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/enrollments/${enrollmentId}`);
      
      if (response.data.success) {
        const enrollmentData = response.data.data;
        setFormData({
          user_id: enrollmentData.user_id.toString(),
          course_id: enrollmentData.course_id.toString(),
          status: enrollmentData.status || 'active',
          payment_status: enrollmentData.payment_status || 'paid',
          payment_method: enrollmentData.payment_method || 'cash',
          payment_amount: enrollmentData.payment_amount || 0
        });
      } else {
        setError('Failed to fetch enrollment details');
      }
    } catch (err) {
      console.error('Error fetching enrollment details:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (isEditing) {
        // Update existing enrollment
        response = await axiosInstance.put(`/api/enrollments/${enrollmentId}`, formData);
      } else {
        // Create new enrollment
        response = await axiosInstance.post('/api/enrollments', formData);
      }
      
      if (response.data.success) {
        setSuccess(response.data.message || `Enrollment ${isEditing ? 'updated' : 'created'} successfully!`);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/admin/dashboard/enrollments');
        }, 2000);
      } else {
        setError(response.data.message || 'An error occurred');
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} enrollment:`, err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/dashboard/enrollments');
  };
  
  return (
    <div className="enrollment-form-container">
      <h2><FiUserCheck /> {isEditing ? 'Edit' : 'Add'} Enrollment</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="enrollment-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="user_id">Student*</label>
            <select
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a Student</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} - {user.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="course_id">Course*</label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedCourse && (
          <div className="course-details">
            <h3>Course Details</h3>
            <p><strong>Level:</strong> {selectedCourse.level?.name || 'N/A'}</p>
            <p><strong>Price:</strong> ${selectedCourse.price}</p>
            <p><strong>Duration:</strong> {selectedCourse.duration} minutes</p>
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Enrollment Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="payment_status">Payment Status</label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="payment_method">Payment Method</label>
            <select
              id="payment_method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="payment_amount">Payment Amount ($)</label>
            <input
              type="number"
              id="payment_amount"
              name="payment_amount"
              value={formData.payment_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            <FiSave /> {loading ? `${isEditing ? 'Updating' : 'Creating'}...` : `${isEditing ? 'Update' : 'Create'} Enrollment`}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            <FiX /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm;

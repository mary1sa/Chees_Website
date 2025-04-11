import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiCalendar, FiClock, FiUsers, FiVideo, FiMap, FiRefreshCw } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './SessionManagement.css';
import PageLoading from '../../PageLoading/PageLoading';

const SessionScheduler = ({ isEditing, onLoadingChange }) => {
  const [sessionId, setSessionId] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    coach_id: null,
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    zoom_link: '',
    meeting_id: '',
    meeting_password: '',
    max_participants: 20,
    is_recorded: false,
    recording_url: ''
  });
  
  const [courses, setCourses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        onLoadingChange(true);
        
        await Promise.all([
          fetchCourses(),
          fetchCoaches()
        ]);
        
        // If editing, extract the session ID from the URL and fetch the session data
        if (isEditing) {
          const path = window.location.pathname;
          const id = path.split('/').pop();
          setSessionId(id);
          await fetchSessionData(id);
        }
      } finally {
        setLoading(false);
        onLoadingChange(false);
      }
    };
    
    initializeComponent();
  }, [isEditing]);
  
  const fetchSessionData = async (id) => {
    try {
      const response = await axiosInstance.get(`/api/course-sessions/${id}`);
      
      if (response.data.success) {
        const sessionData = response.data.data;
        
        // Update form data with the fetched session data
        setFormData({
          course_id: sessionData.course_id?.toString() || '',
          coach_id: sessionData.coach_id,
          title: sessionData.title || '',
          description: sessionData.description || '',
          start_datetime: formatDateTimeForInput(sessionData.start_datetime),
          end_datetime: formatDateTimeForInput(sessionData.end_datetime),
          zoom_link: sessionData.zoom_link || '',
          meeting_id: sessionData.meeting_id || '',
          meeting_password: sessionData.meeting_password || '',
          max_participants: sessionData.max_participants || 20,
          is_recorded: sessionData.is_recorded || false,
          recording_url: sessionData.recording_url || ''
        });
      } else {
        setError('Failed to fetch session: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching session:', err.response || err);
      setError(`Error fetching session: ${err.message}. ${err.response?.data?.message || ''}`);
    }
  };
  
  // Format datetime string from API to be usable in datetime-local input
  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const response = await axiosInstance.get('/api/courses?is_active=1');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setCourses(response.data.data.data);
      } else {
        setError('Failed to fetch courses: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching courses:', err.response || err);
      setError(`Error fetching courses: ${err.message}. ${err.response?.data?.message || ''}`);
    }
  };
  
  const fetchCoaches = async () => {
    try {
      // First try to get coaches from users with role_id 2
      try {
        const response = await axiosInstance.get('/api/users');
        if (response.data && Array.isArray(response.data)) {
          // Filter users where role_id === 2 (coaches)
          const coachUsers = response.data.filter(user => user.role_id === 2);
          console.log('Found coaches from users API:', coachUsers);
          if (coachUsers.length > 0) {
            setCoaches(coachUsers);
            return;
          }
        }
      } catch (apiErr) {
        console.log('Error fetching from /api/users:', apiErr);
      }
      
      // If users API didn't work, try the coaches endpoint
      try {
        const response = await axiosInstance.get('/api/coaches');
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          console.log('Coaches from dedicated API:', response.data.data);
          setCoaches(response.data.data || []);
          return;
        }
      } catch (coachApiErr) {
        console.log('Error fetching from /api/coaches:', coachApiErr);
      }
      
      // Fallback to hardcoded coaches if all else fails
      console.log('Using fallback coach data');
      const hardcodedCoaches = [
        {
          id: 2,
          username: 'coach1',
          first_name: 'Coach',
          last_name: 'One',
          role_id: 2,
          email: 'coach1@chessclub.com'
        }
      ];
      setCoaches(hardcodedCoaches);
      
    } catch (err) {
      console.error('Error in fetchCoaches:', err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Declare sessionData outside the try block so it's available in the catch block
    let sessionData = {};
    
    try {
      // Format the session data for API - include all database fields directly
      sessionData = {
        course_id: formData.course_id,
        title: formData.title,
        description: formData.description,
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime,
        zoom_link: formData.zoom_link || '',
        meeting_id: formData.meeting_id || '',
        meeting_password: formData.meeting_password || '',
        max_participants: parseInt(formData.max_participants, 10) || 20,
        is_recorded: formData.is_recorded || false,
        recording_url: formData.recording_url || ''
      };
      
      // Only add coach_id if a valid value is selected
      if (formData.coach_id && formData.coach_id !== '') {
        // Convert coach_id to number to ensure proper comparison
        const coachIdNum = parseInt(formData.coach_id, 10);
        
        // Debug coach data
        console.log('Available coaches:', coaches);
        console.log('Selected coach_id:', formData.coach_id, 'as number:', coachIdNum);
        
        // Verify the coach user exists in our loaded coaches list (compare as numbers)
        const coachExists = coaches.some(user => {
          const userId = typeof user.id === 'number' ? user.id : parseInt(user.id, 10);
          return userId === coachIdNum;
        });
        
        console.log('Coach exists in list?', coachExists);
        
        if (coachExists) {
          // Make sure to use the numeric version of the ID
          sessionData.coach_id = coachIdNum;
        } else {
          console.warn('Selected coach not found in coaches list - omitting from request');
        }
      }
      
      let response;
      
      if (isEditing) {
        // If editing, use PUT to update the session
        response = await axiosInstance.put(`/api/course-sessions/${sessionId}`, sessionData);
      } else {
        // If creating, use POST to create a new session
        response = await axiosInstance.post('/api/course-sessions', sessionData);
      }
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Session(s) scheduled successfully!');
        // Reset form after successful submission
        setFormData({
          course_id: '',
          coach_id: null,
          title: '',
          description: '',
          start_datetime: '',
          end_datetime: '',
          zoom_link: '',
          meeting_id: '',
          meeting_password: '',
          max_participants: 20,
          is_recorded: false,
          recording_url: ''
        });
      } else {
        setError(response.data.message || 'Failed to schedule session.');
      }
    } catch (err) {
      console.error('Error scheduling session:', err);
      
      // Enhanced error handling to show detailed validation errors
      if (err.response?.data?.errors) {
        // Format validation errors
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        
        setError(`Validation errors:\n${errorMessages}`);
        console.log('Validation errors:', err.response.data.errors);
      console.log('Form data that was sent:', sessionData);
      } else {
        setError(err.response?.data?.message || 'An error occurred while scheduling the session.');
      }
      
      // Also log the data that was sent to help with debugging
      console.log('Form data that was sent:', sessionData);
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    // Reset form
    setFormData({
      course_id: '',
      coach_id: null,
      title: '',
      description: '',
      start_datetime: '',
      end_datetime: '',
      zoom_link: '',
      meeting_id: '',
      meeting_password: '',
      max_participants: 20,
      is_recorded: false,
      recording_url: ''
    });
    setError(null);
    setSuccess(null);
  };
  
  // Get min date for datepicker (today)
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Function to generate future recurrence end date (3 months from now by default)
  const getDefaultRecurrenceEndDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Set default recurrence end date when recurring is toggled on
  useEffect(() => {
    if (formData.is_recurring && !formData.recurrence_end_date) {
      setFormData(prev => ({
        ...prev,
        recurrence_end_date: getDefaultRecurrenceEndDate()
      }));
    }
  }, [formData.is_recurring]);
  
  return (
    <div className="session-scheduler">
      {loading && <PageLoading />}
      
      {!loading && (
        <>
          <h2>{isEditing ? 'Edit Session' : 'Schedule New Session'}</h2>
          
          {/* Error and success messages */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button className="retry-button" onClick={fetchCourses}>
                <FiRefreshCw /> Retry
              </button>
              <p className="error-hint">
                Note: Please check that your Laravel backend is running and the courses API endpoint is properly configured.
              </p>
            </div>
          )}
          
          {success && <div className="success-message">{success}</div>}
          
          {/* Session form (will render when data loading is complete) */}
          {!error && (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Course</label>
                  <select 
                    name="course_id" 
                    value={formData.course_id} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Session Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange}
                    placeholder="e.g. Introduction to Chess Openings"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    placeholder="Brief description of what will be covered in this session"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label><FiCalendar /> Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="start_datetime" 
                    value={formData.start_datetime} 
                    onChange={handleChange}
                    required
                    min={`${getTodayString()}T00:00`}
                  />
                </div>
                
                <div className="form-group">
                  <label><FiClock /> End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="end_datetime" 
                    value={formData.end_datetime} 
                    onChange={handleChange}
                    required
                    min={formData.start_datetime || `${getTodayString()}T00:00`}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Coach (Optional)</label>
                  <select 
                    name="coach_id" 
                    value={formData.coach_id || ''} 
                    onChange={handleChange}
                  >
                    <option value="">Select a coach</option>
                    {coaches && coaches.length > 0 ? (
                      coaches.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name || (user.first_name && user.last_name ? 
                            `${user.first_name} ${user.last_name}` : 
                            `Coach #${user.id}`)}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No coaches available</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="form-section">
                <h3 className="form-section-title"><FiVideo /> Online Meeting Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label><span className="label-title">Zoom Link</span></label>
                    <input 
                      type="url" 
                      name="zoom_link" 
                      value={formData.zoom_link} 
                      onChange={handleChange}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Meeting ID</label>
                    <input 
                      type="text" 
                      name="meeting_id" 
                      value={formData.meeting_id} 
                      onChange={handleChange}
                      placeholder="123 456 7890"
                    />
                  </div>
                  <div className="form-group">
                    <label>Meeting Password</label>
                    <input 
                      type="text" 
                      name="meeting_password" 
                      value={formData.meeting_password} 
                      onChange={handleChange}
                      placeholder="abc123"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3 className="form-section-title"><FiUsers /> Session Settings</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label> <span className="label-title">Maximum Participants</span></label>
                    <input 
                      type="number" 
                      name="max_participants" 
                      value={formData.max_participants} 
                      onChange={handleChange}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="is_recorded" 
                      name="is_recorded" 
                      checked={formData.is_recorded} 
                      onChange={handleChange}
                    />
                    <label htmlFor="is_recorded">This session will be recorded</label>
                  </div>
                </div>
                
                {formData.is_recorded && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Recording URL</label>
                      <input 
                        type="url" 
                        name="recording_url" 
                        value={formData.recording_url} 
                        onChange={handleChange}
                        placeholder="https://zoom.us/rec/..."
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* We removed the recurrence options since they're not directly in the database schema */}
              
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FiSave /> {loading ? (isEditing ? 'Updating...' : 'Scheduling...') : (isEditing ? 'Update Session' : 'Schedule Session')}
                </button>
                {!isEditing && (
                  <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>
                    <FiX /> Clear Form
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => window.location.href = '/admin/dashboard/sessions'} 
                  disabled={loading}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </form>
          )}
        </> 
      )}
    </div>
  );
};

export default SessionScheduler;

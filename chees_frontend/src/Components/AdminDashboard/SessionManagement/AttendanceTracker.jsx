import React, { useState, useEffect, useRef } from 'react';
import { FiUsers, FiCalendar, FiCheck, FiX, FiMoreVertical, FiDownload, FiFilter } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './SessionManagement.css';

const AttendanceTracker = ({ onLoadingChange }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        onLoadingChange(true);
        
        await Promise.all([
          fetchCourses(),
          fetchSessions()
        ]);
      } finally {
        setLoading(false);
        onLoadingChange(false);
      }
    };
    
    // Add click outside listener to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    initializeComponent();
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (courseFilter || dateFilter) {
      const updateFilters = async () => {
        try {
          setLoading(true);
          onLoadingChange(true);
          await fetchSessions();
        } finally {
          setLoading(false);
          onLoadingChange(false);
        }
      };
      
      updateFilters();
    }
  }, [courseFilter, dateFilter]);
  
  useEffect(() => {
    if (selectedSession) {
      const getAttendance = async () => {
        try {
          setLoading(true);
          onLoadingChange(true);
          await fetchAttendance();
        } finally {
          setLoading(false);
          onLoadingChange(false);
        }
      };
      
      getAttendance();
    } else {
      setAttendanceList([]);
    }
  }, [selectedSession]);
  
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/api/courses');
      if (response.data.success) {
        setCourses(response.data.data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };
  
  const fetchSessions = async () => {
    try {
      let url = '/api/course-sessions';
      let params = [];
      
      if (courseFilter) {
        params.push(`course_id=${courseFilter}`);
      }
      
      if (dateFilter) {
        params.push(`date=${dateFilter}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        setSessions(response.data.data);
        // Reset selected session if it's no longer in the list
        if (selectedSession && !response.data.data.find(s => s.id === selectedSession)) {
          setSelectedSession('');
        }
      } else {
        setError('Failed to fetch sessions');
      }
    } catch (err) {
      setError(`Error fetching sessions: ${err.message}`);
    }
  };
  
  const fetchAttendance = async () => {
    try {
      setError('');
      const response = await axiosInstance.get(`/api/session-attendances`, {
        params: { session_id: selectedSession }
      });
      if (response.data.success) {
        setAttendanceList(response.data.data);
      } else {
        setError('Failed to fetch attendance data');
        setAttendanceList([]);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(`Error fetching attendance: ${err.response?.status === 404 ? 'No attendance records found for this session' : err.message}`);
      setAttendanceList([]);
    }
  };
  
  const updateAttendanceStatus = async (attendanceId, status) => {
    try {
      const response = await axiosInstance.patch(`/api/session-attendances/${attendanceId}`, {
        status
      });
      
      if (response.data.success) {
        // Update attendance in the list
        setAttendanceList(prevList => 
          prevList.map(item => 
            item.id === attendanceId ? { ...item, status } : item
          )
        );
        
        setSuccess('Attendance updated successfully');
        // Clear success message after a few seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(`Error updating attendance: ${err.message}`);
      // Clear error message after a few seconds
      setTimeout(() => setError(null), 5000);
    }
  };
  
  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };
  
  const bulkUpdateAttendance = async (status) => {
    try {
      const attendanceIds = attendanceList.map(item => item.id);
      
      const response = await axiosInstance.post('/api/session-attendances/bulk-update', {
        attendance_ids: attendanceIds,
        status
      });
      
      if (response.data.success) {
        // Update all attendance items
        setAttendanceList(prevList => 
          prevList.map(item => ({ ...item, status }))
        );
        
        setSuccess('Attendance updated in bulk successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(`Error updating attendance: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };
  
  const exportAttendance = () => {
    // In a real application, this would call an API endpoint that returns a CSV file
    // For now, we'll create a simple CSV on the client side
    if (attendanceList.length === 0) {
      setError('No attendance data to export');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Get the session details for the filename
    const session = sessions.find(s => s.id === selectedSession);
    if (!session) return;
    
    // Create CSV content
    const headers = ['Student ID', 'Student Name', 'Email', 'Status', 'Timestamp'];
    let csvContent = headers.join(',') + '\n';
    
    attendanceList.forEach(item => {
      const row = [
        item.user.id,
        `"${item.user.name}"`, // Wrap in quotes to handle names with commas
        item.user.email,
        item.status,
        item.updated_at
      ];
      csvContent += row.join(',') + '\n';
    });
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date(session.start_datetime || session.start_time).toISOString().split('T')[0];
    const courseTitle = courses.find(c => c.id === session.course_id)?.title || 'Unknown_Course';
    const filename = `attendance_${courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateStr}.csv`;
    
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="session-management-container">
      <div className="section-header">
        <h2 className="section-title">Attendance Tracker</h2>
        
        <div className="section-actions">
          {selectedSession && attendanceList.length > 0 && (
            <button className="action-button secondary-button" onClick={exportAttendance}>
              <FiDownload /> Export CSV
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      <div className="attendance-tracker-container">
        <div className="attendance-header">
          <div className="attendance-filters">
            <div className="filter-group">
              <span className="filter-label">Filter by Course</span>
              <div className="filter-control">
                <select 
                  value={courseFilter} 
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="filter-group">
              <span className="filter-label">Filter by Date</span>
              <div className="filter-control">
                <input 
                  type="date" 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <span className="filter-label">Select Session</span>
              <div className="filter-control">
                <select 
                  value={selectedSession} 
                  onChange={(e) => setSelectedSession(e.target.value)}
                  disabled={loading || sessions.length === 0}
                >
                  <option value="">Select a session</option>
                  {sessions.map(session => {
                    const courseTitle = courses.find(c => c.id === session.course_id)?.title || 'Unknown Course';
                    const sessionDate = new Date(session.start_datetime || session.start_time);
                    const formattedDate = !isNaN(sessionDate.getTime()) ? sessionDate.toLocaleDateString() : 'Invalid Date';
                    const formattedTime = !isNaN(sessionDate.getTime()) ? sessionDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Invalid Time';
                    return (
                      <option key={session.id} value={session.id}>
                        {courseTitle} - {formattedDate} {formattedTime}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-message">Loading attendance data...</div>
        ) : selectedSession ? (
          attendanceList.length > 0 ? (
            <>
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map(attendance => (
                    <tr key={attendance.id}>
                      <td>{attendance.user.name}</td>
                      <td>{attendance.user.email}</td>
                      <td>
                        <span className={`attendance-status status-${attendance.status}`}>
                          {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {new Date(attendance.updated_at).toLocaleString()}
                      </td>
                      <td>
                        <div className="attendance-actions">
                          <button 
                            className="attendance-button mark-present" 
                            onClick={() => updateAttendanceStatus(attendance.id, 'attended')}
                            title="Mark as Present"
                          >
                            <FiCheck />
                          </button>
                          
                          <button 
                            className="attendance-button mark-absent" 
                            onClick={() => updateAttendanceStatus(attendance.id, 'absent')}
                            title="Mark as Absent"
                          >
                            <FiX />
                          </button>
                          
                          <div 
                            className={`toggle-dropdown ${activeDropdown === attendance.id ? 'active' : ''}`}
                            ref={activeDropdown === attendance.id ? dropdownRef : null}
                          >
                            <button 
                              className="attendance-button" 
                              onClick={() => toggleDropdown(attendance.id)}
                              title="More Options"
                            >
                              <FiMoreVertical />
                            </button>
                            
                            <div className="status-dropdown">
                              <div 
                                className="status-option"
                                onClick={() => {
                                  updateAttendanceStatus(attendance.id, 'excused');
                                  setActiveDropdown(null);
                                }}
                              >
                                <span className="status-option-icon">E</span>
                                <span className="status-option-label">Excused</span>
                              </div>
                              
                              <div 
                                className="status-option"
                                onClick={() => {
                                  updateAttendanceStatus(attendance.id, 'pending');
                                  setActiveDropdown(null);
                                }}
                              >
                                <span className="status-option-icon">P</span>
                                <span className="status-option-label">Pending</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="bulk-edit-container">
                <div className="bulk-edit-header">
                  <h3 className="bulk-edit-title">Bulk Actions</h3>
                </div>
                
                <div className="bulk-edit-form">
                  <div className="bulk-form-group">
                    <label>Set All Students To:</label>
                    <select id="bulk-status">
                      <option value="">Choose status...</option>
                      <option value="attended">Present</option>
                      <option value="absent">Absent</option>
                      <option value="excused">Excused</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <button 
                    className="bulk-action-button primary-button"
                    onClick={() => {
                      const status = document.getElementById('bulk-status').value;
                      if (status) {
                        bulkUpdateAttendance(status);
                      }
                    }}
                  >
                    Apply to All
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <FiUsers />
              <h3>No attendance records found</h3>
              <p>There are no students enrolled in this course session, or the attendance records haven't been created yet.</p>
            </div>
          )
        ) : (
          <div className="empty-state">
            <FiCalendar />
            <h3>Select a Session</h3>
            <p>Please select a course session from the dropdown above to view and manage attendance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;

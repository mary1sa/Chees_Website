import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiEdit, FiTrash2, FiUsers, FiVideo, FiMap, FiFilter, FiSearch, FiGrid, FiList, FiEye, FiX, FiLink, FiInfo, FiCheck, FiLock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import { format } from 'date-fns';
import './SessionManagement.css';
import '../../AdminDashboard/UserTable.css';
import PageLoading from '../../PageLoading/PageLoading';
import ConfirmDelete from '../../Confirm/ConfirmDelete';

const SessionList = ({ onLoadingChange }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const ITEMS_PER_PAGE_GRID = 8;
  const ITEMS_PER_PAGE_LIST = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        onLoadingChange(true);
        
        await Promise.all([
          fetchCourses(),
          fetchCoaches()
        ]);
        
        await fetchSessions();
      } finally {
        setLoading(false);
        onLoadingChange(false);
      }
    };
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Reset to page 1 when search term changes
    setCurrentPage(1);
    if (searchTerm) {
      fetchSessions();
    }
  }, [searchTerm]);

  // When view mode changes, we may need to refetch sessions due to different items per page
  useEffect(() => {
    fetchSessions();
  }, [viewMode]);

  useEffect(() => {
    // Reset to page 1 when course filter changes
    setCurrentPage(1);
    if (courseFilter) {
      fetchSessions();
    }
  }, [courseFilter]);

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
  
  const fetchCoaches = async () => {
    try {
      // First try to get coaches from the dedicated coaches table
      try {
        const response = await axiosInstance.get('/api/coaches');
        console.log('Coaches API response:', response.data);
        
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          console.log('Coaches from dedicated API:', response.data.data);
          setCoaches(response.data.data || []);
          return;
        } else if (response.data && Array.isArray(response.data)) {
          // Handle case where API returns array directly
          console.log('Coaches from direct array response:', response.data);
          setCoaches(response.data);
          return;
        }
      } catch (coachErr) {
        console.log('Error fetching from /api/coaches:', coachErr);
      }
      
      // Fallback to users with role_id 2 if coaches endpoint fails
      try {
        const response = await axiosInstance.get('/api/users');
        if (response.data && Array.isArray(response.data)) {
          const coachUsers = response.data.filter(user => user.role_id === 2);
          console.log('Fallback: found coaches from users API:', coachUsers);
          if (coachUsers.length > 0) {
            setCoaches(coachUsers);
            return;
          }
        }
      } catch (userErr) {
        console.log('Error fetching from /api/users:', userErr);
      }
      
      // If all else fails, use hardcoded data for coach ID 2
      console.warn('Could not fetch coaches from any endpoint, using fallback data');
      const hardcodedCoaches = [
        {
          id: 2,
          name: 'Coach One',
          email: 'coach1@chessclub.com'
        }
      ];
      setCoaches(hardcodedCoaches);
    } catch (err) {
      console.error('Error in fetchCoaches:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      onLoadingChange(true);
      
      let queryParams = new URLSearchParams();
      
      if (courseFilter) {
        queryParams.append('course_id', courseFilter);
      }
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      // Add pagination parameters
      queryParams.append('page', currentPage);
      
      // Set different items per page based on view mode
      const perPage = viewMode === 'grid' ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_LIST;
      queryParams.append('per_page', perPage);
      
      const url = `/api/course-sessions?${queryParams.toString()}`;
      console.log('Fetching sessions with URL:', url);
      
      const response = await axiosInstance.get(url);
      console.log('Session response:', response.data);
      
      if (response.data.success) {
        // Check if data is paginated by looking for the pagination structure
        if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          // Laravel paginated response format
          console.log('Using paginated data format');
          setSessions(response.data.data.data);
          setTotalPages(response.data.data.last_page || 1);
          console.log(`Got ${response.data.data.data.length} sessions, page ${currentPage} of ${response.data.data.last_page}`);
        } else if (Array.isArray(response.data.data)) {
          // Legacy format (not paginated)
          console.log('Using legacy non-paginated format');
          setSessions(response.data.data);
          // Force artificial pagination for display purposes
          const totalItems = response.data.data.length;
          const calculatedTotalPages = Math.ceil(totalItems / perPage);
          setTotalPages(calculatedTotalPages || 1);
          
          // Manual pagination on frontend if backend doesn't support it
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const paginatedSessions = response.data.data.slice(startIndex, endIndex);
          console.log(`Manual pagination: showing ${paginatedSessions.length} of ${totalItems} sessions`);
          setSessions(paginatedSessions);
        } else {
          console.error('Unexpected response format:', response.data);
          setSessions([]);
          setTotalPages(1);
        }
      } else {
        console.error('API returned error:', response.data);
        setError('Failed to fetch sessions');
        setSessions([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Error loading sessions');
      setSessions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/api/course-sessions/${sessionToDelete.id}`);
      if (response.data.success) {
        // Remove the deleted session from the state
        setSessions(sessions.filter(session => session.id !== sessionToDelete.id));
      }
    } catch (err) {
      setError(`Failed to delete session: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
      setSessionToDelete(null);
      setLoading(false);
    }
  };

  const deleteSession = (session) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const formatDateTime = (dateTimeString) => {
    try {
      return format(new Date(dateTimeString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const openDetailsModal = (session) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };
  
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSession(null);
  };
  
  const getCoachName = (coachId) => {
    if (!coachId) return 'Not assigned';
    
    // Convert coachId to number for proper comparison
    const coachIdNum = typeof coachId === 'string' ? parseInt(coachId, 10) : coachId;
    
    // Find coach in the coaches array, comparing as numbers
    const coach = coaches.find(c => {
      const cId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
      return cId === coachIdNum;
    });
    
    if (coach) {
      // Start with the most likely name field in coaches table
      if (coach.name) {
        return coach.name;
      } 
      // Fallbacks for different API response structures
      else if (coach.first_name && coach.last_name) {
        return `${coach.first_name} ${coach.last_name}`;
      } else if (coach.first_name) {
        return coach.first_name;
      } else if (coach.username) {
        return coach.username;
      } else if (coach.email) {
        // Last fallback - at least show email if no name fields exist
        return coach.email.split('@')[0]; // Just username part of email
      }
    }
    
    console.warn(`Could not find name for coach ID: ${coachId}. Available coaches:`, coaches);
    
    // If no coach object is found but ID is 2, use hardcoded name as fallback
    if (coachIdNum === 2) {
      return 'Coach One';
    }
    
    // Last resort
    return 'Coach Name Not Available';
  };

  return (
    <div className="session-list-container">
      <ConfirmDelete 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSessionToDelete(null);
        }}
        onConfirm={confirmDeleteSession}
        itemName={sessionToDelete ? sessionToDelete.title : 'this session'}
      />
      
      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="session-modal-overlay">
          <div className="session-modal">
            <div className="session-modal-header">
              <h2>{selectedSession.title}</h2>
              <button 
                className="session-modal-close" 
                onClick={closeDetailsModal}
                title="Close"
              >
                <FiX />
              </button>
            </div>
            <div className="session-modal-content">
              <div className="session-detail-section">
                <h3><FiInfo /> Session Information</h3>
                <div className="session-detail-item">
                  <strong>Course:</strong> {courses.find(c => c.id === selectedSession.course_id)?.title || 'Unknown'}
                </div>
                <div className="session-detail-item">
                  <strong>Coach:</strong> {getCoachName(selectedSession.coach_id)}
                </div>
                <div className="session-detail-item">
                  <strong>Description:</strong> {selectedSession.description || 'No description provided.'}
                </div>
                <div className="session-detail-item">
                  <strong>Start Time:</strong> {formatDateTime(selectedSession.start_datetime)}
                </div>
                <div className="session-detail-item">
                  <strong>End Time:</strong> {formatDateTime(selectedSession.end_datetime)}
                </div>
                <div className="session-detail-item">
                  <strong>Maximum Participants:</strong> {selectedSession.max_participants}
                </div>
                <div className="session-detail-item">
                  <strong>Session Type:</strong> 
                  <span className="session-type-badge online">
                    <><FiVideo /> Online</>
                  </span>
                </div>
              </div>

              {(
                <div className="session-detail-section">
                  <h3><FiLink /> Meeting Information</h3>
                  <div className="session-detail-item">
                    <strong>Zoom Link:</strong> 
                    {selectedSession.zoom_link ? (
                      <a href={selectedSession.zoom_link} target="_blank" rel="noopener noreferrer">
                        Open Meeting Link
                      </a>
                    ) : 'No meeting link available'}
                  </div>
                  {selectedSession.meeting_id && (
                    <div className="session-detail-item">
                      <strong>Meeting ID:</strong> {selectedSession.meeting_id}
                    </div>
                  )}
                  {selectedSession.meeting_password && (
                    <div className="session-detail-item">
                      <strong>Password:</strong> {selectedSession.meeting_password}
                    </div>
                  )}
                </div>
              )}

              <div className="session-detail-section">
                <h3><FiCheck /> Recording Information</h3>
                <div className="session-detail-item">
                  <strong>Is Recorded:</strong> {selectedSession.is_recorded ? 'Yes' : 'No'}
                </div>
                {selectedSession.is_recorded && (
                  <div className="session-detail-item">
                    <strong>Recording URL:</strong> 
                    {selectedSession.recording_url ? (
                      <a href={selectedSession.recording_url} target="_blank" rel="noopener noreferrer">
                        View Recording
                      </a>
                    ) : 'No recording available yet'}
                  </div>
                )}
              </div>
            </div>
            <div className="session-modal-footer">
              <button 
                className=" btn-add-session" 
                onClick={() => {
                  closeDetailsModal();
                  window.location.href = `/admin/dashboard/sessions/edit/${selectedSession.id}`;
                }}
              >
                <FiEdit /> Edit Session
              </button>
              <button 
                className=" btn-close btn-secondary" 
                onClick={closeDetailsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="section-header">
        <h2 className="section-title">Course Sessions</h2>
        <div className="section-actions">
          <button 
            className={`action-button view-style-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FiGrid  /> <span className="action-button-text">Grid View</span>
          </button>
          <button 
            className={`action-button view-style-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList  /> <span className="action-button-text">List View</span>
          </button>
        </div>
      </div>
      
      <div className="course-list-container">
        <div className="course-list-header">
          <div className="course-search-filter">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search sessions by title or description"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="filter-dropdown">
              <select 
                value={courseFilter} 
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      
        {error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchSessions} className="retry-button">
              <FiCalendar /> Retry Loading Sessions
            </button>
          </div>
        ) : (
          <>
            {sessions.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="session-grid">
                  {sessions.map(session => (
                    <div key={session.id} className="session-card" data-session-id={session.id}>
                      <div className="session-card-header">
                        <h3>{session.title}</h3>
                        <div className="session-actions">
                          <button 
                            className="action-icon-button view-button"
                            title="View Session Details"
                            onClick={() => openDetailsModal(session)}
                          >
                            <FiEye />
                          </button>
                          <button 
                            className="action-icon-button edit-button"
                            title="Edit Session"
                            onClick={() => window.location.href = `/admin/dashboard/sessions/edit/${session.id}`}
                          >
                            <FiEdit />
                          </button>
                          <button 
                            className="action-icon-button delete-button"
                            title="Delete Session"
                            onClick={() => deleteSession(session)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      
                      <div className="session-details">
                        <div className="session-badge">
                          {courses.find(c => c.id === session.course_id)?.title || 'Unknown Course'}
                        </div>
                        <div className="session-detail">
                          <FiCalendar />
                          <span>Start: {formatDateTime(session.start_datetime)}</span>
                        </div>
                        <div className="session-detail">
                          <FiClock />
                          <span>End: {formatDateTime(session.end_datetime)}</span>
                        </div>
                        <div className="session-detail">
                          <FiUsers />
                          <span>Coach: {getCoachName(session.coach_id)}</span>
                        </div>
                        <div className="session-detail">
                          <FiUsers />
                          <span>Max: {session.max_participants} participants</span>
                        </div>
                        <div className="session-detail">
                          <span className="session-type-badge online">
                            <><FiVideo /> Online</>
                          </span>
                        </div>
                      </div>
                      
                      <div className="session-description">
                        {session.description || 'No description provided.'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="course-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Course</th>
                        <th>Coach</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Type</th>
                        <th>Participants</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map(session => (
                        <tr key={session.id}>
                          <td>{session.title}</td>
                          <td>{courses.find(c => c.id === session.course_id)?.title || 'Unknown'}</td>
                          <td>{getCoachName(session.coach_id)}</td>
                          <td>{formatDateTime(session.start_datetime)}</td>
                          <td>{formatDateTime(session.end_datetime)}</td>
                          <td>
                            <span className="course-status status-online">
                              Online
                            </span>
                          </td>
                          <td>{session.max_participants}</td>
                          <td className="actions">
                            <div className="table-actions">
                              <button 
                                className="action-icon-button view-button"
                                onClick={() => openDetailsModal(session)}
                                title="View Session Details"
                              >
                                <FiEye />
                              </button>
                              <button 
                                className="action-icon-button edit-button"
                                onClick={() => window.location.href = `/admin/dashboard/sessions/edit/${session.id}`}
                                title="Edit Session"
                              >
                                <FiEdit />
                              </button>
                              <button 
                                className="action-icon-button delete-button"
                                onClick={() => deleteSession(session)}
                                title="Delete Session"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="empty-state">
                <FiCalendar />
                <h3>No Sessions Found</h3>
                <p>There are no sessions available for the selected filters.</p>
                <button className="action-button primary-button" onClick={() => window.location.href = '/admin/dashboard/sessions/scheduler'}>
                  Schedule a New Session
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && sessions.length > 0 && (
              <div className="pagination">
                <button 
                  className="pagination-button pagination-nav"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(prev => prev - 1);
                    }
                  }}
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
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(prev => prev + 1);
                    }
                  }}
                  disabled={currentPage === totalPages}
                >
                  Next <FiChevronRight className="icon" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SessionList;

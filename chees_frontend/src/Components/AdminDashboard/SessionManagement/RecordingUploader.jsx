import React, { useState, useEffect, useRef } from 'react';
import { FiUpload, FiVideo, FiX, FiFile, FiCalendar, FiClock, FiUsers, FiSave, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './SessionManagement.css';

const RecordingUploader = ({ onLoadingChange }) => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionDetails, setSessionDetails] = useState(null);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sessionRecordings, setSessionRecordings] = useState([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        onLoadingChange(true);
        await fetchCourses();
        await fetchPastSessions();
      } finally {
        setLoading(false);
        onLoadingChange(false);
      }
    };
    
    initializeComponent();
  }, []);
  
  useEffect(() => {
    if (selectedSession) {
      const loadSessionDetails = async () => {
        try {
          setLoading(true);
          onLoadingChange(true);
          // First fetch recordings based on session ID only
          await fetchSessionRecordings(selectedSession);
          // Then get the detailed session info
          await fetchSessionDetails();
        } finally {
          setLoading(false);
          onLoadingChange(false);
        }
      };
      
      loadSessionDetails();
    } else {
      setSessionDetails(null);
      setSessionRecordings([]);
    }
  }, [selectedSession]);
  
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/api/courses');
      if (response.data.success) {
        // Make sure we're accessing the correct nesting level of data
        setCourses(response.data.data.data || response.data.data || []);
      } else {
        setError('Failed to fetch courses');
        setCourses([]);
      }
    } catch (err) {
      setError(`Error fetching courses: ${err.message}`);
      setCourses([]);
    }
  };
  
  const fetchPastSessions = async () => {
    try {
      // Get only past sessions for recording uploads
      const now = new Date();
      const nowISOString = now.toISOString();
      
      console.log(`Fetching sessions that ended before ${nowISOString}`);
      
      // Use API to fetch sessions that have already ended
      const response = await axiosInstance.get('/api/course-sessions', {
        params: {
          end_time_before: nowISOString,
          status: 'completed' // Add status filter if your API supports it
        }
      });
      
      if (response.data.success) {
        let sessionsData = response.data.data;
        
        // If data is nested in a paginated response
        if (sessionsData && sessionsData.data) {
          sessionsData = sessionsData.data;
        }
        
        // Additional client-side filtering to ensure only past sessions
        const pastSessions = sessionsData.filter(session => {
          // Get end time (handle different field names)
          const endTime = new Date(session.end_time || session.end_datetime);
          // Only include sessions that have already ended
          return !isNaN(endTime.getTime()) && endTime < now;
        });
        
        console.log(`Found ${pastSessions.length} past sessions`);
        setSessions(pastSessions);
      } else {
        setError('Failed to fetch past sessions');
        setSessions([]);
      }
    } catch (err) {
      console.error('Error fetching past sessions:', err);
      setError(`Error fetching sessions: ${err.message}`);
      setSessions([]);
    }
  };
  
  const fetchSessionDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/course-sessions/${selectedSession}`);
      if (response.data.success) {
        setSessionDetails(response.data.data);
        // Update recordings with more details if needed
        if (response.data.data && response.data.data.course_id) {
          await fetchSessionRecordings(selectedSession, response.data.data.course_id);
        }
      }
    } catch (err) {
      setError(`Error fetching session details: ${err.message}`);
    }
  };
  
  const fetchSessionRecordings = async (sessionId, courseId = null) => {
    try {
      console.log('Fetching recordings for session:', sessionId);
      
      const params = { 
        session_id: sessionId,
        type: 'recording'
      };
      
      // Add course_id to params if available
      if (courseId) {
        params.course_id = courseId;
      }
      
      const response = await axiosInstance.get(`/api/course-materials`, { params });
      
      console.log('API Response for recordings:', response.data);
      
      if (response.data.success) {
        // Handle potential nested data structures
        let recordingsData = response.data.data;
        
        // If data is nested in a paginated response
        if (recordingsData && recordingsData.data) {
          recordingsData = recordingsData.data;
        }
        
        console.log('Parsed recordings data:', recordingsData);
        setSessionRecordings(Array.isArray(recordingsData) ? recordingsData : []);
      } else {
        setSessionRecordings([]);
      }
    } catch (err) {
      console.error('Error fetching session recordings:', err);
      setSessionRecordings([]);
    }
  };
  
  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
    setFile(null);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };
  
  const validateAndSetFile = (selectedFile) => {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload MP4, WebM, or QuickTime video files.');
      return;
    }
    
    // Check file size (limit to 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 500MB limit. Please upload a smaller file.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !selectedSession) {
      setError('Please select a session and upload a recording file.');
      return;
    }
    
    try {
      setLoading(true);
      onLoadingChange(true);
      setError(null);
      setSuccess(null);
      setUploadProgress(0);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'recording');
      formData.append('session_id', selectedSession);
      formData.append('title', `Session Recording - ${sessionDetails?.title || 'Untitled Session'}`);
      
      // Get session date safely
      const sessionDate = getSessionDate(sessionDetails);
      formData.append('description', `Recording for session on ${sessionDate.toLocaleDateString()}`);
      formData.append('course_id', sessionDetails?.course_id);
      
      // Setup axios request with progress tracking
      const response = await axiosInstance.post(
        `/api/course-materials`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }
      );
      
      if (response.data.success) {
        setSuccess('Recording uploaded successfully!');
        // Clear file after successful upload
        setFile(null);
        // Refresh recordings immediately
        await fetchSessionRecordings(selectedSession, sessionDetails?.course_id);
      } else {
        setError(response.data.message || 'Failed to upload recording');
      }
    } catch (err) {
      console.error('Error uploading recording:', err);
      setError(err.response?.data?.message || 'An error occurred while uploading the recording');
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  };
  
  const openFileSelector = () => {
    fileInputRef.current.click();
  };
  
  const handleCancel = () => {
    setFile(null);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);
  };
  
  // Helper function to safely get session date regardless of field name
  const getSessionDate = (session) => {
    if (!session) return new Date();
    
    // Try different date fields that might be available
    const dateString = session.start_time || session.start_datetime || session.created_at;
    
    if (!dateString) return new Date();
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date for display with safe handling
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Not specified';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Format time for display with safe handling
  const formatTime = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Not specified';
    
    const options = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleTimeString(undefined, options);
  };
  
  const openVideoModal = (recording) => {
    console.log('Opening video modal for recording:', recording.id);
    
    // Create a full URL that will work in the browser
    // Try different endpoints that might be available
    let videoUrl = `/api/course-materials/${recording.id}/stream`;
    
    // If there's a direct streaming URL provided by the API, use that instead
    if (recording.stream_url) {
      videoUrl = recording.stream_url;
    } else if (recording.file_url) {
      videoUrl = recording.file_url;
    }
    
    console.log('Using video URL:', videoUrl);
    setCurrentVideoUrl(videoUrl);
    setCurrentVideoTitle(recording.title);
    setVideoModalOpen(true);
  };
  
  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setCurrentVideoUrl('');
    setCurrentVideoTitle('');
  };
  
  // Delete functionality
  const openDeleteModal = (recording) => {
    setRecordingToDelete(recording);
    setDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setRecordingToDelete(null);
  };
  
  const handleDeleteRecording = async () => {
    if (!recordingToDelete) return;
    
    try {
      setDeleting(true);
      setError(null);
      
      const response = await axiosInstance.delete(`/api/course-materials/${recordingToDelete.id}`);
      
      if (response.data.success) {
        setSuccess(`"${recordingToDelete.title}" was deleted successfully`);
        // Refresh recordings list
        await fetchSessionRecordings(selectedSession, sessionDetails?.course_id);
      } else {
        setError(response.data.message || 'Failed to delete recording');
      }
    } catch (err) {
      console.error('Error deleting recording:', err);
      setError(err.response?.data?.message || 'An error occurred while deleting the recording');
    } finally {
      setDeleting(false);
      closeDeleteModal();
    }
  };
  
  return (
    <div className="recording-uploader-container">
      <div className="uploader-header">
        <h2>Upload Session Recordings</h2>
        <p>Upload video recordings for past course sessions to make them available to enrolled students.</p>
      </div>
      
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      <div className="session-selector">
        <label className="session-selector-label" htmlFor="session-select">Select a Past Session</label>
        <select 
          id="session-select"
          className="session-select"
          value={selectedSession}
          onChange={handleSessionChange}
          disabled={loading}
        >
          <option value="">Select a session</option>
          {sessions.length > 0 ? (
            sessions.map(session => {
              // Ensure courses is an array before using find
              const courseTitle = Array.isArray(courses) 
                ? courses.find(c => c.id === session.course_id)?.title || 'Unknown Course'
                : 'Unknown Course';
                
              // Safely get and format the session date
              const sessionDate = getSessionDate(session);
              const formattedDate = sessionDate.toLocaleDateString();
              const formattedTime = sessionDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <option key={session.id} value={session.id}>
                  {courseTitle} - {formattedDate} {formattedTime}
                </option>
              );
            })
          ) : (
            <option disabled value="">No past sessions available</option>
          )}
        </select>
      </div>
      
      {sessionDetails && (
        <div className="session-details">
          <div className="session-detail">
            <span className="detail-label">Course:</span>
            <span className="detail-value">
              {sessionDetails?.course?.title || 
               (sessionDetails?.course_id && Array.isArray(courses) ? 
                 courses.find(c => c.id === sessionDetails.course_id)?.title : 
                 'Unknown Course')}
            </span>
          </div>
          <div className="session-detail">
            <span className="detail-label">Session Title:</span>
            <span className="detail-value">{sessionDetails.title || 'Untitled Session'}</span>
          </div>
          <div className="session-detail">
            <span className="detail-label"><FiCalendar /> Date:</span>
            <span className="detail-value">{formatDate(sessionDetails.start_time || sessionDetails.start_datetime)}</span>
          </div>
          <div className="session-detail">
            <span className="detail-label"><FiClock /> Time:</span>
            <span className="detail-value">
              {formatTime(sessionDetails.start_time || sessionDetails.start_datetime)} - 
              {formatTime(sessionDetails.end_time || sessionDetails.end_datetime)}
            </span>
          </div>
          <div className="session-detail">
            <span className="detail-label"><FiUsers /> Participants:</span>
            <span className="detail-value">{sessionDetails.enrollments_count || 0} enrolled</span>
          </div>
        </div>
      )}
      {/* Display session recordings immediately after session selection */}
      {selectedSession && (
        <div className="session-recordings">
          <h4>Session Recordings</h4>
          {sessionRecordings.length > 0 ? (
            <div className="recordings-list">
              {sessionRecordings.map(recording => (
                <div key={recording.id} className="recording-item">
                  <div className="recording-icon">
                    <FiVideo />
                  </div>
                  <div className="recording-details">
                    <h5>{recording.title}</h5>
                    <p>{recording.description}</p>
                    <p className="recording-date">Uploaded: {new Date(recording.created_at).toLocaleString()}</p>
                    <p className="recording-file-path">File: {recording.file_path}</p>
                  </div>
                  <div className="recording-actions">
                    <button
                      onClick={async () => {
                        try {
                          console.log('Downloading recording ID:', recording.id);
                          const response = await axiosInstance.get(`/api/course-materials/${recording.id}/download`, {
                            responseType: 'blob'
                          });
                          
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `${recording.title}.mp4`);
                          document.body.appendChild(link);
                          link.click();
                          
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(link);
                        } catch (err) {
                          console.error('Error downloading file:', err);
                          alert('Error downloading file. Please try again.');
                        }
                      }}
                      className="action-button"
                    >
                      <FiDownload /> Download
                    </button>
                    {/* <button
                      onClick={() => openVideoModal(recording)}
                      className="action-button"
                    >
                      <FiEye /> View
                    </button> */}
                    <button
                      onClick={() => openDeleteModal(recording)}
                      className="action-button "
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-recordings">No recordings found for this session</p>
          )}
        </div>
      )}
      
      
      
      {selectedSession && (
        <>
          <div 
            className={`file-upload-area ${dragActive ? 'dragging' : ''}`}
            onClick={openFileSelector}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              ref={fileInputRef}
              className="hidden-input" 
              type="file" 
              accept="video/mp4,video/webm,video/quicktime" 
              onChange={handleFileChange}
              disabled={loading}
            />
            
            <div className="upload-icon">
              <FiVideo />
            </div>
            
            <div className="upload-text">
              <h3>Drag & Drop Video File Here</h3>
              <p>or <strong>Click to Browse</strong> your computer</p>
              <p className="supported-formats">Supported formats: MP4, WebM, QuickTime (max 500MB)</p>
            </div>
          </div>
          
          {file && (
            <div className="file-preview">
              <div className="file-preview-icon">
                <FiFile />
              </div>
              
              <div className="file-info">
                <h4 className="file-name">{file.name}</h4>
                <div className="file-meta">
                  <span>{file.type}</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="upload-progress">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
              </div>
              
              <button className="remove-file" onClick={handleCancel} disabled={loading}>
                <FiX />
              </button>
            </div>
          )}
          
          <div className="upload-actions">
            <button 
              className="cancel-button" 
              onClick={handleCancel}
              disabled={loading || !file}
            >
              <FiX /> Cancel
            </button>
            
            <button 
              className="upload-button" 
              onClick={handleUpload}
              disabled={loading || !file}
            >
              {loading ? (
                <span>Uploading... {uploadProgress}%</span>
              ) : (
                <>
                  <FiUpload /> Upload Recording
                </>
              )}
            </button>
          </div>
        </>
      )}
      
      {/* Video Modal with improved video source handling */}
      {videoModalOpen && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <div className="video-modal-header">
              <h4>{currentVideoTitle}</h4>
              <button className="close-modal-btn" onClick={closeVideoModal}>×</button>
            </div>
            <div className="video-container">
              <video 
                controls 
                autoPlay
                className="video-player"
                src={currentVideoUrl}
                onError={(e) => {
                  console.error("Video playback error:", e);
                  setError("Error playing video. Please try downloading the file instead.");
                }}
              >
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && recordingToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h4>Confirm Deletion</h4>
              <button className="close-modal-btn" onClick={closeDeleteModal}>×</button>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete the recording: <strong>{recordingToDelete.title}</strong>?</p>
              <p className="warning-text">This action cannot be undone and will permanently remove this recording.</p>
            </div>
            <div className="delete-modal-footer">
              <button 
                className="cancel-button" 
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="delete-button" 
                onClick={handleDeleteRecording}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Recording'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingUploader;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiBook, FiVideo, FiDownload, FiList } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import VideoPlayer from './VideoPlayer';
import DownloadMaterials from './DownloadMaterials';
import PageLoading from '../../PageLoading/PageLoading';
import './CourseContent.css';

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchCourseMaterials();
    }
  }, [courseId]);
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.data);
        // If course has featured video, set it as active
        if (response.data.data.featured_video_url) {
          setActiveVideo({
            url: response.data.data.featured_video_url,
            title: 'Course Introduction'
          });
        }
      } else {
        setError('Failed to fetch course details');
      }
    } catch (err) {
      setError(`Error fetching course details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCourseMaterials = async () => {
    try {
      const response = await axiosInstance.get(`/api/courses/${courseId}/materials`);
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching course materials:', err);
      // We don't set this as a blocking error
    }
  };
  
  const handleVideoComplete = async (videoId) => {
    try {
      // Mark video as watched
      await axiosInstance.post(`/api/courses/${courseId}/videos/${videoId}/mark-watched`);
      // Update progress
      fetchCourseData(); // Refresh course data to get updated progress
    } catch (err) {
      console.error('Error marking video as complete:', err);
    }
  };
  
  const handleVideoSelect = (video) => {
    setActiveVideo(video);
    setActiveTab('content');
  };
  
  if (loading) {
    return <PageLoading text="Loading course content..." />;
  }
  
  if (error) {
    return <div className="course-content-error">{error}</div>;
  }
  
  if (!course) {
    return <div className="course-content-error">Course not found</div>;
  }
  
  return (
    <div className="course-content-container">
      <div className="course-content-header">
        <button 
          className="back-button"
          onClick={() => navigate('/member/courses/enrolled')}
        >
          <FiArrowLeft /> Back to Enrolled Courses
        </button>
        
        <h2>{course.title}</h2>
      </div>
      
      <div className="course-info">
        <div className="course-info-grid">
          <div className="course-info-item">
            <span className="course-info-label">Coach</span>
            <span className="course-info-value">
              <FiUser className="info-icon" /> {course.coach?.name || 'TBA'}
            </span>
          </div>
          
          <div className="course-info-item">
            <span className="course-info-label">Duration</span>
            <span className="course-info-value">
              <FiClock className="info-icon" /> {course.duration} hours
            </span>
          </div>
          
          <div className="course-info-item">
            <span className="course-info-label">Level</span>
            <span className="course-info-value">
              <FiBook className="info-icon" /> {course.level?.name || 'All Levels'}
            </span>
          </div>
          
          <div className="course-info-item">
            <span className="course-info-label">Progress</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${course.user_progress || 0}%` }}
              ></div>
              <span className="progress-text">{course.user_progress || 0}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="course-tabs">
        <div 
          className={`course-tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <FiVideo /> Content
        </div>
        
        <div 
          className={`course-tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          <FiDownload /> Materials
        </div>
        
        <div 
          className={`course-tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <FiCalendar /> Sessions
        </div>
      </div>
      
      <div className="tab-content">
        {activeTab === 'content' && (
          <div className="content-tab">
            {activeVideo && (
              <VideoPlayer 
                videoUrl={activeVideo.url} 
                title={activeVideo.title}
                onComplete={() => handleVideoComplete(activeVideo.id)}
              />
            )}
            
            <div className="section-container">
              <h3 className="section-header">Course Sections</h3>
              
              {course.sections && course.sections.length > 0 ? (
                course.sections.map(section => (
                  <div key={section.id} className="course-section">
                    <h4 className="section-title">{section.title}</h4>
                    <p className="section-description">{section.description}</p>
                    
                    <div className="section-videos">
                      {section.videos && section.videos.map(video => (
                        <div 
                          key={video.id} 
                          className={`video-item ${video.id === activeVideo?.id ? 'active' : ''}`}
                          onClick={() => handleVideoSelect(video)}
                        >
                          <FiVideo className="video-icon" />
                          <div className="video-info">
                            <h5 className="video-title">{video.title}</h5>
                            <span className="video-duration">{video.duration} min</span>
                          </div>
                          {video.watched && <div className="video-watched">✓</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-sections-message">
                  No content sections available for this course yet.
                </p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'materials' && (
          <div className="materials-tab">
            <DownloadMaterials materials={materials} />
          </div>
        )}
        
        {activeTab === 'sessions' && (
          <div className="sessions-tab">
            <h3 className="section-header">Upcoming Sessions</h3>
            
            {course.upcoming_sessions && course.upcoming_sessions.length > 0 ? (
              <div className="upcoming-sessions-list">
                {course.upcoming_sessions.map(session => (
                  <div key={session.id} className="session-item">
                    <div className="session-date">
                      <FiCalendar className="session-icon" />
                      <span>
                        {new Date(session.start_time).toLocaleDateString(undefined, { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="session-time">
                      <FiClock className="session-icon" />
                      <span>
                        {new Date(session.start_time).toLocaleTimeString(undefined, { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(session.end_time).toLocaleTimeString(undefined, { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="session-info">
                      <h4 className="session-title">{session.title}</h4>
                      <p className="session-description">{session.description}</p>
                    </div>
                    
                    {/* {session.is_bookable && (
                      <button 
                        className="book-session-btn" 
                        onClick={() => bookSession(session.id)}
                      >
                        Book Session
                      </button>
                    )} */}
                    
                    {session.is_booked && (
                      <div className="session-booked">
                        <span>✓ Booked</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-sessions-message">
                No upcoming sessions scheduled for this course yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContent;

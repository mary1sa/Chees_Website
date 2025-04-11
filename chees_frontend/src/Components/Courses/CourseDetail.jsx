import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';
import { FiHeart, FiCalendar, FiClock, FiUsers, FiDownload, FiCheck } from 'react-icons/fi';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollmentStatus();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.data);
        setMaterials(response.data.data.materials || []);
        setSessions(response.data.data.sessions || []);
        setIsWishlisted(response.data.data.is_wishlisted || false);
      } else {
        setError('Failed to fetch course details');
      }
    } catch (err) {
      setError('Error fetching course details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const userId = user?.id;
      
      if (!userId || !token) {
        console.error('User authentication information not found');
        return;
      }
      
      const response = await axios.get(`/api/users/${userId}/enrollments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const enrollments = response.data.data;
        const courseEnrollment = enrollments.find(enrollment => 
          enrollment.courses.some(c => c.id === parseInt(courseId))
        );
        
        if (courseEnrollment) {
          setIsEnrolled(true);
          const courseData = courseEnrollment.courses.find(c => c.id === parseInt(courseId));
          setEnrollmentProgress(courseData.pivot.progress || 0);
        }
      }
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    }
  };

  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await axios.post(`/api/wishlists/toggle/${courseId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (err) {
      setError('Failed to update wishlist');
    }
  };

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await axios.post('/api/courses/enroll', {
        course_ids: [courseId]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setIsEnrolled(true);
        navigate(`/member/courses/enrolled`);
      }
    } catch (err) {
      setError('Failed to enroll in course: ' + err.message);
    }
  };

  const downloadMaterial = async (materialId) => {
    try {
      window.open(`/api/course-materials/${materialId}/download`, '_blank');
    } catch (err) {
      setError('Failed to download material');
    }
  };

  const updateProgress = async (newProgress) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const userId = user?.id;
      
      if (!userId || !token) {
        setError('User authentication information not found');
        return;
      }
      
      await axios.put(`/api/enrollments/${userId}/courses/${courseId}/progress`, {
        progress: newProgress
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setEnrollmentProgress(newProgress);
    } catch (err) {
      setError('Failed to update progress');
    }
  };

  if (loading) {
    return <div className="course-detail-loading">Loading course details...</div>;
  }

  if (error) {
    return <div className="course-detail-error">{error}</div>;
  }

  if (!course) {
    return <div className="course-not-found">Course not found</div>;
  }

  return (
    <div className="course-detail-container">
      <div className="course-detail-header">
        <div className="course-header-content">
          <h1>{course.title}</h1>
          <p className="course-description">{course.description}</p>
          
          <div className="course-meta">
            <div className="meta-item">
              <FiClock />
              <span>{course.duration} hours</span>
            </div>
            <div className="meta-item">
              <FiUsers />
              <span>{course.max_students ? `Max ${course.max_students} students` : 'Unlimited'}</span>
            </div>
            <div className="meta-item">
              <FiCalendar />
              <span>{course.is_online ? 'Online Course' : 'In-Person Course'}</span>
            </div>
          </div>
        </div>
        
        <div className="course-header-image">
          <img src={course.thumbnail || '/course-placeholder.jpg'} alt={course.title} />
        </div>
      </div>
      
      <div className="course-detail-actions">
        {isEnrolled ? (
          <div className="enrolled-status">
            <div className="progress-container">
              <div className="progress-label">Your Progress: {enrollmentProgress}%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${enrollmentProgress}%` }}></div>
              </div>
            </div>
            <button 
              className="continue-button"
              onClick={() => navigate(`/member/courses/enrolled`)}
            >
              Continue Learning
            </button>
          </div>
        ) : (
          <div className="enrollment-actions">
            <div className="course-price">${course.price.toFixed(2)}</div>
            <button 
              className="enroll-button"
              onClick={handleEnroll}
            >
              Enroll Now
            </button>
            <button 
              className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
              onClick={toggleWishlist}
            >
              <FiHeart /> {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        )}
      </div>
      
      <div className="course-detail-tabs">
        <div className="tabs-container">
          <div className="tab active">Overview</div>
          <div className="tab">Materials</div>
          <div className="tab">Sessions</div>
        </div>
        
        <div className="tab-content">
          <h3>Course Overview</h3>
          <div className="course-overview">
            <p>{course.description}</p>
            <div className="course-level">
              <h4>Course Level</h4>
              <p>{course.level ? course.level.name : 'All Levels'}</p>
            </div>
            <div className="what-you-learn">
              <h4>What You Will Learn</h4>
              <ul>
                <li>Master fundamental chess strategies</li>
                <li>Understand opening principles</li>
                <li>Develop middle game tactics</li>
                <li>Improve endgame techniques</li>
              </ul>
            </div>
          </div>
        </div>
        
        {isEnrolled && (
          <div className="materials-section">
            <h3>Course Materials</h3>
            {materials.length === 0 ? (
              <p>No materials available for this course yet.</p>
            ) : (
              <div className="materials-list">
                {materials.map(material => (
                  <div key={material.id} className="material-item">
                    <div className="material-info">
                      <h4>{material.title}</h4>
                      <p>{material.description}</p>
                    </div>
                    <button 
                      className="download-button"
                      onClick={() => downloadMaterial(material.id)}
                    >
                      <FiDownload /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {isEnrolled && sessions.length > 0 && (
          <div className="sessions-section">
            <h3>Upcoming Sessions</h3>
            <div className="sessions-list">
              {sessions.map(session => (
                <div key={session.id} className="session-item">
                  <div className="session-date">
                    <FiCalendar />
                    <span>{new Date(session.start_time).toLocaleDateString()}</span>
                  </div>
                  <div className="session-time">
                    {new Date(session.start_time).toLocaleTimeString()} - 
                    {new Date(session.end_time).toLocaleTimeString()}
                  </div>
                  <div className="session-location">
                    {session.location || (course.is_online ? 'Online' : 'In-person')}
                  </div>
                  {session.is_completed && (
                    <div className="session-completed">
                      <FiCheck /> Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;

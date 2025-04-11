import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';
import { FiAward, FiBarChart2, FiCheckCircle, FiClock } from 'react-icons/fi';

const CourseProgress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(0);
  const [inProgressCourses, setInProgressCourses] = useState(0);
  const [notStartedCourses, setNotStartedCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      // Get the user ID and token from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const userId = user?.id;
      
      if (!userId || !token) {
        setError('User authentication information not found');
        setLoading(false);
        return;
      }
      
      // Using the users/{user}/enrollments endpoint with authentication
      const response = await axios.get(`/api/users/${userId}/enrollments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const enrollmentsData = response.data.data;
        setEnrollments(enrollmentsData);
        
        // Calculate aggregate statistics
        let totalCourses = 0;
        let totalProgress = 0;
        let completed = 0;
        let inProgress = 0;
        let notStarted = 0;
        
        enrollmentsData.forEach(enrollment => {
          enrollment.courses.forEach(course => {
            totalCourses++;
            totalProgress += course.pivot.progress;
            
            if (course.pivot.progress === 100) {
              completed++;
            } else if (course.pivot.progress > 0) {
              inProgress++;
            } else {
              notStarted++;
            }
          });
        });
        
        setOverallProgress(totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0);
        setCompletedCourses(completed);
        setInProgressCourses(inProgress);
        setNotStartedCourses(notStarted);
      } else {
        setError('Failed to fetch enrollments');
      }
    } catch (err) {
      setError('Error fetching enrollments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="progress-loading">Loading your progress...</div>;
  }

  if (error) {
    return <div className="progress-error">{error}</div>;
  }

  return (
    <div className="course-progress-container">
      <div className="progress-header">
        <h1>My Learning Progress</h1>
        <p>Track your chess learning journey</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="no-enrollments">
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/member/courses/catalog" className="browse-courses-button">
            Browse Courses
          </Link>
        </div>
      ) : (
        <>
          <div className="progress-overview">
            <div className="progress-card overall">
              <div className="progress-circle">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="12"
                    strokeDasharray="339.292"
                    strokeDashoffset={`${339.292 * (1 - overallProgress / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="progress-percentage">{overallProgress}%</div>
              </div>
              <h3>Overall Progress</h3>
            </div>

            <div className="progress-stats">
              <div className="stat-card">
                <div className="stat-icon completed">
                  <FiCheckCircle />
                </div>
                <div className="stat-content">
                  <h3>{completedCourses}</h3>
                  <p>Completed Courses</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon in-progress">
                  <FiBarChart2 />
                </div>
                <div className="stat-content">
                  <h3>{inProgressCourses}</h3>
                  <p>In Progress</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon not-started">
                  <FiClock />
                </div>
                <div className="stat-content">
                  <h3>{notStartedCourses}</h3>
                  <p>Not Started</p>
                </div>
              </div>
            </div>
          </div>

          <div className="course-progress-list">
            <h2>Course Details</h2>
            
            {enrollments.map(enrollment => (
              enrollment.courses.map(course => (
                <div key={course.id} className="course-progress-item">
                  <div className="course-info">
                    <img 
                      src={course.thumbnail || '/course-placeholder.jpg'} 
                      alt={course.title} 
                      className="course-thumbnail"
                    />
                    <div className="course-details">
                      <h3>{course.title}</h3>
                      <div className="course-meta">
                        <span className="course-level">{course.level?.name || 'All Levels'}</span>
                        <span className="course-format">{course.is_online ? 'Online' : 'In-Person'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="course-progress-details">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${course.pivot.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      <span className="progress-percentage">{course.pivot.progress}%</span>
                      <span className="progress-status">
                        {course.pivot.progress === 100 ? (
                          <span className="completed-status">
                            <FiAward /> Completed
                          </span>
                        ) : course.pivot.progress > 0 ? (
                          <span className="in-progress-status">In Progress</span>
                        ) : (
                          <span className="not-started-status">Not Started</span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="course-actions">
                    <Link 
                      to={`/member/courses/${course.id}`}
                      className="view-course-button"
                    >
                      View Course
                    </Link>
                    
                    {course.pivot.progress < 100 && (
                      <button 
                        className="update-progress-button"
                        onClick={async () => {
                          try {
                            const newProgress = Math.min(100, course.pivot.progress + 25);
                            await axios.put(`/api/my-courses/${course.id}/progress`, {
                              progress: newProgress
                            });
                            // Refresh the data
                            fetchEnrollments();
                          } catch (err) {
                            setError('Failed to update progress');
                          }
                        }}
                      >
                        Update Progress
                      </button>
                    )}
                  </div>
                </div>
              ))
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseProgress;

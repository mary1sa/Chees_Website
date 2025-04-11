import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';
import { FiPlay, FiBook, FiClock, FiCalendar, FiFileText } from 'react-icons/fi';

const EnrolledCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

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
        setEnrollments(response.data.data);
      } else {
        setError('Failed to fetch enrollments');
      }
    } catch (err) {
      setError('Error fetching enrollments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (courseId, newProgress) => {
    try {
      // Get the user ID and token from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const userId = user?.id;
      
      if (!userId || !token) {
        setError('User authentication information not found');
        return;
      }
      
      // Using the users/{user}/courses/{course}/progress endpoint with authentication
      await axios.put(`/api/users/${userId}/courses/${courseId}/progress`, {
        progress: newProgress
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      const updatedEnrollments = enrollments.map(enrollment => {
        const updatedCourses = enrollment.courses.map(course => {
          if (course.id === courseId) {
            return {
              ...course,
              pivot: {
                ...course.pivot,
                progress: newProgress
              }
            };
          }
          return course;
        });
        
        return {
          ...enrollment,
          courses: updatedCourses
        };
      });
      
      setEnrollments(updatedEnrollments);
    } catch (err) {
      setError('Failed to update progress');
    }
  };

  const filterCourses = (enrollments) => {
    if (activeFilter === 'all') {
      return enrollments;
    }
    
    return enrollments.map(enrollment => {
      const filteredCourses = enrollment.courses.filter(course => {
        if (activeFilter === 'in-progress') {
          return course.pivot.progress > 0 && course.pivot.progress < 100;
        } else if (activeFilter === 'completed') {
          return course.pivot.progress === 100;
        } else if (activeFilter === 'not-started') {
          return course.pivot.progress === 0;
        }
        return true;
      });
      
      return {
        ...enrollment,
        courses: filteredCourses
      };
    }).filter(enrollment => enrollment.courses.length > 0);
  };

  const filteredEnrollments = filterCourses(enrollments);

  if (loading) {
    return <div className="enrolled-courses-loading">Loading your courses...</div>;
  }

  if (error) {
    return <div className="enrolled-courses-error">{error}</div>;
  }

  return (
    <div className="enrolled-courses-container">
      <div className="enrolled-courses-header">
        <h1>My Enrolled Courses</h1>
        <p>Continue your learning journey with our chess courses</p>
      </div>

      <div className="enrolled-courses-filters">
        <button
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Courses
        </button>
        <button
          className={`filter-button ${activeFilter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setActiveFilter('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-button ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`filter-button ${activeFilter === 'not-started' ? 'active' : ''}`}
          onClick={() => setActiveFilter('not-started')}
        >
          Not Started
        </button>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="no-enrolled-courses">
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/member/courses/catalog" className="browse-courses-button">
            Browse Courses
          </Link>
        </div>
      ) : (
        <>
          {filteredEnrollments.map(enrollment => (
            <div key={enrollment.id} className="enrollment-group">
              {enrollment.courses.map(course => (
                <div key={course.id} className="enrolled-course-card">
                  <div className="course-image">
                    <img src={course.thumbnail || '/course-placeholder.jpg'} alt={course.title} />
                    <div className="progress-badge">
                      {course.pivot.progress}%
                    </div>
                  </div>
                  
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <div className="course-meta">
                      <div className="meta-item">
                        <FiClock />
                        <span>{course.duration} hours</span>
                      </div>
                      <div className="meta-item">
                        <FiCalendar />
                        <span>{course.is_online ? 'Online' : 'In-Person'}</span>
                      </div>
                    </div>
                    
                    <div className="course-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${course.pivot.progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-label">
                        {course.pivot.progress === 0
                          ? 'Not started'
                          : course.pivot.progress === 100
                            ? 'Completed'
                            : `${course.pivot.progress}% complete`}
                      </div>
                    </div>
                    
                    <div className="course-materials-preview">
                      <h4>
                        <FiFileText />
                        <span>Course Materials</span>
                      </h4>
                      <p>
                        {course.materials_count || 0} materials available
                      </p>
                    </div>
                    
                    <div className="course-actions">
                      <Link
                        to={`/member/courses/${course.id}`}
                        className="view-details-button"
                      >
                        View Details
                      </Link>
                      
                      {course.pivot.progress < 100 && (
                        <button
                          className="update-progress-button"
                          onClick={() => updateProgress(course.id, Math.min(100, course.pivot.progress + 25))}
                        >
                          <FiPlay />
                          {course.pivot.progress === 0 ? 'Start Course' : 'Continue Learning'}
                        </button>
                      )}
                      
                      {course.pivot.progress === 100 && (
                        <button className="completed-button" disabled>
                          Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default EnrolledCourses;

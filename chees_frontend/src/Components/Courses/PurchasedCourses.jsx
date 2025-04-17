import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import './PurchasedCourses.css';
import { FiArrowRight, FiBook, FiCalendar, FiClock, FiDownload, FiUsers } from 'react-icons/fi';
import PageLoading from '../PageLoading/PageLoading';

const PurchasedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchasedCourses();
  }, []);

  const fetchPurchasedCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/courses/purchased');
      
      if (response.data.success) {
        setCourses(response.data.data);
      } else {
        setError('Failed to fetch your purchased courses');
      }
    } catch (err) {
      setError('Error fetching purchased courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading text="Loading your purchased courses..." />;
  }

  if (error) {
    return <div className="pc-empty">{error}</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="pc-empty">
        <h2>No Purchased Courses</h2>
        <p>You haven't purchased any courses yet.</p>
        <Link to="/member/dashboard/courses/catalog" className="pc-browse-button">
          Browse Available Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="pc-container">
      <div className="pc-header">
        <h1>My Purchased Courses</h1>
        <p>Access all your purchased course materials and sessions</p>
      </div>

      <div className="pc-grid">
        {courses.map(course => (
          <div key={course.id} className="pc-card">
            <div className="pc-image">
              <img src={course.thumbnail_url || '/course-placeholder.jpg'} alt={course.title} />
              <div className="pc-badge">Purchased</div>
            </div>
            
            <div className="pc-content">
              {course.level && (
                <span className="pc-level">{course.level.name}</span>
              )}
              
              <h3 className="pc-title">{course.title}</h3>
              
              <p className="pc-description">
                {course.description?.length > 120 
                  ? `${course.description.substring(0, 120)}...` 
                  : course.description}
              </p>
              
              <div className="pc-meta">
                <div className="pc-meta-item">
                  <FiClock />
                  <span>{course.duration} hours</span>
                </div>
                <div className="pc-meta-item">
                  <FiUsers />
                  <span>{course.max_students ? `Max ${course.max_students}` : 'Unlimited'}</span>
                </div>
                <div className="pc-meta-item">
                  <FiCalendar />
                  <span>{course.is_online ? 'Online' : 'In-Person'}</span>
                </div>
              </div>
              
              <div className="pc-actions">
                {course.materials && course.materials.length > 0 ? (
                  <Link to={`/member/dashboard/course-materials?course=${course.id}`} className="pc-view-button">
                     View Materials ({course.materials.length}) <FiArrowRight />
                  </Link>
                ) : (
                  <span className="pc-no-materials">No materials available yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasedCourses;

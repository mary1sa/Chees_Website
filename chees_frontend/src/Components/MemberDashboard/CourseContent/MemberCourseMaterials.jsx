import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import MaterialList from './MaterialList';
import PageLoading from '../../PageLoading/PageLoading';
import './CourseContent.css';

const MemberCourseMaterials = () => {
  const { courseId: urlParamCourseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get courseId from either URL params or query params
  const queryParams = new URLSearchParams(location.search);
  const queryCourseId = queryParams.get('course');
  const courseId = urlParamCourseId || queryCourseId;
  
  const [course, setCourse] = useState(null);
  const [courseLevels, setCourseLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchCourseLevels();
    
    if (courseId) {
      fetchCourseData(courseId);
    } else {
      // If no courseId, fetch user's courses
      fetchUserCourses();
    }
  }, [courseId, location]);
  
  const fetchCourseLevels = async () => {
    try {
      const response = await axiosInstance.get('/api/course-levels');
      if (response.data.success) {
        setCourseLevels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching course levels:', err);
      // Don't set this as a blocking error
    }
  };
  
  const fetchCourseData = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/courses/${id}`);
      if (response.data.success) {
        setCourse(response.data.data);
      } else {
        setError('Failed to fetch course details');
      }
    } catch (err) {
      setError(`Error fetching course details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/courses/purchased');
      if (response.data.success && response.data.data.length > 0) {
        // Redirect to the first course if no specific course is selected
        navigate(`/member/dashboard/course-materials/${response.data.data[0].id}`);
      } else if (response.data.success && response.data.data.length === 0) {
        setError('You have not purchased any courses yet');
        setLoading(false);
      } else {
        setError('Failed to fetch your courses');
        setLoading(false);
      }
    } catch (err) {
      setError(`Error fetching your courses: ${err.message}`);
      setLoading(false);
    }
  };
  
  // Helper function to get level name from level_id
  const getLevelName = (levelId) => {
    if (!levelId) return 'All Levels';
    
    const level = courseLevels.find(level => level.id === levelId);
    return level ? level.name : `Level ${levelId}`;
  };
  
  if (loading) {
    return <PageLoading text="Loading course materials..." />;
  }
  
  if (error) {
    return (
      <div className="course-error-container">
        <h3>Unable to Load Course Materials</h3>
        <p>{error}</p>
        <button 
          className="back-button"
          onClick={() => navigate('/member/dashboard')}
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="course-content-container">
      {course ? (
        <>
          <div className="course-content-header">
            <h2>
              <FiBookOpen className="header-icon" /> 
              Course Materials: {course.title}
            </h2>
            <p className="course-subtitle">
              Access all materials for this course
            </p>
          </div>
          
          <div className="course-info-card">
            <div className="course-info-item">
              <span className="info-label">Course Level:</span>
              <span className="info-value">
                {getLevelName(course.level_id)}
              </span>
            </div>
            <div className="course-info-item">
              <span className="info-label">Duration:</span>
              <span className="info-value">{course.duration || 'N/A'} hours</span>
            </div>
          </div>
          
          <div className="course-description">
            <h3>Course Description</h3>
            <p>{course.description || 'No description available.'}</p>
          </div>
          
          <MaterialList courseId={course.id} />
          
        </>
      ) : (
        <div className="no-course-selected">
          <h3>No Course Selected</h3>
          <p>Please select a course to view its materials.</p>
          <button 
            className="primary-button"
            onClick={() => navigate('/member/dashboard/courses/catalog')}
          >
            Browse Courses
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCourseMaterials;

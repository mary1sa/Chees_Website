import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import '../../Courses/CourseDetail.css';
import './CoachCourses.css';
import { FiCalendar, FiClock, FiUsers, FiDownload, FiCheck, FiBook, FiVideo, FiFileText, FiExternalLink } from 'react-icons/fi';
import PageLoading from '../../PageLoading/PageLoading';

const CoachCourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentCount, setPaymentCount] = useState(0);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchPaymentCount();
    }
  }, [courseId]);

  const fetchPaymentCount = async () => {
    try {
      // Fetch payments for this course
      const response = await axiosInstance.get(`/api/payments?course_id=${courseId}`);
      console.log('Payment API response:', response.data);
      
      if (response.data && response.data.success) {
        // Check if data exists and is an array
        const paymentsData = response.data.data;
        if (!paymentsData) {
          console.log('No payment data available');
          setPaymentCount(0);
          return;
        }
        
        // Ensure we're working with an array
        const paymentsArray = Array.isArray(paymentsData) 
          ? paymentsData 
          : [paymentsData]; // If it's a single object, wrap in array
        
        if (paymentsArray.length === 0) {
          console.log('No payments found for this course');
          setPaymentCount(0);
          return;
        }
        
        // Filter for successful payments
        const successfulPayments = paymentsArray.filter(payment => 
          payment && (payment.status === 'completed' || payment.status === 'paid' || payment.status === 'success')
        );
        
        // Count unique users who have paid for this course (if user_id exists)
        const uniqueUserIds = new Set();
        successfulPayments.forEach(payment => {
          if (payment.user_id) {
            uniqueUserIds.add(payment.user_id);
          }
        });
        
        const count = uniqueUserIds.size > 0 ? uniqueUserIds.size : successfulPayments.length;
        setPaymentCount(count);
        console.log(`${count} users have purchased this course`);
      } else {
        console.log('Invalid API response format or unsuccessful request');
        setPaymentCount(0);
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setPaymentCount(0);
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/courses/${courseId}`);

      if (response.data.success) {
        setCourse(response.data.data);
        // Fetch materials and sessions
        fetchMaterials();
        fetchSessions();
      } else {
        setError('Failed to fetch course details');
      }
    } catch (err) {
      setError('Error fetching course details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axiosInstance.get(`/api/courses/${courseId}/materials`);
      if (response.data.success) {
        // Process materials to identify links
        const processedMaterials = response.data.data.map(material => {
          return {
            ...material,
            isLink: isLinkMaterial(material)
          };
        });
        setMaterials(processedMaterials);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get(`/api/courses/${courseId}/sessions`);

      if (response.data.success) {
        // Parse dates properly before setting state
        const processedSessions = response.data.data.map(session => ({
          ...session,
          // Force date string formatting if needed
          start_time: session.start_time ? new Date(session.start_time).toISOString() : null,
          end_time: session.end_time ? new Date(session.end_time).toISOString() : null
        }));

        setSessions(processedSessions || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  // Improved function to check if material is a link
  const isLinkMaterial = (material) => {
    // Check all possible places where URL might be stored
    const urlFields = [
      material.url,
      material.file_url,
      material.link_url,
      material.content,
      material.description
    ];
    
    // Check if material type indicates it's a link
    const linkTypes = ['link', 'url', 'youtube', 'video'];
    const hasLinkType = material.file_type && linkTypes.includes(material.file_type.toLowerCase()) || 
                        material.type && linkTypes.includes(material.type.toLowerCase());
    
    // Check if any URL field contains common URL patterns
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com|docs\.google\.com|bit\.ly|tinyurl\.com|http|https)/i;
    const hasUrlPattern = urlFields.some(field => field && typeof field === 'string' && urlPattern.test(field));
    
    return hasLinkType || hasUrlPattern;
  };

  // Get the URL from a material
  const getMaterialUrl = (material) => {
    // Try all possible places where URL might be stored
    return material.url || 
           material.file_url || 
           material.link_url || 
           (material.content && typeof material.content === 'string' && material.content.match(/https?:\/\/[^\s]+/)?.[0]) ||
           (material.description && typeof material.description === 'string' && material.description.match(/https?:\/\/[^\s]+/)?.[0]);
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      const response = await axiosInstance.get(`/api/course-materials/${materialId}/download`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading material:', err);
    }
  };

  // Handle opening a link
  const handleOpenLink = (material) => {
    const url = getMaterialUrl(material);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      console.error('No valid URL found for this material');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine material icon based on type and content
  const getMaterialIcon = (material) => {
    if (material.isLink) {
      // Check if it's a YouTube link
      const url = getMaterialUrl(material);
      if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        return <FiVideo />;
      }
      return <FiExternalLink />;
    }
    return <FiFileText />;
  };

  if (loading) {
    return <PageLoading text="Loading course details..." />;
  }

  if (error) {
    return <div className="course-detail-error">{error}</div>;
  }

  if (!course) {
    return <div className="course-detail-error">Course not found</div>;
  }

  return (
    <div className="coach-course-detail-container">
      <div className="coach-banner">
        <div className="coach-access-badge">
          <FiBook /> Coach Access - Unrestricted
        </div>
      </div>
      
      <div className="course-header">
        <div className="course-header-content">
          <h1>{course.title}</h1>
          <div className="course-meta">
            <span><FiClock /> {course.duration || '0h'} Hours Total Duration</span>
          </div>
        </div>
        <img 
          src={course.thumbnail_url || '/course-placeholder.jpg'} 
          alt={course.title} 
          className="course-thumbnail"
        />
      </div>

      <div className="course-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'materials' ? 'active' : ''} 
          onClick={() => setActiveTab('materials')}
        >
          Materials
        </button>
      </div>

      <div className="course-tab-content">
        {activeTab === 'overview' && (
          <div className="course-overview">
            <h2>About This Course</h2>
            <p className="course-description">{course.description}</p>
            
            <div className="course-info-grid">
              <div className="info-item">
                <h3>Level</h3>
                <p>{course.level?.name || 'All Levels'}</p>
              </div>
              <div className="info-item">
                <h3>Duration</h3>
                <p>{course.duration || 'Self-paced'} hours</p>
              </div>
              <div className="info-item">
                <h3>Materials</h3>
                <p>{materials.length} resources</p>
              </div>
              <div className="info-item">
                <h3>Course Price</h3>
                <p>${course.price || 0}</p>
              </div>
            </div>

            {course.prerequisites && (
              <div className="prerequisites">
                <h3>Prerequisites</h3>
                <p>{course.prerequisites}</p>
              </div>
            )}
            
            {course.objectives && (
              <div className="learning-objectives">
                <h3>Learning Objectives</h3>
                <p>{course.objectives}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="course-materials">
            <h2>Course Materials</h2>
            {materials.length === 0 ? (
              <p>No materials available for this course.</p>
            ) : (
              <div className="materials-list">
                {materials.map(material => (
                  <div key={material.id} className="material-item">
                    <div className="material-icon">
                      {getMaterialIcon(material)}
                    </div>
                    <div className="material-details">
                      <h3>{material.title}</h3>
                      {/* Show URL for link materials */}
                      {material.isLink && (
                        <p className="material-url">{getMaterialUrl(material)}</p>
                      )}
                      {/* {material.description && (
                        <p>{material.description}</p>
                      )} */}
                    </div>
                    <button 
                      className={material.isLink ? "visit-button" : " visit-button"}
                      onClick={() => material.isLink 
                        ? handleOpenLink(material) 
                        : handleDownload(material.id, material.title)
                      }
                    >
                      {material.isLink ? (
                        <><FiExternalLink /> Visit link </>
                      ) : (
                        <><FiDownload /> Download</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachCourseDetail;
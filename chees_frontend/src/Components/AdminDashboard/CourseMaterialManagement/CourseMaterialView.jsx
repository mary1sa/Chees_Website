import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEdit, FiExternalLink } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './CourseMaterialManagement.css';
import '../CourseManagement/CourseManagement.css';
import PageLoading from '../../PageLoading/PageLoading';

const CourseMaterialView = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    fetchMaterialDetails();
  }, [materialId]);
  
  const fetchMaterialDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/course-materials/${materialId}`);
      
      if (response.data.success) {
        setMaterial(response.data.data);
        
        // Fetch associated course details
        if (response.data.data.course_id) {
          fetchCourseDetails(response.data.data.course_id);
        }
        
        // Fetch associated session details if available
        if (response.data.data.session_id) {
          fetchSessionDetails(response.data.data.session_id);
        }
      } else {
        setError('Failed to load material details');
      }
    } catch (err) {
      console.error('Error fetching material details:', err);
      setError('Error loading material. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
    }
  };
  
  const fetchSessionDetails = async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/api/course-sessions/${sessionId}`);
      if (response.data.success) {
        setSession(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
    }
  };
  
  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get(`/api/course-materials/${materialId}/download`, {
        responseType: 'blob'
      });
      
      const contentType = response.headers['content-type'];
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition or use material title
      const contentDisposition = response.headers['content-disposition'];
      let filename = material.title || 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    }
  };
  
  const renderMaterialPreview = () => {
    if (!material) return null;
    
    if (material.file_type === 'link') {
      return (
        <div className="external-link-preview">
          <a href={material.description} target="_blank" rel="noopener noreferrer" className="link-button">
            <FiExternalLink /> Open External Link
          </a>
          <div className="link-display">{material.description}</div>
        </div>
      );
    }
    
    const fileUrl = `${process.env.REACT_APP_API_URL}/storage/${material.file_path}`;
    
    switch (material.file_type) {
      case 'pdf':
        return (
          <div className="pdf-preview">
            <iframe
              src={`${fileUrl}#view=FitH`}
              title={material.title}
              width="100%"
              height="600px"
              className="pdf-viewer"
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="video-preview">
            <video controls width="100%" className="video-player">
              <source src={fileUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'image':
        return (
          <div className="image-preview">
            <img src={fileUrl} alt={material.title} className="material-image" />
          </div>
        );
      
      default:
        return (
          <div className="document-preview">
            <div className="document-info">
              <FiDownload size={24} />
              <p>This document can be downloaded but not previewed in the browser.</p>
              <button onClick={handleDownload} className="primary-button">
                Download Document
              </button>
            </div>
          </div>
        );
    }
  };
  
  if (loading) return <PageLoading />;
  
  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/admin/dashboard/course-materials')} className="secondary-button">
          <FiArrowLeft /> Back to Materials
        </button>
      </div>
    );
  }
  
  if (!material) {
    return (
      <div className="admin-container">
        <div className="error-message">Material not found.</div>
        <button onClick={() => navigate('/admin/dashboard/course-materials')} className="secondary-button">
          <FiArrowLeft /> Back to Materials
        </button>
      </div>
    );
  }
  
  return (
    <div className="admin-container">
      <div className="page-header">
        <div className="title-section">
          <h1>{material.title}</h1>
          <div className="header-actions">
            <button onClick={() => navigate('/admin/dashboard/course-materials')} className="secondary-button">
              <FiArrowLeft /> Back to Materials
            </button>
            <button onClick={() => navigate(`/admin/dashboard/course-materials/${materialId}/edit`)} className="primary-button">
              <FiEdit /> Edit Material
            </button>
            {material.file_type !== 'link' && material.is_downloadable && (
              <button onClick={handleDownload} className="primary-button">
                <FiDownload /> Download
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="material-details-grid">
        <div className="material-metadata">
          <div className="metadata-section">
            <h3>Material Details</h3>
            <div className="metadata-item">
              <span className="label">Type:</span>
              <span className="value">{material.file_type ? material.file_type.charAt(0).toUpperCase() + material.file_type.slice(1) : 'Unknown'}</span>
            </div>
            {material.file_type !== 'link' && (
              <>
                <div className="metadata-item">
                  <span className="label">Downloadable:</span>
                  <span className="value">{material.is_downloadable ? 'Yes' : 'No'}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Order:</span>
                  <span className="value">{material.order_number || 'Not specified'}</span>
                </div>
              </>
            )}
          </div>
          
          {course && (
            <div className="metadata-section">
              <h3>Course Information</h3>
              <div className="metadata-item">
                <span className="label">Course:</span>
                <span className="value">{course.title}</span>
              </div>
              {session && (
                <div className="metadata-item">
                  <span className="label">Session:</span>
                  <span className="value">{session.title}</span>
                </div>
              )}
            </div>
          )}
          
          {material.description && material.file_type !== 'link' && (
            <div className="metadata-section">
              <h3>Description</h3>
              <p className="material-description">{material.description}</p>
            </div>
          )}
        </div>
        
        <div className="material-preview-section">
          <h3>Preview</h3>
          <div className="material-preview-container">
            {renderMaterialPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMaterialView;

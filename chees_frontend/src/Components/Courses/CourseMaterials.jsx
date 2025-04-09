import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';
import { FiDownload, FiFile, FiFilm, FiImage, FiFileText, FiEye } from 'react-icons/fi';

const CourseMaterials = ({ courseId, isEnrolled }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId && isEnrolled) {
      fetchCourseMaterials();
    }
  }, [courseId, isEnrolled]);

  const fetchCourseMaterials = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`/api/course-materials?course_id=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setMaterials(response.data.data);
      } else {
        setError('Failed to fetch course materials');
      }
    } catch (err) {
      setError('Error fetching course materials: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <FiFile />;
    
    if (mimeType.includes('pdf')) {
      return <FiFileText />;
    } else if (mimeType.includes('image')) {
      return <FiImage />;
    } else if (mimeType.includes('video')) {
      return <FiFilm />;
    } else {
      return <FiFile />;
    }
  };

  const downloadMaterial = async (materialId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Using the download endpoint with proper authentication
      const response = await axios.get(`/api/course-materials/${materialId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Important for handling file downloads
      });
      
      // Create a blob URL and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download material: ' + err.message);
    }
  };
  
  const viewMaterial = (material) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // For PDFs and images, we can use the file URL directly
      // For videos, we might need a different approach depending on how they're stored
      const fileUrl = material.file_url || `/api/course-materials/${material.id}/view`;
      
      window.open(fileUrl, '_blank');
    } catch (err) {
      setError('Failed to view material: ' + err.message);
    }
  };

  if (!isEnrolled) {
    return (
      <div className="materials-not-available">
        <p>Enroll in this course to access the learning materials.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="materials-loading">Loading course materials...</div>;
  }

  if (error) {
    return <div className="materials-error">{error}</div>;
  }

  if (materials.length === 0) {
    return <div className="no-materials">No materials available for this course yet.</div>;
  }

  return (
    <div className="course-materials-container">
      <h3>Course Materials</h3>
      <div className="materials-list">
        {materials.map(material => (
          <div key={material.id} className="material-item">
            <div className="material-icon">
              {getFileIcon(material.mime_type)}
            </div>
            <div className="material-info">
              <h4>{material.title}</h4>
              <p>{material.description}</p>
              <div className="material-meta">
                <span className="material-type">
                  {material.mime_type ? material.mime_type.split('/')[1].toUpperCase() : 'File'}
                </span>
                {material.file_size && (
                  <span className="material-size">
                    {Math.round(material.file_size / 1024)} KB
                  </span>
                )}
              </div>
            </div>
            <div className="material-actions">
              <button 
                className="view-button"
                onClick={() => viewMaterial(material)}
                title="View Material"
              >
                <FiEye />
                <span>View</span>
              </button>
              <button 
                className="download-button"
                onClick={() => downloadMaterial(material.id)}
                title="Download Material"
              >
                <FiDownload />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseMaterials;

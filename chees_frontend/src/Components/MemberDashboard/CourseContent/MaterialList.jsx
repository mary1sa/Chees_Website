import React, { useState, useEffect } from 'react';
import { FiFile, FiDownload, FiPlay, FiImage, FiFileText, FiLink } from 'react-icons/fi';
import axios from 'axios';
import './CourseContent.css';

const MaterialList = ({ courseId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (courseId) {
      fetchMaterials();
    }
  }, [courseId]);
  
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}/materials`);
      if (response.data.success) {
        setMaterials(response.data.data);
      } else {
        setError('Failed to fetch course materials');
      }
    } catch (err) {
      setError(`Error fetching course materials: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = async (materialId, materialName) => {
    try {
      const response = await axios.get(`/api/course-materials/${materialId}/download`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', materialName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(`Error downloading file: ${err.message}`);
    }
  };
  
  // Helper to get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFile />;
    
    if (fileType.includes('pdf')) {
      return <FiFileText />;
    } else if (fileType.includes('video')) {
      return <FiPlay />;
    } else if (fileType.includes('image')) {
      return <FiImage />;
    } else if (fileType.includes('link')) {
      return <FiLink />;
    } else {
      return <FiFile />;
    }
  };
  
  if (loading) {
    return <div className="materials-loading">Loading materials...</div>;
  }
  
  if (error) {
    return <div className="materials-error">{error}</div>;
  }
  
  if (materials.length === 0) {
    return (
      <div className="empty-materials">
        <p>No materials available for this course yet.</p>
      </div>
    );
  }
  
  return (
    <div className="materials-list">
      {materials.map(material => (
        <div key={material.id} className="material-item">
          <div className="material-icon">
            {getFileIcon(material.file_type)}
          </div>
          
          <div className="material-info">
            <h4 className="material-title">{material.title}</h4>
            <p className="material-description">{material.description}</p>
            <div className="material-meta">
              <span className="material-type">{material.file_type}</span>
              {material.file_size && (
                <span className="material-size">{formatFileSize(material.file_size)}</span>
              )}
            </div>
          </div>
          
          <div className="material-actions">
            {material.url ? (
              <a 
                href={material.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="material-action-button"
              >
                View
              </a>
            ) : (
              <button 
                className="material-action-button"
                onClick={() => handleDownload(material.id, material.title)}
              >
                <FiDownload /> Download
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default MaterialList;

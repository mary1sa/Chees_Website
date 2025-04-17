import React, { useState, useEffect } from 'react';
import { FiFile, FiDownload, FiPlay, FiImage, FiFileText, FiLink, FiExternalLink, FiEye } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './CourseContent.css';

const MaterialList = ({ courseId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  useEffect(() => {
    if (courseId) {
      fetchMaterials();
    }
  }, [courseId]);
  
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/courses/${courseId}/materials`);
      if (response.data.success) {
        // Sort materials by order_number - handle null/undefined values by placing them at the end
        const sortedMaterials = response.data.data.sort((a, b) => {
          // If either order_number is null/undefined, set a default high value
          const orderA = a.order_number !== null && a.order_number !== undefined ? a.order_number : Number.MAX_SAFE_INTEGER;
          const orderB = b.order_number !== null && b.order_number !== undefined ? b.order_number : Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
        console.log('Course materials received and sorted by order_number:', sortedMaterials);
        setMaterials(sortedMaterials);
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
      // Create a hidden anchor element
      const link = document.createElement('a');
      link.href = `${process.env.REACT_APP_API_URL}/api/course-materials/${materialId}/download`;
      // Ensure the browser treats this as a download
      link.setAttribute('download', materialName || 'download');
      // Hide the element and add it to the document
      link.style.display = 'none';
      document.body.appendChild(link);
      // Trigger the download
      link.click();
      // Clean up
      document.body.removeChild(link);
    } catch (err) {
      setError(`Error downloading file: ${err.message}`);
    }
  };

  const handlePreview = async (materialId) => {
    try {
      window.open(`${process.env.REACT_APP_API_URL}/api/course-materials/${materialId}/view`, '_blank');
    } catch (err) {
      setError(`Error previewing file: ${err.message}`);
    }
  };
  
  // Helper to get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FiFile className="material-type-icon" />;
    
    const type = fileType.toLowerCase();
    switch(type) {
      case 'pdf':
        return <FiFileText className="material-type-icon pdf" />;
      case 'video':
        return <FiPlay className="material-type-icon video" />;
      case 'image':
        return <FiImage className="material-type-icon image" />;
      case 'document':
        return <FiFileText className="material-type-icon document" />;
      default:
        return <FiFile className="material-type-icon" />;
    }
  };
  
  // Helper to detect if a material is a link
  const isLinkMaterial = (material) => {
    if (!material) return false;
    
    // Check various conditions that would indicate this is a link
    return (
      // Check if file_type is explicitly set to 'link'
      (material.file_type && material.file_type.toLowerCase() === 'link') ||
      // Check if description contains a URL
      (material.description && (
        material.description.startsWith('http://') ||
        material.description.startsWith('https://')
      )) ||
      // Check if title contains indicator words
      (material.title && material.title.toLowerCase().includes('link'))
    );
  };
  
  // Helper to extract URL from a material
  const getUrlFromMaterial = (material) => {
    if (!material) return '';
    
    // Try to find a URL in various fields
    if (material.description && (
      material.description.startsWith('http://') ||
      material.description.startsWith('https://')
    )) {
      return material.description;
    }
    
    // If we have a file_path that looks like a URL
    if (material.file_path && (
      material.file_path.startsWith('http://') ||
      material.file_path.startsWith('https://')
    )) {
      return material.file_path;
    }
    
    // Default to empty string if no URL found
    return '';
  };
  
  // Filter materials by type
  const filteredMaterials = filterType === 'all' 
    ? materials 
    : materials.filter(material => material.file_type === filterType);
  
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
  
  // Get unique material types for filter
  // Filter out null or undefined file types
  const materialTypes = ['all', ...new Set(materials.map(material => material.file_type).filter(Boolean))];
  
  return (
    <div className="materials-container">
      <div className="materials-header">
        <h3>Course Materials</h3>
        <div className="material-filters">
          {materialTypes.map(type => (
            <button
              key={type}
              className={`filter-button ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="materials-list">
        {filteredMaterials.map(material => {
          // Determine if material is a link
          const isLink = isLinkMaterial(material);
          const url = getUrlFromMaterial(material);
          
          return (
            <div key={material.id} className={`material-item ${isLink ? 'link' : material.file_type || 'unknown'}`}>
              <div className="material-icons">
                {isLink ? <FiLink className="material-type-icon link" /> : getFileIcon(material.file_type)}
              </div>
              
              <div className="material-info">
                <h4 className="material-title">{material.title}</h4>
                {!isLink && material.description && (
                  <p className="material-description">{material.description}</p>
                )}
                {isLink && (
                  <p className="material-description material-link">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {url}
                    </a>
                  </p>
                )}
                <div className="material-meta">
                  <span className={`material-type-badge ${isLink ? 'link-badge' : material.file_type ? `${material.file_type}-badge` : ''}`}>
                    {isLink ? 'LINK' : material.file_type ? material.file_type.toUpperCase() : 'UNKNOWN'}
                  </span>
                  
                </div>
                {material.order_number !== null && material.order_number !== undefined && (
                    <span className="material-type-badge" style={{backgroundColor: '#f0f0f0', color: '#555'}} title="Material order number">
                      #{material.order_number}
                    </span>
                  )}
              </div>
              
              <div className="material-actions">
                {isLink ? (
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="material-action-button link"
                    title="Open Link"
                  >
                    <FiExternalLink />
                  </a>
                ) : material.file_path ? (
                  <>
                    {/* <button 
                      className="material-action-button preview"
                      onClick={() => handlePreview(material.id)}
                      title="View"
                    >
                      <FiEye />
                    </button> */}
                    {material.is_downloadable && (
                      <button 
                        className="material-action-button download"
                        onClick={() => handleDownload(material.id, material.title)}
                        title="Download"
                      >
                        <FiDownload />
                      </button>
                    )}
                  </>
                ) : (
                  <span className="material-unavailable">No file available</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
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

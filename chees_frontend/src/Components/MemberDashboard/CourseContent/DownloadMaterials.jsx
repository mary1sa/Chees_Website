import React, { useState } from 'react';
import { FiDownload, FiFilter, FiSearch, FiFile, FiFileText, FiImage, FiPlay } from 'react-icons/fi';
import './CourseContent.css';

const DownloadMaterials = ({ materials = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Filter materials based on search term and filter type
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          material.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                          (filterType === 'documents' && material.file_type.includes('pdf')) ||
                          (filterType === 'videos' && material.file_type.includes('video')) ||
                          (filterType === 'images' && material.file_type.includes('image'));
    
    return matchesSearch && matchesFilter;
  });
  
  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return <FiFileText className="file-icon document" />;
    } else if (fileType.includes('video')) {
      return <FiPlay className="file-icon video" />;
    } else if (fileType.includes('image')) {
      return <FiImage className="file-icon image" />;
    } else {
      return <FiFile className="file-icon" />;
    }
  };
  
  return (
    <div className="download-materials-container">
      <div className="download-materials-header">
        <h3>Course Materials</h3>
        <div className="download-materials-controls">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <FiFilter className="filter-icon" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Materials</option>
              <option value="documents">Documents</option>
              <option value="videos">Videos</option>
              <option value="images">Images</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredMaterials.length === 0 ? (
        <div className="no-materials-message">
          {searchTerm || filterType !== 'all' 
            ? "No materials match your search criteria."
            : "No downloadable materials available for this course."}
        </div>
      ) : (
        <div className="materials-grid">
          {filteredMaterials.map(material => (
            <div key={material.id} className="material-card">
              <div className="material-card-header">
                {getFileIcon(material.file_type)}
                <h4 className="material-title">{material.title}</h4>
              </div>
              
              <div className="material-card-content">
                <p className="material-description">{material.description}</p>
                
                <div className="material-meta">
                  <span className="material-format">{material.file_type}</span>
                  {material.file_size && (
                    <span className="material-size">{formatFileSize(material.file_size)}</span>
                  )}
                </div>
              </div>
              
              <div className="material-card-footer">
                <a 
                  href={material.download_url} 
                  download={material.title}
                  className="download-button"
                >
                  <FiDownload /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
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

export default DownloadMaterials;

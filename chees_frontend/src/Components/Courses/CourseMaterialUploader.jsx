import React, { useState } from 'react';
import axios from 'axios';
import './Courses.css';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

/**
 * Course Material Uploader Component
 * 
 * Handles uploading course materials (PDFs, videos, images) following
 * the backend's file upload system requirements:
 * - Uses form-data (not JSON)
 * - Supports field names 'file' and 'file_path'
 * - Files stored in storage/app/public/course_materials/{course_id}/
 */
const CourseMaterialUploader = ({ courseId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const uploadMaterial = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      // Create form data object
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('course_id', courseId);
      formData.append('file', selectedFile); // Using 'file' field name as required by backend
      
      // Make POST request with form-data
      const response = await axios.post('/api/course-materials', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // Important for form-data
        }
      });
      
      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setError('Failed to upload material');
      }
    } catch (err) {
      setError('Error uploading material: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-material-uploader">
      <h3>Upload Course Material</h3>
      
      {error && (
        <div className="upload-error">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="upload-success">
          <p>Material uploaded successfully!</p>
        </div>
      )}
      
      <form onSubmit={uploadMaterial} className="upload-form">
        <div className="form-group">
          <label htmlFor="material-title">Title *</label>
          <input
            id="material-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter material title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="material-description">Description</label>
          <textarea
            id="material-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter material description"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label>File *</label>
          <div className="file-upload-area">
            {!selectedFile ? (
              <>
                <input
                  type="file"
                  id="material-file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mov"
                  className="file-input"
                />
                <label htmlFor="material-file" className="file-upload-button">
                  <FiUpload />
                  <span>Choose File</span>
                </label>
                <p className="file-help-text">
                  Upload PDF, Word, PowerPoint, Excel, image, or video files
                </p>
              </>
            ) : (
              <div className="selected-file">
                <div className="file-preview">
                  {previewUrl ? (
                    <img src={previewUrl} alt="File Preview" className="image-preview" />
                  ) : (
                    <FiFile className="file-icon" />
                  )}
                </div>
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">{Math.round(selectedFile.size / 1024)} KB</p>
                </div>
                <button
                  type="button"
                  className="remove-file-button"
                  onClick={clearSelectedFile}
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="upload-button"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseMaterialUploader;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './CourseManagement.css';
import './CreateCourse.css';

const CourseForm = ({ isEditing = false, isViewOnly = false }) => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    level_id: '',
    max_students: '',
    is_online: true,
    is_active: true,
    thumbnail: null
  });
  
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    // Set the document title based on form mode
    if (isViewOnly) {
      document.title = 'View Course';
    } else {
      document.title = isEditing ? 'Edit Course' : 'Create Course';
    }
    
    // Fetch levels
    fetchLevels();
    
    // If editing or viewing, fetch course data
    if ((isEditing || isViewOnly) && courseId) {
      fetchCourseData();
    }
  }, [isEditing, isViewOnly, courseId]);
  
  const fetchLevels = async () => {
    try {
      const response = await axiosInstance.get('/api/course-levels');
      if (response.data.success) {
        setLevels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
      setError('Failed to load course levels. Please try again.');
    }
  };
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/courses/${courseId}`);
      
      if (response.data.success) {
        const courseData = response.data.data;
        
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          price: courseData.price || '',
          duration: courseData.duration || '',
          level_id: courseData.level_id || '',
          max_students: courseData.max_students || '',
          is_online: courseData.is_online,
          is_active: courseData.is_active,
          thumbnail: null,
          original_thumbnail: courseData.thumbnail
        });
        
        // Determine the base URL for our API
        const baseUrl = axiosInstance.defaults.baseURL || '';

        // Set a default chess-themed placeholder image as a backup
        const placeholderImage = 'https://placehold.co/400x300/e9ecef/495057?text=Chess+Course';
        
        if (courseData.thumbnail_url) {
          setThumbnailPreview(courseData.thumbnail_url);
        } else if (courseData.thumbnail) {
          if (courseData.thumbnail_exists === false) {
            setThumbnailPreview(placeholderImage);
          } else {
            let thumbnailUrl;
            
            if (courseData.thumbnail.includes('/')) {
              const directoryPath = courseData.thumbnail;
              thumbnailUrl = `${baseUrl || window.location.origin}/storage/${directoryPath}`;
            } else {
              // Old format: just the filename
              thumbnailUrl = `${baseUrl || window.location.origin}/storage/courses/${courseData.thumbnail}`;
            }
            
            setThumbnailPreview(thumbnailUrl);
          }
        } else {
          setThumbnailPreview(null);
        }
      } else {
        setError('Failed to load course details. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError(`Error loading course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        thumbnail: file
      });
      
      // Create a URL for the file for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeThumbnail = () => {
    setFormData({
      ...formData,
      thumbnail: null,
      original_thumbnail: null
    });
    setThumbnailPreview(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      for (const key in formData) {
        if (key !== 'thumbnail' && key !== 'original_thumbnail') {
          // Convert boolean values for proper API handling
          if (key === 'is_online' || key === 'is_active') {
            formDataToSend.append(key, formData[key] ? 1 : 0);
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      }
      
      // Only append the file if a new thumbnail was selected
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      } else if (isEditing && formData.original_thumbnail) {
        // If editing and no new thumbnail was selected, keep the original
        formDataToSend.append('file_path', formData.original_thumbnail);
      }
      
      let response;
      
      if (isEditing && courseId) {
        // If editing and we have a courseId, update
        response = await axiosInstance.post(
          `/api/courses/${courseId}/update-with-file`, 
          formDataToSend, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Otherwise create a new course
        response = await axiosInstance.post(
          '/api/courses', 
          formDataToSend, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      if (response.data.success) {
        setSuccess(
          isEditing 
            ? 'Course updated successfully!' 
            : 'Course created successfully!'
        );
        
        // Reset form if creating a new course
        if (!isEditing) {
          setFormData({
            title: '',
            description: '',
            price: '',
            duration: '',
            level_id: '',
            max_students: '',
            is_online: true,
            is_active: true,
            thumbnail: null
          });
          setThumbnailPreview(null);
        } else {
          // If editing, update the form data with the response
          const updatedCourse = response.data.data;
          setFormData({
            ...formData,
            ...updatedCourse,
            thumbnail: null
          });
          
          // Update thumbnail preview if a new one was sent
          if (updatedCourse.thumbnail_url) {
            setThumbnailPreview(updatedCourse.thumbnail_url);
          }
        }
        
        // Redirect to course list after a delay
        setTimeout(() => {
          navigate('/admin/dashboard/courses');
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving course:', err);
      
      // Display specific validation errors if available
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join('\n');
        setError(`Validation errors:\n${errorMessages}`);
      } else {
        setError(`Error: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="create-course-container">
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <h2 className="create-course-title">
        {isViewOnly ? 'Course Details' : (isEditing ? 'Edit Course' : 'Create Course')}
      </h2>
      
      <form onSubmit={handleSubmit} className={`create-course-form ${isViewOnly ? 'view-only-form' : ''}`}>
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            placeholder="Enter course title"
            value={formData.title} 
            onChange={handleInputChange} 
            disabled={isViewOnly}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="level_id">Course Level</label>
          <select 
            id="level_id" 
            name="level_id" 
            value={formData.level_id} 
            onChange={handleInputChange} 
            disabled={isViewOnly}
            required
            className="form-select"
          >
            <option value="">Select Level</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (MAD)</label>
          <input 
            type="number" 
            id="price" 
            name="price" 
            placeholder="Enter course price"
            value={formData.price} 
            onChange={handleInputChange} 
            min="0" 
            step="0.01" 
            disabled={isViewOnly}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duration">Duration (hours)</label>
          <input 
            type="number" 
            id="duration" 
            name="duration" 
            placeholder="Enter course duration"
            value={formData.duration} 
            onChange={handleInputChange} 
            min="1" 
            step="1" 
            disabled={isViewOnly}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="max_students">Max Students</label>
          <input 
            type="number" 
            id="max_students" 
            name="max_students" 
            placeholder="Enter max students"
            value={formData.max_students} 
            onChange={handleInputChange} 
            min="1" 
            step="1" 
            disabled={isViewOnly}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <div className="checkbox-row">
            <div className="checkbox-container">
              <input 
                type="checkbox" 
                id="is_online"
                name="is_online" 
                checked={formData.is_online} 
                onChange={handleInputChange} 
                disabled={isViewOnly}
              />
              <label htmlFor="is_online">Online Course</label>
            </div>
            
            <div className="checkbox-container">
              <input 
                type="checkbox" 
                id="is_active"
                name="is_active" 
                checked={formData.is_active} 
                onChange={handleInputChange} 
                disabled={isViewOnly}
              />
              <label htmlFor="is_active">Active Course</label>
            </div>
          </div>
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="description">Course Description</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            rows="6" 
            disabled={isViewOnly}
            required
            className="form-textarea"
          ></textarea>
        </div>
        
        <div className="form-group full-width">
          <label>Course Thumbnail</label>
          
          {!isViewOnly && (
            <div className="thumbnail-upload-container">
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                onChange={handleThumbnailChange}
                accept="image/*"
                className="file-input"
                aria-label="Upload course thumbnail"
              />
              <label htmlFor="thumbnail" className="thumbnail-label" title="" data-title="">
                <FiUpload size={20} /> <span>Select Image</span>
              </label>
            </div>
          )}
            
          {thumbnailPreview && (
            <div className="thumbnail-preview">
              <img 
                src={thumbnailPreview} 
                alt="Thumbnail preview" 
                onError={(e) => {
                  console.error('Image failed to load:', thumbnailPreview);
                  
                  // Use a placeholder image if the thumbnail fails to load
                  if (!thumbnailPreview.includes('placehold.co')) {
                    console.log('Using placeholder image instead of attempting retries');
                    e.target.src = 'https://placehold.co/400x300/e9ecef/495057?text=Chess+Course';
                  } else {
                    // If even the placeholder fails, hide the image
                    console.log('Placeholder image failed, showing text fallback');
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('thumbnail-placeholder');
                  }
                }} 
              />
              {!isViewOnly && (
                <button 
                  type="button" 
                  className="remove-thumbnail" 
                  onClick={removeThumbnail}
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          {isViewOnly ? (
            <>
              <button 
                type="button" 
                className="cancel-course-button" 
                onClick={() => navigate('/admin/dashboard/courses')}
              >
                <FiX /> Back to Courses
              </button>
              
              <button 
                type="button" 
                className="save-button" 
                onClick={() => navigate(`/admin/dashboard/courses/${courseId}/edit`)}
              >
                <FiSave /> Edit Course
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                className="cancel-course-button" 
                onClick={() => navigate('/admin/dashboard/courses')}
                disabled={loading}
              >
                <FiX /> Cancel
              </button>
              
              <button 
                type="submit" 
                className="save-button" 
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-button">
                    <span className="spinner"></span> Saving...
                  </span>
                ) : (
                  <>
                    <FiSave /> Save Course
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default CourseForm;

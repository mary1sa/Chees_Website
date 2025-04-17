import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiLink, FiFile, FiPaperclip } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import '../CourseManagement/CourseManagement.css';
import './CourseMaterialManagement.css';
import PageLoading from '../../PageLoading/PageLoading';

const CourseMaterialForm = ({ isEditing = false }) => {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [materialType, setMaterialType] = useState('file'); // 'file' or 'link'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    course_id: '',
    session_id: '',
    title: '',
    description: '',
    file: null,
    file_path: '',
    file_type: '',
    external_url: '',
    is_downloadable: true,
    order_number: 0,
  });
  
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileDetails, setFileDetails] = useState({
    name: '',
    size: 0,
    type: ''
  });
  const [courseMaterials, setCourseMaterials] = useState([]);
  
  useEffect(() => {
    fetchCourses();
    if (isEditing && materialId) {
      fetchMaterialDetails();
    }
  }, [isEditing, materialId]);
  
  useEffect(() => {
    if (formData.course_id) {
      fetchSessions(formData.course_id);
      fetchCourseMaterials(formData.course_id);
    } else {
      setSessions([]);
      setCourseMaterials([]);
    }
  }, [formData.course_id]);
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/courses');
      if (response.data.success) {
        setCourses(response.data.data.data);
        
        // If there's at least one course and we're not editing, select the first course
        if (response.data.data.data.length > 0 && !isEditing) {
          setFormData(prev => ({
            ...prev,
            course_id: response.data.data.data[0].id
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSessions = async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/course-sessions?course_id=${courseId}`);
      if (response.data.success) {
        // Check if the response is paginated or not
        if (response.data.data && response.data.data.data) {
          // Handle paginated response (with data.data structure)
          console.log('Sessions: Using paginated data format');
          setSessions(response.data.data.data);
        } else if (Array.isArray(response.data.data)) {
          // Handle non-paginated response
          console.log('Sessions: Using non-paginated data format');
          setSessions(response.data.data);
        } else {
          // Fallback to empty array if format is unexpected
          console.warn('Sessions: Unexpected data format in response:', response.data);
          setSessions([]);
        }
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setSessions([]);
    }
  };
  
  const fetchCourseMaterials = async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/course-materials?course_id=${courseId}`);
      if (response.data.success) {
        // Check if the response is paginated or not
        if (response.data.data && response.data.data.data) {
          // Handle paginated response (with data.data structure)
          console.log('Course Materials: Using paginated data format');
          setCourseMaterials(response.data.data.data);
        } else if (Array.isArray(response.data.data)) {
          // Handle non-paginated response
          console.log('Course Materials: Using non-paginated data format');
          setCourseMaterials(response.data.data);
        } else {
          // Fallback to empty array if format is unexpected
          console.warn('Course Materials: Unexpected data format in response:', response.data);
          setCourseMaterials([]);
        }
      } else {
        setCourseMaterials([]);
      }
    } catch (err) {
      console.error('Error fetching course materials:', err);
      setCourseMaterials([]);
    }
  };
  
  const fetchMaterialDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/course-materials/${materialId}`);
      if (response.data.success) {
        const material = response.data.data;
        
        // Determine material type
        const isLink = material.file_type === 'link';
        setMaterialType(isLink ? 'link' : 'file');
        
        setFormData({
          course_id: material.course_id,
          session_id: material.session_id || '',
          title: material.title,
          description: material.description || '',
          file: null,
          file_path: material.file_path || '',
          file_type: material.file_type || '',
          external_url: isLink ? material.description : '',
          is_downloadable: material.is_downloadable,
          order_number: material.order_number || 0,
        });
        
        if (material.file_path) {
          setPreviewUrl(`${process.env.REACT_APP_API_URL}/storage/${material.file_path}`);
        }
      }
    } catch (err) {
      console.error('Error fetching material details:', err);
      setError('Failed to load material details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
      return;
    }
    
    // Handle all other inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Determine file type
    let fileType = 'document';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type === 'application/pdf') {
      fileType = 'pdf';
    }
    
    // Update form data with file and file_type
    setFormData(prev => ({
      ...prev,
      file: file,
      file_type: fileType
    }));
    
    // Create a preview URL for the file if it's an image
    if (file.type.startsWith('image/')) {
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    } else {
      setPreviewUrl('');
    }
    
    // Set file details
    setFileDetails({
      name: file.name,
      size: file.size,
      type: file.type
    });
  };
  
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  const handleTypeChange = (type) => {
    setMaterialType(type);
    // Reset file-related fields when switching to link type
    if (type === 'link') {
      setFormData(prev => ({
        ...prev,
        file: null,
        file_type: 'link'
      }));
      setPreviewUrl('');
      setFileDetails({
        name: '',
        size: 0,
        type: ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        file_type: ''
      }));
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.course_id) {
      setError('Please select a course');
      return false;
    }
    
    if (materialType === 'file' && !isEditing && !formData.file) {
      setError('Please upload a file');
      return false;
    }
    
    if (materialType === 'link' && !formData.external_url.trim()) {
      setError('Please enter a valid URL');
      return false;
    }
    
    if (materialType === 'link' && !isValidUrl(formData.external_url)) {
      setError('Please enter a valid URL (include http:// or https://)');
      return false;
    }
    
    // Check for unique display order within the course
    const isDuplicateOrder = courseMaterials.some(material => 
      // If we're editing, we need to exclude the current material from the check
      material.order_number === parseInt(formData.order_number) && 
      (!isEditing || (isEditing && material.id !== parseInt(materialId)))
    );
    
    if (isDuplicateOrder) {
      setError(`Display order ${formData.order_number} is already used in this course. Please choose a unique value.`);
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      const submitData = new FormData();
      submitData.append('course_id', formData.course_id);
      submitData.append('title', formData.title);
      submitData.append('is_downloadable', formData.is_downloadable ? 1 : 0);
      submitData.append('order_number', formData.order_number);
      
      if (formData.session_id) {
        submitData.append('session_id', formData.session_id);
      }
      
      if (materialType === 'file') {
        // File upload
        if (formData.file) {
          submitData.append('file', formData.file);
          submitData.append('file_type', formData.file_type);
        }
        if (formData.description) {
          submitData.append('description', formData.description);
        }
      } else {
        // Link
        submitData.append('description', formData.external_url);
        submitData.append('file_type', 'link');
      }
      
      let response;
      
      if (isEditing) {
        // For editing, need to use a special route for file uploads
        if (formData.file) {
          response = await axiosInstance.post(
            `/api/course-materials/${materialId}/update-with-file`, 
            submitData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
              }
            }
          );
        } else {
          // Regular update without file
          response = await axiosInstance.put(
            `/api/course-materials/${materialId}`, 
            submitData
          );
        }
      } else {
        // Creating new material
        response = await axiosInstance.post(
          '/api/course-materials', 
          submitData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        );
      }
      
      if (response.data.success) {
        setSuccess(`Course material ${isEditing ? 'updated' : 'created'} successfully`);
        
        // Redirect after a short delay to allow user to see success message
        setTimeout(() => {
          navigate('/admin/dashboard/course-materials');
        }, 1500);
      } else {
        setError('Failed to save the course material. Please try again.');
      }
    } catch (err) {
      console.error('Error saving course material:', err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} the course material: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return <PageLoading text={`Loading ${isEditing ? 'material details' : 'form'}...`} />;
  }
  
  return (
    <div className="course-form-container">
      <div className="form-header">
        <h1>{isEditing ? 'Edit Course Material' : 'Add Course Material'}</h1>
        
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <FiX className="alert-icon" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          <FiSave className="alert-icon" />
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="course-form">
        {!isEditing && (
          <div className="form-section">
            <h2>Course Selection</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course_id">Course *</label>
                <select
                  id="course_id"
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter material title"
                required
                className="form-input"
              />
            </div>
            
            {isEditing && (
              <div className="form-group">
                <label htmlFor="course_id">Course *</label>
                <select
                  id="course_id"
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                  disabled={isEditing}
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <p className="form-hint">Course cannot be changed when editing a material</p>
              </div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="session_id">Session (Optional)</label>
              <select
                id="session_id"
                name="session_id"
                value={formData.session_id}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">No specific session</option>
                {sessions.map(session => {
                  // Format date safely with validation
                  let dateDisplay = '';
                  if (session.start_datetime) {
                    const sessionDate = new Date(session.start_datetime);
                    dateDisplay = !isNaN(sessionDate.getTime()) 
                      ? sessionDate.toLocaleDateString() 
                      : '(No date)';
                  } else {
                    dateDisplay = '(No date)';
                  }
                  
                  return (
                    <option key={session.id} value={session.id}>
                      {session.title} - {dateDisplay}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="order_number">Display Order</label>
              <input
                type="number"
                id="order_number"
                name="order_number"
                value={formData.order_number}
                onChange={handleInputChange}
                min="0"
                className="form-input"
              />
              <small>Lower numbers appear first. Must be unique per course.</small>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{ width: '100%' }}>
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a description for this material"
                rows="4"
                className="form-textarea"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Material Type</h2>
          
          <div className="material-type-selector" style={{ justifyContent: 'center' }}>
            <button 
              type="button"
              className={`type-button ${materialType === 'file' ? 'active' : ''}`}
              onClick={() => handleTypeChange('file')}
            >
              <FiFile className="type-icon" />
              <span>Upload File</span>
            </button>
            
            <button 
              type="button"
              className={`type-button ${materialType === 'link' ? 'active' : ''}`}
              onClick={() => handleTypeChange('link')}
            >
              <FiLink className="type-icon" />
              <span>External Link</span>
            </button>
          </div>
          
          {materialType === 'file' && (
            <div className="material-upload-section">
              <div className="form-row">
                <div className="form-group" style={{ width: '100%' }}>
                  <label htmlFor="file">File Upload</label>
                  
                  {isEditing && formData.file_path && !formData.file && (
                    <div className="current-file" style={{ textAlign: 'center' }}>
                      <p><strong>Current file:</strong> Available</p>
                      
                    </div>
                  )}
                  
                  <div className="file-upload-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <div 
                      className="file-upload-area"
                      onClick={() => fileInputRef.current.click()}
                      style={{ maxWidth: '500px', width: '100%' }}
                    >
                      <FiUpload className="upload-icon" />
                      <p>Click to select or drag and drop</p>
                      <p className="file-types">PDF, Video, Image, or Document</p>
                    </div>
                    
                    <input
                      type="file"
                      id="file"
                      name="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.webm"
                    />
                  </div>
                  
                  {formData.file && (
                    <div className="selected-file" style={{ maxWidth: '500px', margin: '0 auto' }}>
                      <div className="file-info">
                        <FiPaperclip className="file-icon" />
                        <div>
                          <p className="file-name">{fileDetails.name}</p>
                          <p className="file-size">{formatFileSize(fileDetails.size)}</p>
                        </div>
                      </div>
                      {formData.file_type === 'image' && (
                        <div className="file-preview" style={{ display: 'flex', justifyContent: 'center' }}>
                          <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px' }} />
                        </div>
                      )}
                      <button
                        type="button"
                        className="remove-file"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, file: null }));
                          setFileDetails({ name: '', size: 0, type: '' });
                          setPreviewUrl('');
                        }}
                        style={{ margin: '12px auto', display: 'flex' }}
                      >
                        <FiX /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-checkbox" style={{ justifyContent: 'center', marginTop: '20px' }}>
                <input
                  type="checkbox"
                  id="is_downloadable"
                  name="is_downloadable"
                  checked={formData.is_downloadable}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_downloadable">Allow users to download this file</label>
              </div>
            </div>
          )}
          
          {materialType === 'link' && (
            <div className="material-link-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="form-group">
                <label htmlFor="external_url"> URL *</label>
                <div className="url-input-container">
                  <input
                    type="url"
                    id="external_url"
                    name="external_url"
                    value={formData.external_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/"
                    required={materialType === 'link'}
                    className="link-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {isSubmitting && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/course-materials')}
            className="cancel-button"
            disabled={isSubmitting}
          >
            <FiX /> Cancel
          </button>
          
          <button
            type="submit"
            className="save-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading-button">
                <span className="spinner"></span> Saving...
              </span>
            ) : (
              <>
                <FiSave /> {isEditing ? 'Update Material' : 'Save Material'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseMaterialForm;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiBarChart2 } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './CourseLevelManagement.css';

const LevelForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { levelId } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_rating: 0,
    max_rating: 3000
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    if (isEditing && levelId) {
      fetchLevelDetails();
    }
  }, [isEditing, levelId]);
  
  const fetchLevelDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/course-levels/${levelId}`);
      
      if (response.data.success) {
        const levelData = response.data.data;
        setFormData({
          name: levelData.name || '',
          description: levelData.description || '',
          min_rating: levelData.min_rating || 0,
          max_rating: levelData.max_rating || 3000
        });
      } else {
        setError('Failed to fetch level details');
      }
    } catch (err) {
      console.error('Error fetching level details:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (isEditing) {
        // Update existing level
        response = await axiosInstance.put(`/api/course-levels/${levelId}`, formData);
      } else {
        // Create new level
        response = await axiosInstance.post(`/api/course-levels`, formData);
      }
      
      if (response.data.success) {
        setSuccess(response.data.message || `Level ${isEditing ? 'updated' : 'created'} successfully!`);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/admin/dashboard/levels');
        }, 2000);
      } else {
        setError(response.data.message || 'An error occurred');
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} level:`, err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/dashboard/levels');
  };
  
  return (
    <div className="level-form-container">
      <h2><FiBarChart2 /> {isEditing ? 'Edit' : 'Add'} Course Level</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="level-form">
        <div className="form-group">
          <label htmlFor="name">Level Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Beginner, Intermediate, Advanced"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Provide a description of this course level..."
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="min_rating">Minimum Rating</label>
            <input
              type="number"
              id="min_rating"
              name="min_rating"
              value={formData.min_rating}
              onChange={handleChange}
              min="0"
              max={formData.max_rating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="max_rating">Maximum Rating</label>
            <input
              type="number"
              id="max_rating"
              name="max_rating"
              value={formData.max_rating}
              onChange={handleChange}
              min={formData.min_rating}
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            <FiSave /> {loading ? `${isEditing ? 'Updating' : 'Creating'}...` : `${isEditing ? 'Update' : 'Create'} Level`}
          </button>
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            <FiX /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LevelForm;

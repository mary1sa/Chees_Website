import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiBarChart2 } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import './CourseLevelManagement.css';
import PageLoading from '../../PageLoading/PageLoading';

const LevelList = () => {
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [levelCourseCounts, setLevelCourseCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchLevels();
  }, [searchTerm]);
  
  // Add another useEffect to ensure fresh data fetch when component mounts
  useEffect(() => {
    // This ensures we get fresh data whenever the component is displayed
    fetchLevels();
    fetchCourses();
  }, []);
  
  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/course-levels${searchTerm ? `?search=${searchTerm}` : ''}`;
      
      const response = await axiosInstance.get(url);
      
      if (response.data.success) {
        setLevels(response.data.data);
      } else {
        setError('Failed to fetch levels');
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
      setError(`Error loading levels: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCourses = async () => {
    try {
      // Fetch all courses
      const response = await axiosInstance.get('/api/courses?per_page=1000');
      
      if (response.data.success) {
        const coursesData = response.data.data.data || [];
        setCourses(coursesData);
        
        // Calculate course counts by level
        const countsByLevel = {};
        coursesData.forEach(course => {
          if (course.level_id) {
            countsByLevel[course.level_id] = (countsByLevel[course.level_id] || 0) + 1;
          }
        });
        
        setLevelCourseCounts(countsByLevel);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };
  
  const handleDelete = async (levelId) => {
    if (!window.confirm('Are you sure you want to delete this level? This may affect courses assigned to this level.')) {
      return;
    }
    
    try {
      const response = await axiosInstance.delete(`/api/course-levels/${levelId}`);
      
      if (response.data.success) {
        // Refresh the levels list and course counts
        fetchLevels();
        fetchCourses();
      } else {
        setError(response.data.message || 'Failed to delete level');
      }
    } catch (err) {
      console.error('Error deleting level:', err);
      setError(`Error deleting level: ${err.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="level-list-container">
        <div className="level-list-header">
          <h2><FiBarChart2 /> Course Levels</h2>
          <Link to="/admin/dashboard/createlevel" className="add-level-btn">
            <FiPlus /> Add New Level
          </Link>
        </div>
        
        <PageLoading text="Loading levels..." />
      </div>
    );
  }

  return (
    <div className="level-list-container">
      <div className="level-list-header">
        <h2><FiBarChart2 /> Course Levels</h2>
        <Link to="/admin/dashboard/createlevel" className="add-level-btn">
          <FiPlus /> Add New Level
        </Link>
      </div>
      
      <div className="level-search">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search course levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="level-grid">
          {levels.length === 0 ? (
            <div className="no-levels-message">
              <p>No course levels found.</p>
              <p>Add a new level to get started.</p>
            </div>
          ) : (
            <table className="level-table">
              <thead>
                <tr>
                  <th>Level Name</th>
                  <th>Description</th>
                  <th>Rating Range</th>
                  <th>Courses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((level) => (
                  <tr key={level.id}>
                    <td>{level.name}</td>
                    <td>
                      {level.description.length > 100
                        ? `${level.description.substring(0, 100)}...`
                        : level.description
                      }
                    </td>
                    <td>
                      {level.min_rating} - {level.max_rating}
                    </td>
                    <td>
                      {levelCourseCounts[level.id] || 0} courses
                    </td>
                    <td className="action-buttons">
                      <Link
                        to={`/admin/dashboard/levels/edit/${level.id}`}
                        className="edit-button"
                        title="Edit Level"
                      >
                        <FiEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(level.id)}
                        className="delete-button"
                        title="Delete Level"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
    </div>
  );
};

export default LevelList;

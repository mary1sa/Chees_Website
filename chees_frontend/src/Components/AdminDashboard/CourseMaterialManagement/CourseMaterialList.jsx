import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiDownload, FiEye, FiChevronLeft, FiChevronRight, FiList } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import '../CourseManagement/CourseManagement.css';
import '../../AdminDashboard/UserTable.css';
import PageLoading from '../../PageLoading/PageLoading';
import ConfirmDelete from '../../Confirm/ConfirmDelete';

const CourseMaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const ITEMS_PER_PAGE_GRID = 8;
  const ITEMS_PER_PAGE_LIST = 10;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCourses();
    fetchMaterials();
  }, [searchTerm, filterCourse, filterType, currentPage, viewMode]);
  
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/api/courses');
      if (response.data.success) {
        setCourses(response.data.data.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };
  
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (filterCourse !== 'all') {
        queryParams.append('course_id', filterCourse);
      }
      
      if (filterType !== 'all') {
        queryParams.append('file_type', filterType);
      }
      
      // Add pagination parameters
      queryParams.append('page', currentPage);
      
      // Set different items per page based on view mode
      const perPage = viewMode === 'grid' ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_LIST;
      queryParams.append('per_page', perPage);
      
      const url = `/api/course-materials?${queryParams.toString()}`;
      console.log('Fetching materials with URL:', url);
      
      const response = await axiosInstance.get(url);
      console.log('Materials response:', response.data);
      
      if (response.data.success) {
        // Check if data is paginated by looking for the pagination structure
        if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          // Laravel paginated response format
          console.log('Using paginated data format');
          setMaterials(response.data.data.data);
          setTotalPages(response.data.data.last_page || 1);
          console.log(`Got ${response.data.data.data.length} materials, page ${currentPage} of ${response.data.data.last_page}`);
        } else if (Array.isArray(response.data.data)) {
          // Legacy format (not paginated)
          console.log('Using legacy non-paginated format');
          setMaterials(response.data.data);
          // Force artificial pagination for display purposes
          const totalItems = response.data.data.length;
          const calculatedTotalPages = Math.ceil(totalItems / perPage);
          setTotalPages(calculatedTotalPages || 1);
          
          // Manual pagination on frontend if backend doesn't support it
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const paginatedMaterials = response.data.data.slice(startIndex, endIndex);
          console.log(`Manual pagination: showing ${paginatedMaterials.length} of ${totalItems} materials`);
          setMaterials(paginatedMaterials);
        } else {
          console.error('Unexpected response format:', response.data);
          setMaterials([]);
          setTotalPages(1);
        }
      } else {
        console.error('API returned error:', response.data);
        setError('Failed to fetch course materials');
        setMaterials([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching course materials:', err);
      setError('Error loading course materials. Please try again later.');
      setMaterials([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/api/course-materials/${materialToDelete.id}`);
      if (response.data.success) {
        // Refresh the materials list
        fetchMaterials();
      } else {
        setError('Failed to delete course material');
      }
    } catch (err) {
      setError(`Error deleting course material: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
      setMaterialToDelete(null);
      setLoading(false);
    }
  };

  const handleDelete = (material) => {
    setMaterialToDelete(material);
    setShowDeleteModal(true);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleCourseFilterChange = (e) => {
    setFilterCourse(e.target.value);
    setCurrentPage(1);
  };
  
  const handleTypeFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const downloadMaterial = async (materialId) => {
    try {
      // First get the material details to determine file type
      const materialResponse = await axiosInstance.get(`/api/course-materials/${materialId}`);
      if (!materialResponse.data.success) {
        throw new Error('Could not retrieve material details');
      }
      
      const material = materialResponse.data.data;
      let fileType = material.file_type;
      
      // Additional check: if file_path ends with .pdf, override the file_type
      if (material.file_path && material.file_path.toLowerCase().endsWith('.pdf')) {
        fileType = 'pdf';
      }
      
      // Get appropriate extension based on file type
      let extension = '';
      switch (fileType) {
        case 'pdf':
          extension = '.pdf';
          break;
        case 'video':
          extension = '.mp4';
          break;
        case 'image':
          // Try to extract extension from file_path if available
          if (material.file_path) {
            const pathExtension = material.file_path.split('.').pop().toLowerCase();
            extension = pathExtension ? '.' + pathExtension : '.jpg';
          } else {
            extension = '.jpg';
          }
          break;
        case 'document':
          // Try to extract extension from file_path if available
          if (material.file_path) {
            const pathExtension = material.file_path.split('.').pop().toLowerCase();
            // Special case: if file is actually a PDF, use .pdf extension
            if (pathExtension === 'pdf') {
              extension = '.pdf';
            } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(pathExtension)) {
              extension = '.' + pathExtension;
            } else {
              extension = '.docx';
            }
          } else {
            extension = '.docx';
          }
          break;
        default:
          // For unknown types, try to extract from file_path
          if (material.file_path) {
            const pathExtension = material.file_path.split('.').pop().toLowerCase();
            extension = pathExtension ? '.' + pathExtension : '';
          }
      }
      
      console.log(`Downloading file with type: ${fileType}, extension: ${extension}`);
      
      // Download the file as binary data
      const response = await axiosInstance.get(`/api/course-materials/${materialId}/download`, {
        responseType: 'blob'
      });
      
      // Check the Content-Type header to help determine the file type
      const contentType = response.headers['content-type'];
      if (contentType === 'application/pdf') {
        extension = '.pdf';
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      
      // Get the filename from Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = material.title || 'download';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      } else {
        // If no Content-Disposition header, make sure the filename has the correct extension
        if (!filename.endsWith(extension)) {
          filename = filename + extension;
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading material:', err);
      setError(`Error downloading material. Please try again. ${err.message}`);
    }
  };
  
  const previewMaterial = async (materialId) => {
    try {
      window.open(`${process.env.REACT_APP_API_URL}/api/course-materials/${materialId}/view`, '_blank');
    } catch (err) {
      setError(`Error previewing material: ${err.message}`);
    }
  };
  
  const getFileTypeIcon = (fileType) => {
    switch(fileType) {
      case 'video':
        return <span className="material-type video">Video</span>;
      case 'pdf':
        return <span className="material-type pdf">PDF</span>;
      case 'document':
        return <span className="material-type document">Document</span>;
      case 'image':
        return <span className="material-type image">Image</span>;
      case 'link':
        return <span className="material-type link">Link</span>;
      default:
        return <span className="material-type other">File</span>;
    }
  };
  
  const isUrl = (str) => {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  if (loading) {
    return <PageLoading text="Loading course materials..." />;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="course-material-container">
      <ConfirmDelete 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMaterialToDelete(null);
        }}
        onConfirm={confirmDeleteMaterial}
        itemName={materialToDelete ? materialToDelete.title : 'this material'}
      />
      
      <div className="page-header">
        <h1 className="page-title"> Course Materials </h1>
        {/* <Link 
          to="/admin/dashboard/course-materials/create" 
          className="btn-primary add-material-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            textDecoration: 'none',
            margin: '20px 0'
          }}
        >
          <FiPlus style={{ marginRight: '8px' }} /> Add New Material
        </Link> */}
      </div>
      
      <div className="filter-controls">
        <div className="filter-group">
          <input 
            type="text" 
            placeholder="Search materials..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={filterCourse} 
            onChange={handleCourseFilterChange}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <select 
            value={filterType} 
            onChange={handleTypeFilterChange}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="link">Links</option>
          </select>
        </div>
      </div>
      
      {materials.length === 0 ? (
        <div className="no-results">
          <h3>No materials found</h3>
          <p>There are no course materials matching your search criteria. Try adjusting your filters or add a new material.</p>
          <Link to="/admin/dashboard/course-materials/create" className="action-button primary-button">
            <FiPlus /> Add New Material
          </Link>
        </div>
      ) : (
        <>
          <div className="data-table materials-table-container">
            <table className="materials-table">
              <thead>
                <tr>
                  <th width="20%">Title</th>
                  <th width="15%">Course</th>
                  <th width="10%">Type</th>
                  <th width="25%">Description</th>
                  <th width="10%">Downloadable</th>
                  <th width="12%">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(material => (
                  <tr key={material.id}>
                    <td className="material-title-cell">{material.title}</td>
                    <td className="material-course-cell">
                      {courses.find(c => c.id === material.course_id)?.title || 'Unknown'}
                    </td>
                    <td className="material-type-cell">
                      {isUrl(material.description) && material.file_type !== 'link' ? 
                        getFileTypeIcon('link') : 
                        getFileTypeIcon(material.file_type)}
                    </td>
                    <td className="material-description-cell">
                      {material.description ? 
                        (isUrl(material.description) ? 
                          <a href={material.description} target="_blank" rel="noopener noreferrer">
                            {material.description.length > 40 ? 
                              `${material.description.substring(0, 40)}...` : 
                              material.description}
                          </a> :
                          (material.description.length > 40 ? 
                            `${material.description.substring(0, 40)}...` : 
                            material.description)) : 
                        'No description'}
                    </td>
                    <td className="material-downloadable-cell">
                      {material.file_type === 'link' || isUrl(material.description) ? 
                        <span className="status-badge inactive">No</span> : 
                        <span className={`status-badge ${material.is_downloadable ? 'active' : 'inactive'}`}>
                          {material.is_downloadable ? 'Yes' : 'No'}
                        </span>
                      }
                    </td>
                    <td className="actions-cell">
                      <Link 
                        to={`/admin/dashboard/course-materials/${material.id}/edit`}
                        className="action-icon-button edit-button"
                        title="Edit material"
                      >
                        <FiEdit />
                      </Link>
                      <button 
                        onClick={() => handleDelete(material)}
                        className="action-icon-button delete-button"
                        title="Delete material"
                      >
                        <FiTrash2 />
                      </button>
                      {material.file_path && material.file_type !== 'link' && !isUrl(material.description) && (
                        <>
                          {/* <button 
                            onClick={() => navigate(`/admin/dashboard/course-materials/${material.id}/view`)}
                            className="action-icon-button view-button"
                            title="View material details"
                          >
                            <FiEye />
                          </button> */}
                          {material.is_downloadable && (
                            <button 
                              onClick={() => downloadMaterial(material.id)}
                              className="action-icon-button download-material-button"
                              title="Download material"
                            >
                              <FiDownload />
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Show a different view button for links */}
                      {(material.file_type === 'link' || isUrl(material.description)) && (
                        <a 
                          href={material.file_type === 'link' ? material.external_url || material.description : material.description}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-icon-button view-button"
                          title="Open link"
                        >
                          <FiEye />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button pagination-nav"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <FiChevronLeft className="icon" /> Previous
              </button>
              
              {/* First page is always shown */}
              {totalPages > 0 && (
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
                >
                  1
                </button>
              )}
              
              {/* Show ellipsis if there's a gap between first page and other visible pages */}
              {currentPage > 3 && (
                <span className="pagination-ellipsis">...</span>
              )}
              
              {/* Show pages before and after current page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show pages adjacent to current, but not first or last page (we handle those separately)
                  return page !== 1 && page !== totalPages && Math.abs(page - currentPage) <= 1;
                })
                .map(page => (
                  <button 
                    key={page}
                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              
              {/* Show ellipsis if there's a gap between last page and other visible pages */}
              {currentPage < totalPages - 2 && (
                <span className="pagination-ellipsis">...</span>
              )}
              
              {/* Last page is always shown if there are multiple pages */}
              {totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                >
                  {totalPages}
                </button>
              )}
              
              <button 
                className="pagination-button pagination-nav"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight className="icon" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseMaterialList;

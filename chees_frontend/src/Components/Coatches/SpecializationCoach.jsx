import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiPlus, FiSearch, FiX } from 'react-icons/fi';
import '../AdminDashboard/CreateUser.css';
import PageLoading from '../PageLoading/PageLoading';
import ConfirmDelete from '../Confirm/ConfirmDelete';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';

const CoachSpecialization = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, nameFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [successMessage, errorMessage]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/specializations');
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let result = categories;
    
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      result = result.filter(category => {
        const nameMatch = category.name.toLowerCase().includes(searchTerm);
        const descMatch = category.description 
          ? category.description.toLowerCase().includes(searchTerm)
          : false;
        
        return nameMatch || descMatch;
      });
    }
    
    setFilteredCategories(result);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});
    setErrorMessage('');

    try {
      const response = await axiosInstance.post('/specializations', formData);
      if (response.status === 201) {
        setShowCreateModal(false);
        setSuccessMessage('Category created successfully!');
        setFormData({ name: '', description: '' });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.response?.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to create category');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});
    setErrorMessage('');

    try {
      const response = await axiosInstance.put(`/specializations/${selectedCategory.id}`, formData);
      if (response.status === 200) {
        setShowEditModal(false);
        setSuccessMessage('Category updated successfully!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.response?.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to update category');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/specializations/${categoryToDelete.id}`);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      setFilteredCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      setSuccessMessage('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMessage('Failed to delete category. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setNameFilter('');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pages = [];
    const visiblePages = 3;

    if (totalPages > 0) {
      pages.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
        >
          1
        </button>
      );
    }

    if (currentPage > visiblePages + 1) {
      pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          >
            {i.toString().padStart(2, '0')}
          </button>
        );
      }
    }

    if (currentPage < totalPages - visiblePages) {
      pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
    }

    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
        >
          {totalPages.toString().padStart(2, '0')}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-button pagination-nav"
        >
          <FiChevronLeft className="icon" />
          <span>Previous</span>
        </button>
        
        {pages}
        
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="pagination-button pagination-nav"
        >
          <span>Next</span>
          <FiChevronRight className="icon" />
        </button>
      </div>
    );
  };

  if (loading) return <PageLoading/>;

  return (
    <div className="table-container">
      <ConfirmDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteCategory}
        itemName={categoryToDelete ? categoryToDelete.name : 'this category'}
      />

      {successMessage && (
        <SuccessAlert 
          message={successMessage} 
          onClose={() => setSuccessMessage('')}
        />
      )}
      {errorMessage && (
        <ErrorAlert 
          message={errorMessage} 
          onClose={() => setErrorMessage('')}
        />
      )}

      <h1 className="table-title">Coach Specialization Categories</h1>
      
      <div className="filter-controls">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
  type="text"
  value={nameFilter}
  onChange={(e) => setNameFilter(e.target.value)}
  placeholder="Search by name or description..."
  className="search-input"
/>
          {nameFilter && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="clear-search-btn"
            >
              <FiX />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => {
            setShowCreateModal(true);
            setFormErrors({});
            setErrorMessage('');
          }} 
          className="add-new-btn"
        >
          <FiPlus className="icon" />
          Add New 
        </button>
      </div>
      
      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">ID</div>
          <div className="header-cell">Name</div>
          <div className="header-cell">Descr</div>

          <div className="header-cell">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map((category) => (
            <div key={category.id} className="table-row">
              <div className="table-cell">
                <span className="type-id">#{category.id}</span>
              </div>
              <div className="table-cell">{category.name}</div>
              <div className="table-cell">{category.description}</div>

              <div className="table-cell actions">
                <button 
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowViewModal(true);
                  }} 
                  className="action-btn view-btn"
                  title="View"
                >
                  <FiEye className="icon" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedCategory(category);
                    setFormData({
                      name: category.name,
                      description: category.description || ''
                    });
                    setShowEditModal(true);
                  }} 
                  className="action-btn update-btn"
                  title="Edit"
                >
                  <FiEdit className="icon" />
                </button>
                <button 
                  onClick={() => {
                    setCategoryToDelete(category); 
                    setShowDeleteModal(true); 
                  }}                 
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 className="icon" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No categories found matching your criteria
          </div>
        )}
      </div>
      
      {renderPagination()}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Category</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength="100"
                  className={`form-input ${formErrors.name ? 'invalid' : ''}`}
                  placeholder="Enter category name"
                />
                {formErrors.name && (
                  <div className="form-error">{formErrors.name[0]}</div>
                )}
              </div>
              <div className="form-group form-groupp">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className={`form-textarea ${formErrors.description ? 'invalid' : ''}`}
                  placeholder="Enter description (optional)"
                ></textarea>
                {formErrors.description && (
                  <div className="form-error">{formErrors.description[0]}</div>
                )}
              </div>
              <div className="modal-footer form-groupp">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span> Creating...
                    </>
                  ) : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && (
        <div className="modal-overlay">
          <div className="modal view-modal">
            <div className="modal-header">
              <h3>Category Details</h3>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-card">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">#{selectedCategory?.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedCategory?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Description:</span>
                  <div className="detail-text">
                    {selectedCategory?.description || 'No description provided'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setFormData({
                    name: selectedCategory?.name,
                    description: selectedCategory?.description || ''
                  });
                  setShowEditModal(true);
                }}
                className="btn btn-edit"
              >
                <FiEdit className="icon" /> Edit
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="btn btn-close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal edit-modal">
            <div className="modal-header">
              <h3>Edit Category</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength="100"
                  className={`form-input ${formErrors.name ? 'invalid' : ''}`}
                  placeholder="Enter category name"
                />
                {formErrors.name && (
                  <div className="form-error">{formErrors.name[0]}</div>
                )}
              </div>
              <div className="form-group form-groupp">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  className={`form-textarea ${formErrors.description ? 'invalid' : ''}`}
                  placeholder="Enter description (optional)"
                ></textarea>
                {formErrors.description && (
                  <div className="form-error">{formErrors.description[0]}</div>
                )}
              </div>
              <div className="modal-footer form-groupp">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span> Updating...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachSpecialization;
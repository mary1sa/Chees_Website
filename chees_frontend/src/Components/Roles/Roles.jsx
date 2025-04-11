import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiPlus, FiEye } from 'react-icons/fi';
import PageLoading from '../PageLoading/PageLoading';
import ConfirmDelete from '../Confirm/ConfirmDelete';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';

const FetchRoles = () => {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    let result = roles;
    
    if (nameFilter) {
      result = result.filter(role => 
        role.name?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    setFilteredRoles(result);
    setCurrentPage(1);
  }, [roles, nameFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [successMessage, errorMessage]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/roles');
      setRoles(response.data);
      setFilteredRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setErrorMessage('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/roles/${roleToDelete.id}`);
      setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
      setFilteredRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
      setSuccessMessage('Role deleted successfully!');
    } catch (error) {
      console.error('Error deleting role:', error);
      setErrorMessage('Failed to delete role. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setRoleToDelete(null);
      setLoading(false);
    }
  };
   
  const handleView = (role) => {
    setSelectedRole(role);
    setShowViewModal(true);
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/roles', formData);
      if (response.status === 201) {
        setShowCreateModal(false);
        setSuccessMessage('Role created successfully!');
        fetchRoles();
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        setErrorMessage('Failed to create role. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/roles/${formData.id}`, formData);
      if (response.status === 200) {
        setShowEditModal(false);
        setSuccessMessage('Role updated successfully!');
        fetchRoles();
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setFormErrors(error.response.data.errors);
      } else {
        setErrorMessage('Failed to update role. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '' });
    setShowCreateModal(true);
    setFormErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  };

  const openEditModal = (role) => {
    setFormData({
      id: role.id,
      name: role.name,
      description: role.description
    });
    setShowEditModal(true);
    setFormErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

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
        onConfirm={confirmDeleteRole}
        itemName={roleToDelete?.name || 'this role'}
      />

      {successMessage && (
        <SuccessAlert 
          message={successMessage} 
          onClose={() => setSuccessMessage('')}
          iconType="check"
        />
      )}
      {errorMessage && (
        <ErrorAlert 
          message={errorMessage} 
          onClose={() => setErrorMessage('')}
        />
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Role</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">Role Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  maxLength="50"
                  placeholder="Enter role name"

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
                  className="form-input"
                  maxLength="255"
                  rows="3"
                  placeholder="Enter description (optional)"

                />
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
                  ) : 'Create Role'}
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
              <h3>Role Details</h3>
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
                  <span className="detail-value">#{selectedRole?.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedRole?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Description:</span>
                  <div className="detail-text">
                    {selectedRole?.description || 'No description provided'}
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-value">
                    {new Date(selectedRole?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
            <button 
  onClick={() => {
    setShowViewModal(false);
    openEditModal(selectedRole);
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
              <h3>Edit Role</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="modal-close-btn"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group form-groupp">
                <label className="form-label">Role Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  maxLength="50"
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
                  className="form-input"
                  maxLength="255"
                  rows="3"
                />
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
                  ) : 'Update Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h1 className="table-title">Roles List</h1>
      
      <div className="filter-controls">
        <div className="filter-group">
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Search by role name"
            className="filter-input"
          />
        </div>
        <button onClick={openCreateModal} className="btn-create">
          <FiPlus className="icon" /> Create New Role
        </button>
      </div>
      
      <div className="data-table">
        <div className="table-header">
        <div className="header-cell">ID</div>

          <div className="header-cell">Role Name</div>
          <div className="header-cell">Description</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map((role) => (
            <div key={role.id} className="table-row">
              <div className="table-cell">
                <span className="role-id">ID: #{role.id}</span>
              </div>
              <div className="table-cell ">
              {role.name}

              </div>
              <div className="table-cell description-cell">
                {role.description || 'No description'}
              </div>
             
              <div className="table-cell actions">
              <button 
  onClick={() => handleView(role)}  
  className="action-btn view-btn"
  title="View"
>
  <FiEye className="icon" />
</button>
                <button 
                  onClick={() => openEditModal(role)}
                  className="action-btn update-btn"
                  title="Edit"
                >
                  <FiEdit className="icon" />
                </button>
                <button 
                  onClick={() => {
                    setRoleToDelete(role); 
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
            No roles found matching your criteria
          </div>
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default FetchRoles;
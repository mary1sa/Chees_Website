import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import './UserTable.css';

import PageLoading from '../PageLoading/PageLoading';
import ConfirmDelete from '../Confirm/ConfirmDelete';

const FetchUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [firstNameFilter, setFirstNameFilter] = useState('');
  const [lastNameFilter, setLastNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [uniqueRoles, setUniqueRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
const navigate=useNavigate()
const Createnew=()=>{
  navigate("/admin/dashboard/createuser")
}
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    
    if (firstNameFilter) {
      result = result.filter(user => 
        user.first_name?.toLowerCase().includes(firstNameFilter.toLowerCase())
      );
    }
    
    if (lastNameFilter) {
      result = result.filter(user => 
        user.last_name?.toLowerCase().includes(lastNameFilter.toLowerCase())
      );
    }
    
    if (roleFilter !== 'all') {
      result = result.filter(user => 
        user.role?.name === roleFilter
      );
    }
    
    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, firstNameFilter, lastNameFilter, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
      
      const roles = [...new Set(response.data.map(user => user.role?.name).filter(Boolean))];
      setUniqueRoles(roles);
    } catch (error) {
      console.error('Error fetching users:', error);
    }finally{
      setLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/users/${userToDelete.id}`);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setFilteredUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
      setLoading(false);
    }
  };
  

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
  onConfirm={confirmDeleteUser}
  itemName={userToDelete ? `${userToDelete.first_name} ${userToDelete.last_name}` : 'this user'}
/>

      <h1 className="table-title">Users List</h1>
      
      <div className="filter-controls">
        <div className="filter-group">
          <input
            type="text"
            value={firstNameFilter}
            onChange={(e) => setFirstNameFilter(e.target.value)}
            placeholder="First Name"
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            value={lastNameFilter}
            onChange={(e) => setLastNameFilter(e.target.value)}
            placeholder="Last Name"
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <button onClick={Createnew} className="add-new-btn">
                  <FiPlus className="icon" /> Create User
                </button>
      </div>
      
      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">Profile</div>
       
          <div className="header-cell">Email</div>
          <div className="header-cell">Phone</div>
          <div className="header-cell">Role</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map((user) => (
            <div key={user.id} className="table-row">
        <div className="table-cell">
  <div className="profile-image-container">
    <img
      src={
        user.profile_picture
          ? `http://localhost:8000/storage/${user.profile_picture}`
          : '/anony.jpg'
      }
      alt={`${user.first_name} ${user.last_name}`}
      className="profile-image"
    />
    <div className="user-info">
      <div className="name-container">
        <span className="user-name">
          {user.first_name} {user.last_name}
        </span>
      </div>
      <span className="user-id">ID: #{user.id}</span>
    </div>
  </div>
</div>
            
              <div className="table-cell">{user.email}</div>
              <div className="table-cell">{user.phone || 'N/A'}</div>
              <div className="table-cell">{user.role?.name || 'N/A'}</div>
              <div className="table-cell">
                <span className={`status-badge ${(user.status || 'inactive').toLowerCase().replace(' ', '-')}`}>
                  {user.status || 'Inactive'}
                </span>
              </div>
              <div className="table-cell actions">
                <Link 
                  to={`/admin/dashboard/updateuser/${user.id}`} 
                  className="action-btn update-btn"
                  title="Update"
                >
                  <FiEdit className="icon" />
                </Link>
                <button 
onClick={() => {
  setUserToDelete(user); 
  setShowDeleteModal(true); 
}}                 
 className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 className="icon" />
                </button>
                <Link 
                  to={`/admin/dashboard/showuser/${user.id}`} 
                  className="action-btn view-btn"
                  title="View"
                >
                  <FiEye className="icon" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No users found matching your criteria
          </div>
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default FetchUsers;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import PageLoading from '../../PageLoading/PageLoading';
import ConfirmDelete from '../../Confirm/ConfirmDelete';

const FetchCoaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [firstNameFilter, setFirstNameFilter] = useState('');
  const [lastNameFilter, setLastNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate=useNavigate()
  const itemsPerPage = 5;
const Createnew=()=>{
  navigate("/admin/dashboard/CreateCoatch")
}
  useEffect(() => {
    fetchCoaches();
  }, []);

  useEffect(() => {
    let result = coaches;

    if (firstNameFilter) {
      result = result.filter(coach =>
        coach.user.first_name?.toLowerCase().includes(firstNameFilter.toLowerCase())
      );
    }

    if (lastNameFilter) {
      result = result.filter(coach =>
        coach.user.last_name?.toLowerCase().includes(lastNameFilter.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(coach =>
        coach.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredCoaches(result);
    setCurrentPage(1);
  }, [coaches, firstNameFilter, lastNameFilter, statusFilter]);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('approved-coaches');
      setCoaches(response.data);
      
      setFilteredCoaches(response.data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCoach = async () => {
    if (!coachToDelete) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/coaches/${coachToDelete.id}`);
      setCoaches(prev => prev.filter(c => c.id !== coachToDelete.id));
      setFilteredCoaches(prev => prev.filter(c => c.id !== coachToDelete.id));
    } catch (error) {
      console.error('Error deleting coach:', error);
    } finally {
      setShowDeleteModal(false);
      setCoachToDelete(null);
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCoaches.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCoaches.length / itemsPerPage);

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

  if (loading) return <PageLoading />;

  return (
    <div className="table-container">
      <ConfirmDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteCoach}
        itemName={coachToDelete ? `${coachToDelete.first_name} ${coachToDelete.last_name}` : 'this coach'}
      />

      <h1 className="table-title">Coaches List</h1>

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button onClick={Createnew} className="add-new-btn">
                  <FiPlus className="icon" /> Create Coach
                </button>
      </div>

      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">Profile</div>
          
          <div className="header-cell">Title</div>
          <div className="header-cell">NatlTitle</div>
          <div className="header-cell">rating</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>

        {currentItems.length > 0 ? (
          currentItems.map((coach) => (
            <div key={coach.id} className="table-row">
              <div className="table-cell">
                <div className="profile-image-container">
                  <img
                    src={coach.user.profile_picture ? `http://localhost:8000/storage/${coach.user.profile_picture}` : '/anony.jpg'}
                    alt={`${coach.first_name} ${coach.last_name}`}
                    className="profile-image"
                  />
                  <div className="user-info">
                    <div className="name-container">
                      <span className="user-name">{coach.user.first_name} {coach.user.last_name}</span>
                    </div>
                    <span className="user-id">ID: #{coach.id}</span>
                  </div>
                </div>
              </div>

              <div className="table-cell">{coach.title}</div>
              <div className="table-cell">{coach.national_title}</div>
              <div className="table-cell">{coach.rating}</div>              <div className="table-cell">
                <span className={`status-badge ${(coach.status || 'inactive').toLowerCase().replace(' ', '-')}`}>
                  {coach.status || 'Inactive'}
                </span>
              </div>
              <div className="table-cell actions">
                <Link
                  to={`/admin/dashboard/updatecoach/${coach.id}`}
                  className="action-btn update-btn"
                  title="Update"
                >
                  <FiEdit className="icon" />
                </Link>
                <button
                  onClick={() => {
                    setCoachToDelete(coach);
                    setShowDeleteModal(true);
                  }}
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 className="icon" />
                </button>
                <Link
                  to={`/admin/dashboard/showuser/${coach.user.id}`} 
                  className="action-btn view-btn"
                  title="View"
                >
                  <FiEye className="icon" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">No coaches found matching your criteria</div>
        )}
      </div>

      {renderPagination()}
    </div>
  );
};

export default FetchCoaches;

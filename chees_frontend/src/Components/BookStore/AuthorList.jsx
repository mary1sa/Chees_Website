import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axiosInstance from '../config/axiosInstance';
import '../AdminDashboard/UserTable.css';
import PageLoading from '../PageLoading/PageLoading';
import ConfirmDelete from '../Confirm/ConfirmDelete';

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    let result = authors;
    
    if (nameFilter) {
      result = result.filter(author => 
        author.name?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    
    setFilteredAuthors(result);
    setCurrentPage(1);
  }, [authors, nameFilter]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/authors');
      setAuthors(response.data);
      setFilteredAuthors(response.data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAuthor = async () => {
    if (!authorToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/authors/${authorToDelete.id}`);
      setAuthors(prev => prev.filter(a => a.id !== authorToDelete.id));
      setFilteredAuthors(prev => prev.filter(a => a.id !== authorToDelete.id));
    } catch (error) {
      console.error('Error deleting author:', error);
    } finally {
      setShowDeleteModal(false);
      setAuthorToDelete(null);
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAuthors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);

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
        onConfirm={confirmDeleteAuthor}
        itemName={authorToDelete ? authorToDelete.name : 'this author'}
      />

      <h1 className="table-title">Authors List</h1>
      
      <div className="header-actions">
        <Link to="create" className="add-author-btn">
          <FiPlus /> Add Author
        </Link>
        
        <div className="filter-controls">
          <div className="filter-group">
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search by name"
              className="filter-input"
            />
          </div>
        </div>
      </div>
      
      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">Profile</div>
          <div className="header-cell">Name</div>
          <div className="header-cell">Bio</div>
          <div className="header-cell">Books</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map((author) => (
            <div key={author.id} className="table-row">
              <div className="table-cell">
                <div className="profile-image-container">
                  <img
                    src={
                      author.photo
                        ? `http://localhost:8000/storage/${author.photo}`
                        : '/default-author.jpg'
                    }
                    alt={author.name}
                    className="profile-image"
                  />
                </div>
              </div>
              
              <div className="table-cell">
                <div className="user-info">
                  <div className="name-container">
                    <span className="user-name">{author.name}</span>
                  </div>
                  <span className="user-id">ID: #{author.id}</span>
                </div>
              </div>
              
              <div className="table-cell bio-cell">
                {author.bio || 'No biography available'}
              </div>
              
              <div className="table-cell">
                <span className="books-count">{author.books_count || 0}</span>
              </div>
              
              <div className="table-cell actions">
                <Link 
                    to={`/admin/dashboard/authors/edit/${author.id}`}
                    className="action-btn update-btn"
                    title="Edit"
                    >
                <FiEdit className="icon" />
                </Link>
                <button 
                  onClick={() => {
                    setAuthorToDelete(author); 
                    setShowDeleteModal(true); 
                  }}                 
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 className="icon" />
                </button>
                <Link 
                to={`/admin/dashboard/authors/show/${author.id}`}  // Updated path
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
            No authors found matching your criteria
          </div>
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default AuthorList;
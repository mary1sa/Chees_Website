import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../AdminDashboard/UserTable.css';
import PageLoading from '../PageLoading/PageLoading';
import ConfirmDelete from '../Confirm/ConfirmDelete';
import ViewBook from './ViewBook';
import EditBook from './EditBook';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [titleFilter, setTitleFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingBook, setViewingBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    let result = books;

    if (titleFilter) {
      result = result.filter(book =>
        book.title?.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (authorFilter) {
      result = result.filter(book =>
        book.author?.name.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(book =>
        book.category?.name === categoryFilter
      );
    }

    setFilteredBooks(result);
    setCurrentPage(1);
  }, [books, titleFilter, authorFilter, categoryFilter]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/books');
      setBooks(response.data);
      setFilteredBooks(response.data);

      const categories = [...new Set(response.data.map(book => book.category?.name).filter(Boolean))];
      setUniqueCategories(categories);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/books/${bookToDelete.id}`);
      setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
      setFilteredBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setShowDeleteModal(false);
      setBookToDelete(null);
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditingBook(null);
    fetchBooks();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

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
        onConfirm={confirmDeleteBook}
        itemName={bookToDelete ? bookToDelete.title : 'this book'}
      />

      {viewingBook && (
        <ViewBook
          bookId={viewingBook}
          onClose={() => setViewingBook(null)}
        />
      )}

      {editingBook ? (
        <EditBook
          bookId={editingBook}
          onSave={handleEditSuccess}
          onCancel={() => setEditingBook(null)}
        />
      ) : (
        <>
          <h1 className="table-title">Books Management</h1>

          <div className="filter-controls">
            <div className="filter-group">
              <input
                type="text"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                placeholder="Book Title"
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <input
                type="text"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                placeholder="Author"
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="data-table">
            <div className="table-header">
              <div className="header-cell">Book</div>
              <div className="header-cell">Author</div>
              <div className="header-cell">Category</div>
              <div className="header-cell">Price</div>
              <div className="header-cell">Stock</div>
              <div className="header-cell">Actions</div>
            </div>

            {currentItems.length > 0 ? (
              currentItems.map((book) => (
                <div key={book.id} className="table-row">
                  <div className="table-cell">
                    <div className="profile-image-container">
                      {book.cover_image && (
                        <img
                          src={`http://localhost:8000/storage/${book.cover_image}`}
                          alt={book.title}
                          className="profile-image"
                        />
                      )}
                      <div className="user-info">
                        <div className="name-container">
                          <span className="user-name">
                            {book.title}
                          </span>
                        </div>
                        <span className="user-id">ISBN: {book.isbn || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="table-cell">
                    {book.author?.name || 'Unknown'}
                  </div>
                  <div className="table-cell">
                    {book.category?.name || 'Uncategorized'}
                  </div>
                  <div className="table-cell">
                    ${Number(book.price)?.toFixed(2) || '0.00'}
                  </div>
                  <div className="table-cell">
                    <span className={`status-badge ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="table-cell actions">
                    <button
                      onClick={() => setEditingBook(book.id)}
                      className="action-btn update-btn"
                      title="Edit"
                    >
                      <FiEdit className="icon" />
                    </button>
                    <button
                      onClick={() => {
                        setBookToDelete(book);
                        setShowDeleteModal(true);
                      }}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      <FiTrash2 className="icon" />
                    </button>
                    <button
                      onClick={() => setViewingBook(book.id)}
                      className="action-btn view-btn"
                      title="View"
                    >
                      <FiEye className="icon" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                No books found matching your criteria
              </div>
            )}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default BookList;

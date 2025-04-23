import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiShoppingCart, FiSearch, FiFilter, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import axiosInstance from '../../config/axiosInstance';
import PageLoading from '../../PageLoading/PageLoading';
import './Books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistUpdating, setWishlistUpdating] = useState({});
  const [wishlistedBooks, setWishlistedBooks] = useState([]);
  const categories = [...new Set(books.map(book => book.category?.name).filter(Boolean))];
  const authors = [...new Set(books.map(book => book.author?.name).filter(Boolean))];
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch books
        const booksResponse = await axiosInstance.get('/books');
        setBooks(booksResponse.data);
        
        // Fetch wishlist if user is authenticated
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (token && user?.id) {
          try {
            const wishlistResponse = await axiosInstance.get(`/users/${user.id}/wishlist`);
            if (wishlistResponse.data.success) {
              const bookWishlist = wishlistResponse.data.data
                .filter(item => item.item_type === 'book')
                .map(item => item.item_id);
              setWishlistedBooks(bookWishlist);
            }
          } catch (wishlistError) {
            console.error('Error fetching wishlist:', wishlistError);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleWishlist = async (bookId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (wishlistUpdating[bookId]) return;
    
    try {
      setWishlistUpdating(prev => ({ ...prev, [bookId]: true }));
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user?.id) {
        setError('Please log in to add books to your wishlist');
        return;
      }
      
      // Optimistically update UI
      const isWishlisted = wishlistedBooks.includes(bookId);
      setWishlistedBooks(prev => 
        isWishlisted 
          ? prev.filter(id => id !== bookId)
          : [...prev, bookId]
      );
      
      // Make API call
      await axiosInstance.post(`/wishlists/toggle/${bookId}`, {
        item_type: 'book'
      });
      
    } catch (err) {
      setError('Error updating wishlist');
      // Revert on error
      setWishlistedBooks(prev => 
        wishlistedBooks.includes(bookId)
          ? prev.filter(id => id !== bookId)
          : [...prev, bookId]
      );
    } finally {
      setWishlistUpdating(prev => ({ ...prev, [bookId]: false }));
    }
  };


const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...books];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author?.name && book.author.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(book => 
        book.category?.name === filters.category
      );
    }

    // Apply author filter
    if (filters.author) {
      filtered = filtered.filter(book => 
        book.author?.name === filters.author
      );
    }

    // Apply price range filters
    if (filters.minPrice) {
      filtered = filtered.filter(book => 
        book.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(book => 
        book.price <= parseFloat(filters.maxPrice)
      );
    }

    return filtered;
  };

  const filteredBooks = applyFilters();

  if (loading) return <PageLoading />;
  if (error) return <div className="book-error">Error: {error}</div>;
  return (
    <div className="books-container">
      <div className="books-header">
        <h2>Book Store</h2>
        <div className="search-filter-container">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="header-actions">
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filters
            </button>
            <Link to="/member/dashboard/books/wishlist" className="wishlist-link">
              <FaHeart /> My Wishlist
            </Link>
          </div>
        </div>
      </div>


      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Category</label>
            <select 
              name="category" 
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Author</label>
            <select 
              name="author" 
              value={filters.author}
              onChange={handleFilterChange}
            >
              <option value="">All Authors</option>
              {authors.map((author, index) => (
                <option key={index} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-range">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                value={filters.minPrice}
                onChange={handleFilterChange}
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                min="0"
              />
            </div>
          </div>
        </div>
      )}

<div className="books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div key={book.id} className="book-card">
              <Link to={`/member/dashboard/books/${book.id}`}>
                <div className="book-cover">
                  {book.cover_image ? (
                    <img 
                      src={`/storage/${book.cover_image}`} 
                      alt={book.title} 
                    />
                  ) : (
                    <div className="book-cover-placeholder">
                      <FiBook size={48} />
                    </div>
                  )}
                  <button 
                    className={`heart-button ${wishlistedBooks.includes(book.id) ? 'active' : ''}`}
                    onClick={(e) => toggleWishlist(book.id, e)}
                  >
                    <FaHeart size={30} />
                  </button>
                </div>
              </Link>
              <div className="book-details">
                <h3>
                  <Link to={`/member/dashboard/books/${book.id}`}>
                    {book.title}
                  </Link>
                </h3>
                <p className="author">{book.author?.name}</p>
                <div className="price-section">
                  {book.sale_price ? (
                    <>
                      <span className="original-price">${Number(book.price).toFixed(2)}</span>
                      <span className="sale-price">${Number(book.sale_price).toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="price">${Number(book.price).toFixed(2)}</span>
                  )}
                </div>
                <p className="stock-status">
                  {book.stock > 0 ? 
                    `${book.stock} available` : 'Out of stock'}
                </p>
                <Link 
                  to={`/member/dashboard/books/${book.id}/order`}
                  state={{ book }}
                  className={`order-button ${book.stock <= 0 ? 'disabled' : ''}`}
                >
                  <FiShoppingCart /> Order
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No books found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;
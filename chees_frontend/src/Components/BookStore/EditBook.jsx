import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { FiX, FiSave } from 'react-icons/fi';
import '../AdminDashboard/UserTable.css';

const EditBook = ({ bookId, onSave, onCancel }) => {
  const [book, setBook] = useState({
    title: '',
    author_id: '',
    category_id: '',
    isbn: '',
    price: '',
    stock: '',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, catsRes, authsRes] = await Promise.all([
          axiosInstance.get(`/api/books/${bookId}`),
          axiosInstance.get('/api/book-categories'),
          axiosInstance.get('/api/authors')
        ]);

        setBook(bookRes.data);
        setCategories(catsRes.data);
        setAuthors(authsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axiosInstance.put(`/api/books/${bookId}`, book);
      onSave();
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      }
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading book data...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Book</h2>
          <button onClick={onCancel} className="close-btn">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title*</label>
            <input
              type="text"
              name="title"
              value={book.title}
              onChange={handleChange}
              required
            />
            {errors.title && <span className="error">{errors.title[0]}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Author*</label>
              <select
                name="author_id"
                value={book.author_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Author</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Category*</label>
              <select
                name="category_id"
                value={book.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ISBN</label>
              <input
                type="text"
                name="isbn"
                value={book.isbn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Price*</label>
              <input
                type="number"
                name="price"
                value={book.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Stock*</label>
              <input
                type="number"
                name="stock"
                value={book.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={book.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              <FiSave className="icon" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;

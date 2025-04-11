import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import { FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';
import '../AdminDashboard/UserTable.css';
import PageLoading from '../PageLoading/PageLoading';

const EditBook = () => {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author_id: '',
    category_id: '',
    isbn: '',
    price: '',
    stock: '',
    description: '',
    cover_image: null,
    sale_price: '',
    pages: '',
    publisher: '',
    publication_date: '',
    language: '',
    format: '',
    weight: '',
    dimensions: '',
    is_featured: false,
    is_active: true
  });
  
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, catsRes, authsRes] = await Promise.all([
          axiosInstance.get(`/books/${bookId}`),
          axiosInstance.get('/categories'),
          axiosInstance.get('/authors')
        ]);

        const book = bookRes.data;
        setFormData({
          title: book.title || '',
          author_id: book.author?.id || '',
          category_id: book.category?.id || '',
          isbn: book.isbn || '',
          price: book.price || '',
          stock: book.stock || '',
          description: book.description || '',
          cover_image: null,
          sale_price: book.sale_price || '',
          pages: book.pages || '',
          publisher: book.publisher || '',
          publication_date: book.publication_date || '',
          language: book.language || '',
          format: book.format || '',
          weight: book.weight || '',
          dimensions: book.dimensions || '',
          is_featured: book.is_featured || false,
          is_active: book.is_active !== undefined ? book.is_active : true
        });

        setCategories(catsRes.data);
        setAuthors(authsRes.data);
        
        if (book.cover_image) {
          setPreviewImage(`http://localhost:8000/storage/${book.cover_image}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ fetch: 'Failed to load book data' });
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchData();
    }
  }, [bookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        cover_image: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          // Convert boolean values to 1/0 for form data
          const value = typeof formData[key] === 'boolean' 
            ? formData[key] ? 1 : 0 
            : formData[key];
          formDataToSend.append(key, value);
        }
      });

      // Use PUT for updates
      await axiosInstance.put(`/books/${bookId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Book updated successfully!');
      setTimeout(() => {
        navigate('/admin/dashboard/books');
      }, 1500);
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ form: error.response?.data?.message || 'An error occurred while updating the book' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setSuccessMessage('');
    setErrors({});
  };

  if (loading) {
    return <PageLoading />;
  }

  if (errors.fetch) {
    return (
      <div className="error-container">
        <ErrorAlert message={errors.fetch} />
        <button 
          onClick={() => navigate('/admin/dashboard/books')}
          className="btn-secondary"
        >
          <FiArrowLeft /> Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="create-book-container">
      <div className="modal-header">
        <button 
          onClick={() => navigate('/admin/dashboard/books')}
          className="back-btn"
        >
          <FiArrowLeft />
        </button>
        <h1 className="create-book-title">Edit Book</h1>
      </div>
      
      {successMessage && (
        <SuccessAlert 
          message={successMessage} 
          onClose={handleCloseAlert}
        />
      )}
      
      {errors.form && (
        <ErrorAlert 
          message={errors.form} 
          onClose={handleCloseAlert}
        />
      )}

      <form onSubmit={handleSubmit} className="create-book-form">
        <div className="image-upload-section">
          <label 
            htmlFor="cover_image" 
            className={`file-label ${previewImage ? 'has-image' : ''}`}
          >
            <input
              type="file"
              name="cover_image"
              id="cover_image"
              onChange={handleFileChange}
              className="file-input"
              accept="image/*"
            />
            
            {!previewImage && (
              <div className="default-cover">
                <svg className="book-icon" viewBox="0 0 24 24">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </svg>
                <span>Upload Cover Image</span>
              </div>
            )}

            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Book cover preview" />
              </div>
            )}
          </label>
          {errors.cover_image && <div className="error-message">{errors.cover_image}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="Title*"
            value={formData.title}
            onChange={handleChange}
            className={`form-input ${errors.title ? 'is-invalid' : ''}`}
            required
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              name="author_id"
              value={formData.author_id}
              onChange={handleChange}
              className={`form-select ${errors.author_id ? 'is-invalid' : ''}`}
              required
            >
              <option value="">Select Author*</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            {errors.author_id && <div className="error-message">{errors.author_id}</div>}
          </div>

          <div className="form-group">
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
              required
            >
              <option value="">Select Category*</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && <div className="error-message">{errors.category_id}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={formData.isbn}
              onChange={handleChange}
              className={`form-input ${errors.isbn ? 'is-invalid' : ''}`}
            />
            {errors.isbn && <div className="error-message">{errors.isbn}</div>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="price"
              placeholder="Price*"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`form-input ${errors.price ? 'is-invalid' : ''}`}
              required
            />
            {errors.price && <div className="error-message">{errors.price}</div>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="sale_price"
              placeholder="Sale Price"
              value={formData.sale_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`form-input ${errors.sale_price ? 'is-invalid' : ''}`}
            />
            {errors.sale_price && <div className="error-message">{errors.sale_price}</div>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="stock"
              placeholder="Stock*"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className={`form-input ${errors.stock ? 'is-invalid' : ''}`}
              required
            />
            {errors.stock && <div className="error-message">{errors.stock}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="pages"
              placeholder="Pages"
              value={formData.pages}
              onChange={handleChange}
              min="1"
              className={`form-input ${errors.pages ? 'is-invalid' : ''}`}
            />
            {errors.pages && <div className="error-message">{errors.pages}</div>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="publisher"
              placeholder="Publisher"
              value={formData.publisher}
              onChange={handleChange}
              className={`form-input ${errors.publisher ? 'is-invalid' : ''}`}
            />
            {errors.publisher && <div className="error-message">{errors.publisher}</div>}
          </div>

          <div className="form-group">
            <input
              type="date"
              name="publication_date"
              placeholder="Publication Date"
              value={formData.publication_date}
              onChange={handleChange}
              className={`form-input ${errors.publication_date ? 'is-invalid' : ''}`}
            />
            {errors.publication_date && <div className="error-message">{errors.publication_date}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="language"
              placeholder="Language"
              value={formData.language}
              onChange={handleChange}
              className={`form-input ${errors.language ? 'is-invalid' : ''}`}
            />
            {errors.language && <div className="error-message">{errors.language}</div>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="format"
              placeholder="Format"
              value={formData.format}
              onChange={handleChange}
              className={`form-input ${errors.format ? 'is-invalid' : ''}`}
            />
            {errors.format && <div className="error-message">{errors.format}</div>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="weight"
              placeholder="Weight (g)"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`form-input ${errors.weight ? 'is-invalid' : ''}`}
            />
            {errors.weight && <div className="error-message">{errors.weight}</div>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="dimensions"
              placeholder="Dimensions (e.g., 20x25x5)"
              value={formData.dimensions}
              onChange={handleChange}
              className={`form-input ${errors.dimensions ? 'is-invalid' : ''}`}
            />
            {errors.dimensions && <div className="error-message">{errors.dimensions}</div>}
          </div>
        </div>

        <div className="form-group">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className={`form-textarea ${errors.description ? 'is-invalid' : ''}`}
            rows="4"
          />
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                is_featured: e.target.checked
              }))}
              className="form-checkbox"
            />
            Featured Book
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                is_active: e.target.checked
              }))}
              className="form-checkbox"
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/dashboard/books')}
            className="btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? (
              <span className="loading-button">
                <span className="spinner_button"></span> Saving...
              </span>
            ) : (
              <>
                <FiSave className="icon" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook;
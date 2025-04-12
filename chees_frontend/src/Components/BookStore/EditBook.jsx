import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';
import { FiX, FiSave } from 'react-icons/fi';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';
import '../AdminDashboard/UserTable.css';
import PageLoading from '../PageLoading/PageLoading';

const EditBook = ({ bookId, onSave, onCancel }) => {
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
        const [bookRes, categoriesRes, authorsRes] = await Promise.all([
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
          price: book.price ? book.price.toString() : '',
          stock: book.stock ? book.stock.toString() : '',
          description: book.description || '',
          cover_image: null,
          sale_price: book.sale_price ? book.sale_price.toString() : '',
          pages: book.pages ? book.pages.toString() : '',
          publisher: book.publisher || '',
          publication_date: book.publication_date ? book.publication_date.split('T')[0] : '',
          language: book.language || '',
          format: book.format || '',
          weight: book.weight ? book.weight.toString() : '',
          dimensions: book.dimensions || '',
          is_featured: book.is_featured || false,
          is_active: book.is_active !== undefined ? book.is_active : true
        });

        setCategories(categoriesRes.data);
        setAuthors(authorsRes.data);
        
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        cover_image: file
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrors({});
    
    try {
      const formDataToSend = new FormData();
      
      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'cover_image') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          }
        } else if (value !== null && value !== undefined && value !== '') {
          if (key === 'is_featured' || key === 'is_active') {
            formDataToSend.append(key, value ? '1' : '0');
          } else if (key === 'price' || key === 'sale_price' || key === 'weight') {
            formDataToSend.append(key, String(value));
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      // Debug: Log FormData contents
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await axiosInstance.put(`/books/${bookId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Book updated successfully!');
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      if (error.response?.status === 422) {
        const validationErrors = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          validationErrors[field] = Array.isArray(messages) ? messages.join(', ') : messages;
        });
        setErrors(validationErrors);
        console.log('Validation errors:', validationErrors);
      } else {
        setErrors({ 
          form: error.response?.data?.message || 'An error occurred while updating the book' 
        });
      }
      console.error("Update error:", error.response);
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
        <ErrorAlert message={errors.fetch} onClose={() => setErrors({})} />
        <button onClick={onCancel} className="btn-secondary">
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="create-book-container">
      <div className="modal-header">
        <h1>Edit Book</h1>
        <button onClick={onCancel} className="close-btn">
          <FiX />
        </button>
      </div>
      
      {successMessage && <SuccessAlert message={successMessage} onClose={handleCloseAlert} />}
      {errors.form && <ErrorAlert message={errors.form} onClose={handleCloseAlert} />}

      <form onSubmit={handleSubmit} className="create-book-form">
        {/* Image Upload */}
        <div className="image-upload-section">
          <label htmlFor="cover_image" className={`file-label ${previewImage ? 'has-image' : ''}`}>
            <input
              type="file"
              id="cover_image"
              onChange={handleFileChange}
              accept="image/*"
            />
            {previewImage ? (
              <div className="image-preview">
                <img src={previewImage} alt="Book cover" />
              </div>
            ) : (
              <div className="default-cover">
                <svg className="book-icon" viewBox="0 0 24 24">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </svg>
                <span>Upload Cover Image</span>
              </div>
            )}
          </label>
          {errors.cover_image && <div className="error-message">{errors.cover_image}</div>}
        </div>

        {/* Required Fields */}
        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="Title*"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'is-invalid' : ''}
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
              className={errors.author_id ? 'is-invalid' : ''}
              required
            >
              <option value="">Select Author*</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
            </select>
            {errors.author_id && <div className="error-message">{errors.author_id}</div>}
          </div>

          <div className="form-group">
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={errors.category_id ? 'is-invalid' : ''}
              required
            >
              <option value="">Select Category*</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <div className="error-message">{errors.category_id}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="price"
              placeholder="Price*"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.price ? 'is-invalid' : ''}
              required
            />
            {errors.price && <div className="error-message">{errors.price}</div>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="stock"
              placeholder="Stock*"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className={errors.stock ? 'is-invalid' : ''}
              required
            />
            {errors.stock && <div className="error-message">{errors.stock}</div>}
          </div>
        </div>

        {/* Optional Fields */}
        <div className="form-group">
          <input
            type="text"
            name="isbn"
            placeholder="ISBN"
            value={formData.isbn}
            onChange={handleChange}
            className={errors.isbn ? 'is-invalid' : ''}
          />
          {errors.isbn && <div className="error-message">{errors.isbn}</div>}
        </div>

        <div className="form-group">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'is-invalid' : ''}
            rows="4"
          />
          {errors.description && <div className="error-message">{errors.description}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="sale_price"
              placeholder="Sale Price"
              value={formData.sale_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.sale_price ? 'is-invalid' : ''}
            />
            {errors.sale_price && <div className="error-message">{errors.sale_price}</div>}
          </div>

          <div className="form-group">
            <input
              type="number"
              name="pages"
              placeholder="Pages"
              value={formData.pages}
              onChange={handleChange}
              min="1"
              className={errors.pages ? 'is-invalid' : ''}
            />
            {errors.pages && <div className="error-message">{errors.pages}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="publisher"
              placeholder="Publisher"
              value={formData.publisher}
              onChange={handleChange}
              className={errors.publisher ? 'is-invalid' : ''}
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
              className={errors.publication_date ? 'is-invalid' : ''}
              max={new Date().toISOString().split('T')[0]}
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
              className={errors.language ? 'is-invalid' : ''}
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
              className={errors.format ? 'is-invalid' : ''}
            />
            {errors.format && <div className="error-message">{errors.format}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={errors.weight ? 'is-invalid' : ''}
            />
            {errors.weight && <div className="error-message">{errors.weight}</div>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="dimensions"
              placeholder="Dimensions (e.g., 6x9 inches)"
              value={formData.dimensions}
              onChange={handleChange}
              className={errors.dimensions ? 'is-invalid' : ''}
            />
            {errors.dimensions && <div className="error-message">{errors.dimensions}</div>}
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleCheckboxChange}
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
              onChange={handleCheckboxChange}
              className="form-checkbox"
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={submitting || !formData.title || !formData.author_id || !formData.category_id}
          >
            {submitting ? 'Saving...' : <><FiSave /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook;
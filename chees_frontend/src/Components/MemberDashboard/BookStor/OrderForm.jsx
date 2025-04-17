import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import axiosInstance from '../../config/axiosInstance';
import './Books.css';
import PageLoading from '../../PageLoading/PageLoading';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(location.state?.book);
  const [loadingBook, setLoadingBook] = useState(!location.state?.book);
  
  const [formData, setFormData] = useState({
    items: [{ book_id: id, quantity: 1 }],
    shipping_address: '',
    billing_address: '',
    payment_method: 'cash',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!book && id) {
      const fetchBook = async () => {
        try {
          const response = await axiosInstance.get(`/books/${id}`);
          setBook(response.data);
        } catch (error) {
          console.error('Error fetching book:', error);
          setErrors({ form: 'Failed to load book details' });
        } finally {
          setLoadingBook(false);
        }
      };
      
      fetchBook();
    }
  }, [id, book, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const orderData = {
        ...formData,
        items: formData.items.map(item => ({
          book_id: item.book_id,
          quantity: parseInt(item.quantity)
        }))
      };

      const response = await axiosInstance.post('/orders', orderData);
      setSuccessMessage(`Order #${response.data.order_number} placed successfully!`);
      
      setTimeout(() => {
        navigate(`/member/dashboard/books`);
      }, 1500);
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ form: error.response?.data?.message || 'Failed to place order' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setSuccessMessage('');
    setErrors({});
  };

  if (loadingBook) return <PageLoading />;
  if (!book) return <div className="error-message">Book not found</div>;

  return (
    <div className="create-book-container">
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
      >
        <FiArrowLeft /> Back to Book
      </button>

      <h1 className="create-book-title">Order: {book.title}</h1>
      
      {successMessage && (
        <SuccessAlert 
          message={successMessage} 
          onClose={handleCloseAlert}
          iconType="check"
        />
      )}
      
      {errors.form && (
        <ErrorAlert 
          message={errors.form} 
          onClose={handleCloseAlert}
        />
      )}

      <form onSubmit={handleSubmit} className="create-book-form">
        <div className="form-group">
          <label>Quantity (Max: {book.stock})</label>
          <input
            type="number"
            name="quantity"
            min="1"
            max={book.stock}
            value={formData.items[0].quantity}
            onChange={(e) => {
              const newItems = [...formData.items];
              newItems[0] = {
                ...newItems[0],
                quantity: Math.min(book.stock, Math.max(1, parseInt(e.target.value) || 1))
              };
              setFormData(prev => ({ ...prev, items: newItems }));
            }}
            className={`form-input ${errors['items.0.quantity'] ? 'is-invalid' : ''}`}
            required
          />
          {errors['items.0.quantity'] && (
            <div className="error-message">{errors['items.0.quantity']}</div>
          )}
        </div>

        <div className="form-group">
          <label>Shipping Address</label>
          <input
            type="text"
            name="shipping_address"
            value={formData.shipping_address}
            onChange={handleChange}
            className={`form-input ${errors.shipping_address ? 'is-invalid' : ''}`}
            required
          />
          {errors.shipping_address && (
            <div className="error-message">{errors.shipping_address}</div>
          )}
        </div>

        <div className="form-group">
          <label>Billing Address</label>
          <input
            type="text"
            name="billing_address"
            value={formData.billing_address}
            onChange={handleChange}
            className={`form-input ${errors.billing_address ? 'is-invalid' : ''}`}
            required
          />
          {errors.billing_address && (
            <div className="error-message">{errors.billing_address}</div>
          )}
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className={`form-select ${errors.payment_method ? 'is-invalid' : ''}`}
            required
          >
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
          {errors.payment_method && (
            <div className="error-message">{errors.payment_method}</div>
          )}
        </div>

        <div className="form-group">
          <label>Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className={`form-textarea ${errors.notes ? 'is-invalid' : ''}`}
            rows="3"
          />
          {errors.notes && (
            <div className="error-message">{errors.notes}</div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading || loadingBook}
        >
          {loading ? (
            <span className="loading-button">
              <span className="spinner_button"></span> Processing...
            </span>
          ) : (
            "Place Order"
          )}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
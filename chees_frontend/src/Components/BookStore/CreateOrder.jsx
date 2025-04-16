import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';
import axiosInstance from '../config/axiosInstance';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    items: [{ book_id: '', quantity: 1 }],
    shipping_address: '',
    billing_address: '',
    payment_method: 'credit_card',
    notes: '',
    status: 'pending'
  });
  const [books, setBooks] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get('/books');
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
        setErrors({ form: 'Failed to load books data' });
      }
    };
    fetchBooks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [name]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { book_id: '', quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setSuccessMessage('Order created successfully!');
      setTimeout(() => navigate('/admin/dashboard/orders'), 1500);
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      } else {
        setErrors({ form: error.response?.data?.message || 'Failed to create order' });
        console.error('Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setSuccessMessage('');
    setErrors({});
  };

  return (
    <div className="create-book-container">
      <h1 className="create-book-title">Create New Order</h1>
      
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
          <input
            name="shipping_address"
            placeholder="Shipping Address*"
            value={formData.shipping_address}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'is-invalid' : ''}`}
            
          />
          {errors.shipping_address && <div className="error-message">{errors.shipping_address}</div>}
        </div>

        <div className="form-group">
          <input
            name="billing_address"
            placeholder="Billing Address*"
            value={formData.billing_address}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'is-invalid' : ''}`}
          />
          {errors.billing_address && <div className="error-message">{errors.billing_address}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className={`form-select ${errors.payment_method ? 'is-invalid' : ''}`}
            >
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
            </select>
            {errors.payment_method && <div className="error-message">{errors.payment_method}</div>}
          </div>

          <div className="form-group">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`form-select ${errors.status ? 'is-invalid' : ''}`}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && <div className="error-message">{errors.status}</div>}
          </div>
        </div>

        <div className="form-group">
          <textarea
            name="notes"
            placeholder="Order Notes (Optional)"
            value={formData.notes}
            onChange={handleChange}
            className={`form-textarea ${errors.notes ? 'is-invalid' : ''}`}
            rows="2"
          />
          {errors.notes && <div className="error-message">{errors.notes}</div>}
        </div>

        <div className="order-items-section">
          <h3 className="section-title">Order Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="form-row order-item-row">
              <div className="form-group">
                <select
                  name="book_id"
                  value={item.book_id}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                  className={`form-select ${errors[`items.${index}.book_id`] ? 'is-invalid' : ''}`}
                >
                  <option value="">Select Book*</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} (${book.sale_price || book.price})
                    </option>
                  ))}
                </select>
                {errors[`items.${index}.book_id`] && (
                  <div className="error-message">{errors[`items.${index}.book_id`]}</div>
                )}
              </div>

              <div className="form-group quantity-group">
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity*"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  min="1"
                  className={`form-input ${errors[`items.${index}.quantity`] ? 'is-invalid' : ''}`}
                />
                {errors[`items.${index}.quantity`] && (
                  <div className="error-message">{errors[`items.${index}.quantity`]}</div>
                )}
              </div>

              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="remove-item-button"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="add-item-button"
          >
            Add Item
          </button>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loading-button">
              <span className="spinner_button"></span> Creating...
            </span>
          ) : (
            "Create Order"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateOrder;
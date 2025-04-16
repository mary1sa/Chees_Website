import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import axiosInstance from '../../config/axiosInstance';
import './Books.css';

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const book = location.state?.book;
  
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const orderData = {
        items: [{ book_id: id, quantity }],
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        notes: notes
      };

      const response = await axiosInstance.post('/orders', orderData);
      
      navigate(`/member/dashboard/books/${id}`, {
        state: { 
          orderSuccess: `Order #${response.data.order_number} placed successfully!` 
        }
      });
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!book) {
    return (
      <div className="loading-container">
        <p>Loading book details...</p>
      </div>
    );
  }

  return (
    <div className="order-form-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FiArrowLeft /> Back to Book
      </button>

      <h2>Order: {book.title}</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quantity (Max: {book.stock})</label>
          <input
            type="number"
            min="1"
            max={book.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(book.stock, Math.max(1, parseInt(e.target.value) || 1)))}
            required
          />
        </div>

        <div className="form-group">
          <label>Shipping Address</label>
          <input
            type="text"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Billing Address</label>
          <input
            type="text"
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="submit-order" 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
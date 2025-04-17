import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import { 
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiTruck,
  FiShoppingCart,
  FiBook
} from 'react-icons/fi';
import './Books.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch order details');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'shipped': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'primary';
    }
  };

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!order) return <div className="no-orders">Order not found</div>;

  return (
    <div className="order-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FiArrowLeft /> Back to Orders
      </button>

      <div className="order-header">
        <h2>Order Details #{order.order_number}</h2>
        <div className={`order-status ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>

      <div className="order-meta">
        <div className="meta-item">
          <FiCalendar />
          <span>Order Date: {new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <div className="meta-item">
          <FiDollarSign />
          <span>Total Amount: ${Number(order.total_amount).toFixed(2)}</span>
        </div>
        {order.shipping_tracking_number && (
          <div className="meta-item">
            <FiTruck />
            <span>Tracking Number: {order.shipping_tracking_number}</span>
          </div>
        )}
      </div>

      <div className="order-sections">
        <div className="order-section">
          <h3>Shipping Address</h3>
          <p>{order.shipping_address}</p>
        </div>

        <div className="order-section">
          <h3>Billing Address</h3>
          <p>{order.billing_address}</p>
        </div>

        <div className="order-section">
          <h3>Payment Method</h3>
          <p>{order.payment_method}</p>
        </div>

        {order.notes && (
          <div className="order-section">
            <h3>Notes</h3>
            <p>{order.notes}</p>
          </div>
        )}
      </div>

      <div className="order-items">
        <h3>Items ({order.items.length})</h3>
        {order.items.map(item => (
          <div key={item.id} className="order-item">
            <div className="item-image">
              {item.book?.cover_image ? (
                <img 
                  src={`http://127.0.0.1:8000/storage/${item.book.cover_image}`} 
                  alt={item.book.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="item-image-placeholder">
                <FiBook />
              </div>
            </div>
            <div className="item-details">
              <h4>
                <Link to={`/member/dashboard/books/${item.book_id}`}>
                  {item.book?.title || 'Book not available'}
                </Link>
              </h4>
              <div className="item-meta">
                <span>Price: ${Number(item.price).toFixed(2)}</span>
                <span>Quantity: {item.quantity}</span>
                <span>Subtotal: ${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetails;
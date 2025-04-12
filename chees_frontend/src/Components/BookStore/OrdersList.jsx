import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiTrash2, FiChevronLeft, FiChevronRight, FiBook, FiPlus } from 'react-icons/fi';
import axiosInstance from '../config/axiosInstance';
import { format } from 'date-fns';
import '../AdminDashboard/UserTable.css';
import PageLoading from '../PageLoading/PageLoading';
import ConfirmDelete from '../Confirm/ConfirmDelete';
import SuccessAlert from '../Alerts/SuccessAlert';
import ErrorAlert from '../Alerts/ErrorAlert';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    if (searchFilter) {
      const searchTerm = searchFilter.toLowerCase();
      result = result.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm) ||
        (order.user?.name && order.user.name.toLowerCase().includes(searchTerm)) ||
        order.items.some(item => item.book.title.toLowerCase().includes(searchTerm))
      );
    }
    
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [orders, statusFilter, searchFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/orders');
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Failed to load orders');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
  
    try {
      setLoading(true);
      await axiosInstance.delete(`/orders/${orderToDelete.id}`);
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      setFilteredOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      setSuccessMessage('Order deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting order:', error);
      setErrorMessage('Failed to delete order');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setShowDeleteModal(false);
      setOrderToDelete(null);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await axiosInstance.patch(`/orders/${orderId}/status`, {
        status: newStatus
      });
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSuccessMessage('Order status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrorMessage('Failed to update order status');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      default: return 'status-pending';
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pages = [];
    const visiblePages = 3;

    if (totalPages <= 1) return null;

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
        onConfirm={confirmDeleteOrder}
        itemName={orderToDelete ? `order #${orderToDelete.order_number}` : 'this order'}
      />

      {successMessage && <SuccessAlert message={successMessage} />}
      {errorMessage && <ErrorAlert message={errorMessage} />}

      <h1 className="table-title">Orders List</h1>
      
      <div className="header-actions">
        <Link to="/admin/dashboard/orders/create" className="add-order-btn">
          <FiPlus /> Create New Order
        </Link>
        
        <div className="filter-controls">
          <div className="filter-group">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by order #, customer, or book title"
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="data-table">
        <div className="table-header">
          <div className="header-cell">Order #</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Customer</div>
          <div className="header-cell">Amount</div>
          <div className="header-cell">Items</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {currentItems.length > 0 ? (
          currentItems.map((order) => (
            <React.Fragment key={order.id}>
              <div 
                className={`table-row ${expandedOrder === order.id ? 'expanded' : ''}`} 
                onClick={() => toggleOrderExpand(order.id)}
              >
                <div className="table-cell">
                  <span className="order-number">#{order.order_number}</span>
                </div>
                
                <div className="table-cell">
                  {format(new Date(order.created_at), 'MMM dd, yyyy')}
                </div>
                
                <div className="table-cell">
                  {order.user?.name || 'Guest'}
                </div>
                
                <div className="table-cell">
                  ${Number(order.total_amount).toFixed(2)}
                </div>
                
                <div className="table-cell">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </div>
                
                <div className="table-cell">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className={`status-select ${getStatusClass(order.status)}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="table-cell actions">
                  <Link 
                    to={`/orders/${order.id}`} 
                    className="action-btn view-btn"
                    title="View Details"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiEye className="icon" />
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrderToDelete(order); 
                      setShowDeleteModal(true); 
                    }}                 
                    className="action-btn delete-btn"
                    title="Delete"
                  >
                    <FiTrash2 className="icon" />
                  </button>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="order-details-expanded">
                  <div className="order-items-header">
                    <FiBook className="icon" />
                    <h4>Order Items</h4>
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img 
                        src={item.book.cover_image || '/default-book.jpg'} 
                        alt={item.book.title} 
                        className="order-item-image"
                      />
                      <div className="item-info">
                        <div className="item-title">{item.book.title}</div>
                        <div className="item-meta">
                          <span>Qty: {item.quantity}</span>
                          <span>Price: ${Number(item.price).toFixed(2)}</span>
                          <span>Total: ${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.book.author && (
                          <div className="item-author">Author: {item.book.author.name}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>${Number(order.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>${Number(order.shipping_fee)?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>${(Number(order.total_amount) + Number(order.shipping_fee || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="no-results">
            No orders found matching your criteria
          </div>
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default OrdersList;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';

const MemberOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchUserOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/user/orders?page=${page}`);
      setOrders(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchUserOrders(newPage);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  if (!orders || orders.length === 0) {
    return (
      <div className="empty-wishlist">
        <svg 
        style={{width:"100px"}}
          className="wishlist-icon" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
          />
        </svg>
        <h3>Your order history is empty</h3>
        <p>You haven't placed any orders yet. When you do, they'll appear here.</p>
        <Link to="/books" className="browse-books-button">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <div className="text-sm text-gray-500">
          Showing {(pagination.current_page - 1) * pagination.per_page + 1}-
          {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} orders
        </div>
      </div>
      
      <div className="space-y-6">
        {orders?.map(order => (
          <Link 
            key={order.id}
            to={`/member/dashboard/orders/${order.id}`}
            className="block bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Order #{order.order_number}</h2>
                <p className="text-sm text-gray-500">
                  Placed on: {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="mt-2 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${order.total_amount?.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {order.items?.reduce((total, item) => total + item.quantity, 0)} items
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3 text-gray-700">Order Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {order.items?.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                      {item.book?.cover_image ? (
                        <img 
                          src={`/storage/${item.book.cover_image}`} 
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.book?.title || 'Unknown Book'}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className="flex items-center text-sm text-gray-500">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pagination.last_page > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              let page;
              if (pagination.last_page <= 5) {
                page = i + 1;
              } else if (pagination.current_page <= 3) {
                page = i + 1;
              } else if (pagination.current_page >= pagination.last_page - 2) {
                page = pagination.last_page - 4 + i;
              } else {
                page = pagination.current_page - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                    pagination.current_page === page
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MemberOrders;
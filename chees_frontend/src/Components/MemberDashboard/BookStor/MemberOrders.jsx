import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance'; // Update the path

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        {orders?.length > 0 && (
          <div className="text-sm text-gray-500">
            Showing {(pagination.current_page - 1) * pagination.per_page + 1}-
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} orders
          </div>
        )}
      </div>
      
      {orders?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-gray-500">Your order history will appear here once you make purchases.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {orders?.map(order => (
              <div key={order.id} className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Order #{order.order_number}</h2>
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
                
                {order.items && order?.items?.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3 text-gray-700">Order Items</h3>
                    <ul className="space-y-4">
                      {order?.items.map(item => (
                        <li key={item.id} className="flex items-start">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                            {item.book?.cover_image ? (
                              <img 
                                src={item.book.cover_image} 
                                alt={item.book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="font-medium text-gray-900">{item.book?.title || 'Unknown Book'}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            <p className="text-sm">${item.price?.toFixed(2)} each</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.price * item.quantity)?.toFixed(2)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Shipping Information</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm">{order.shipping_address}</p>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Tracking:</span> {order.shipping_tracking_number || 'Not available'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Payment Information</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">Method:</span> {order.payment_method}
                        </p>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Transaction ID:</span> {order.transaction_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
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
                ))}
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
        </>
      )}
    </div>
  );
};

export default MemberOrders;
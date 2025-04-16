import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './BookStoreDashboard.css';
import axiosInstance from '../config/axiosInstance';
import PageLoading from '../PageLoading/PageLoading'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BookStoreDashboard = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/order-items', {
          params: { range: timeRange }
        });
        setOrderItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order items:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Process data for charts
  const processOrderProgressData = () => {
    // Group by date
    const ordersByDate = orderItems.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});

    // Get all dates in range
    const endDate = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case 'week': startDate.setDate(endDate.getDate() - 7); break;
      case 'month': startDate.setMonth(endDate.getMonth() - 1); break;
      case 'quarter': startDate.setMonth(endDate.getMonth() - 3); break;
      case 'year': startDate.setFullYear(endDate.getFullYear() - 1); break;
      default: startDate.setMonth(endDate.getMonth() - 1);
    }

    const labels = [];
    const values = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      labels.push(formattedDate);
      values.push(ordersByDate[dateString] || 0);
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      labels,
      datasets: [{
        label: 'Orders',
        data: values,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    };
  };

  const processTopBooksData = () => {
    // Group by book
    const booksCount = orderItems.reduce((acc, item) => {
      if (!acc[item.book_id]) {
        acc[item.book_id] = {
          title: item.book?.title || 'Unknown Book',
          count: 0
        };
      }
      acc[item.book_id].count++;
      return acc;
    }, {});

    // Get top 10
    const topBooks = Object.values(booksCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      labels: topBooks.map(book => book.title),
      datasets: [{
        label: 'Number of Orders',
        data: topBooks.map(book => book.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  };

  const calculateSummary = () => {
    const uniqueOrders = new Set(orderItems.map(item => item.order_id));
    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalBooksSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      total_orders: uniqueOrders.size,
      total_revenue: totalRevenue,
      total_books_sold: totalBooksSold,
      avg_order_value: uniqueOrders.size > 0 ? totalRevenue / uniqueOrders.size : 0
    };
  };

  if (loading) return <PageLoading />;

  const summary = calculateSummary();

  return (
    <div className="bookstore-dashboard">
      <div className="dashboard-header">
        <h2>Book Store Dashboard</h2>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-container">
          <h3>Order Progress</h3>
          <div className="chart-wrapper">
            <Line 
              data={processOrderProgressData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Order Trends Over Time' }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>Top 10 Ordered Books</h3>
          <div className="chart-wrapper">
            <Bar
              data={processTopBooksData()}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Most Popular Books' }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p>{summary.total_orders}</p>
        </div>
        <div className="stat-card">
          <h4>Revenue</h4>
          <p>${summary.total_revenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h4>Avg. Order Value</h4>
          <p>${summary.avg_order_value.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h4>Books Sold</h4>
          <p>{summary.total_books_sold}</p>
        </div>
      </div>
    </div>
  );
};

export default BookStoreDashboard;
import React, { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiBook, FiTrendingUp, FiBookOpen } from 'react-icons/fi';
import axios from 'axios';
import './CourseManagement.css';

const CourseStats = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeStudents: 0
  });
  
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'
  
  useEffect(() => {
    fetchStats();
    fetchPopularCourses();
  }, [period]);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/stats/courses?period=${period}`);
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError(`Error fetching statistics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPopularCourses = async () => {
    try {
      const response = await axios.get(`/api/stats/popular-courses?period=${period}`);
      if (response.data.success) {
        setPopularCourses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching popular courses:', err);
    }
  };
  
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };
  
  // Placeholder for when actual chart libraries are imported
  const renderChartPlaceholder = (title) => (
    <div className="chart-placeholder">
      <p>{title} visualization would appear here</p>
      <p>Implement with Chart.js or Recharts library</p>
    </div>
  );
  
  if (loading && !stats.totalCourses) {
    return <div className="loading-message">Loading statistics...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="course-management-container">
      <div className="section-header">
        <h2 className="section-title">Course Analytics</h2>
        <div className="period-selector">
          <button 
            className={`period-button ${period === 'week' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('week')}
          >
            This Week
          </button>
          <button 
            className={`period-button ${period === 'month' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('month')}
          >
            This Month
          </button>
          <button 
            className={`period-button ${period === 'year' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('year')}
          >
            This Year
          </button>
        </div>
      </div>
      
      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Courses</span>
              <span className="stat-icon bg-primary">
                <FiBook />
              </span>
            </div>
            <h3 className="stat-value">{stats.totalCourses}</h3>
            <div className="stat-change positive">
              <FiTrendingUp />
              <span>+{stats.newCoursesPercent || 0}% from last {period}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Enrollments</span>
              <span className="stat-icon bg-success">
                <FiUsers />
              </span>
            </div>
            <h3 className="stat-value">{stats.totalEnrollments}</h3>
            <div className={`stat-change ${stats.enrollmentTrend >= 0 ? 'positive' : 'negative'}`}>
              <FiTrendingUp />
              <span>{stats.enrollmentTrend >= 0 ? '+' : ''}{stats.enrollmentTrend || 0}% from last {period}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Revenue</span>
              <span className="stat-icon bg-warning">
                <FiDollarSign />
              </span>
            </div>
            <h3 className="stat-value">${stats.totalRevenue?.toFixed(2) || '0.00'}</h3>
            <div className={`stat-change ${stats.revenueTrend >= 0 ? 'positive' : 'negative'}`}>
              <FiTrendingUp />
              <span>{stats.revenueTrend >= 0 ? '+' : ''}{stats.revenueTrend || 0}% from last {period}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Active Students</span>
              <span className="stat-icon bg-info">
                <FiBookOpen />
              </span>
            </div>
            <h3 className="stat-value">{stats.activeStudents}</h3>
            <div className={`stat-change ${stats.activeStudentsTrend >= 0 ? 'positive' : 'negative'}`}>
              <FiTrendingUp />
              <span>{stats.activeStudentsTrend >= 0 ? '+' : ''}{stats.activeStudentsTrend || 0}% from last {period}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Enrollment Trends</h3>
            <div className="chart-period-selector">
              <button 
                className={`chart-period-option ${period === 'week' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('week')}
              >
                W
              </button>
              <button 
                className={`chart-period-option ${period === 'month' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('month')}
              >
                M
              </button>
              <button 
                className={`chart-period-option ${period === 'year' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('year')}
              >
                Y
              </button>
            </div>
          </div>
          <div className="chart-body">
            {renderChartPlaceholder('Enrollment trends over time')}
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue Breakdown</h3>
            <div className="chart-period-selector">
              <button 
                className={`chart-period-option ${period === 'week' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('week')}
              >
                W
              </button>
              <button 
                className={`chart-period-option ${period === 'month' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('month')}
              >
                M
              </button>
              <button 
                className={`chart-period-option ${period === 'year' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('year')}
              >
                Y
              </button>
            </div>
          </div>
          <div className="chart-body">
            {renderChartPlaceholder('Revenue breakdown by course category')}
          </div>
        </div>
      </div>
      
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Most Popular Courses</h3>
        </div>
        
        {popularCourses.length === 0 ? (
          <div className="empty-state">
            <p>No enrollment data available for this period.</p>
          </div>
        ) : (
          <table className="popular-courses-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Course</th>
                <th>Enrollments</th>
                <th>Completion Rate</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {popularCourses.map((course, index) => (
                <tr key={course.id}>
                  <td>
                    <div className={`course-rank ${index < 3 ? 'top' : ''}`}>{index + 1}</div>
                  </td>
                  <td>{course.title}</td>
                  <td>{course.enrollments_count}</td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${course.completion_rate}%` }}></div>
                    </div>
                    <span className="progress-text">{course.completion_rate}%</span>
                  </td>
                  <td>${course.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CourseStats;

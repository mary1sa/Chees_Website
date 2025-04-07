import React from 'react';
import './PageLoading.css'; 

const PageLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default PageLoading;

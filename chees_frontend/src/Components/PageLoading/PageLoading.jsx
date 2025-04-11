import React from 'react';
import './PageLoading.css';
import chessLoader from './chess-loading-animation.gif'; 

const PageLoading = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <img src={chessLoader} alt="Loading" className="chess-loader" />
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default PageLoading;

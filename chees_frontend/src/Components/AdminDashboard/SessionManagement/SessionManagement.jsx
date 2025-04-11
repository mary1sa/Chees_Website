import React, { useState, useEffect } from 'react';
import { FiCalendar, FiUsers, FiVideo, FiList } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import SessionScheduler from './SessionScheduler';
import SessionList from './SessionList';
import AttendanceTracker from './AttendanceTracker';
import RecordingUploader from './RecordingUploader';
import PageLoading from '../../PageLoading/PageLoading';
import './SessionManagement.css';

const SessionManagement = () => {
  const [activeTab, setActiveTab] = useState('list'); // Default to "View Sessions"
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  
  // Set the active tab based on the URL path
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/admin/dashboard/sessions/scheduler')) {
      setActiveTab('schedule');
    } else {
      // Default to list view (All Sessions)
      setActiveTab('list');
    }
  }, [location]);
  
  return (
    <div className="session-management-container">
      <div className="session-tabs">
        <button 
          className={`session-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <FiList /> View Sessions
        </button>
        <button 
          className={`session-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <FiCalendar /> Schedule Sessions
        </button>
        
        
        
        <button 
          className={`session-tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <FiUsers /> Attendance Tracker
        </button>
        
        <button 
          className={`session-tab ${activeTab === 'recordings' ? 'active' : ''}`}
          onClick={() => setActiveTab('recordings')}
        >
          <FiVideo /> Upload Recordings
        </button>
      </div>
      
      <div className="session-content">
        {loading && <PageLoading />}
        
        {/* Always render the active component but hide it with CSS if loading */}
        <div className={loading ? 'hidden-content' : ''}>
          {activeTab === 'schedule' && <SessionScheduler onLoadingChange={setLoading} />}
          {activeTab === 'list' && <SessionList onLoadingChange={setLoading} />}
          {activeTab === 'attendance' && <AttendanceTracker onLoadingChange={setLoading} />}
          {activeTab === 'recordings' && <RecordingUploader onLoadingChange={setLoading} />}
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;

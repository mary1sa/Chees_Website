import React, { useState, useEffect } from 'react';
import { FiCalendar, FiList, FiX } from 'react-icons/fi';
import axios from 'axios';
import SessionCard from './SessionCard';
import SessionCalendar from './SessionCalendar';
import './Sessions.css';
import PageLoading from '../../PageLoading/PageLoading';

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(null);
  const [joinSessionData, setJoinSessionData] = useState(null);
  
  useEffect(() => {
    fetchSessions();
  }, []);
  
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/course-sessions/upcoming');
      if (response.data.success) {
        setSessions(response.data.data);
      } else {
        setError('Failed to fetch sessions');
      }
    } catch (err) {
      setError(`Error fetching sessions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDaySelect = (date) => {
    setSelectedDate(date);
  };
  
  const filteredSessions = selectedDate 
    ? sessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        return (
          sessionDate.getDate() === selectedDate.getDate() &&
          sessionDate.getMonth() === selectedDate.getMonth() &&
          sessionDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : sessions;
  
  const handleJoinSession = (session) => {
    setJoinSessionData(session);
  };
  
  const closeJoinDialog = () => {
    setJoinSessionData(null);
  };
  
  const joinSession = () => {
    // Open Zoom link in new tab
    if (joinSessionData?.zoom_link) {
      window.open(joinSessionData.zoom_link, '_blank');
      
      // Mark attendance
      markAttendance(joinSessionData.id);
      
      // Close dialog
      closeJoinDialog();
    }
  };
  
  const markAttendance = async (sessionId) => {
    try {
      await axios.post('/api/session-attendances', {
        session_id: sessionId,
        status: 'attended'
      });
      // No need to handle response, this is a background operation
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      // We don't show this error to the user to avoid disrupting their flow
    }
  };
  
  if (loading) {
    return <PageLoading />;
  }
  
  if (error) {
    return <div className="sessions-error">{error}</div>;
  }
  
  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <h2>Upcoming Sessions</h2>
        <div className="view-toggle">
          <button 
            className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            <FiList /> List
          </button>
          <button 
            className={`view-toggle-btn ${view === 'calendar' ? 'active' : ''}`}
            onClick={() => setView('calendar')}
          >
            <FiCalendar /> Calendar
          </button>
        </div>
      </div>
      
      {view === 'calendar' ? (
        <div className="calendar-view">
          <SessionCalendar 
            sessions={sessions}
            onDaySelect={handleDaySelect}
          />
          
          {selectedDate && (
            <div className="calendar-day-sessions">
              <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
              
              {filteredSessions.length === 0 ? (
                <p className="no-sessions-message">No sessions scheduled for this day.</p>
              ) : (
                <div className="sessions-list">
                  {filteredSessions.map(session => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      onJoin={handleJoinSession} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="list-view">
          <div className="sessions-tabs">
            <div className="session-tab active">Upcoming</div>
            <div className="session-tab">Past</div>
          </div>
          
          {sessions.length === 0 ? (
            <div className="empty-sessions">
              <FiCalendar />
              <h3>No upcoming sessions</h3>
              <p>You don't have any upcoming sessions scheduled. Check your enrolled courses to book sessions.</p>
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.map(session => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onJoin={handleJoinSession} 
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {joinSessionData && (
        <div className="join-session-overlay">
          <div className="join-dialog">
            <div className="join-dialog-header">
              <h3 className="join-dialog-title">Join Session</h3>
              <button className="join-dialog-close" onClick={closeJoinDialog}>
                <FiX />
              </button>
            </div>
            
            <div className="join-dialog-details">
              <p><strong>{joinSessionData.title}</strong></p>
              <p>
                {new Date(joinSessionData.start_time).toLocaleString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {joinSessionData.coach && <p>Coach: {joinSessionData.coach.name}</p>}
            </div>
            
            <div className="join-dialog-actions">
              <button 
                className="join-dialog-button secondary" 
                onClick={closeJoinDialog}
              >
                Cancel
              </button>
              <button 
                className="join-dialog-button primary" 
                onClick={joinSession}
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSessions;

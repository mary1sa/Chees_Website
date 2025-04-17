import React, { useState, useEffect } from 'react';
import { FiCalendar, FiList, FiX, FiClock, FiUser, FiBook } from 'react-icons/fi';
import axiosInstance from '../../../api/axios';
import SessionCard from './CoachSessionCard';
import SessionCalendar from './SessionCalendar';
import './CoachSessions.css';
import PageLoading from '../../PageLoading/PageLoading';

const UpcomingSessions = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]); // For calendar view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(null);
  const [joinSessionData, setJoinSessionData] = useState(null);

  const handleDaySelect = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the logged-in coach's ID from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const coachId = userData.id;
        
        if (!coachId) {
          setError('Unable to identify coach. Please log in again.');
          setLoading(false);
          return;
        }

        // Use the standard session endpoints since coach-specific endpoints are not available
        const response = await axiosInstance.get(`/api/course-sessions/${activeTab}`);
        
        // Debug: Log coachId and all fetched sessions
        console.log('Logged-in coachId:', coachId);
        console.log('Fetched sessions from API:', response.data.data);
        
        // Filter sessions to only include those assigned to this coach
        const allSessionsData = response.data.data || [];
        const coachSessions = allSessionsData.filter(session => 
          session.coach_id === coachId || 
          (session.coach && session.coach.id === coachId)
        );
        
        // Debug: Log filtered sessions for this coach
        console.log('Filtered sessions for this coach:', coachSessions);
        
        setSessions(coachSessions);

        // If we're in calendar view, fetch all sessions and filter for this coach
        if (view === 'calendar') {
          const [upcomingRes, pastRes] = await Promise.all([
            axiosInstance.get('/api/course-sessions/upcoming'),
            axiosInstance.get('/api/course-sessions/past')
          ]);
          
          // Combine all sessions
          const allSessionsData = [...(upcomingRes.data.data || []), ...(pastRes.data.data || [])];
          
          // Filter to only include sessions assigned to this coach
          const allCoachSessions = allSessionsData.filter(session => 
            session.coach_id === coachId || 
            (session.coach && session.coach.id === coachId)
          );
          
          setAllSessions(allCoachSessions);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching coach sessions:', err);
        setError('Failed to fetch your sessions. Please try again later.');
        setLoading(false);
      }
    };

    fetchSessions();
  }, [activeTab, view]);

  
  const filteredSessions = selectedDate 
    ? (view === 'calendar' ? allSessions : sessions).filter(session => {
        const sessionDate = new Date(session.start_datetime);
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
      await axiosInstance.post('/api/session-attendances', {
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
        <h2>Sessions</h2>
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
      <div className="sessions-tabs">
        <button
          className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
      </div>
      
      {view === 'calendar' ? (
        <div className="calendar-view">
          <SessionCalendar 
            sessions={allSessions}
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
        sessions.length === 0 ? (
          <div className="empty-sessions">
            <FiCalendar />
            <h3>No {activeTab} sessions assigned to you</h3>
            <p>You don't have any {activeTab} sessions {activeTab === 'upcoming' ? 'scheduled' : 'recorded'} where you're the assigned coach.</p>
          </div>
        ) : (
          <div className={`sessions-list ${view === 'list' ? 'list-view' : ''}`}>
            {sessions.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                onJoin={handleJoinSession}
                isPastSession={activeTab === 'past'}
              />
            ))}
          </div>
        )
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
            
            {joinSessionData.coach && (
              <div className="join-dialog-coach">
                <div className="join-dialog-coach-avatar">
                  {joinSessionData.coach.first_name ? joinSessionData.coach.first_name.charAt(0) : ''}
                  {joinSessionData.coach.last_name ? joinSessionData.coach.last_name.charAt(0) : ''}
                </div>
                <div className="join-dialog-coach-info">
                  <span className="join-dialog-coach-label">Your Coach</span>
                  <span className="join-dialog-coach-name">
                    {joinSessionData.coach.first_name} {joinSessionData.coach.last_name}
                  </span>
                </div>
              </div>
            )}
            
            <div className="join-dialog-details">
              <div className="join-dialog-detail">
                <FiCalendar />
                <div className="join-dialog-detail-content">
                  <span className="join-dialog-detail-label">Date</span>
                  <span className="join-dialog-detail-value">
                    {new Date(joinSessionData.start_datetime).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="join-dialog-detail">
                <FiClock />
                <div className="join-dialog-detail-content">
                  <span className="join-dialog-detail-label">Time</span>
                  <span className="join-dialog-detail-value">
                    {new Date(joinSessionData.start_datetime).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(joinSessionData.end_datetime).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              {joinSessionData.course && (
                <div className="join-dialog-detail">
                  <FiBook />
                  <div className="join-dialog-detail-content">
                    <span className="join-dialog-detail-label">Course</span>
                    <span className="join-dialog-detail-value">{joinSessionData.course.title}</span>
                  </div>
                </div>
              )}
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

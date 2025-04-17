import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, FiClock, FiUser, 
  FiVideo, FiArrowRight, FiMapPin,
  FiUsers, FiCheckCircle, FiList,
  FiSettings, FiFileText, FiUserPlus,
  FiDollarSign,
  FiInfo,
  FiPlus,
  FiPlusCircle
} from 'react-icons/fi';
import axiosInstance from '../../api/axios';
import PageLoading from '../PageLoading/PageLoading';
import '../MemberDashboard/MemberDashboard.css';
import './CoachDashboard.css';

const CoachDashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    totalCourses: 0,
    previousSessions: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);


  useEffect(() => {
    fetchCoachData();
  }, []);

  const calculateTimeUntilSession = (session) => {
    try {
      // Try multiple date fields that might be available
      const sessionDate = session.start_date || session.start_datetime || session.datetime;
      
      // Make sure we have a valid date
      if (!sessionDate) return "N/A";
      
      // Parse the date string safely
      const sessionTime = new Date(sessionDate).getTime();
      
      // Check if the date is valid
      if (isNaN(sessionTime)) return "N/A";
      
      const now = new Date().getTime();
      const timeDifference = sessionTime - now;
      
      // If the session is in the past
      if (timeDifference < 0) return "Session started";
      
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      }
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error("Error calculating time until session:", error);
      return "N/A";
    }
  };

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      
      // Get user ID from local storage or auth context
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const coachId = userData.id;
      
      if (!coachId) {
        setError("Unable to identify coach. Please log in again.");
        setLoading(false);
        return;
      }
      
      // Fetch upcoming sessions and past sessions for this coach
      let sessionsData = [];
      let pastSessionsData = [];
      try {
        // Get upcoming sessions for this coach
        const response = await axiosInstance.get('/api/course-sessions/upcoming');
        if (response && response.data && response.data.data) {
          // Filter to only include sessions assigned to this coach
          sessionsData = response.data.data.filter(session => 
            session.coach_id === coachId || 
            (session.coach && session.coach.id === coachId)
          );
        }
        // Fetch past sessions for this coach
        const pastResponse = await axiosInstance.get(`/api/course-sessions/past?coach_id=${coachId}`);
        if (pastResponse && pastResponse.data && pastResponse.data.data) {
          pastSessionsData = pastResponse.data.data;
        }

      } catch (err) {
        // Fallback to mock data if API fails
        const now = new Date();
        const dayInMs = 86400000;
        
        sessionsData = [
          {
            id: 1,
            title: "Opening Principles",
            course_id: 1,
            course: { title: "Beginner's Chess Fundamentals" },
            start_date: new Date(now.getTime() + (dayInMs * 1)).toISOString(),
            end_date: new Date(now.getTime() + (dayInMs * 1) + 7200000).toISOString(),
            location: "Online",
            is_online: true,
            zoom_link: "https://zoom.us/j/example",
            location_type: "online",
            registered_students: 8
          },
          {
            id: 2,
            title: "Tactical Combinations",
            course_id: 2,
            course: { title: "Intermediate Tactics" },
            start_date: new Date(now.getTime() + (dayInMs * 3)).toISOString(),
            end_date: new Date(now.getTime() + (dayInMs * 3) + 7200000).toISOString(),
            location: "Online",
            is_online: true,
            zoom_link: "https://zoom.us/j/example2",
            location_type: "online",
            registered_students: 6
          },
          {
            id: 3,
            title: "Pawn Structure Analysis",
            course_id: 3,
            course: { title: "Advanced Opening Theory" },
            start_date: new Date(now.getTime() + (dayInMs * 5)).toISOString(),
            end_date: new Date(now.getTime() + (dayInMs * 5) + 7200000).toISOString(),
            location: "Raja Club Inzgane Training Room",
            is_online: false,
            registered_students: 5
          }
        ];
      }
      
      // Sort upcoming sessions by date
      sessionsData.sort((a, b) => new Date(a.start_date || a.start_datetime || a.datetime) - new Date(b.start_date || b.start_datetime || b.datetime));
      // Set upcoming sessions (for dashboard display)
      setUpcomingSessions(sessionsData);
      
      // Fetch all courses for course count
      let totalCourses = 0;
      try {
        const coursesResponse = await axiosInstance.get('/api/courses');
        if (coursesResponse.data && coursesResponse.data.success) {
          totalCourses = coursesResponse.data.data.meta?.total || 
                        coursesResponse.data.data.total || 
                        coursesResponse.data.data.data?.length || 
                        coursesResponse.data.data.length || 0;
        }
      } catch (courseErr) {
        console.error('Error fetching courses for coach dashboard:', courseErr);
      }

      // Calculate stats
      const dashboardStats = {
        upcomingSessions: sessionsData.length,
        totalCourses: totalCourses,
        previousSessions: pastSessionsData.length
      };
      
      setStats(dashboardStats);
      setLoading(false);
    } catch (err) {
      console.error("Error setting up coach dashboard:", err);
      setError("Error loading dashboard data. Please try again later.");
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading text="Loading your dashboard..." />;
  }

  return (
    <div className="member-dashboard-overview">
      {/* DEBUG: Show sessionsData as JSON for troubleshooting */}

      <h1>Coach Dashboard</h1>
      <p className="welcome-message">
        Welcome to your Coach Dashboard. Here you can manage your upcoming sessions, view student registrations, and access teaching materials.
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Coach Stats Section */}
      <div className="dashboard-stats">
        <div className="stat-cards">
          <div className="stat-icon session-icon">
            <FiCalendar />
          </div>
          <div className="stat-details">
            <h3>Upcoming Sessions</h3>
            <p className="stat-count">{stats.upcomingSessions}</p>
            <p className="stat-label">Scheduled sessions</p>
          </div>
        </div>
        
        <div className="stat-cards">
          <div className="stat-icon user-icon">
            <FiUsers />
          </div>
          <div className="stat-details">
            <h3>Courses</h3>
            <p className="stat-count">{stats.totalCourses}</p>
            <p className="stat-label">Registered students</p>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-icon session-icon">
            <FiCalendar />
          </div>
          <div className="stat-details">
            <h3>Previous Sessions</h3>
            <p className="stat-count">{stats.previousSessions}</p>
            <p className="stat-label">past sessions</p>
          </div>
        </div>
        
      </div>
      
      {/* Upcoming Sessions Section */}
      <div className="upcoming-sessions-section">
        <h2><FiClock /> Your Upcoming Sessions</h2>
        {upcomingSessions.length > 0 ? (
          <div className="sessions-grid">
            {upcomingSessions.slice(0, 3).map(session => (
              <div className="session-card" key={session.id}>
                <div className="session-header">
                  <h3>{session.title}</h3>
                  <span className="countdown-timer">
                    {calculateTimeUntilSession(session)}
                  </span>
                </div>
                
                <div className="session-details">
                  <p className="session-course">
                    {session.course?.title || "Course"}
                  </p>
                  <p className="session-time">
                    <span className="date">
                      {(() => {
                        try {
                          // Try multiple date fields that might be available
                          const dateStr = session.start_date || session.start_datetime || session.datetime;
                          const date = new Date(dateStr);
                          return isNaN(date.getTime()) ? 'Date not available' : date.toLocaleDateString();
                        } catch (error) {
                          return 'Date not available';
                        }
                      })()}
                    </span>
                    <span className="time">
                      {(() => {
                        try {
                          // Try multiple date fields that might be available
                          const dateStr = session.start_date || session.start_datetime || session.datetime;
                          const date = new Date(dateStr);
                          return isNaN(date.getTime()) ? 'Time not available' : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        } catch (error) {
                          return 'Time not available';
                        }
                      })()}
                    </span>
                  </p>
                  
                  
                  {(session.zoom_link || session.is_online || session.location_type === 'online') ? (
                    <div className="session-location online">
                      <FiVideo /> Online Session
                      {session.zoom_link && (
                        <a 
                          href={session.zoom_link} 
                          target="_blank"
                          rel="noreferrer"
                          className="join-session-btn"
                        >
                          Start Session
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="session-location">
                      <FiMapPin /> {session.location || session.venue || session.address || "Raja Club"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-sessions">
            <p>You don't have any upcoming sessions scheduled.</p>
          </div>
        )}
        
        <Link to="/coach/dashboard/upcoming-sessions" className="view-all-link">
          View all your sessions <FiArrowRight />
        </Link>

        {/* Quick Actions Section */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/coach/dashboard/upcoming-sessions" className="action-button sessions-action">
              <FiCalendar />
              <span>Manage Sessions</span>
            </Link>
            <Link to="/coach/dashboard/coachavailability" className="action-button orders-action">
              <FiClock />
              <span>View Availability</span>
            </Link>
            <Link to="/coach/dashboard/creatavailability" className="action-button users-action">
              <FiPlusCircle />
              <span>Add Availability</span>
            </Link>
            <Link to="/coach/dashboard/registrations" className="action-button events-action">
              <FiInfo />
              <span>Event Registrations</span>
            </Link>
            <Link to="/coach/dashboard/courses" className="action-button courses-action">
              <FiFileText />
              <span>Course Content</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboardOverview;

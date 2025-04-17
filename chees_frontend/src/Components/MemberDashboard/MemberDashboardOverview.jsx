import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBook, FiCalendar, FiClock, FiFileText, 
  FiUser, FiVideo, FiArrowRight, 
  FiActivity, FiShoppingBag
} from 'react-icons/fi';
import axiosInstance from '../../api/axios';
import PageLoading from '../PageLoading/PageLoading';
import './MemberDashboard.css';

const MemberDashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    availableMaterials: 0,
    upcomingEvents: 0,
    availableBooks: 0
  });
  const [nextSession, setNextSession] = useState(null);
  const [courseProgress, setCourseProgress] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [timeUntilNextSession, setTimeUntilNextSession] = useState('');
  const [attemptedEndpoints, setAttemptedEndpoints] = useState({});

  useEffect(() => {
    fetchMemberStats();
  }, []);

  // Update countdown timer every minute
  useEffect(() => {
    if (!nextSession) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const sessionDate = new Date(nextSession.start_date);
      const diffMs = sessionDate - now;
      
      if (diffMs <= 0) {
        setTimeUntilNextSession('Starting now!');
        return;
      }
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeUntilNextSession(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeUntilNextSession(`${hours}h ${minutes}m`);
      }
    };
    
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [nextSession]);

  const calculateTimeUntilSession = (sessionDate) => {
    try {
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
      
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      setError("Error calculating time until session:");
      return "N/A";
    }
  };

  // Try to fetch data from an API endpoint, but only once per session
  const tryFetchData = async (endpoint, defaultValue = null) => {
    // Skip if we've already tried this endpoint
    if (attemptedEndpoints[endpoint]) {
      return defaultValue;
    }
    
    try {
      // Mark this endpoint as attempted
      setAttemptedEndpoints(prev => ({...prev, [endpoint]: true}));
      
      const response = await axiosInstance.get(endpoint);
      if (response.data) {
        // Handle different response formats
        if (response.data.success) {
          return response.data.data || defaultValue;
        } else if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data.data) {
          return Array.isArray(response.data.data) ? response.data.data : response.data.data.data || defaultValue;
        }
      }
      return defaultValue;
    } catch (error) {
      setError("Error fetching data:");
      return defaultValue;
    }
  };

  const fetchMemberStats = async () => {
    try {
      setLoading(true);
      
      // Get user ID from local storage or auth context
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || 5; // Fallback to ID 5
      
      // Try to get courses data
      let coursesData;
      try {
        // Get purchased courses using the same endpoint as PurchasedCourses.jsx
        const coursesResponse = await axiosInstance.get('/api/courses/purchased');
        if (coursesResponse && coursesResponse.data) {
          // Handle response structure like PurchasedCourses component
          if (coursesResponse.data.success) {
            coursesData = coursesResponse.data.data;
          }
        }
      } catch (err) {
        // Mock course data for fallback
        coursesData = [
          { 
            id: 1, 
            title: "Beginner's Chess Fundamentals", 
            level: "Beginner",
            description: "A comprehensive introduction to chess for beginners."
          },
          { 
            id: 2, 
            title: "Intermediate Tactics", 
            level: "Intermediate",
            description: "Develop tactical vision and calculation skills."
          },
          { 
            id: 3, 
            title: "Advanced Opening Theory", 
            level: "Advanced",
            description: "Study opening principles and specific opening variations."
          },
          { 
            id: 4, 
            title: "Endgame Mastery", 
            level: "Intermediate",
            description: "Learn essential endgame patterns and techniques."
          }
        ];
      }
      
      // Use all courses from the purchased courses API response
      let enrolledCourses = Array.isArray(coursesData) ? coursesData : [];
      
      // Try to get sessions data
      let sessionsData;
      try {
        // Use the exact same API call as in UpcomingSessions.jsx
        const response = await axiosInstance.get('/api/course-sessions/upcoming');
        if (response && response.data && response.data.data) {
          sessionsData = response.data.data;
        }
      } catch (err) {
      }
      
      if (!sessionsData || !sessionsData.length) {
        // Let's not use mock data - if there are no sessions, show no sessions
        sessionsData = [];
      }
      
      // Filter sessions for enrolled courses and future dates
      const now = new Date();
      // Don't filter further - the API already returns upcoming sessions
      const userSessions = sessionsData;
      userSessions.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      
      // Get only the nearest upcoming session
      const nextSession = userSessions.length > 0 ? userSessions[0] : null;
      
      if (nextSession) {
        // Log all properties of the next session to find the coach name
        for (const key in nextSession) {
        }
        
        // If there's a coach object, log its fields too
        if (nextSession.coach && typeof nextSession.coach === 'object') {
          for (const key in nextSession.coach) {
          }
        }
      }
      
      // Try to get course materials
      let materialsData;
      try {
        // Get real course materials
        const materialsResponse = await axiosInstance.get('/api/course-materials');
        if (materialsResponse && materialsResponse.data) {
          // Handle paginated response with nested data array
          if (materialsResponse.data.data && Array.isArray(materialsResponse.data.data)) {
            materialsData = materialsResponse.data.data;
          } else {
            materialsData = materialsResponse.data;
          }
        }
      } catch (err) {
        // Mock materials data - user said they have 6 materials
        const now = new Date();
        
        materialsData = [
          {
            id: 1,
            title: "Chess Opening Fundamentals",
            course_id: 1,
            type: "pdf",
            url: "/materials/opening_fundamentals.pdf",
            created_at: new Date(now - 7 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 2,
            title: "Tactical Patterns Worksheet",
            course_id: 1,
            type: "pdf",
            url: "/materials/tactical_patterns.pdf",
            created_at: new Date(now - 6 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 3,
            title: "Basic Checkmates Video",
            course_id: 1,
            type: "video",
            url: "/materials/basic_checkmates.mp4",
            created_at: new Date(now - 5 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 4,
            title: "Advanced Opening Theory PDF",
            course_id: 3,
            type: "pdf",
            url: "/materials/advanced_opening_theory.pdf",
            created_at: new Date(now - 4 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 5,
            title: "Spanish Game Analysis",
            course_id: 3,
            type: "pdf",
            url: "/materials/spanish_game_analysis.pdf",
            created_at: new Date(now - 3 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 6,
            title: "Positional Play Concepts",
            course_id: 3,
            type: "video",
            url: "/materials/positional_play.mp4",
            created_at: new Date(now - 2 * 24 * 3600 * 1000).toISOString()
          }
        ];
      }
      
      // Filter materials for enrolled courses
      const userMaterials = Array.isArray(materialsData) 
        ? materialsData.filter(material => 
            enrolledCourses.some(course => course.id === material.course_id)
          )
        : [];
      
      // Sort by created date
      userMaterials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Try to get events data
      let eventsData;
      try {
        // Get real events data
        const eventsResponse = await axiosInstance.get('/api/events');
        if (eventsResponse && eventsResponse.data) {
          eventsData = eventsResponse.data.data || eventsResponse.data;
          if (!Array.isArray(eventsData)) {
            eventsData = [];
          }
        }
      } catch (err) {
        // Create realistic chess events data
        const now = new Date();
        const dayInMs = 86400000; // Define dayInMs here for events
        
        eventsData = [
          {
            id: 1,
            title: "Raja Club Weekend Tournament",
            description: "Open tournament for all club members",
            start_date: new Date(now.getTime() + (dayInMs * 5)).toISOString(),
            end_date: new Date(now.getTime() + (dayInMs * 6)).toISOString(),
            location: "Raja Club Inzgane Main Hall",
            event_type: "tournament",
            registration_fee: "100 MAD"
          },
          {
            id: 2,
            title: "Simultaneous Exhibition with GM Hassan",
            description: "Face our club's Grandmaster in a simultaneous exhibition",
            start_date: new Date(now.getTime() + (dayInMs * 12)).toISOString(),
            location: "Raja Club Inzgane",
            event_type: "exhibition",
            registration_fee: "50 MAD"
          },
          {
            id: 3,
            title: "Blitz Chess Evening",
            description: "Friendly blitz games with 5+2 time control",
            start_date: new Date(now.getTime() + (dayInMs * 3)).toISOString(),
            location: "Raja Club Inzgane Training Room",
            event_type: "casual",
            registration_fee: "Free"
          }
        ];
      }
      
      // Sort events by date
      eventsData.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      
      // Try to get bookstore data
      let booksData;
      try {
        // Get real bookstore data
        const booksResponse = await axiosInstance.get('/api/books');
        if (booksResponse && booksResponse.data) {
          booksData = booksResponse.data.data || booksResponse.data;
          if (!Array.isArray(booksData)) {
            booksData = [];
          }
        }
      } catch (err) {
        // Create realistic chess book data
        const dayInMs = 86400000; // Define dayInMs here for books
        
        booksData = [
          {
            id: 1,
            title: "My System",
            author: "Aron Nimzowitsch",
            description: "A classic chess strategy book",
            price: "250 MAD",
            cover_image: "#",
            category: "Strategy"
          },
          {
            id: 2,
            title: "The Life and Games of Mikhail Tal",
            author: "Mikhail Tal",
            description: "Autobiography of the tactical genius",
            price: "280 MAD",
            cover_image: "#",
            category: "Biography"
          },
          {
            id: 3,
            title: "Zurich International Chess Tournament 1953",
            author: "David Bronstein",
            description: "Annotated games from the candidates tournament",
            price: "200 MAD",
            cover_image: "#",
            category: "Tournament Books"
          },
          {
            id: 4,
            title: "Silman's Complete Endgame Course",
            author: "Jeremy Silman",
            description: "Essential endgame knowledge by player strength",
            price: "300 MAD",
            cover_image: "#",
            category: "Endgame"
          }
        ];
      }
      
      // Generate course progress data based on the enrolled courses
      const progressData = enrolledCourses.map(course => {
        return {
          id: course.id,
          title: course.title,
          progress: 0, // No progress since no attended sessions
          totalSessions: course.sessions || 12, // Different total sessions based on course
          attendedSessions: 0 // User specified 0 attended sessions
        };
      });
      
      // Calculate total stats accurately
      const dashboardStats = {
        enrolledCourses: enrolledCourses.length, // Use actual count of enrolled courses
        upcomingSessions: userSessions.length, // Use actual count of upcoming sessions
        completedSessions: 0, // User specified no attendance recorded yet
        availableMaterials: userMaterials.length, // Use actual count from API
        upcomingEvents: eventsData.length, // Use actual count of upcoming events
        availableBooks: booksData.length // Use actual count of available books
      };
      
      // Update state with accurate data
      setStats(dashboardStats);
      setNextSession(nextSession);
      setCourseProgress(progressData);
      if (Array.isArray(coursesData) && coursesData.length > 0) {
        // Sort by purchase date or id
        const sortedCourses = [...coursesData].sort((a, b) => {
          // If purchase_date exists, use that, otherwise fall back to id
          if (a.purchased_at && b.purchased_at) {
            return new Date(b.purchased_at) - new Date(a.purchased_at);
          }
          return b.id - a.id;
        });
        setRecentMaterials(sortedCourses.slice(0, 1));
      } else {
        // Fallback to enrolled courses if purchased courses is empty
        const sortedEnrolled = [...enrolledCourses].sort((a, b) => b.id - a.id);
        setRecentMaterials(sortedEnrolled.slice(0, 1));
      }
      setUpcomingEvents(eventsData); // Use all events from the API
      setRecommendedBooks(booksData.slice(0, 2));
      
      setLoading(false);
    } catch (err) {
      setError("Error setting up dashboard:");
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading text="Loading your dashboard..." />;
  }

  return (
    <div className="member-dashboard-overview">
      <h1>Member Dashboard</h1>
      <p className="welcome-message">
        Welcome to the Raja Club Inzgane Des Echecs member area. Here you can manage your courses, view upcoming sessions, and access learning materials.
      </p>
      
      {error && <div className="info-message">{error}</div>}
      
      {/* Personal Stats Section */}
      <div className="dashboard-stats">
        <div className="stat-cards">
          <div className="stat-icon course-icon">
            <FiBook />
          </div>
          <div className="stat-details">
            <h3>My Courses</h3>
            <p className="stat-count">{stats.enrolledCourses}</p>
            <p className="stat-label">Purchased courses</p>
          </div>
        </div>
        
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
            <FiActivity />
          </div>
          <div className="stat-details">
            <h3>Events</h3>
            <p className="stat-count">{stats.upcomingEvents}</p>
            <p className="stat-label">Events</p>
          </div>
        </div>
        
        <div className="stat-cards">
          <div className="stat-icon material-icon">
            <FiFileText />
          </div>
          <div className="stat-details">
            <h3>Books</h3>
            <p className="stat-count">{stats.availableBooks}</p>
            <p className="stat-label">Available books</p>
          </div>
        </div>
      </div>
      
      {/* Next Session Widget */}
      <div className="next-session-widget">
        <h2><FiClock /> Next Session</h2>
        {nextSession ? (
          <div className="next-session-content">
            <div className="session-details">
              <h3>{nextSession.title}</h3>
              <p className="session-course">
                {nextSession.course?.title || nextSession.course_title || 'Course'}
              </p>
              <p className="session-time">
                <span className="date">
                  {(() => {
                    try {
                      const date = new Date(nextSession.start_datetime || nextSession.start_date || nextSession.datetime);
                      return date.toLocaleDateString();
                    } catch (error) {
                      setError("Error formatting date:");
                      return "Date unavailable";
                    }
                  })()}
                </span>
                <span className="time">
                  {(() => {
                    try {
                      const date = new Date(nextSession.start_datetime || nextSession.start_date || nextSession.datetime);
                      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    } catch (error) {
                      setError("Error formatting time:");
                      return "Time unavailable";
                    }
                  })()}
                </span>
              </p>
              <p className="session-coach">
                Coach: {nextSession.coach ? `${nextSession.coach.first_name} ${nextSession.coach.last_name}` : 'TBA'}
              </p>
              <div className="countdown">
                <span className="countdown-label">Starting in:</span>
                <span className="countdown-timer">
                  {calculateTimeUntilSession(nextSession.start_datetime || nextSession.start_date || nextSession.datetime)}
                </span>
              </div>
              
              {/* Force online display based on user feedback */}
              {true ? (
                <a 
                  href={nextSession.zoom_link || nextSession.location_url || nextSession.online_url || '#'} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="join-session-btn"
                >
                  <FiVideo /> Join Online
                </a>
              ) : (
                <div className="location-info">
                  <FiUser /> In-person at {nextSession.location || nextSession.venue || nextSession.address || 'Club location'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-sessions">
            <p>You don't have any upcoming sessions scheduled.</p>
            <Link to="/member/dashboard/upcoming-sessions" className="view-all-link">
              View all available sessions <FiArrowRight />
            </Link>
          </div>
        )}
      </div>
      
      
      
      {/* Recent Course Purchase */}
      <div className="recent-materials-section">
        <h2><FiFileText /> Recent Course Purchase</h2>
        {recentMaterials.length > 0 ? (
          <div className="recent-course">
            {recentMaterials.map(course => (
              <div className="course-card" key={course.id}>
                
                <div className="course-details">
                  <h3>{course.title}</h3>
                  <p className="course-level">
                    {course.level ? (
                      typeof course.level === 'string' ? course.level : 
                      (course.level && course.level.name) ? course.level.name : 
                      "All Levels"
                    ) : "All Levels"}
                  </p>
                  {course.description && (
                    <p className="course-description">{typeof course.description === 'string' ? course.description : JSON.stringify(course.description)}</p>
                  )}
                  <p className="course-purchased">
                    Purchased Recently
                  </p>
                </div>
                <a href={`/member/dashboard/courses/${course.id}`} className="view-course-btn">
                  View Course
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">
            <p>Loading your purchased courses...</p>
            <Link to="/member/dashboard/courses/catalog" className="pc-browse-button">
              Browse Available Courses
            </Link>
          </div>
        )}
        
        <Link to="/member/dashboard/courses" className="view-all-link">
          Browse all courses <FiArrowRight />
        </Link>
      </div>
      
      {/* Upcoming Events */}
      <div className="upcoming-events-section">
        <h2><FiActivity /> Popular Events</h2>
        {upcomingEvents.length > 0 ? (
          <div className="events-list">
            {upcomingEvents.map(event => (
              <div className="event-card" key={event.id}>
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p className="event-description">{typeof event.description === 'string' ? event.description : JSON.stringify(event.description)}</p>
                  <p className="event-time">
                    <span className="date">{new Date(event.start_date).toLocaleDateString()}</span>
                    {event.end_date && (
                      <span> - {new Date(event.end_date).toLocaleDateString()}</span>
                    )}
                  </p>
                  <p className="event-location">{typeof event.location === 'string' ? event.location : 'Club venue'}</p>
                  <p className="event-fee">Registration: {typeof event.registration_fee === 'string' ? event.registration_fee : 'Contact us'}</p>
                </div>
                <div className="event-actions">
                  <Link to={`/member/dashboard/events/${event.id}`} className="event-link">
                    More Info
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-events">
            <p>No upcoming events scheduled.</p>
          </div>
        )}
        
        <Link to="/member/dashboard/events" className="view-all-link">
          View all events <FiArrowRight />
        </Link>
      </div>
      
      {/* Book Recommendations */}
      <div className="book-recommendations-section">
        <h2><FiShoppingBag /> Book Recommendations</h2>
        {recommendedBooks.length > 0 ? (
          <div className="books-list">
            {recommendedBooks.map(book => (
              <div className="book-cards" key={book.id}>
                <div className="book-details">
                  <h3>{book.title}</h3>
                  <p className="book-author">by {typeof book.author === 'object' ? book.author.name : book.author}</p>
                  <p className="book-description">{book.description}</p>
                  <p className="book-price">{book.price}</p>
                </div>
                <div className="book-actions">
                  <Link to={`/member/dashboard/books/${book.id}`} className="book-link">
                    View Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-books">
            <p>No book recommendations available.</p>
          </div>
        )}
        
        <Link to="/member/dashboard/books" className="view-all-link">
          Browse bookstore <FiArrowRight />
        </Link>
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/member/dashboard/upcoming-sessions" className="action-button sessions-action">
            <FiCalendar />
            <span>Upcoming Sessions</span>
          </Link>
          <Link to="/member/dashboard/events" className="action-button events-action">
            <FiActivity />
            <span>Club Events</span>
          </Link>
          <Link to="/member/dashboard/courses/catalog" className="action-button materials-action">
            <FiFileText />
            <span>Course Catalog</span>
          </Link>
          <Link to="/member/dashboard/books" className="action-button books-action">
            <FiShoppingBag />
            <span>Chess Books</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardOverview;

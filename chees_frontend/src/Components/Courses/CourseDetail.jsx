import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import './CourseDetail.css';
import { FiHeart, FiCalendar, FiClock, FiUsers, FiDownload, FiCheck, FiLock, FiX, FiCreditCard } from 'react-icons/fi';
import PaymentProcessor from '../Payment/PaymentProcessor';
import PageLoading from '../PageLoading/PageLoading';
import { toast } from 'react-hot-toast';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);



  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/courses/${courseId}`);


      if (response.data.success) {
        setCourse(response.data.data);
        // Check if user is authenticated
        checkPurchaseStatus();
        // Fetch materials and sessions
        fetchMaterials();
        fetchSessions();
      } else {
        setError('Failed to fetch course details');
      }
    } catch (err) {
      setError('Error fetching course details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/courses/${courseId}/materials`);
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get(`/api/courses/${courseId}/sessions`);


      if (response.data.success) {
        // Parse dates properly before setting state
        const processedSessions = response.data.data.map(session => ({
          ...session,
          // Force date string formatting if needed
          start_time: session.start_time ? new Date(session.start_time).toISOString() : null,
          end_time: session.end_time ? new Date(session.end_time).toISOString() : null
        }));

        setSessions(processedSessions || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const userId = user?.id;

      if (!userId || !token) {
        console.error('User authentication information not found');
        return;
      }

      // Check if user has purchased this course
      try {
        const response = await axiosInstance.get(`/api/courses/check-purchase/${courseId}`);
        if (response.data.success && response.data.data.purchased) {
          setIsPurchased(true);
        }
      } catch (purchaseErr) {
        // If the endpoint doesn't exist, we'll assume the user has not purchased
        // Could not check purchase status, assuming not purchased
        setIsPurchased(false);
      }
    } catch (err) {
      console.error('Error checking purchase status:', err);
    }
  };

  const toggleWishlist = async () => {
    try {
      // Check authentication status before proceeding
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError('Please log in to add items to your wishlist');
        return;
      }
      
      // Optimistic update - update UI immediately before API call completes
      setIsWishlisted(!isWishlisted);

      // Send the required parameters expected by the backend API
      const response = await axiosInstance.post(`/api/wishlists/toggle/${courseId}`, {
        item_type: 'course',
        item_id: parseInt(courseId)
      });

      if (!response.data.success) {
        // If server reports failure, revert the optimistic update
        setIsWishlisted(!isWishlisted);
        setError(response.data.message || 'Failed to update wishlist');
      }
    } catch (err) {
      // On error, revert the optimistic update
      setIsWishlisted(!isWishlisted);
      
      // Check for authentication error
      if (err.response && err.response.status === 401) {
        setError('Please log in to add items to your wishlist');
      } else {
        console.error('Error toggling wishlist:', err);
        setError('Failed to update wishlist: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      }
    }
  };

  const handlePurchase = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentResult) => {
    // Payment completed
    setIsPurchased(true); // Update purchase status
    setShowPaymentModal(false);
    toast.success('Course purchased successfully!');
    navigate('/member/dashboard/courses/purchased'); // Redirect to purchased courses
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const downloadMaterial = async (materialId) => {
    try {
      // Get the base URL from your axios instance
      const baseURL = axiosInstance.defaults.baseURL || '';
      window.open(`${baseURL}/api/course-materials/${materialId}/download`, '_blank');
    } catch (err) {
      setError('Failed to download material');
    }
  };

  const updateProgress = async (newProgress) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const userId = user?.id;

      if (!userId || !token) {
        setError('User authentication information not found');
        return;
      }

      await axiosInstance.put(`/api/course-progress/${userId}/${courseId}`, {
        progress: newProgress
      });
    } catch (err) {
      setError('Failed to update progress');
    }
  };

  if (loading) {
    return <PageLoading text="Loading course details..." />;
  }

  if (error) {
    return <div className="cd-error">{error}</div>;
  }

  if (!course) {
    return <div className="cd-error">Course not found</div>;
  }

  return (
    <div className="cd-container">
      {showPaymentModal && (
        <PaymentProcessor
          amount={course.price}
          courseId={course.id}
          courseTitle={course.title}
          onPaymentComplete={handlePaymentComplete}
          onClose={handleClosePaymentModal}
        />
      )}

      <div className="cd-header">
        <div className="cd-header-content">
          <h1>{course.title}</h1>
          <p className="cd-description">{course.description}</p>

          <div className="cd-meta">
            <div className="cd-meta-item">
              <FiClock />
              <span>{course.duration} hours</span>
            </div>
            <div className="cd-meta-item">
              <FiUsers />
              <span>{course.max_students ? `Max ${course.max_students}` : 'Unlimited'}</span>
            </div>
            <div className="cd-meta-item">
              <FiCalendar />
              <span>{course.created_at ? new Date(course.created_at).toLocaleDateString() : ''}</span>
            </div>
          </div>
        </div>

        <div className="cd-header-image">
          <img src={course.thumbnail_url || '/course-placeholder.jpg'} alt={course.title} />
        </div>
      </div>

      <div className="cd-actions">
        {isPurchased ? (
          <div className="cd-purchase-status">
            <div className="cd-purchase-message">You have purchased this course</div>
            <button
              className="cd-continue-button"
              onClick={() => navigate(`/member/dashboard/courses/purchased`)}
            >
              Go to My Courses
            </button>
          </div>
        ) : (
          <div className="cd-purchase-actions">
            <div className="cd-price">{course.price.toFixed(2)} MAD</div>
            <button
              onClick={handlePurchase}
              className="cd-purchase-button"
            >
              <FiCreditCard /> Purchase Now
            </button>
            {/* <button
              className={`cd-wishlist-button ${isWishlisted ? 'active' : ''}`}
              onClick={toggleWishlist}
            >
              <FiHeart /> {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button> */}
          </div>
        )}
      </div>

      <div className="cd-tabs">
        <div className="cd-tabs-container">
          <div className="cd-tab active">Overview</div>

        </div>

        <div className="cd-tab-content">
          <h3>Course Overview</h3>
          <div className="cd-overview">
            <p>{course.description}</p>
            <div className="cd-level">
              <h4>Course Level</h4>
              <p>{course.level?.name || 'All Levels'}</p>
            </div>
          </div>
        </div>

        <div className="cd-materials">
          <h3>Course Materials</h3>
          {materials.length === 0 ? (
            <p>No materials available for this course yet.</p>
          ) : (
            <div className="cd-materials-list">
              {materials.map(material => (
                <div key={material.id} className={`cd-material-item ${!isPurchased ? 'locked' : ''}`}>
                  <div className="cd-material-info">
                    <h4>{material.title} {!isPurchased && <span className="cd-material-locked"><FiLock /> Locked</span>}</h4>
                    {isPurchased ? (
                      <p>{material.description}</p>
                    ) : (
                      <p>
                        {material.description?.includes('http') 
                          ? 'Content will be available after purchase.' 
                          : material.description}
                      </p>
                    )}
                  </div>
                  {isPurchased ? (
                    ''
                  ) : (
                    <button 
                      className="cd-locked-button"
                      onClick={handlePurchase}
                    >
                      <FiLock /> Purchase to Access
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {isPurchased && sessions.length > 0 && (
          <div className="cd-sessions">
            <h3>Upcoming Sessions</h3>
            <div className="cd-sessions-list">
              {sessions.map(session => (
                <div key={session.id} className="cd-session-item">
                  <div className="cd-session-date">
                    <FiCalendar />
                    <span>
                      {session.start_datetime ? 
                        new Date(session.start_datetime).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })
                        : 'Date TBA'}
                    </span>
                  </div>
                  <div className="cd-session-time">
                    {session.start_datetime ? 
                      new Date(session.start_datetime).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })
                      : ''} 
                    {session.start_datetime && session.end_datetime ? ' - ' : ''}
                    {session.end_datetime ? 
                      new Date(session.end_datetime).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })
                      : ''}
                  </div>
                  <div className="cd-session-location">
                    {session.location || (course.is_online ? 'Online' : 'In-person')}
                  </div>
                  {session.is_completed && (
                    <div className="cd-session-completed">
                      <FiCheck /> Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;

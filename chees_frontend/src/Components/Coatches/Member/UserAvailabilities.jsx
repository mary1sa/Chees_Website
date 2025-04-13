import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import {
  FiChevronLeft, FiChevronRight, FiClock, FiMapPin, FiUser, FiBookOpen, FiEye
} from 'react-icons/fi';
import PageLoading from '../../PageLoading/PageLoading';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';
import "./useravailabilities.css";

const UserAvailabilities = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [filteredAvailabilities, setFilteredAvailabilities] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  useEffect(() => {
    filterAvailabilities();
  }, [availabilities, dateFilter, typeFilter, locationFilter]);

  const fetchAvailabilities = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/available-slots');
      setAvailabilities(response.data);
      const types = [...new Set(response.data
        .map(avail => avail.availability_type)
        .filter(Boolean)
        .sort())];
      setUniqueTypes(types);
    } catch (error) {
      setErrorMessage('Failed to fetch availabilities');
    } finally {
      setLoading(false);
    }
  };

  const isPastSession = (availability) => {
    try {
      const dateObj = new Date(availability.date);
      const [endHour, endMinute] = availability.end_time.split(':').map(Number);
  
      const sessionDate = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        endHour,
        endMinute
      );
  
      console.log('Final session date:', sessionDate.toString());
  
      return sessionDate < new Date();
    } catch (err) {
      console.error("Failed to parse session date:", err);
      return false;
    }
  };
  

  const filterAvailabilities = () => {
    let filtered = [...availabilities];

    if (dateFilter) {
      filtered = filtered.filter(avail => avail.date.includes(dateFilter));
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(avail => avail.availability_type === typeFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(avail =>
        avail.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredAvailabilities(filtered);
    setCurrentPage(1);
  };

  const handleBooking = async (availabilityId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));

      const userBookings = user.bookings || [];
      if (userBookings.includes(availabilityId)) {
        setErrorMessage('You have already booked this session.');
        return;
      }

      await axiosInstance.post('/book-slot', {
        availability_id: availabilityId,
        user_id: user.id
      });

      user.bookings = [...userBookings, availabilityId];
      localStorage.setItem('user', JSON.stringify(user));

      setSuccessMessage('Booking successful!');
      fetchAvailabilities();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Booking failed');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAvailabilities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAvailabilities.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-nav"
        >
          <FiChevronLeft /> Previous
        </button>

        <div className="page-numbers">{pages}</div>

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-nav"
        >
          Next <FiChevronRight />
        </button>
      </div>
    );
  };

  const ViewAvailabilityModal = ({ isOpen, onClose, availability }) => {
    if (!isOpen || !availability) return null;

    return (
      <div className="modaloverlay" onClick={onClose}>
        <div className="modalcontent" onClick={(e) => e.stopPropagation()}>
          <div className="modalheader">
            <h3>Availability Details</h3>
            <button className="modalclose" onClick={onClose}>
              &times;
            </button>
          </div>

          <div className="modalbody">
            <div className="detailitem">
              <label>Coach:</label>
              <span>{availability.coach.user.first_name} {availability.coach.user.last_name}
              </span>
            </div>

            <div className="detailitem">
              <label>Date:</label>
              <span>{new Date(availability.date).toLocaleDateString('en-MA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            <div className="detailitem">
              <label>Time:</label>
              <span>{availability.start_time} - {availability.end_time}</span>
            </div>

            <div className="detailitem">
              <label>Type:</label>
              <span className={`type-tag ${availability.availability_type.toLowerCase()}`}>
                {availability.availability_type}
              </span>
            </div>

            <div className="detailitem">
              <label>Location:</label>
              <span>{availability.location || 'Online'}</span>
            </div>

            <div className="detailitem">
              <label>Max Students:</label>
              <span>{availability.max_students}</span>
            </div>

            <div className="detailitem">
              <label>Available Spots:</label>
              <span>{availability.max_students - availability.current_bookings}</span>
            </div>

            <div className="detailitem">
              <label>Booking Note:</label>
              <span>{availability.booking_notes}</span>
            </div>

            {isPastSession(availability) && (
              <div className="detailitem expired-message">
                <label>Note:</label>
                <span>This session has already ended and is no longer available for booking.</span>
              </div>
            )}
          </div>

          <div className="modalfooter">
            <button className="btnsecondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AvailabilityCard = ({ availability }) => (
    <div className={`availability-card ${isPastSession(availability) ? 'expired' : ''}`}>
      <div className="card-header">
        <FiUser className="card-icon" />
        <span>{availability.coach.user.first_name} {availability.coach.user.last_name}</span>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <div className="meta-item">
            <FiClock className="meta-icon" />
            <span>{new Date(availability.date).toLocaleDateString('en-MA', {
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
          <div className="meta-item">
            <FiMapPin className="meta-icon" />
            <span>{availability.location || 'Online'}</span>
          </div>
        </div>

        <div className="time-slot">
          {availability.start_time} - {availability.end_time}
        </div>

        <div className="availability-info">
          <div className="info-item">
            <span className="info-label">Type:</span>
            <span className={`type-tag ${availability.availability_type.toLowerCase()}`}>
              {availability.availability_type}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Spots Left:</span>
            <span className="spots-left">
              {availability.max_students - availability.current_bookings}
            </span>
          </div>
          {isPastSession(availability) && (
            <div className="expired-note">Session Expired</div>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button
          className="view-details-btn"
          onClick={() => {
            setSelectedAvailability(availability);
            setShowViewModal(true);
          }}
        >
          <FiEye /> Details
        </button>
        <button
          className="book-now-btn"
          onClick={() => handleBooking(availability.id)}
          disabled={
            availability.current_bookings >= availability.max_students ||
            isPastSession(availability)
          }
        >
          <FiBookOpen /> Book Now
        </button>
      </div>
    </div>
  );

  if (loading) return <PageLoading />;

  return (
    <div className="availability-container">
      <div className="filters-section">
        <h1>Available Coaching Sessions</h1>

        <div className="filter-controls">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Session Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Search location..."
            className="filter-input"
          />
        </div>
      </div>

      <div className="availability-grid">
        {currentItems.length > 0 ? (
          currentItems.map(avail => (
            <AvailabilityCard key={avail.id} availability={avail} />
          ))
        ) : (
          <div className="no-results">
            No available sessions found matching your criteria
          </div>
        )}
      </div>

      {totalPages > 1 && renderPagination()}

      <ViewAvailabilityModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAvailability(null);
        }}
        availability={selectedAvailability}
      />

      {successMessage && <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />}
      {errorMessage && <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />}
    </div>
  );
};

export default UserAvailabilities;

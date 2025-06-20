import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import PageLoading from '../../PageLoading/PageLoading';
import ConfirmDelete from '../../Confirm/ConfirmDelete';
import SuccessAlert from '../../Alerts/SuccessAlert';
import ErrorAlert from '../../Alerts/ErrorAlert';
import { Link, useNavigate } from 'react-router-dom';

const AdminCoachAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [filteredAvailabilities, setFilteredAvailabilities] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [availabilityToDelete, setAvailabilityToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const itemsPerPage = 5;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
const navigate=useNavigate()
  useEffect(() => {
    fetchAllAvailabilities();
  }, []);

  useEffect(() => {
    filterAvailabilities();
  }, [availabilities, dateFilter, typeFilter, locationFilter]);

  const fetchAllAvailabilities = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/coach_availability'); 
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
  const handleClick = () => {
    navigate('/admin/dashboard/creatavailability');
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
      filtered = filtered.filter(avail => avail.location?.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    setFilteredAvailabilities(filtered);
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    if (!availabilityToDelete) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/coach_availability/${availabilityToDelete.id}`);
      setSuccessMessage('Availability deleted successfully!');
      await fetchAllAvailabilities();
    } catch (error) {
      setErrorMessage('Failed to delete availability');
    } finally {
      setShowDeleteModal(false);
      setLoading(false);
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
            <div className="detail-item">
              <label>Date:</label>
              <span>{new Date(availability.date).toLocaleDateString()}</span>
            </div>
<div className="detailitem">
              <label>Name</label>
              <span>{availability.coach?.user?.first_name} {availability.coach?.user?.last_name}</span>
            </div>
            <div className="detailitem">
              <label>Start Time:</label>
              <span>{availability.start_time}</span>
            </div>

            <div className="detailitem">
              <label>End Time:</label>
              <span>{availability.end_time}</span>
            </div>

            <div className="detailitem">
              <label>Type:</label>
              <span>{availability.availability_type}</span>
            </div>

            <div className="detailitem">
              <label>Location:</label>
              <span>{availability.location || 'Not specified'}</span>
            </div>

            <div className="detailitem">
              <label>Capacity:</label>
              <span>{availability.max_students || 'Unlimited'}</span>
            </div>
            <div className="detailitem">
              <label>Available Spots:</label>
              <span>{availability.max_students - availability.current_bookings}</span>
            </div>
            {availability.notes && (
              <div className="detailitem">
                <label>Additional Notes:</label>
                <p className="notestext">{availability.notes}</p>
              </div>
            )}
          </div>

          <div className="modalfooter">
            <button className="btnsecondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <PageLoading />;

  return (
    <div className="table-container">
      <ConfirmDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={`availability on ${availabilityToDelete?.date}`}
      />
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

      <h1 className="table-title">Manage Coach Availabilities</h1>

      <div className="filter-controls">
        <div className="filter-group">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Search location..."
            className="filter-input"
          />
        </div>

        <button onClick={handleClick} className="add-new-btn">
      <FiPlus className="icon" />
      Add New
    </button>
      </div>

      <div className="data-table">
        <div className="table-header">
          <div>Name</div>
          <div>Date</div>
          <div>Time</div>
          <div>Type</div>
          <div>Capacity</div>
          <div>Actions</div>
        </div>

        {currentItems.length > 0 ? (
          currentItems.map(avail => (
            <div key={avail.id} className="table-row">
               <div className="table-cell">
      {avail.coach?.user?.first_name}-{avail.coach?.user?.last_name}
    </div>
              <div className="table-cell">{new Date(avail.date).toLocaleDateString()}</div>
              <div className="table-cell">
                {avail.start_time} - {avail.end_time}
              </div>

              <div className="table-cell">{avail.availability_type}</div>
              <div className="table-cell">{avail.max_students || 'Unlimited'}</div>
              <div className="table-cell actions">
                <Link to={`/admin/dashboard/updateavailability/${avail.id}`} className="action-btn update-btn" title="Update">
                  <FiEdit className="icon" />
                </Link>
                <button
                  onClick={() => {
                    setAvailabilityToDelete(avail);
                    setShowDeleteModal(true);
                  }}
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  <FiTrash2 className="icon" />
                </button>
                <button
                  onClick={() => {
                    setSelectedAvailability(avail);
                    setShowViewModal(true);
                  }}
                  className="action-btn view-btn"
                  title="View"
                >
                  <FiEye className="icon" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div>No availabilities found.</div>
        )}
      </div>

      {renderPagination()}
    </div>
  );
};

export default AdminCoachAvailability;

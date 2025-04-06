import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import GetRegistrations from './GetRegistrations';

const AdminEventRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [editModal, setEditModal] = useState({
    show: false,
    registration: null,
    formData: {
      status: '',
      payment_status: '',
      notes: ''
    }
  });
  const [detailView, setDetailView] = useState(null);
  const navigate = useNavigate();

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      const response = await axiosInstance.get('/registrations');
      
      if (response.data && response.data.data) {
        setRegistrations(response.data.data.data || []);
        setPagination({
          current_page: response.data.data.current_page,
          total: response.data.data.total,
          per_page: response.data.data.per_page
        });
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle API errors
  const handleApiError = (err) => {
    console.error('API Error:', err);
    if (err.response?.status === 401) {
      navigate('/login');
    } else {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  // Confirm payment
  const handleConfirmPayment = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/registrations/${id}/confirm-payment`);
      await fetchRegistrations();
    } catch (err) {
      handleApiError(err);
    }
  };

  // Delete registration
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/registrations/${id}`);
        await fetchRegistrations();
      } catch (err) {
        handleApiError(err);
      }
    }
  };

  // Show registration details
  const showDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/registrations/${id}`);
      setDetailView(response.data.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (registration) => {
    setEditModal({
      show: true,
      registration,
      formData: {
        status: registration.status,
        payment_status: registration.payment_status,
        notes: registration.notes || ''
      }
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      }
    }));
  };

  // Submit updated registration
  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(
        `/registrations/${editModal.registration.id}`,
        editModal.formData
      );
      setEditModal({ show: false, registration: null, formData: {} });
      await fetchRegistrations();
    } catch (err) {
      handleApiError(err);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  if (loading) return <div>Loading registrations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Admin Registration Management</h1>
      <h2>All Registrations ({pagination.total || registrations.length})</h2>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Event</th>
            <th>User</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map(reg => (
            <tr key={reg.id}>
              <td>{reg.id}</td>
              <td>{reg.event?.title}</td>
              <td>{reg.user?.first_name} {reg.user?.last_name}</td>
              <td>{reg.status}</td>
              <td>{reg.payment_status}</td>
              <td>
                <button onClick={() => showDetails(reg.id)}>Details</button>
                <button onClick={() => openEditModal(reg)}>Edit</button>
                <button onClick={() => handleDelete(reg.id)}>Delete</button>
                {reg.payment_status === 'pending' && (
                  <button onClick={() => handleConfirmPayment(reg.id)}>
                    Confirm Payment
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail View Modal */}
      {detailView && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            maxWidth: '600px',
            width: '90%'
          }}>
            <h2>Registration Details #{detailView.id}</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <h3>Event Information</h3>
              <p><strong>Title:</strong> {detailView.event?.title}</p>
              <p><strong>Date:</strong> {new Date(detailView.event?.start_date).toLocaleDateString()}</p>
              <p><strong>Venue:</strong> {detailView.event?.venue}</p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3>User Information</h3>
              <p><strong>Name:</strong> {detailView.user?.first_name} {detailView.user?.last_name}</p>
              <p><strong>Email:</strong> {detailView.user?.email}</p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3>Registration Details</h3>
              <p><strong>Status:</strong> {detailView.status}</p>
              <p><strong>Payment Status:</strong> {detailView.payment_status}</p>
              <p><strong>Registration Number:</strong> {detailView.registration_number}</p>
              <p><strong>Registration Date:</strong> {new Date(detailView.registration_date).toLocaleString()}</p>
              {detailView.notes && <p><strong>Notes:</strong> {detailView.notes}</p>}
            </div>
            
            <button onClick={() => setDetailView(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px'
          }}>
            <h3>Edit Registration #{editModal.registration.id}</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Status:</label>
              <select
                name="status"
                value={editModal.formData.status}
                onChange={handleInputChange}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="attended">Attended</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Payment Status:</label>
              <select
                name="payment_status"
                value={editModal.formData.payment_status}
                onChange={handleInputChange}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Notes:</label>
              <textarea
                name="notes"
                value={editModal.formData.notes}
                onChange={handleInputChange}
                rows="3"
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditModal({ show: false, registration: null, formData: {} })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <GetRegistrations></GetRegistrations>

    </div>
  );
};

export default AdminEventRegistrations;
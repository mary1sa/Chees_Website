import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';

const EventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const response = await axiosInstance.get('/event-types');
      setEventTypes(response.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/event-types', formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      fetchEventTypes();
    } catch (error) {
      console.error('Error creating event type:', error);
    }
  };

  const handleView = (eventType) => {
    setSelectedEventType(eventType);
    setShowViewModal(true);
  };

  const handleEditClick = (eventType) => {
    setSelectedEventType(eventType);
    setFormData({
      name: eventType.name,
      description: eventType.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/event-types/${selectedEventType.id}`, formData);
      setShowEditModal(false);
      fetchEventTypes();
    } catch (error) {
      console.error('Error updating event type:', error);
    }
  };

  const handleDelete = async (eventType) => {
    try {
      await axiosInstance.delete(`/event-types/${eventType.id}`);
      fetchEventTypes();
    } catch (error) {
      console.error('Error deleting event type:', error);
    }
  };

  return (
    <div>
      <div>
        <h2>Event Types Management</h2>
        <button onClick={() => setShowCreateModal(true)}>
          Add New Type
        </button>
      </div>

      <div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventTypes.map(type => (
              <tr key={type.id}>
                <td>{type.id}</td>
                <td>{type.name}</td>
                <td>{type.description || 'N/A'}</td>
                <td>
                  <button onClick={() => handleView(type)}>
                    View
                  </button>
                  <button onClick={() => handleEditClick(type)}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(type)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div>
          <div>
            <h3>Create New Event Type</h3>
            <button onClick={() => setShowCreateModal(false)}>Close</button>
          </div>
          <form onSubmit={handleCreate}>
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength="100"
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>
            <div>
              <button type="button" onClick={() => setShowCreateModal(false)}>
                Close
              </button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div>
          <div>
            <h3>Event Type Details</h3>
            <button onClick={() => setShowViewModal(false)}>Close</button>
          </div>
          <div>
            <div>
              <label>ID</label>
              <p>{selectedEventType?.id}</p>
            </div>
            <div>
              <label>Name</label>
              <p>{selectedEventType?.name}</p>
            </div>
            <div>
              <label>Description</label>
              <p>{selectedEventType?.description || 'N/A'}</p>
            </div>
          </div>
          <div>
            <button onClick={() => setShowViewModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div>
          <div>
            <h3>Edit Event Type</h3>
            <button onClick={() => setShowEditModal(false)}>Close</button>
          </div>
          <form onSubmit={handleUpdate}>
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength="100"
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>
            <div>
              <button type="button" onClick={() => setShowEditModal(false)}>
                Close
              </button>
              <button type="submit">Update</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventTypes;
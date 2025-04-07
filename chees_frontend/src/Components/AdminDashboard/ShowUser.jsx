import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance'; 

const ShowUser = () => {
  const { id } = useParams(); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        setUser(response.data); 
        console.log(user)
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Details</h1>
      <table border="1">
        <tbody>
          <tr>
            <td>Profile Picture:</td>
            <td>
              <img
                src={user.profile_picture ? `/storage/${user.profile_picture}` : 'default-avatar.png'}
                alt={user.username}
                width={100}
                height={100}
              />
            </td>
          </tr>
          <tr>
            <td>Username:</td>
            <td>{user.username}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>{user.email}</td>
          </tr>
          <tr>
            <td>Role:</td>
            <td>{user.role.name}</td>
          </tr>
          <tr>
            <td>First Name:</td>
            <td>{user.first_name}</td>
          </tr>
          <tr>
            <td>Last Name:</td>
            <td>{user.last_name}</td>
          </tr>
          <tr>
            <td>Chess Rating:</td>
            <td>{user.chess_rating}</td>
          </tr>
          <tr>
            <td>Bio:</td>
            <td>{user.bio}</td>
          </tr>
          <tr>
            <td>Phone:</td>
            <td>{user.phone}</td>
          </tr>
          <tr>
            <td>Date of Birth:</td>
            <td>{user.date_of_birth}</td>
          </tr>
          <tr>
            <td>Address:</td>
            <td>{user.address}</td>
          </tr>
          <tr>
            <td>City:</td>
            <td>{user.city}</td>
          </tr>
          <tr>
            <td>Status:</td>
            <td>{user.is_active ? 'Active' : 'Inactive'}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={() => window.history.back()}>Back</button>
    </div>
  );
};

export default ShowUser;

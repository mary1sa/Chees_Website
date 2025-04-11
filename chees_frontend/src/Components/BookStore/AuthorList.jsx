import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get('/api/authors');
        setAuthors(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching authors:', error);
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await axios.delete(`/api/authors/${id}`);
        setAuthors(authors.filter(author => author.id !== id));
      } catch (error) {
        console.error('Error deleting author:', error);
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Author Management</h2>
        <Link to="create" className="btn-primary">
          <FiPlus /> Add Author
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading authors...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Books</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map(author => (
                <tr key={author.id}>
                  <td>
                    {author.photo && (
                      <img 
                        src={`http://localhost:8000/storage/${author.photo}`} 
                        alt={author.name} 
                        className="author-photo"
                      />
                    )}
                  </td>
                  <td>{author.name}</td>
                  <td>{author.books_count || 0}</td>
                  <td className="actions">
                    <Link to={`edit/${author.id}`} className="btn-edit">
                      <FiEdit />
                    </Link>
                    <button 
                      onClick={() => handleDelete(author.id)} 
                      className="btn-danger"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuthorList;
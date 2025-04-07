import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';

const CreateUser = () => {
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
    first_name: '',
    last_name: '',
    profile_picture: null,
    chess_rating: '',
    bio: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    is_active: true,
  });

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des rôles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUserForm({ ...userForm, profile_picture: file });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!userForm.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
      isValid = false;
    }

    if (!userForm.email.trim()) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
      isValid = false;
    }

    if (!userForm.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (userForm.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }

    if (!userForm.role_id) {
      newErrors.role_id = 'Le rôle est requis';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(userForm).forEach((key) => {
        if (userForm[key] !== null) {
          formData.append(key, userForm[key]);
        }
      });

      await axiosInstance.post('/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Utilisateur créé avec succès !');
      setErrors({});
      
      setUserForm({
        username: '',
        email: '',
        password: '',
        role_id: '',
        first_name: '',
        last_name: '',
        profile_picture: null,
        chess_rating: '',
        bio: '',
        phone: '',
        date_of_birth: '',
        address: '',
        city: '',
      });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          const serverErrors = {};
          Object.keys(error.response.data.errors).forEach(key => {
            serverErrors[key] = error.response.data.errors[key][0];
          });
          setErrors(serverErrors);
        } else if (error.response.status === 409) {
          if (error.response.data.message.includes('email')) {
            setErrors({ ...errors, email: 'Cet email est déjà utilisé' });
          } else if (error.response.data.message.includes('username')) {
            setErrors({ ...errors, username: 'Ce nom d\'utilisateur est déjà pris' });
          }
        } else {
          setErrors({ ...errors, form: 'Une erreur est survenue lors de la création de l\'utilisateur' });
        }
      } else {
        setErrors({ ...errors, form: 'Erreur réseau. Veuillez réessayer.' });
      }
    }
  };

  return (
    <div className="create-user-container">
      <h1 className="create-user-title">Créer un Utilisateur</h1>
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      {errors.form && (
        <div className="alert alert-danger">
          {errors.form}
        </div>
      )}
      <form onSubmit={handleCreateUser} className="create-user-form">
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={userForm.username}
            onChange={handleChange}
            className={`form-input ${errors.username ? 'is-invalid' : ''}`}
          />
          {errors.username && <div className="error-message">{errors.username}</div>}
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={userForm.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={userForm.password}
            onChange={handleChange}
            className={`form-input ${errors.password ? 'is-invalid' : ''}`}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        <div className="form-group">
          <select
            name="role_id"
            value={userForm.role_id}
            onChange={handleChange}
            className={`form-select ${errors.role_id ? 'is-invalid' : ''}`}
          >
            <option value="">Sélectionner un rôle</option>
            {roles
              .filter(role => role.name === 'coach' || role.name === 'member')
              .map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name === 'coach' ? 'Entraîneur' : 'Membre'}
                </option>
              ))}
          </select>
          {errors.role_id && <div className="error-message">{errors.role_id}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="first_name"
            placeholder="Prénom"
            value={userForm.first_name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="last_name"
            placeholder="Nom"
            value={userForm.last_name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <div className="file-input-container">
            <label className="file-input-label">
              Photo de profil
              <input
                type="file"
                name="profile_picture"
                onChange={handleFileChange}
                className="file-input"
              />
              <img src={userForm.profile_picture} alt=""                      style={{ maxWidth: '200px', maxHeight: '200px' }} 
              />
            </label>
          </div>
        </div>

        <div className="form-group">
          <input
            type="number"
            name="chess_rating"
            placeholder="Classement aux échecs"
            value={userForm.chess_rating}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <textarea
            name="bio"
            placeholder="Biographie"
            value={userForm.bio}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="phone"
            placeholder="Téléphone"
            value={userForm.phone}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="date"
            name="date_of_birth"
            placeholder="Date de naissance"
            value={userForm.date_of_birth}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="address"
            placeholder="Adresse"
            value={userForm.address}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="city"
            placeholder="Ville"
            value={userForm.city}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-button">
          Créer l'Utilisateur
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
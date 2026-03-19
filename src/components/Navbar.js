import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <FaStar /> CrowdReview
        </Link>
        <div className="navbar-links">
          <Link to="/businesses">Businesses</Link>
          {user ? (
            <>
              {user.role !== 'admin' && <Link to="/my-reviews">My Reviews</Link>}
              {user.role === 'admin' && <Link to="/admin">Admin</Link>}
              <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Hi, {user.name}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register"><button className="btn btn-primary btn-sm">Sign Up</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

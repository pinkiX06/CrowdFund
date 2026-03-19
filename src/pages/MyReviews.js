import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { StarDisplay } from '../components/Stars';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/my').then((res) => setReviews(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading your reviews...</div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Reviews</h1>
          <p>Track the status of your submitted reviews</p>
        </div>

        {reviews.length === 0 ? (
          <div className="empty">
            <h3>No reviews yet</h3>
            <p>Start reviewing businesses to see them here</p>
            <Link to="/businesses"><button className="btn btn-primary mt-4">Browse Businesses</button></Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {reviews.map((r) => (
              <div className="card" key={r._id}>
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link to={`/businesses/${r.business?._id}`}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: 4 }}>{r.business?.name || 'Unknown Business'}</h3>
                  </Link>
                  <span className="badge badge-category" style={{ marginBottom: 8, display: 'inline-block' }}>
                    {r.business?.category}
                  </span>
                  <h4>{r.title}</h4>
                  <p style={{ color: 'var(--text-light)', marginTop: 4 }}>{r.content.substring(0, 150)}...</p>
                  <div style={{ marginTop: 8 }}>
                    <StarDisplay rating={(r.ratings.quality + r.ratings.service + r.ratings.value) / 3} />
                  </div>
                  {r.adminNote && (
                    <p style={{ marginTop: 8, padding: 8, background: 'var(--bg)', borderRadius: 6, fontSize: '0.85rem' }}>
                      <strong>Admin note:</strong> {r.adminNote}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { StarDisplay, StarInput } from '../components/Stars';

export default function BusinessDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', ratings: { quality: 0, service: 0, value: 0 } });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/businesses/${id}`),
      api.get(`/reviews/business/${id}`),
    ]).then(([bRes, rRes]) => {
      setBusiness(bRes.data);
      setReviews(rRes.data.reviews);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!form.ratings.quality || !form.ratings.service || !form.ratings.value) {
      toast.error('Please rate all criteria');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('business', id);
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('ratings.quality', form.ratings.quality);
      formData.append('ratings.service', form.ratings.service);
      formData.append('ratings.value', form.ratings.value);
      photos.forEach((p) => formData.append('photos', p));

      await api.post('/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Review submitted! It will appear after admin approval.');
      setShowForm(false);
      setForm({ title: '', content: '', ratings: { quality: 0, service: 0, value: 0 } });
      setPhotos([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!business) return <div className="empty"><h3>Business not found</h3></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="business-detail">
          <div>
            {business.image ? (
              <img src={business.image} alt={business.name} style={{ width: '100%', borderRadius: 12, maxHeight: 400, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: 300, background: '#e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📷</div>
            )}
          </div>
          <div className="business-info">
            <span className="badge badge-category">{business.category}</span>
            <h1>{business.name}</h1>
            <div className="business-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-light)', fontSize: '0.9rem' }}>
                <FaMapMarkerAlt /> {business.address?.street}, {business.address?.city}, {business.address?.state} {business.address?.zipCode}
              </span>
            </div>
            {business.phone && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}><FaPhone /> {business.phone}</p>}
            {business.website && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}><FaGlobe /> {business.website}</p>}
            <p style={{ marginTop: 12 }}>{business.description}</p>

            <div className="ratings-summary">
              {['quality', 'service', 'value', 'overall'].map((key) => (
                <div className="rating-item" key={key}>
                  <div className="label">{key}</div>
                  <div className="value">{business.ratings?.[key]?.toFixed(1) || '0.0'}</div>
                  <StarDisplay rating={business.ratings?.[key] || 0} size={14} />
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--text-light)' }}>{business.totalReviews} total reviews</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2>Reviews</h2>
          {user && user.role !== 'admin' && !showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>Write a Review</button>
          )}
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <h3 style={{ marginBottom: 16 }}>Write Your Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label>Title</label>
                  <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Your Review</label>
                  <textarea className="form-control" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                  {['quality', 'service', 'value'].map((key) => (
                    <div key={key}>
                      <label style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>{key}</label>
                      <StarInput value={form.ratings[key]} onChange={(v) => setForm({ ...form, ratings: { ...form.ratings, [key]: v } })} />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label>Photos (optional, up to 5)</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setPhotos(Array.from(e.target.files).slice(0, 5))} />
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          {reviews.length === 0 ? (
            <div className="empty"><h3>No reviews yet</h3><p>Be the first to review this business!</p></div>
          ) : (
            reviews.map((r) => (
              <div className="review-card" key={r._id}>
                <div className="review-header">
                  <div>
                    <span className="review-author">{r.user?.name || 'Anonymous'}</span>
                    <div className="review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <StarDisplay rating={(r.ratings.quality + r.ratings.service + r.ratings.value) / 3} />
                </div>
                <h4 style={{ marginBottom: 4 }}>{r.title}</h4>
                <p style={{ color: 'var(--text-light)' }}>{r.content}</p>
                <div className="review-ratings">
                  <span>Quality: {r.ratings.quality}/5</span>
                  <span>Service: {r.ratings.service}/5</span>
                  <span>Value: {r.ratings.value}/5</span>
                </div>
                {r.photos?.length > 0 && (
                  <div className="review-photos">
                    {r.photos.map((p, i) => <img key={i} src={p} alt={`Review ${i + 1}`} />)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

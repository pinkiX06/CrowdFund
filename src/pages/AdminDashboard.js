import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import api from '../utils/api';
import { StarDisplay } from '../components/Stars';

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data));
  }, []);

  useEffect(() => {
    if (tab === 'reviews' || tab === 'dashboard') {
      setLoading(true);
      api.get(`/admin/reviews?status=${statusFilter}`)
        .then((res) => setReviews(res.data.reviews))
        .finally(() => setLoading(false));
    }
  }, [tab, statusFilter]);

  const handleAction = async (id, action) => {
    const note = action === 'reject' ? window.prompt('Rejection reason (optional):') : '';
    try {
      await api.put(`/admin/reviews/${id}/${action}`, { adminNote: note || '' });
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success(`Review ${action}d successfully`);
      api.get('/admin/stats').then((res) => setStats(res.data));
    } catch {
      toast.error(`Failed to ${action} review`);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="admin-layout">
          <div className="admin-sidebar">
            <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Admin Panel</h3>
            <a className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')} href="#!">
              Dashboard
            </a>
            <a className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')} href="#!">
              Manage Reviews
            </a>
          </div>

          <div className="admin-content">
            {tab === 'dashboard' && (
              <>
                <h2 style={{ marginBottom: 20 }}>Dashboard</h2>
                <div className="stat-cards">
                  <div className="stat-card">
                    <div className="number">{stats.totalBusinesses || 0}</div>
                    <div className="label">Businesses</div>
                  </div>
                  <div className="stat-card">
                    <div className="number">{stats.totalUsers || 0}</div>
                    <div className="label">Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="number">{stats.totalReviews || 0}</div>
                    <div className="label">Total Reviews</div>
                  </div>
                  <div className="stat-card">
                    <div className="number" style={{ color: 'var(--secondary)' }}>{stats.pendingReviews || 0}</div>
                    <div className="label">Pending Reviews</div>
                  </div>
                </div>

                <h3 style={{ marginBottom: 12 }}>Recent Pending Reviews</h3>
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : reviews.length === 0 ? (
                  <div className="empty"><p>No pending reviews</p></div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Business</th>
                          <th>User</th>
                          <th>Title</th>
                          <th>Rating</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.slice(0, 5).map((r) => (
                          <tr key={r._id}>
                            <td>{r.business?.name}</td>
                            <td>{r.user?.name}</td>
                            <td>{r.title}</td>
                            <td><StarDisplay rating={(r.ratings.quality + r.ratings.service + r.ratings.value) / 3} size={12} /></td>
                            <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="flex gap-2">
                                <button className="btn btn-success btn-sm" onClick={() => handleAction(r._id, 'approve')}>
                                  <FaCheck />
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleAction(r._id, 'reject')}>
                                  <FaTimes />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {tab === 'reviews' && (
              <>
                <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
                  <h2>Manage Reviews</h2>
                  <div className="flex gap-2">
                    {['pending', 'approved', 'rejected', 'all'].map((s) => (
                      <button
                        key={s}
                        className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setStatusFilter(s)}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="loading">Loading...</div>
                ) : reviews.length === 0 ? (
                  <div className="empty"><p>No {statusFilter} reviews found</p></div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Business</th>
                          <th>User</th>
                          <th>Title</th>
                          <th>Content</th>
                          <th>Rating</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((r) => (
                          <tr key={r._id}>
                            <td>{r.business?.name}</td>
                            <td>{r.user?.name}<br /><small style={{ color: 'var(--text-light)' }}>{r.user?.email}</small></td>
                            <td>{r.title}</td>
                            <td style={{ maxWidth: 200 }}>{r.content?.substring(0, 80)}...</td>
                            <td><StarDisplay rating={(r.ratings.quality + r.ratings.service + r.ratings.value) / 3} size={12} /></td>
                            <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                            <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td>
                              {r.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button className="btn btn-success btn-sm" onClick={() => handleAction(r._id, 'approve')}>
                                    <FaCheck /> Approve
                                  </button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleAction(r._id, 'reject')}>
                                    <FaTimes /> Reject
                                  </button>
                                </div>
                              )}
                              {r.status !== 'pending' && <span style={{ color: 'var(--text-light)' }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

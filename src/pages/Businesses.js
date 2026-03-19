import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api';
import { StarDisplay } from '../components/Stars';

const CATEGORIES = ['restaurant', 'shop', 'service', 'hotel', 'entertainment', 'health', 'education', 'other'];

export default function Businesses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    params.set('page', page);

    api.get(`/businesses?${params.toString()}`)
      .then((res) => {
        setBusinesses(res.data.businesses);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [category, search, city, page]);

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  if (loading) return <div className="loading">Loading businesses...</div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Browse Businesses</h1>
          <p>{businesses.length > 0 ? `Showing ${businesses.length} businesses` : 'No businesses found'}</p>
        </div>

        <div className="filter-bar">
          <input
            className="form-control"
            style={{ maxWidth: 250 }}
            placeholder="Search by city..."
            value={city}
            onChange={(e) => setFilter('city', e.target.value)}
          />
          <span
            className={`filter-chip ${!category ? 'active' : ''}`}
            onClick={() => setFilter('category', '')}
          >
            All
          </span>
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className={`filter-chip ${category === c ? 'active' : ''}`}
              onClick={() => setFilter('category', c)}
            >
              {c}
            </span>
          ))}
        </div>

        <div className="grid grid-3">
          {businesses.map((b) => (
            <Link to={`/businesses/${b._id}`} key={b._id}>
              <div className="card">
                {b.image ? (
                  <img src={b.image} alt={b.name} className="card-img" />
                ) : (
                  <div className="card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-light)' }}>
                    📷
                  </div>
                )}
                <div className="card-body">
                  <span className="badge badge-category">{b.category}</span>
                  <h3 style={{ margin: '8px 0 4px' }}>{b.name}</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaMapMarkerAlt /> {b.address?.city}, {b.address?.state}
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <StarDisplay rating={b.ratings?.overall || 0} />
                    <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginLeft: 8 }}>
                      ({b.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {businesses.length === 0 && (
          <div className="empty">
            <h3>No businesses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setFilter('page', page - 1)}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={page === i + 1 ? 'active' : ''}
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', i + 1); setSearchParams(p); }}
              >
                {i + 1}
              </button>
            ))}
            <button disabled={page >= totalPages} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', page + 1); setSearchParams(p); }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api';
import { StarDisplay } from '../components/Stars';

const CATEGORIES = ['restaurant', 'shop', 'service', 'hotel', 'entertainment', 'health', 'education', 'other'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/businesses?limit=6&sort=-ratings.overall').then((res) => setFeatured(res.data.businesses));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    navigate(`/businesses?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Discover & Review Local Businesses</h1>
          <p>Find the best restaurants, shops, and services in your area. Share your experiences and help others make informed decisions.</p>
          <form onSubmit={handleSearch}>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <button className="btn btn-primary" type="submit">
                <FaSearch /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="page">
        <div className="container">
          <div className="page-header">
            <h1>Top Rated Businesses</h1>
            <p>Highest rated businesses based on user reviews</p>
          </div>
          <div className="grid grid-3">
            {featured.map((b) => (
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
          {featured.length === 0 && (
            <div className="empty">
              <h3>No businesses yet</h3>
              <p>Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

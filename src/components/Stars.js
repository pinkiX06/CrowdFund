import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

export function StarDisplay({ rating, size = 16 }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0' }}>
          {i <= Math.round(rating) ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
      <span className="rating-value">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
    </span>
  );
}

export function StarInput({ value, onChange, size = 24 }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`star ${i <= value ? 'filled' : ''}`}
          style={{ fontSize: size }}
          onClick={() => onChange(i)}
        >
          {i <= value ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </span>
  );
}

import React, { useState } from 'react';
import { Tag, CheckCircle, X, AlertCircle, Loader } from 'lucide-react';
import axiosInstance from '../../api/axios';

const PromoCodeSection = ({ onApply, appliedPromo, disabled, courseId }) => {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApply = async () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the backend to validate the coupon
      const response = await axiosInstance.post('/api/courses/validate-coupon', {
        code: promoCode.trim(),
        course_id: courseId
      });
      
      if (response.data.success) {
        // Apply the coupon data from the backend
        onApply({
          ...response.data.data,
          code: response.data.data.code.toUpperCase() // Ensure code is uppercase for display
        });
        setPromoCode('');
      } else {
        setError(response.data.message || 'Invalid coupon code');
        onApply(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error validating promo code';
      setError(errorMessage);
      onApply(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePromo = () => {
    onApply(null);
  };

  return (
    <div className="promo-code-container">
      <h3 className="promo-code-title">
        <Tag className="promo-icon" /> Have a Promo Code?
      </h3>
      
      {error && (
        <div className="promo-error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {appliedPromo ? (
        <div className="applied-promo">
          <div className="applied-promo-info">
            <CheckCircle className="promo-success-icon" />
            <div>
              <span className="applied-promo-code">{appliedPromo.code}</span>
              <span className="applied-promo-discount">
                {appliedPromo.type === 'percentage' 
                  ? `${appliedPromo.value}% Off` 
                  : `$${appliedPromo.value} Off`}
              </span>
            </div>
          </div>
          <button 
            onClick={handleRemovePromo} 
            className="remove-promo-button"
            disabled={disabled}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="promo-code-input-group">
          <input
            type="text"
            className="promo-code-input"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            disabled={disabled}
          />
          <button
            onClick={handleApply}
            className="apply-promo-button"
            disabled={loading || disabled || !promoCode.trim()}
          >
            {loading ? (
              <>
                <Loader className="loading-icon" size={16} />
                Applying...
              </>
            ) : (
              'Apply'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PromoCodeSection;

import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, LoaderCircle, X } from 'lucide-react';
import './PaymentProcessor.css';
import PromoCodeSection from './PromoCodeSection';
import axiosInstance from '../../api/axios';

// Error types focused on user experience
const PaymentErrors = {
  INVALID_CARD: 'INVALID_CARD',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  INVALID_PROMO: 'INVALID_PROMO',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

// Clear error messages that guide the user
const errorMessages = {
  [PaymentErrors.INVALID_CARD]: 'Please enter a valid card format',
  [PaymentErrors.NETWORK_ERROR]: 'Network connection error. Please try again.',
  [PaymentErrors.VALIDATION_ERROR]: 'Please check your payment details.',
  [PaymentErrors.PROCESSING_ERROR]: 'Payment processing failed. Please try again.',
  [PaymentErrors.INVALID_PROMO]: 'Invalid promo code or expired.',
  [PaymentErrors.TIMEOUT_ERROR]: 'Request timed out. Please try again.'
};

// Format card number with spaces for readability
const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

// Format expiry date with slash
const formatExpiryDate = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  
  return v;
};

const PaymentMethod = ({ onMethodSelect, selectedMethod }) => {
  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card', icon: <CreditCard className="payment-icon" /> },
    { id: 'paypal', name: 'PayPal', icon: <CreditCard className="payment-icon" /> }
  ];

  return (
    <div className="payment-method-container">
      <h3 className="payment-method-title">Select Payment Method</h3>
      <div className="payment-method-grid">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method.id)}
            className={`payment-method-button ${selectedMethod === method.id ? 'selected' : ''}`}
          >
            {method.icon}
            <span>{method.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const PaymentForm = ({ method, onSubmit, amount, originalAmount, loading, appliedPromo, onPromoApply, courseTitle, courseId }) => {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [promoError, setPromoError] = useState(null);
  const [formTouched, setFormTouched] = useState({
    cardNumber: false,
    expiryDate: false,
    cvv: false,
    name: false
  });

  // Simplified validation - just check format rather than real-world validity
  const validateField = (name, value) => {
    switch (name) {
      case 'cardNumber':
        const cleaned = value.replace(/\s/g, '');
        if (cleaned.length === 0) return 'Card number is required';
        if (cleaned.length !== 16) return 'Card number must be 16 digits';
        if (!/^\d+$/.test(cleaned)) return 'Card number must contain only digits';
        return '';
      case 'expiryDate':
        if (value.length === 0) return 'Expiry date is required';
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) return 'Format must be MM/YY';
        
        // Check if date is in the future
        const [month, year] = value.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
        const today = new Date();
        // Set today to the beginning of the month for comparison
        today.setDate(1);
        today.setHours(0, 0, 0, 0);
        
        if (expiryDate < today) return 'Card has expired';
        return '';
      case 'cvv':
        if (value.length === 0) return 'CVV is required';
        if (!/^[0-9]{3}$/.test(value)) return 'CVV must be 3 digits';
        return '';
      case 'name':
        if (value.length === 0) return 'Cardholder name is required';
        if (value.length < 3) return 'Name is too short';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format inputs for better UX
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/[^\d]/g, '').slice(0, 3);
    }
    
    setPaymentDetails(prev => ({ 
      ...prev, 
      [name]: formattedValue 
    }));
    
    // Mark field as touched
    if (!formTouched[name]) {
      setFormTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validate but only show errors if field has been touched
    const error = validateField(name, formattedValue);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, paymentDetails[name]);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allTouched = Object.keys(paymentDetails).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setFormTouched(allTouched);
    
    // Validate all fields
    const errors = {};
    Object.keys(paymentDetails).forEach(key => {
      const error = validateField(key, paymentDetails[key]);
      if (error) errors[key] = error;
    });

    if (method === 'credit_card' && Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      onSubmit({ error: PaymentErrors.VALIDATION_ERROR });
      return;
    }

    onSubmit({ 
      method, 
      details: paymentDetails,
      status: 'processing',
      appliedPromo
    });
  };

  const handlePromoApply = (promoData) => {
    setPromoError(null);
    
    if (promoData && promoData.error) {
      setPromoError(errorMessages[promoData.error] || promoData.error);
      return;
    }
    
    onPromoApply(promoData);
  };

  if (!method) return null;

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="course-summary">
        <h3>Purchase Summary</h3>
        <p className="course-title">{courseTitle}</p>
        <div className="price-summary">
          <span>Total:</span>
          {originalAmount !== amount && (
            <div className="payment-discount-indicator">
              <span className="original-amount">${originalAmount.toFixed(2)}</span>
              <span className="discount-arrow">→</span>
            </div>
          )}
          <span className="price">${amount.toFixed(2)}</span>
        </div>
      </div>

      {/* <PromoCodeSection 
        onApply={handlePromoApply} 
        appliedPromo={appliedPromo}
        disabled={loading}
        courseId={courseId}
      /> */}

      <div className="payment-details-container">
        {method === 'credit_card' && (
          <>
            <div className="payment-input-group">
              <label className="payment-input-label">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                className={`payment-input ${formTouched.cardNumber && validationErrors.cardNumber ? 'error' : ''}`}
                value={paymentDetails.cardNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={19}
                required
              />
              {formTouched.cardNumber && validationErrors.cardNumber && (
                <span className="payment-error-message">
                  <AlertCircle className="error-icon" />
                  {validationErrors.cardNumber}
                </span>
              )}
            </div>

            <div className="payment-input-grid">
              <div className="payment-input-group">
                <label className="payment-input-label">Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  className={`payment-input ${formTouched.expiryDate && validationErrors.expiryDate ? 'error' : ''}`}
                  value={paymentDetails.expiryDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={5}
                  required
                />
                {formTouched.expiryDate && validationErrors.expiryDate && (
                  <span className="payment-error-message">
                    <AlertCircle className="error-icon" />
                    {validationErrors.expiryDate}
                  </span>
                )}
              </div>
              <div className="payment-input-group">
                <label className="payment-input-label">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  className={`payment-input ${formTouched.cvv && validationErrors.cvv ? 'error' : ''}`}
                  value={paymentDetails.cvv}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={3}
                  required
                />
                {formTouched.cvv && validationErrors.cvv && (
                  <span className="payment-error-message">
                    <AlertCircle className="error-icon" />
                    {validationErrors.cvv}
                  </span>
                )}
              </div>
            </div>

            <div className="payment-input-group">
              <label className="payment-input-label">Cardholder Name</label>
              <input
                type="text"
                name="name"
                placeholder="First and Last Name"
                className={`payment-input ${formTouched.name && validationErrors.name ? 'error' : ''}`}
                value={paymentDetails.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {formTouched.name && validationErrors.name && (
                <span className="payment-error-message">
                  <AlertCircle className="error-icon" />
                  {validationErrors.name}
                </span>
              )}
            </div>
          </>
        )}
        
        {method === 'paypal' && (
          <div className="paypal-info">
            <p>You will be redirected to PayPal to complete payment.</p>
            <p className="demo-note">Note: This is a demo only. No actual PayPal payment will be processed.</p>
          </div>
        )}
        
        <div className="payment-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => onSubmit({ cancelled: true })}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="pay-button"
          >
            {loading ? (
              <>
                <LoaderCircle className="loading-icon" />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

const PaymentProcessor = ({ amount, courseId, courseTitle, onPaymentComplete, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountedAmount, setDiscountedAmount] = useState(amount);
  const [paymentTimeoutId, setPaymentTimeoutId] = useState(null);

  // Calculate discounted amount whenever the promo code changes
  useEffect(() => {
    if (!appliedPromo) {
      setDiscountedAmount(amount);
      return;
    }

    let newAmount = amount;
    if (appliedPromo.type === 'percentage') {
      newAmount = amount * (1 - appliedPromo.value / 100);
    } else if (appliedPromo.type === 'fixed') {
      newAmount = Math.max(amount - appliedPromo.value, 0);
    }
    
    setDiscountedAmount(newAmount);
  }, [appliedPromo, amount]);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (paymentTimeoutId) {
        clearTimeout(paymentTimeoutId);
      }
    };
  }, [paymentTimeoutId]);

  const handlePayment = async (paymentData) => {
    if (paymentData.cancelled) {
      onClose();
      return;
    }

    if (paymentData.error) {
      setError(errorMessages[paymentData.error]);
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('processing');
    
    // Set a timeout to handle stuck requests
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setStatus('error');
      setError(errorMessages[PaymentErrors.TIMEOUT_ERROR]);
    }, 10000); // 10 seconds timeout
    
    setPaymentTimeoutId(timeoutId);
    
    try {
      // Prepare payment data for API
      const paymentInfo = {
        course_id: courseId,
        payment_method: paymentData.method,
        payment_details: {
          ...paymentData.details,
          // Only send last 4 digits of card number for security
          card_number: paymentData.details.cardNumber ? 
            paymentData.details.cardNumber.replace(/\s/g, '').slice(-4) : null
        },
        coupon_id: appliedPromo ? appliedPromo.id : null
      };
      
      // Send payment information to backend
      const response = await axiosInstance.post('/api/courses/purchase', paymentInfo);
      
      if (response.data.success) {
        clearTimeout(timeoutId);
        setPaymentTimeoutId(null);
        setStatus('success');
        
        // Create payment result object
        const paymentResult = {
          payment_method: paymentData.method,
          payment_details: response.data.data,
          payment_status: 'completed',
          subtotal: response.data.data.original_price || amount,
          original_amount: response.data.data.original_price || amount,
          paid_amount: response.data.data.final_price || discountedAmount,
          discount_amount: response.data.data.discount || (amount - discountedAmount),
          coupon_code: response.data.data.coupon_applied || (appliedPromo ? appliedPromo.code : null),
          transaction_id: response.data.data.transaction_id
        };
        
        // Delay to show success message before completion
        setTimeout(() => {
          onPaymentComplete(paymentResult);
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Payment processing failed');
      }
    } catch (err) {
      // Clear timeout
      clearTimeout(timeoutId);
      setPaymentTimeoutId(null);
      
      setStatus('error');
      setError(err.response?.data?.message || err.message || errorMessages[PaymentErrors.PROCESSING_ERROR]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoApply = (promoData) => {
    setAppliedPromo(promoData);
  };
  
  const handleErrorDismiss = () => {
    setError(null);
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Secure Checkout</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="close-button"
              type="button"
            >
              <X />
            </button>
          )}
        </div>
        
        <div className="payment-modal-body">
          {error && (
            <div className="error-alert">
              <AlertCircle className="error-alert-icon" />
              <div>
                <h3 className="error-alert-title">Payment Error</h3>
                <p className="error-alert-message">{error}</p>
              </div>
              <button onClick={handleErrorDismiss} className="error-dismiss-button">
                <X className="error-dismiss-icon" />
              </button>
            </div>
          )}

          {status === 'success' ? (
            <div className="success-message">
              <CheckCircle className="success-icon" />
              <h3 className="success-title">Payment Successful</h3>
              <p className="success-description">Your payment has been processed successfully.</p>
              {appliedPromo && (
                <div className="success-promo-applied">
                  <p>Promo code <strong>{appliedPromo.code}</strong> applied</p>
                  <p>You saved: <strong>${(amount - discountedAmount).toFixed(2)}</strong></p>
                </div>
              )}
            </div>
          ) : (
            <>
              <PaymentMethod
                onMethodSelect={setSelectedMethod}
                selectedMethod={selectedMethod}
              />
              
              {selectedMethod && (
                <div className="payment-form-container">
                  <PaymentForm
                    method={selectedMethod}
                    onSubmit={handlePayment}
                    amount={discountedAmount}
                    originalAmount={amount}
                    loading={loading}
                    appliedPromo={appliedPromo}
                    onPromoApply={handlePromoApply}
                    courseTitle={courseTitle}
                    courseId={courseId}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessor;

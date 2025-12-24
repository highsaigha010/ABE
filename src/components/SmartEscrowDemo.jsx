import React from 'react';

const SmartEscrowDemo = ({ onCancel }) => {
  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#1E293B',
      color: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Smart Escrow Secure Payment</h3>
      <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '24px' }}>
        You are about to initialize a secure escrow transaction. Your funds will be held safely until the service is delivered.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          style={{
            padding: '12px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => alert('Escrow Initialized!')}
        >
          Confirm & Pay
        </button>
        <button 
          style={{
            padding: '12px',
            backgroundColor: 'transparent',
            color: '#94A3B8',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SmartEscrowDemo;

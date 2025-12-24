import React, { useState } from 'react';
import SmartEscrowDemo from './SmartEscrowDemo';

const VendorProfile = () => {
  const [selectedPackage, setSelectedPackage] = useState('essential');
  const [showEscrow, setShowEscrow] = useState(false);

  const packages = {
    essential: {
      id: 'essential',
      name: 'Essential Experience',
      price: 50245,
      description: 'Ideal for intimate events',
      features: ['4 Hours Coverage', '1 Photographer', 'High-res Digital Gallery', 'Basic Editing']
    },
    elite: {
      id: 'elite',
      name: 'Elite Experience',
      price: 90441,
      description: 'Flagship experience, full production',
      features: ['Full Day Coverage', '2 Photographers + 1 Videographer', 'Premium Photo Album', 'Cinematic Highlight Film', 'Same-day Edit']
    }
  };

  const currentPackage = packages[selectedPackage];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#1E293B',
      backgroundColor: '#F8FAFC',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '40px',
      textAlign: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '32px',
      alignItems: 'start'
    },
    packageCard: (isSelected) => ({
      padding: '32px',
      borderRadius: '16px',
      backgroundColor: '#FFFFFF',
      border: isSelected ? '2px solid #4F46E5' : '2px solid transparent',
      boxShadow: isSelected ? '0 20px 25px -5px rgba(79, 70, 229, 0.1), 0 10px 10px -5px rgba(79, 70, 229, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '24px',
      position: 'relative'
    }),
    packagePrice: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#0F172A',
      marginBottom: '8px'
    },
    packageName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#4F46E5',
      marginBottom: '8px'
    },
    packageDesc: {
      color: '#64748B',
      marginBottom: '20px',
      fontSize: '0.95rem'
    },
    featureList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px',
      fontSize: '0.9rem',
      color: '#475569'
    },
    checkIcon: {
      color: '#10B981',
      marginRight: '8px',
      fontWeight: 'bold'
    },
    sidebar: {
      position: 'sticky',
      top: '40px'
    },
    summaryCard: {
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      marginBottom: '20px'
    },
    summaryTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '20px',
      borderBottom: '1px solid #334155',
      paddingBottom: '12px'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '0.9rem'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
      paddingTop: '16px',
      borderTop: '1px solid #334155',
      fontWeight: 'bold',
      fontSize: '1.1rem'
    },
    requestButton: {
      width: '100%',
      padding: '16px',
      backgroundColor: '#4F46E5',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '24px',
      transition: 'background-color 0.2s'
    },
    trustSeal: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px',
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E2E8F0'
    },
    trustItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.85rem',
      color: '#475569'
    },
    trustIcon: {
      backgroundColor: '#EEF2FF',
      color: '#4F46E5',
      padding: '8px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Vendor Profile</h1>
        <p style={{ color: '#64748B' }}>Choose the perfect package for your upcoming event</p>
      </header>

      <div style={styles.grid}>
        {/* Left Column: Package Cards */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', color: '#0F172A' }}>Available Packages</h2>
          
          <div 
            style={styles.packageCard(selectedPackage === 'essential')}
            onClick={() => setSelectedPackage('essential')}
          >
            {selectedPackage === 'essential' && (
              <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#4F46E5', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>SELECTED</div>
            )}
            <div style={styles.packageName}>{packages.essential.name}</div>
            <div style={styles.packagePrice}>{formatPrice(packages.essential.price)}</div>
            <div style={styles.packageDesc}>{packages.essential.description}</div>
            <ul style={styles.featureList}>
              {packages.essential.features.map((feature, index) => (
                <li key={index} style={styles.featureItem}>
                  <span style={styles.checkIcon}>✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>

          <div 
            style={styles.packageCard(selectedPackage === 'elite')}
            onClick={() => setSelectedPackage('elite')}
          >
            {selectedPackage === 'elite' && (
              <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#4F46E5', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>SELECTED</div>
            )}
            <div style={styles.packageName}>{packages.elite.name}</div>
            <div style={styles.packagePrice}>{formatPrice(packages.elite.price)}</div>
            <div style={styles.packageDesc}>{packages.elite.description}</div>
            <ul style={styles.featureList}>
              {packages.elite.features.map((feature, index) => (
                <li key={index} style={styles.featureItem}>
                  <span style={styles.checkIcon}>✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside style={styles.sidebar}>
          {!showEscrow ? (
            <div style={styles.summaryCard}>
              <div style={styles.summaryTitle}>Booking Summary</div>
              <div style={styles.summaryRow}>
                <span>Package</span>
                <span>{currentPackage.name}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Base Price</span>
                <span>{formatPrice(currentPackage.price)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Platform Fee</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div style={styles.totalRow}>
                <span>Total</span>
                <span>{formatPrice(currentPackage.price)}</span>
              </div>
              <button 
                style={styles.requestButton}
                onClick={() => setShowEscrow(true)}
              >
                REQUEST PROPOSAL
              </button>
            </div>
          ) : (
            <SmartEscrowDemo onCancel={() => setShowEscrow(false)} />
          )}

          <div style={styles.trustSeal}>
            <div style={styles.trustItem}>
              <div style={styles.trustIcon}>🛡️</div>
              <div>
                <div style={{ fontWeight: '600' }}>Verified Service Partner</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Background checked and vetted.</div>
              </div>
            </div>
            <div style={styles.trustItem}>
              <div style={styles.trustIcon}>🤝</div>
              <div>
                <div style={{ fontWeight: '600' }}>Escrow Protected Payment</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Your money is safe until delivery.</div>
              </div>
            </div>
            <div style={styles.trustItem}>
              <div style={styles.trustIcon}>📄</div>
              <div>
                <div style={{ fontWeight: '600' }}>Cancellation Insurance</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Flexible rescheduling options.</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VendorProfile;

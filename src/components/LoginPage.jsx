import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated short latency for auth checking feel
    setTimeout(() => {
      const emailTrim = email.trim().toLowerCase();
      if (emailTrim === 'admin@tamfresh.com' && password === 'admin123') {
        onLogin(emailTrim, 'admin');
      } else if (emailTrim === 'operador@tamfresh.com' && password === 'operador123') {
        onLogin(emailTrim, 'operator');
      } else {
        setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backButtonStyle} className="btn-secondary">
        <ArrowLeft size={16} /> Volver al Portal
      </button>

      <div className="glass-panel animate-slide-up" style={cardStyle}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ ...logoWrapperStyle, display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px' }}>
            <img 
              src="/tamfresh_logo.png" 
              alt="Tamfresh Logo" 
              style={{ width: '178px', height: '178px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: 'var(--font-title)' }}>
              Tam<span style={{ color: 'var(--color-success)' }}>fresh</span>
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 500 }}>
            PORTAL ADMINISTRATIVO INTERNO
          </p>
        </div>

        {error && (
          <div style={errorContainerStyle}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={inputIconStyle} />
              <input
                type="email"
                className="form-input"
                placeholder="ejemplo@tamfresh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={inputIconStyle} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={submitButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={spinnerStyle}></span>
            ) : (
              <>
                <LogIn size={16} /> Iniciar Sesión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styling definitions
const containerStyle = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  position: 'relative'
};

const backButtonStyle = {
  position: 'absolute',
  top: '24px',
  left: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '0.85rem'
};

const cardStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '36px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  border: '1px solid var(--panel-border)'
};

const logoWrapperStyle = {
  display: 'inline-block',
  background: 'rgba(255,255,255,0.02)',
  padding: '4px 16px',
  borderRadius: '12px',
  border: '1px solid var(--panel-border)'
};

const inputIconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)'
};

const inputStyle = {
  paddingLeft: '40px',
  width: '100%'
};

const submitButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.9rem',
  background: 'linear-gradient(135deg, var(--color-strawberry) 0%, #be123c 100%)',
  border: 'none',
  marginTop: '8px'
};

const errorContainerStyle = {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  padding: '12px 14px',
  color: 'var(--color-danger)',
  fontSize: '0.8rem',
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
  marginBottom: '20px',
  lineHeight: '1.4'
};

const demoBoxStyle = {
  marginTop: '24px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px dashed var(--panel-border)',
  borderRadius: '8px',
  padding: '12px 14px'
};

const spinnerStyle = {
  display: 'inline-block',
  width: '18px',
  height: '18px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderRadius: '50%',
  borderTopColor: '#white',
  animation: 'spin 1s ease-in-out infinite'
};

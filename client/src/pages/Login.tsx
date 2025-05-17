import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onClose: () => void;
}

export default function Login({ onClose }: LoginProps) {
  const navigate = useNavigate();

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      // Store the credential in localStorage
      localStorage.setItem('googleCredential', credentialResponse.credential);
      onClose();
      navigate('/dashboard');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '400px' }}
      >
        <button 
          className="close-button"
          onClick={onClose}
        >
          ×
        </button>
        <h2 style={{ 
          color: 'var(--primary-color)',
          marginBottom: '2rem',
          fontSize: '2rem',
          textAlign: 'center'
        }}>Login to Pickle Wheel</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => {
              alert('Login Failed');
            }}
          />
        </div>
      </div>
    </div>
  );
} 
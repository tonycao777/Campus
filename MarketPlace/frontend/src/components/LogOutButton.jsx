import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';  // Add this import

const LogoutButton = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to the sign-in page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <button
        style={styles.logoutButton}
        onClick={() => setShowConfirm(true)}
      >
        Log Out
      </button>

      {showConfirm &&
        createPortal(  // Use createPortal to render the overlay outside the sidebar
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmBox}>
              <p>Are you sure you want to log out?</p>
              <button style={styles.confirmButton} onClick={handleLogout}>
                Yes
              </button>
              <button
                style={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
              >
                No
              </button>
            </div>
          </div>,
          document.body  // Render the overlay to the body (full page)
        )
      }

    </>
  );
};

const styles = {
  logoutButton: {
    display: 'block',
    width: '100%',
    padding: '10px 20px',
    marginBottom: '10px',
    backgroundColor: '#8d04be',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  confirmBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
  },
  confirmButton: {
    margin: '5px',
    padding: '10px 20px',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelButton: {
    margin: '5px',
    padding: '10px 20px',
    backgroundColor: '#5bc0de',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default LogoutButton;
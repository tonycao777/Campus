import React from 'react';
import ProfileButton from './profileButton';
import LogoutButton from './LogOutButton';
import { getAuth } from "firebase/auth"; // Import Firebase Auth to get current user's UID

const Sidebar = ({ isOpen, onClose }) => {
  const auth = getAuth();
      const user = auth.currentUser?.uid;
  return (
    <div style={{
      ...styles.sidebar,
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)', // Control the sidebar position
      transition: 'transform 0.3s ease-in-out', // Smooth transition for the slide-in/out effect
    }}>
      <button onClick={onClose} style={styles.closeButton}>
        &times;
      </button>
      <div style={styles.content}>
        <h2 style={styles.header}> Account Information</h2>
        <div style={styles.buttonContainer}>
          <ProfileButton redirect={true} style={styles.buttonStyle} userId={user} />
        </div>
        <div style={styles.logoutContainer}>
          <LogoutButton style={styles.buttonStyle} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '300px',
    height: '100%',
    backgroundColor: '#fff',
    boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    transform: 'translateX(100%)', // Starts off-screen
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    position: 'absolute',
    top: '10px',
    right: '10px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between', // This ensures ProfileButton is at the top and LogoutButton at the bottom
    padding: '20px',
  },
  buttonContainer: {
    marginBottom: 'auto', // Pushes the ProfileButton to the top
  },
  logoutContainer: {
    marginTop: 'auto', // Pushes the LogoutButton to the bottom, but we will adjust it slightly
    marginBottom: '20px', // Adjusts the distance of the logout button from the bottom
  },
  buttonStyle: {
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
};

export default Sidebar;
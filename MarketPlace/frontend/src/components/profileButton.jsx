// components/ProfileButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const ProfileButton = ({ onClick, redirect = false, userId }) => {
  const navigate = useNavigate();
  

  const handleClick = () => {
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;
    if (currentUserId === userId) {
      navigate(`/profile/${currentUserId}`); // Redirect to current user's profile
    } else {
      navigate(`/view-profile/${userId}`); // Redirect to another user's profile
    }
  };

  return (
    <button onClick={handleClick} style={styles.button}>
      User Profile
    </button>
  );
};

const styles = {
  button: {
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

export default ProfileButton;
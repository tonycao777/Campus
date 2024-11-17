import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postItem } from '../firebaseConfig';

const PostItemPage = () => {
  const navigate = useNavigate();
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    contactInfo: '' // Add a contact info field
  });

  const handlePostItem = async () => {
    await postItem(newItem);
    setNewItem({
      title: '',
      description: '',
      price: '',
      location: '',
      contactInfo: '' // Reset contact info as well
    });
  };

  const handleBackToHome = () => {
    navigate('/listing'); // Navigate back to the listing page
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Post a New Item</h2>
      <input
        type="text"
        placeholder="Title"
        value={newItem.title}
        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Description"
        value={newItem.description}
        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Price"
        value={newItem.price}
        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Location"
        value={newItem.location}
        onChange={e => setNewItem({ ...newItem, location: e.target.value })}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Contact Information"
        value={newItem.contactInfo}
        onChange={e => setNewItem({ ...newItem, contactInfo: e.target.value })}
        style={styles.input}
      />
      <button
        onClick={handlePostItem}
        style={styles.button}
      >
        Post Item
      </button>
      <button
        onClick={handleBackToHome}
        style={styles.buttonSecondary}
      >
        Back to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '500px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxSizing: 'border-box', // Prevent padding from affecting width
    transition: 'border-color 0.3s',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '12px',
    backgroundColor: '#4A90E2', // Light blue color
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '15px',
    transition: 'background-color 0.3s, transform 0.3s',
  },
  buttonSecondary: {
    display: 'block',
    width: '100%',
    padding: '12px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
  },
};

// Hover effects for buttons and inputs
document.addEventListener('mouseover', function (e) {
  if (e.target.tagName === 'BUTTON') {
    e.target.style.transform = 'scale(1.05)';
  }
});

document.addEventListener('mouseout', function (e) {
  if (e.target.tagName === 'BUTTON') {
    e.target.style.transform = 'scale(1)';
  }
});

// Input focus effect
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
  input.addEventListener('focus', () => {
    input.style.borderColor = '#4A90E2';
  });
  input.addEventListener('blur', () => {
    input.style.borderColor = '#ccc';
  });
});

export default PostItemPage;
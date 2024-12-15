import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postItem } from '../firebaseConfig';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library

const PostItemPage = () => {
  const navigate = useNavigate();
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    campus: '', // Add campus field
    contactInfo: '',
    images: [], // Store multiple images
  });

  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('/world_universities_and_domains.json'); // Adjust path if needed
        const data = await response.json();
        const filteredUniversities = data.filter((university) => university.country === 'United States');
        setUniversities(filteredUniversities);
      } catch (error) {
        console.error('Error fetching universities:', error);
        setError('Failed to load universities.');
      }
    };

    fetchUniversities();

    return () => {
      // Clean up URLs created for image previews
      newItem.images.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [newItem.images]);

  const handlePostItem = async () => {
    // Check if any required field is missing
    if (
      !newItem.title ||
      !newItem.description ||
      !newItem.price ||
      !newItem.category ||
      !newItem.location ||
      !newItem.campus || // Validate campus
      !newItem.contactInfo ||
      newItem.images.length === 0
    ) {
      alert('All fields are required!'); // Display an alert if any field is missing
      return; // Prevent the item from being posted
    }

    // Use only the file property to create object URLs
  const imageUrls = newItem.images.map(({ file }) => URL.createObjectURL(file));

  const timestamp = new Date();
  const uniqueId = uuidv4();

  const itemToPost = {
    id: uniqueId,
    ...newItem,
    images: imageUrls, // Use URLs for storage or uploading logic here
    timestamp,
  };

  await postItem(itemToPost);
  navigate('/listing');
  
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithPreview = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewItem((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...filesWithPreview],
    }));
  };

  const handleBackToHome = () => {
    navigate('/listing');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Post a New Item</h2>
      {error && <p style={styles.error}>{error}</p>}
      <input
        type="text"
        placeholder="Title"
        value={newItem.title}
        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
        style={styles.input}
        required
      />
      <input
        type="text"
        placeholder="Description"
        value={newItem.description}
        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        style={styles.input}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={newItem.price}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '' || Number(value) > 0) {
            setNewItem({ ...newItem, price: value });
          }
        }}
        style={styles.input}
        min="1"
        required
      />
      <select
        value={newItem.category}
        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        style={styles.input}
      >
        <option value="" disabled>
          Select Category
        </option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Beauty & Health">Beauty & Health</option>
        <option value="Sports & Outdoors">Sports & Outdoors</option>
        <option value="Books">Books</option>
        <option value="Pet Supplies">Pet Supplies</option>
        <option value="Sporting Events">Sporting Events</option>
        <option value="Dorm Supplies">Dorm Supplies</option>
      </select>
      <input
        type="text"
        placeholder="Location"
        value={newItem.location}
        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
        style={styles.input}
        required
      />
      <select
        value={newItem.campus}
        onChange={(e) => setNewItem({ ...newItem, campus: e.target.value })}
        style={styles.input}
        required
      >
        <option value="" disabled>
          Select Campus
        </option>
        {universities.map((university, index) => (
          <option key={index} value={university.name}>
            {university.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Contact Information"
        value={newItem.contactInfo}
        onChange={(e) => setNewItem({ ...newItem, contactInfo: e.target.value })}
        style={styles.input}
        required
      />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={styles.input}
      />
      <div style={styles.imagePreviewContainer}>
        {newItem.images.map(({ previewUrl }, index) => (
          <img
            key={index}
            src={previewUrl}
            alt={`Preview ${index + 1}`}
            style={styles.previewImage}
          />
        ))}
      </div>
      <button onClick={handlePostItem} style={styles.button}>
        Post Item
      </button>
      <button onClick={handleBackToHome} style={styles.buttonSecondary}>
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
    color:'#8d04be',
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
  imagePreviewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  previewImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  button: {
    width: '20%',
    padding: '10px',
    marginBottom: '15px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxSizing: 'border-box',
    backgroundColor: '#8d04be',
    color: 'white',
    cursor: 'pointer',
    outline: 'none',
  },

  buttonSecondary: {
    marginLeft: '275px',
    width: '25%',
    padding: '10px',
    marginBottom: '15px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxSizing: 'border-box',
    backgroundColor: '#8d04be',
    color: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
  },
};

export default PostItemPage;
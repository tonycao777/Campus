import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postItem } from '../firebaseConfig';
import { v4 as uuidv4 } from 'uuid'; 
import { ref, listAll, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebaseConfig';

const PostItemPage = () => {
  const navigate = useNavigate();

  const [imageUploads, setImageUploads] = useState([]); // Store files before upload
  const [imageUrls, setImageUrls] = useState([]); // Store uploaded image URLs
  const [imageList, setImageList] = useState([]);

  const imageListRef = ref(storage, 'images/');

  useEffect(() => {
    listAll(imageListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    campus: '',
    contactInfo: '',
    images: [],
  });

  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false); // Track upload progress

  useEffect(() => {
          // Fetch all universities in the US
          const fetchUniversities = async () => {
              try {
                  const response = await fetch('/world_universities_and_domains.json');
                  const data = await response.json();
                  const filteredUniversities = data
                      .filter((university) => university.country === 'United States')
                      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
      
                  setUniversities(filteredUniversities);
              } catch (error) {
                  console.error("Error fetching universities:", error);
              }
          };
      
          fetchUniversities();
      }, []);

  const uploadImage = async () => {
    if (imageUploads.length === 0) {
      alert('Please select images to upload.');
      return;
    }
  
    setUploading(true); // Indicate that uploading is in progress
  
    try {
      const uploadedUrls = [];
      // Upload each image to Firebase
      for (let i = 0; i < imageUploads.length; i++) {
        const file = imageUploads[i];
        const imageRef = ref(storage, `images/${uuidv4()}`);
  
        const uploadTask = uploadBytesResumable(imageRef, file);
        await uploadTask;
        const downloadURL = await getDownloadURL(imageRef);
        uploadedUrls.push(downloadURL); // Collect the image URLs
      }
  
      // Use the previous state to append new URLs without overwriting
      setImageUrls((prevUrls) => [...prevUrls, ...uploadedUrls]);
      setUploading(false); // Reset uploading state
      alert('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploading(false);
    }
  };

  const handlePostItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.price || !newItem.category || !newItem.location || !newItem.campus || !newItem.contactInfo || imageUrls.length === 0) {
      alert('All fields are required!');
      return;
    }

    try {
      const timestamp = new Date();
      const uniqueId = uuidv4();

      const itemToPost = {
        id: uniqueId,
        ...newItem,
        images: imageUrls,
        timestamp,
      };

      await postItem(itemToPost);
      navigate('/listing');
    } catch (error) {
      console.error('Error posting item:', error);
      alert('Failed to post the item.');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Allow multiple file selection
    setImageUploads(files);
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
        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        style={styles.input}
        min="1"
        required
      />
      <select
        value={newItem.category}
        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        style={styles.input}
      >
        <option value="" disabled>Select Category</option>
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
        <option value="" disabled>Select Campus</option>
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
  
      {/* File input */}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={styles.input}
      />

      <div style={styles.imagePreviewContainer}>
        {imageUploads.length > 0 && imageUploads.map((file, index) => (
          <img key={index} src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} style={styles.previewImage} />
        ))}
      </div>
  
      {/* Upload button below preview */}
      <button onClick={uploadImage} style={styles.uploadButton}>Upload Image</button>
  
      {/* Action buttons */}
      <div style={styles.actionButtons}>
        <button onClick={handlePostItem} style={styles.button}>
          Post Item
        </button>
        <button onClick={handleBackToHome} style={styles.buttonSecondary}>
          Back to Home
        </button>
      </div>
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
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
  },
  imagePreviewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px',  // Space between preview and the upload button
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
  uploadButton: {
    width: '30%',
    padding: '10px',
    marginBottom: '30px', // Space below the upload button for better alignment
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxSizing: 'border-box',
    backgroundColor: '#8d04be',
    color: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
  },
};

export default PostItemPage;

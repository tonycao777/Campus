import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const EditItemPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: docId } = useParams();
  const { item } = location.state;
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: item.title,
    price: item.price,
    description: item.description,
    category: item.category,
    location: item.location,
    campus: item.campus,
    contactInfo: item.contactInfo,
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateItem = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.category ||
      !formData.location ||
      !formData.campus ||
      !formData.contactInfo
    ) {
      alert("All fields are required!");
      return;
    }

    try {
      const itemRef = doc(db, "Items", docId);
      await updateDoc(itemRef, { ...formData });
      alert("Item updated successfully!");
      navigate(`/item/${docId}`);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item.");
    }
  };

  const styles = {
    container: {
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#f9f9f9",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "20px",
      color: "#333",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "16px",
    },
    textarea: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "16px",
      minHeight: "80px",
    },
    select: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "16px",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
    },
    updateButton: {
      backgroundColor: "#4caf50",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    },
    updateButtonHover: {
      backgroundColor: "#45a049",
    },
    backButton: {
      backgroundColor: "#f44336",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    },
    backButtonHover: {
      backgroundColor: "#d7352c",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Edit Your Item</h2>
      <form
        onSubmit={(e) => e.preventDefault()}
        style={styles.form}
      >
        <input
          style={styles.input}
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Title"
        />
        <input
          style={styles.input}
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Price"
          type="number"
        />
        <textarea
          style={styles.textarea}
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
        />
        <select
          style={styles.select}
          name="category"
          value={formData.category}
          onChange={handleInputChange}
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
          style={styles.input}
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Location"
        />
        <select
          style={styles.select}
          name="campus"
          value={formData.campus}
          onChange={(e) =>
            setFormData({ ...formData, campus: e.target.value })
          }
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
          style={styles.input}
          name="contactInfo"
          value={formData.contactInfo}
          onChange={handleInputChange}
          placeholder="Contact Information"
        />
        <div style={styles.buttonGroup}>
          <button
            style={styles.updateButton}
            type="submit"
            onClick={handleUpdateItem}
          >
            Update Item
          </button>
          <button
            style={styles.backButton}
            onClick={() => navigate(`/item/${docId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItemPage;
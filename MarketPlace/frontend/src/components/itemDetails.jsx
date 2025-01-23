import React, { useEffect, useState } from "react";
import { auth, fetchUserFullName, db, deleteItem, storage } from "../firebaseConfig";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import ChatButton from "./chatButton";
import ProfileButton from './profileButton';
import { ref, deleteObject } from "firebase/storage";

const ItemDetails = () => {
  const [item, setItem] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();

  const backHome = () => {
    navigate("/listing");
  };

  useEffect(() => {
    const fetchItemDetails = async () => {
      const itemRef = doc(db, "Items", id);
      const itemDoc = await getDoc(itemRef);
      if (itemDoc.exists()) {
        setItem(itemDoc.data());
      } else {
        console.error("Item not found");
      }
    };

    fetchItemDetails();
  }, [id]);

  useEffect(() => {
    if (item) {
      const fetchUserNames = async () => {
        const name = await fetchUserFullName(item.userId);
        setUserNames((prevNames) => ({
          ...prevNames,
          [item.userId]: name,
        }));
      };

      fetchUserNames();
    }
  }, [item]);

  const handleDeleteItem = async () => {
    if (item) {
      try {
        // Loop through each image URL in the images array
        for (const imageUrl of item.images) {
          // Extract the file path from the image URL
          const filePath = imageUrl.split('/o/')[1].split('?')[0]; // Extract path after /o/
  
          // Get a reference to the image file in Firebase Storage
          const imageRef = ref(storage, decodeURIComponent(filePath));
  
          // Delete the image from Firebase Storage
          await deleteObject(imageRef);
        }
  
        // Now delete the Firestore document
        await deleteItem(id);
  
        // Navigate back to the listing page
        navigate("/listing");
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const handleEditItem = () => {
    if (item) {
      navigate(`/edit-item/${id}`, { state: { item } });
    }
  };

  const nextImage = () => {
    if (item.images) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item.images) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex - 1 + item.images.length) % item.images.length
      );
    }
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "800px" }}>
          <div style={styles.itemCard}>
            <div style={styles.imageContainer}>
              {item.images && (
                <div style={styles.carousel}>
                  <button onClick={prevImage} style={styles.arrowButton}>
                    ◀
                  </button>
                  <img
                    src={item.images[currentImageIndex]}  // Display image from Firebase Storage URL
                    alt="Item"
                    style={styles.carouselImage}
                  />
                  <button onClick={nextImage} style={styles.arrowButton}>
                    ▶
                  </button>
                </div>
              )}
            </div>
            <div style={styles.itemDetails}>
              <h3>{item.title}</h3>
              <p>Price: ${item.price}</p>
              <p>Description: {item.description}</p>
              <p>Category: {item.category}</p>
              <p>Location: {item.location}</p>
              <p>University: {item.campus}</p>
              <p>
                Posted by:{" "}
                {item.userId === auth.currentUser?.uid
                  ? "You"
                  : userNames[item.userId] || "Loading..."}
              </p>
              <ProfileButton userId={item.userId} />
            </div>

            {item.userId !== auth.currentUser?.uid && (
              <div style={styles.actionButtons}>
                <ChatButton sellerId={item.userId} item={item} />
                <button
                  onClick={() => navigate("/payment", { state: { item } })}
                  style={styles.buyButton}
                >
                  Buy
                </button>
              </div>
            )}

            {item.userId === auth.currentUser?.uid && (
              <div>
                <button style={styles.editButton} onClick={handleEditItem}>
                  Edit
                </button>
                <button onClick={handleDeleteItem} style={styles.deleteButton}>
                  Delete
                </button>
              </div>
            )}
            <button onClick={backHome} style={styles.backButton}>
              Back Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  itemCard: {
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    maxWidth: "800px",
    margin: "auto",
  },
  arrowButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "20px", // Slightly smaller size for a more subtle appearance
    fontWeight: "bold",
    color: "#333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px", // Smaller button width
    height: "30px", // Smaller button height
    borderRadius: "50%", // Keep rounded edges
    boxShadow: "none", // Remove shadow for a cleaner look
    transition: "background-color 0.3s ease, transform 0.3s ease",
    padding: "5px", // Padding to make the arrow a bit thinner
  },

  arrowButtonHover: {
    backgroundColor: "#f0f0f0",
    transform: "scale(1.1)", // Keep the scaling effect on hover
  },

  carousel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    position: "relative", // Ensure buttons overlay correctly on images
  },
  carouselImage: {
    width: "100%",
    maxWidth: "500px",
    height: "auto",
    borderRadius: "10px",
  },
  itemDetails: {
    textAlign: "left",
    width: "100%",
    color: "#4f4f4f",
    lineHeight: "1.6",
    fontSize: "16px",
  },
  buyButton: {
    padding: "12px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    maxWidth: "200px",
  },
  editButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "10px 5px",
  },
  deleteButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "10px 5px",
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "20px",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: "400px",
    marginTop: "20px",
    gap: "10px",
  },
};

export default ItemDetails;

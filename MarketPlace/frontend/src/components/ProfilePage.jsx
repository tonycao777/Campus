import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Adjust according to your Firebase config
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth"; // Import Firebase Auth to get current user's UID

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId, viewOnly } = useParams(); // Added `viewOnly` to handle view-only profiles
  const [userData, setUserData] = useState({
    email: "",
    university: "",
    cellphone: "",
    address: "",
    firstName: "",
    lastName: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("userId", "==", user.uid)); 
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0]; 
          setUserData(docSnap.data());
        } else {
          console.log("No user found!");
        }
      } else {
        console.log("No user is logged in.");
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const homePage = () => {
    navigate('/listing');
  };

  const handleUpdateProfile = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("userId", "==", user.uid)); 
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]; 
        const userRef = doc(db, "Users", docSnap.id);

        try {
          await updateDoc(userRef, {
            cellphone: userData.cellphone,
            firstName: userData.firstName,
            lastName: userData.lastName,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zip: userData.zip,
          });
          alert("Profile updated successfully!");
        } catch (error) {
          console.error("Error updating profile:", error);
          alert("Failed to update profile.");
        }
      }
    } else {
      console.log("No user is logged in.");
    }
  };

  const fieldStyle = {
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "95%",
  };

  const readOnlyFieldStyle = {
    ...fieldStyle,
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    color: "#555",
  };

  const containerStyle = {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f7f7f7",
    borderRadius: "8px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    margin: "10px 0",
    backgroundColor: "#8d04be",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const buttonSecondaryStyle = {
    ...buttonStyle,
    backgroundColor: "#8d04be",
    marginLeft: "365px",
    cursor: "pointer",
  };

  const header = {
    textAlign: 'center', // Centers the header text
  };

  const subheader = {
    textAlign: 'center', // Centers the header text
  };
  
  return (
    <div style={containerStyle}>
      <h1 style={header}>Profile Page</h1>
      <p style={subheader}>
        {viewOnly === "true" ? "Viewing User's Profile" : "Your Profile"}
      </p>
      <form onSubmit={(e) => e.preventDefault()}>
      <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleInputChange}
            placeholder={userData.firstName || "First Name"}
            style={fieldStyle}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleInputChange}
            placeholder={userData.lastName || "Last Name"}
            style={fieldStyle}
          />
        </div>
        <div>
          <label>Cellphone:</label>
          <input
            type="text"
            name="cellphone"
            value={userData.cellphone}
            onChange={handleInputChange}
            placeholder={userData.cellphone || "Cellphone"}
            style={fieldStyle}
          />
        </div>
        <div>
          <label>Email:</label>
          <p style={readOnlyFieldStyle}>{userData.email}</p>
        </div>
        <div>
          <label>University:</label>
          <p style={readOnlyFieldStyle}>{userData.university}</p>
        </div>
        <div>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={userData.address}
            onChange={handleInputChange}
            placeholder={userData.address || "Address"}
            style={fieldStyle}
          />
        </div>
        <div>
          <label>City:</label>
          <input
            type="text"
            name="city"
            value={userData.city}
            onChange={handleInputChange}
            placeholder={userData.city || "City"}
            style={fieldStyle}
          />
        </div>
        <div>
          <label>State:</label>
          <input
            type="text"
            name="state"
            value={userData.state}
            onChange={handleInputChange}
            placeholder={userData.state || "State"}
            style={fieldStyle}
          />
        </div>
        <div>
          <label>Zip:</label>
          <input
            type="text"
            name="zip"
            value={userData.zip}
            onChange={handleInputChange}
            placeholder={userData.zip || "Zip"}
            style={fieldStyle}
          />
        </div>
        <button type="button" onClick={homePage} style={buttonStyle}>
          Home Page
        </button>
        <button type="button" onClick={handleUpdateProfile} style={buttonSecondaryStyle}>
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
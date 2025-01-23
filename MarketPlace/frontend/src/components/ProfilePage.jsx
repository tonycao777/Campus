import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig"; // Adjust according to your Firebase config
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userId, viewOnly } = useParams();
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
    profileIcon: "", // Add profileIcon to the user data
  });
  const [newProfileImage, setNewProfileImage] = useState(null); // For storing the selected image file

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
    navigate("/listing");
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

  const handleFileChange = (e) => {
    setNewProfileImage(e.target.files[0]);
  };

  const handleUploadProfileIcon = async () => {
    if (!newProfileImage) {
      alert("Please select an image first!");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const fileName = `${user.uid}_profileIcon`; // Unique filename
      const imageRef = ref(storage, `profileImages/${fileName}`);

      try {
        // Upload the new image
        await uploadBytes(imageRef, newProfileImage);

        // Get the new image URL
        const newImageURL = await getDownloadURL(imageRef);

        // Update Firestore with the new profile icon URL
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const userRef = doc(db, "Users", docSnap.id);

          await updateDoc(userRef, { profilePicture: newImageURL });

          // Update local state
          setUserData((prev) => ({ ...prev, profilePicture: newImageURL }));
          alert("Profile icon updated successfully!");
        }
      } catch (error) {
        console.error("Error uploading profile icon:", error);
        alert("Failed to update profile icon.");
      }
    }
  };

  const fieldStyle = {
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "95%",
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

  const buttonStyle1 = {
    padding: "10px 20px",
    margin: "10px 0",
    backgroundColor: "#8d04be",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: '350px'
  };

  return (
    <div style={containerStyle}>
      <h1>Profile Page</h1>
      <p>{viewOnly === "true" ? "Viewing User's Profile" : "Your Profile"}</p>
      <div>
        <label>Profile Icon:</label>
        <div>
          <img
            src={userData.profilePicture} // Use default image if none is set
            alt="Profile Icon"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} style={fieldStyle} />
        <button type="button" onClick={handleUploadProfileIcon} style={buttonStyle}>
          Upload New Profile Icon
        </button>
      </div>
      <div>
        <label>First Name:</label>
        <input
          type="text"
          name="firstName"
          value={userData.firstName}
          onChange={handleInputChange}
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
          style={fieldStyle}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleInputChange}
          style={fieldStyle}
          disabled
        />
      </div>
      <div>
        <label>Cellphone:</label>
        <input
          type="text"
          name="cellphone"
          value={userData.cellphone}
          onChange={handleInputChange}
          style={fieldStyle}
        />
      </div>
      <div>
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={userData.address}
          onChange={handleInputChange}
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
          style={fieldStyle}
        />
      </div>
      <button type="button" onClick={homePage} style={buttonStyle}>
        Home Page
      </button>
      <button type="button" onClick={handleUpdateProfile} style={buttonStyle1}>
        Update Profile
      </button>
    </div>
  );
};

export default ProfilePage;
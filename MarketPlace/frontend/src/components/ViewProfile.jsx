import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, writeBatch, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

const ViewProfile = () => {
  const { userId } = useParams(); // userId is the ID of the profile being viewed
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser; // currentUser is the logged-in user (the one viewing the profile)

  // Fetch user data based on userId (the profile being viewed)
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("userId", "==", userId)); 
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0]; 
          setUser(docSnap.data()); // Set the user profile data
        } else {
          console.log("No user found!");
        }
      } else {
        console.log("No user is logged in.");
      }
    };

    fetchUserData();
  }, [userId]);

  // Check if the current user is following the profile
  useEffect(() => {
    const checkIfFollowing = async () => {
      if (currentUser) {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("userId", "==", currentUser.uid)); // Fetch the current user's document
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const currentUserDoc = querySnapshot.docs[0]; // Get the current user document
          const currentUserData = currentUserDoc.data();
          setIsFollowing(currentUserData.following?.includes(userId)); // Check if currentUser is following the viewed profile
        } else {
          console.log("Logged-in user not found in Firestore");
        }
      }
    };

    if (currentUser && userId) {
      checkIfFollowing(); // Only run if both currentUser and userId are available
    }
  }, [userId, currentUser]);

  // Follow/Unfollow functionality
  const handleFollowToggle = async () => {
    if (currentUser) {
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("userId", "==", currentUser.uid)); // Fetch the current user's document
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const currentUserDoc = querySnapshot.docs[0]; // Get the current user document
        const currentUserData = currentUserDoc.data();
        const followingArray = currentUserData.following || []; // Get current following array

        const batch = writeBatch(db); // Start a batch operation

        try {
          if (isFollowing) {
            // Unfollow logic: Remove the userId (viewed profile) from the current user's following array
            batch.update(currentUserDoc.ref, {
              following: arrayRemove(userId), // Remove the userId from following
            });
            setIsFollowing(false); // Update button text to "Follow"
          } else {
            // Follow logic: Add the userId (viewed profile) to the current user's following array
            batch.update(currentUserDoc.ref, {
              following: arrayUnion(userId), // Add the userId to following
            });
            setIsFollowing(true); // Update button text to "Unfollow"
          }

          console.log("Batch commit triggered...");
          await batch.commit(); // Commit the batch update
        } catch (error) {
          console.error("Error updating following array: ", error);
        }
      } else {
        console.log("Logged-in user not found in Firestore");
      }
    } else {
      console.log("No current user or profile data.");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1>Profile</h1>
      {user.profilePicture && (
        <div style={styles.profilePictureContainer}>
          <img
            src={user.profilePicture} // Render the profile icon
            alt="Profile"
            style={styles.profilePicture}
          />
        </div>
      )}
      <p><strong>Name:</strong> {`${user.firstName} ${user.lastName}` }</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Cellphone:</strong> {user.cellphone}</p>
      <p><strong>University:</strong> {user.university}</p>
  
      <div style={styles.buttonContainer}>
        <button onClick={handleFollowToggle} style={styles.followButton}>
          {isFollowing ? 'Unfollow' : 'Follow'} {/* Toggle between Follow/Unfollow */}
        </button>
  
        <button onClick={() => navigate('/listing')} style={styles.backButton}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
  
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '500px',
      margin: 'auto',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', // Center content horizontally
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%', // Ensure full width for the button container
      marginTop: '20px',
    },
    backButton: {
      backgroundColor: "grey",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    },
    followButton: {
      backgroundColor: "#8d04be",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    },
    profilePictureContainer: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    profilePicture: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
  };
  
export default ViewProfile;
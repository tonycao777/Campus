import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

const ViewProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      

      if (userId) {
        const usersRef = collection(db, "Users");
        const q = query(usersRef, where("userId", "==", userId)); 
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0]; 
          setUser(docSnap.data());
        } else {
          console.log("No user found!");
        }
      } else {
        console.log("No user is logged in.");
      }
    };

    fetchUserData();
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1>Profile</h1>
      <p><strong>Name:</strong> {`${user.firstName} ${user.lastName}` }</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Cellphone:</strong> {user.cellphone}</p>
      <p><strong>University:</strong> {user.university}</p>
      <button onClick={() => navigate('/listing')} style={styles.backButton}>
        Back to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: 'auto',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default ViewProfile;
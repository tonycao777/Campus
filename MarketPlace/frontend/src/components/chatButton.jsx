import React from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const ChatButton = ({ sellerId, item }) => {
  const navigate = useNavigate();

  const handleChat = async () => {
    if (!auth.currentUser) return alert('Please log in to start a chat.');

    const userId = auth.currentUser.uid;

    console.log('Current User:', auth.currentUser);
    console.log('Item:', item);
    // Check if chat already exists
    const chatsRef = collection(db, 'Chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      where('itemId', '==', item.id)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Navigate to existing chat
      const chatId = querySnapshot.docs[0].id;
      navigate(`/chat/${chatId}`);
    } else {
      // Create new chat
      const newChat = await addDoc(chatsRef, {
        participants: [userId, sellerId],
        itemId: item.id,
        itemName: item.title,
        messages: [],
        createdAt: Timestamp.now(),
      });

      // Navigate to new chat
      navigate(`/chat/${newChat.id}`);
    }
  };

  return (
    <button 
    onClick={handleChat}
  style={styles.chatButton}
  onMouseEnter={(e) => (e.target.style.filter = styles.buttonHover.filter)}
  onMouseLeave={(e) => (e.target.style.filter = "none")}
    >
      Chat with Seller
    </button>
  );

};

const styles = {
  chatButton: {
    padding: "12px 20px",
    backgroundColor: "#6f42c1", // Deep purple to match branding
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    width: "100%",
    maxWidth: "200px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    marginTop: "10px",
  },
  buttonHover: {
    filter: "brightness(1.2)", // Slightly brighter effect on hover
  },
}

export default ChatButton;
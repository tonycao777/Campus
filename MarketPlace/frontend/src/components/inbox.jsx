import React, { useEffect, useState } from "react";
import { auth, fetchUserFullName, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Inbox = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!auth.currentUser) return;

      try {
        const chatsRef = collection(db, "Chats");
        const q = query(chatsRef, where("participants", "array-contains", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        const chatData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const participantNames = await Promise.all(
              data.participants
                .filter((p) => p !== auth.currentUser.uid) // Exclude the current user
                .map(fetchUserFullName) // Fetch full names of other participants
            );

            // Check if there are unread messages for the current user
            const hasUnreadMessages = data.messages?.some(
              (message) =>
                message.receiverId === auth.currentUser.uid && !message.isRead
            );

            return { id: doc.id, ...data, participantNames, hasUnreadMessages };
          })
        );

        setChats(chatData);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const backToHome = () => {
    navigate('/listing');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Your Chats</h2>
      {loading ? (
        <p style={styles.loadingText}>Loading chats...</p>
      ) : (
        <div>
          {chats.length === 0 ? (
            <p style={styles.noChats}>No chats found.</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                style={{
                  ...styles.chatCard,
                  ...(chat.hasUnreadMessages ? styles.chatCardUnread : {}),
                }}
              >
                <p style={styles.chatInfo}>
                  <strong>Chat with:</strong> {chat.participantNames.join(", ")}
                </p>
                <p><strong>Item Name:</strong> {chat.itemName}</p>
                <p style={styles.chatInfo}>
                  <strong>Last Message:</strong>{" "}
                  {chat.messages && chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1].text
                    : "No messages yet"}
                </p>
                {chat.hasUnreadMessages && (
                  <p style={styles.unreadIndicator}>Unread Messages</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
      <button onClick={backToHome} style={styles.button}>
        Back to Home Page
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "2rem auto",
    padding: "1.5rem",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    color: "#8d04be",
    marginBottom: "1rem",
    fontSize: "1.8rem",
  },
  loadingText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#888",
  },
  noChats: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#888",
  },
  chatCard: {
    cursor: "pointer",
    marginBottom: "1rem",
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    transition: "all 0.3s ease",
  },
  chatCardUnread: {
    backgroundColor: "#e3f2fd", // Light blue background for unread chats
    border: "1px solid #42a5f5",
  },
  chatInfo: {
    marginBottom: "0.5rem",
    fontSize: "1.1rem",
    color: "#333",
  },
  unreadIndicator: {
    fontSize: "0.9rem",
    color: "#e53935",
    fontWeight: "bold",
  },
  button: {
    display: "block",
    width: "100%",
    padding: "1rem",
    backgroundColor: "#8d04be",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginTop: "2rem",
  },
};

export default Inbox;
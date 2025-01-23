import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth, fetchUserFullName } from "../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, Timestamp, writeBatch, arrayRemove } from "firebase/firestore";

const ChatThread = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChat = async () => {
      const chatDocRef = doc(db, "Chats", chatId);
      const chatDoc = await getDoc(chatDocRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setChat(chatData);

        const otherUserId = chatData.participants.find(
          (participantId) => participantId !== auth.currentUser.uid
        );

        if (otherUserId) {
          const name = await fetchUserFullName(otherUserId);
          setOtherUserName(name);
        }

        markMessagesAsRead(chatData);
      } else {
        alert("Chat not found");
        navigate("/inbox");
      }
    };

    fetchChat();
  }, [chatId, navigate]);

  const markMessagesAsRead = async (chatData) => {
    const chatDocRef = doc(db, "Chats", chatId);
    const batch = writeBatch(db);

    chatData.messages.forEach((msg) => {
      if (msg.senderId !== auth.currentUser.uid && !msg.isRead) {
        batch.update(chatDocRef, {
          messages: arrayRemove(msg),
        });

        batch.update(chatDocRef, {
          messages: arrayUnion({
            ...msg,
            isRead: true,
          }),
        });
      }
    });

    await batch.commit();
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessageId = `${auth.currentUser.uid}-${Timestamp.now().toMillis()}`;

    const newMessage = {
      messageId: newMessageId,
      senderId: auth.currentUser.uid,
      receiverId: getReceiverId(),
      text: message,
      timestamp: Timestamp.now(),
      isRead: false,
    };

    const chatDocRef = doc(db, "Chats", chatId);

    await updateDoc(chatDocRef, {
      messages: arrayUnion(newMessage),
    });

    setChat((prevChat) => ({
      ...prevChat,
      messages: [...prevChat.messages, newMessage],
    }));

    setMessage("");
  };

  const getReceiverId = () => {
    if (chat && chat.participants) {
      return chat.participants.find(
        (participantId) => participantId !== auth.currentUser.uid
      );
    }
    return null;
  };

  // Filter messages based on the search query
  const filteredMessages = chat?.messages.filter((msg) =>
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Chat Thread</h2>
      {chat && (
        <div>
          <div style={styles.chatHeader}>
            <h3 style={styles.chatWith}>Chat with: {otherUserName}</h3>
            {/* Search bar next to the name */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages"
              style={styles.searchInput}
            />
          </div>
          <div style={styles.chatBox}>
            {filteredMessages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  ...(msg.senderId === auth.currentUser.uid
                    ? styles.sent
                    : styles.received),
                }}
              >
                <p>
                  {msg.senderId === auth.currentUser.uid ? "You" : otherUserName}
                  : {msg.text}
                </p>
              </div>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message"
            style={styles.textarea}
          />
        </div>
      )}
      <button onClick={handleSendMessage} style={styles.button}>
        Send
      </button>
      <button onClick={() => navigate("/inbox")} style={styles.button}>
        Back to Inbox
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "1.5rem",
    border: "2px solid #8d04be",
    borderRadius: "12px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center",
    color: "#8d04be",
    marginBottom: "1rem",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  chatWith: {
    color: "#8d04be",
    marginBottom: "1rem",
  },
  searchInput: {
    padding: "0.5rem",
    fontSize: "0.9rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    width: "200px",
    marginLeft: "10px",
  },
  chatBox: {
    height: "300px",
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    backgroundColor: "#fff",
    marginBottom: "1rem",
  },
  message: {
    padding: "0.5rem 1rem",
    marginBottom: "0.5rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    alignSelf: "flex-start",
    textAlign: "left",
  },
  sent: {
    backgroundColor: "#e5d4f8",
    alignSelf: "flex-end",
    textAlign: "right",
  },
  received: {
    backgroundColor: "#d5f3ff",
    alignSelf: "flex-start",
    textAlign: "left",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    marginLeft: "-15px",
    fontSize: "1rem",
  },
  button: {
    padding: "0.75rem 1rem",
    backgroundColor: "#8d04be",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    marginRight: "0.5rem",
  },
};

export default ChatThread;
import React, { useEffect, useState } from 'react';
import { auth, fetchItems, deleteItem, fetchUserFullName, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Sidebar from './SideBar';




const ListingPage = () => {
const [items, setItems] = useState([]);
const [search, setSearch] = useState('');
const [filteredItems, setFilteredItems] = useState([]);
const [noResults, setNoResults] = useState(false);
const [category, setCategory] = useState('All Categories');
const [unreadCount, setUnreadCount] = useState(0);
const [userNames, setUserNames] = useState({});
const [allCampuses, setAllCampuses] = useState([]); // New state for campuses
const [selectedCampus, setSelectedCampus] = useState(''); // New state to track selected campus
const navigate = useNavigate();
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);




const predefinedCategories = [
  'All Categories',
  'Electronics',
  'Pet Supplies',
  'Clothing',
  'Books',
  'Entertainment',
  'Beauty and Health',
  'Sports and Outdoors',
  'Sporting Events',
  'Dorm Supplies',
];

useEffect(() => {
  // Fetch user campus from Firestore and set in local storage
  const fetchUserCampus = async () => {
    try {
      const userRef = collection(db, 'Users'); // Adjust the collection name
      const q = query(userRef, where('userId', '==', auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const campus = userData.university || ''; // Fallback to empty string
        setSelectedCampus(campus);
      }
    } catch (error) {
      console.error('Error fetching user campus:', error);
    }
  };

 if (auth.currentUser?.uid) {
    fetchUserCampus();
  }
}, []);


// Fetching all items from the database
const fetchAllItems = async () => {
  const fetchedItems = await fetchItems();
  const sortedItems = fetchedItems.sort((a, b) => {
    const timestampA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
    const timestampB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
    return timestampB - timestampA;
  });

  setItems(sortedItems);
  setFilteredItems(sortedItems);




  const uniqueUserIds = [...new Set(sortedItems.map((item) => item.userId))];
  const namePromises = uniqueUserIds.map(async (userId) => {
    const name = await fetchUserFullName(userId);
    return { userId, name };
  });




  const names = await Promise.all(namePromises);
  const nameMap = {};
  names.forEach(({ userId, name }) => {
    nameMap[userId] = name;
  });
  setUserNames(nameMap);
};


const handleViewDetails = (itemId) => {
 navigate(`/item/${itemId}`);
};




useEffect(() => {
  // Fetch all universities in the US
  const fetchUniversities = async () => {
      try {
          const response = await fetch('/world_universities_and_domains.json');
          const data = await response.json();
          const filteredUniversities = data.filter((university) => university.country === 'United States');
        
          setAllCampuses(filteredUniversities);
      } catch (error) {
          console.error("Error fetching universities:", error);
      }
  };




  fetchUniversities();
}, []);




useEffect(() => {
  fetchAllItems();
}, []);




 // Filter items based on search, category, and selected campus
 useEffect(() => {
   const lowercasedSearch = search.toLowerCase();
   const newFilteredItems = items.filter((item) => {
     const matchesSearch =
       item.title?.toLowerCase().includes(lowercasedSearch) ||
       item.category?.toLowerCase().includes(lowercasedSearch);
     const matchesCategory = category === 'All Categories' || item.category === category;
     const matchesCampus = !selectedCampus || item.campus === selectedCampus; // Filter by selected campus
     return matchesSearch && matchesCategory && matchesCampus;
   });
   setFilteredItems(newFilteredItems);
   setNoResults(newFilteredItems.length === 0);
 }, [search, category, selectedCampus, items]); // Add selectedCampus to dependencies




// Fetch unread messages count
const fetchUnreadMessagesCount = async (userId) => {
  const chatsRef = collection(db, 'Chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId)
  );




  const querySnapshot = await getDocs(q);
  let unreadCount = 0;




  querySnapshot.forEach((doc) => {
    const chat = doc.data();
    const unreadMessages = chat.messages.filter(
      (message) => message.isRead === false && message.receiverId === userId
    );
    unreadCount += unreadMessages.length;
  });




  return unreadCount;
};


useEffect(() => {
 const fetchMessages = async () => {
   if (auth.currentUser?.uid) {
     const count = await fetchUnreadMessagesCount(auth.currentUser.uid);
     setUnreadCount(count);
   }
 };
 fetchMessages();
}, []);




useEffect(() => {
 // Trigger notification if unread count changes
 if (unreadCount > 0) {
   new Notification('You have unread messages!', {
     body: `${unreadCount} unread message(s) in your inbox.`,
   });
 }
}, [unreadCount]);




const handlePostNewItem = () => {
  navigate('/post-item');
};




return (
  <div>
    <Navbar
      search={search}
      setSearch={setSearch}
      categories={predefinedCategories}
      category={category}
      setCategory={setCategory}
      unreadCount={unreadCount}
      allCampuses={allCampuses} // Pass filtered campuses to Navbar
      selectedCampus={selectedCampus}
      setSelectedCampus={setSelectedCampus} // Pass down selectedCampus and setSelectedCampus
    >
    </Navbar>

    <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ color: '#8d04be' }}>All Items</h1>




      <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>
        Logged in as: {auth.currentUser?.email}
      </p>




      <button
        onClick={handlePostNewItem}
        style={{
          width: '20%',
          padding: '10px',
          marginBottom: '15px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#8d04be',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        Post a New Item
      </button>




      {search && noResults && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>No items found matching your search.</p>
      )}




<div style={styles.container}>
 {filteredItems.map((item) => (
   <div key={item.id} style={styles.itemCard}>
     {item.images && item.images.length > 0 && (
        <img
          src={item.images[0]} // Display only the first image
          alt={item.title}
          style={styles.itemImage}
        />
      )}
     <div style={styles.itemDetails}>
       <h3>{item.title}</h3>
       <p>Price: ${item.price}</p>
       <p>Category: {item.category}</p>
       <p>
         Posted by:{' '}
         {item.userId === auth.currentUser?.uid
           ? 'You'
           : userNames[item.userId] || 'Loading...'}
       </p>
       <button
         onClick={() => handleViewDetails(item.id)}
           style={styles.detailsButton}>
            View Details
       </button>
   </div>
   </div>
 ))}
</div>
    </div>
  </div>
);
};
const styles = {
 itemCard: {
   display: 'flex',
   flexDirection: 'column',
   alignItems: 'center',
   padding: '15px',
   marginBottom: '15px',
   border: '1px solid #ccc',
   borderRadius: '8px',
   width: '300px',
   textAlign: 'center',
   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
   backgroundColor: '#fff',
 },
 itemImage: {
   width: '100%',
   height: 'auto',
   borderRadius: '8px',
   marginBottom: '10px',
 },
 itemDetails: {
   marginBottom: '10px',
 },
 detailsButton: {
   padding: '8px 15px',
   backgroundColor: '#8d04be',
   color: 'white',
   border: 'none',
   borderRadius: '5px',
   cursor: 'pointer',
   marginBottom: '10px',
 },
 buyButton: {
   padding: '8px 15px',
   backgroundColor: '#4CAF50',
   color: 'white',
   border: 'none',
   borderRadius: '5px',
   cursor: 'pointer',
   marginBottom: '10px',
 },
 deleteButton: {
   padding: '8px 15px',
   backgroundColor: 'red',
   color: 'white',
   border: 'none',
   borderRadius: '5px',
   cursor: 'pointer',
   marginTop: '10px',
 },
};


export default ListingPage;
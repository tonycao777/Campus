import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './SideBar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; // Adjust import based on your project

const Navbar = ({
  unreadCount,
  search,
  setSearch,
  categories,
  setCategory,
  category,
  allCampuses, // Receiving the allCampuses prop
  selectedCampus,
  setSelectedCampus, // Receiving setSelectedCampus prop
}) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const userRef = collection(db, 'Users');
        const q = query(userRef, where('userId', '==', auth.currentUser?.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setProfilePicture(userData.profilePicture || '');
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    if (auth.currentUser?.uid) {
      fetchProfilePicture();
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleClearSearch = () => setSearch(''); // Clear the search input

  const goToInbox = () => {
    navigate('/inbox'); // Redirect to the inbox page
  };

  const handleCampusChange = (event) => {
    const campus = event.target.value;
    setSelectedCampus(campus);
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.title}>Campus Market Place</div>
        <div style={styles.campusDropdownContainer}>
          <select
            value={selectedCampus}
            onChange={handleCampusChange}
            style={styles.campusDropdown}
          >
            <option value="">All Campuses</option>
            {allCampuses.map((campus) => (
              <option key={campus.name} value={campus.name}>
                {campus.name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.searchContainer}>
          <div>
            <select
              style={styles.categoryDropdown}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchBar}
          />
          {search && (
            <button onClick={handleClearSearch} style={styles.clearButton}>
              &times;
            </button>
          )}
        </div>
        <button onClick={goToInbox} style={styles.inboxButton}>
          Inbox
        </button>
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
        <button onClick={toggleSidebar} style={styles.profileButton}>
          Account
        </button>
        {profilePicture && (
          <img
            src={profilePicture}
            alt="Profile"
            style={styles.profilePicture}
          />
        )}
      </nav>

      {/* Conditionally render Sidebar with transition */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#8d04be',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  campusDropdownContainer: {
    position: 'absolute',
    right: '225px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
  },
  campusDropdown: {
    padding: '6px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
    width: '150px',
    cursor: 'pointer',
    marginLeft: '-200px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    margin: '0 20px',
  },
  searchBar: {
    width: '50%',
    padding: '8px',
    marginLeft: '200px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  clearButton: {
    position: 'relative',
    right: '25px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: 'black',
    cursor: 'pointer',
  },
  profileButton: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#8d04be',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '20px',
  },
  categoryDropdown: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '-200px',
    fontSize: '15px',
    marginLeft: '175px',
    width: 'auto',
    cursor: 'pointer',
  },
  inboxButton: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#8d04be',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '100px',
  },
  badge: {
    position: 'absolute',
    top: '5px',
    right: '118px',
    backgroundColor: 'red',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
  },
  profilePicture: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginLeft: '10px',
    objectFit: 'cover',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
  }
};

export default Navbar;
import React, { useEffect, useState } from 'react';
import { auth, fetchItems, deleteItem } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const ListingPage = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Fetch all items from the database
  const fetchAllItems = async () => {
    const fetchedItems = await fetchItems();
    setItems(fetchedItems);
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  // Delete an item by its ID
  const handleDeleteItem = async (id) => {
    await deleteItem(id);
    fetchAllItems();
  };

  // Update search term as user types
  const handleSearchChange = (e) => setSearch(e.target.value);

  // Filter items based on search term (case insensitive)
  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(search.toLowerCase()) // Make both the item title and search term lowercase
  );

  // Navigate to the post item page
  const handlePostNewItem = () => {
    navigate('/post-item');
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: 15, right: 15 }}>
        {`Logged in as: ${auth.currentUser?.email || 'Guest'}`}
      </div>
      <div style={{color:"#4A90E2"}}>
        <h1>All Items</h1>
      </div>
      
      <div style={{ width: '100%', maxWidth: '800px' }}>
        {filteredItems.map(item => (
          <div key={item.id} style={{ borderBottom: '1px solid #ccc', padding: '15px 0' }}>
            <h3>{item.title}</h3>
            <p><strong>Price:</strong> {item.price}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Posted by:</strong> {item.userId === auth.currentUser?.uid ? 'You' : 'Other User'}</p>
            {item.userId === auth.currentUser?.uid && (
              <button onClick={() => handleDeleteItem(item.id)} style={{ color: 'red' }}>Delete</button>
            )}
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={handleSearchChange}
        style={{ width: '50%', padding: '10px', marginTop: '20px' }}
      />

<button
  onClick={handlePostNewItem}
  style={{
    display: 'block',
    margin: '20px 0',
    padding: '10px 20px',
    backgroundColor: '#4A90E2', // Light blue color
    color: '#ffffff', // White text
    border: 'none', // Remove default border
    borderRadius: '8px', // Curved edges
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    fontSize: '16px', // Font size
    cursor: 'pointer', // Pointer cursor on hover
    transition: 'background-color 0.3s ease, transform 0.3s ease', // Smooth transition for hover effects
  }}
  onMouseEnter={e => e.target.style.backgroundColor = '#357ABD'} // Darker blue on hover
  onMouseLeave={e => e.target.style.backgroundColor = '#4A90E2'} // Revert to original color
>
  Post a New Item
</button>
    </div>
  );
};

export default ListingPage;
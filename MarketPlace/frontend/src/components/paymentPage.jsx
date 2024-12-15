import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatButton from './chatButton'; // Import the ChatButton component

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract item details passed via navigate state
  const { item } = location.state || {};

  if (!item) {
    return <p>No item selected for purchase.</p>;
  }

  const handleCompletePurchase = () => {
    alert(`Thank you for purchasing: ${item.title}`);
    navigate('/listing'); // Redirect back to listing after purchase
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Payment Page</h1>
      <h2>{item.title}</h2>
      <img
        src={item.image}
        alt={item.title}
        style={{ width: '150px', height: 'auto', marginBottom: '10px' }}
      />
      <p>Price: ${item.price}</p>
      {/* Add the ChatButton component with required props */}
      <ChatButton
        sellerId={item.userId} // Pass the sellerId of the item's seller
        item={item} // Pass the current item details
        style={{
          padding: '10px 20px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '10px',
        }}
      />
    </div>
  );
};

export default PaymentPage;
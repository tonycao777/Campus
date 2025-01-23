import React, { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ListingPage from './components/ListingPage';  // Import ListingPage component
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostItemPage from './components/PostItemPage';
import PaymentPage from './components/paymentPage'
import ChatThread from './components/chatThread';
import InboxPage from './components/inbox';
import ItemDetails from './components/itemDetails'
import EditItemPage from './components/editItemPage'
import ProfilePage from './components/ProfilePage';
import ViewProfile from './components/ViewProfile';

function App() {
    const [isSignInMode, setIsSignInMode] = useState(true);

    // Function to toggle between SignIn and SignUp components
    const toggleAuthMode = () => {
        setIsSignInMode((prevMode) => !prevMode);
    };

    useEffect(() => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);  // This will run only once when the component mounts

    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={isSignInMode ? <SignIn toggleAuthMode={toggleAuthMode} /> : <SignUp toggleAuthMode={toggleAuthMode} />} />
                    <Route path="/listing" element={<ListingPage />} /> 
                    <Route path= "/post-item" element ={<PostItemPage />}/>
                    <Route path= "/payment" element ={<PaymentPage />}/>
                    <Route path="/chat/:chatId" element={<ChatThread />} />
                    <Route path="/inbox" element={<InboxPage />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/edit-item/:id" element={<EditItemPage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/view-profile/:userId" element={<ViewProfile />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
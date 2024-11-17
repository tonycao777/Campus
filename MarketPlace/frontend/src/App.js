import React, { useState } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ListingPage from './components/ListingPage';  // Import ListingPage component
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostItemPage from './components/PostItemPage';

function App() {
    const [isSignInMode, setIsSignInMode] = useState(true);

    // Function to toggle between SignIn and SignUp components
    const toggleAuthMode = () => {
        setIsSignInMode((prevMode) => !prevMode);
    };

    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={isSignInMode ? <SignIn toggleAuthMode={toggleAuthMode} /> : <SignUp toggleAuthMode={toggleAuthMode} />} />
                    <Route path="/listing" element={<ListingPage />} /> 
                    <Route path= "/post-item" element ={<PostItemPage />}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
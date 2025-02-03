import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for routing
import '../styling/SignIn.css'; // Make sure to update this file for styling

const SignIn = ({ toggleAuthMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();  // Initialize useNavigate hook

    const handleSignIn = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if the email is verified
            if (!user.emailVerified) {
                setError('Please verify your email before signing in.');
                return;  // Stop execution if email is not verified
            }

            setSuccess('Sign in Successful');
            navigate('/listing');  // Redirect to the ListingPage after successful sign-in
        } catch (signInError) {
            console.log(signInError)
            if (signInError.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again later.');
            } else if (signInError.code === 'auth/user-not-found') {
                setError('User not found. Please Sign Up.');
            } else {
                setError('Error signing in. Please try again.');
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <div className="split-screen">
            <div className="left-panel">
                <h1>Welcome Back</h1>
                <h2 className="subheading">Please enter your details</h2>
                <form onSubmit={handleSignIn} className="sign-in-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="email"
                            value={email}
                            placeholder="john.doe@uni.edu"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                placeholder="Password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <FontAwesomeIcon
                                icon={showPassword ? faEye : faEyeSlash}
                                onClick={togglePasswordVisibility}
                                className="eye-icon"
                            />
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="sign-in-button">Sign In</button>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <p>
                        Don't have an account?{' '}
                        <span onClick={toggleAuthMode} className="sign-up-link">
                            Sign up here
                        </span>
                    </p>
                </form>
            </div>
            <div className="right-panel">
                <img src="/Copy-of-Campus.jpeg" alt="Sign in illustration" className="right-image" />
            </div>
        </div>
    );
};

export default SignIn;
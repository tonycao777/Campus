import React, { useState } from 'react';
import { auth, db, fetchUsers } from '../firebaseConfig'; // Import Firestore functions
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore'; // Add user to Firestore
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import '../styling/SignUp.css';

const SignUp = ({ toggleAuthMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate(); 

    const handleSignUp = async (event) => {
        event.preventDefault();
        setError(null); // Reset error message
        setSuccessMessage(''); // Reset success message

        // Basic email and password validation
        if (!email.endsWith('.edu')) {
            setError('Email must be an .edu address');
            return;
        }
        if (password.length <= 8) {
            setError('Password must be greater than 8 characters');
            return;
        }

        try {
            // Sign up the user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore under the Users collection
            await addDoc(collection(db, 'Users'), {
                email: user.email,
                createdAt: new Date().toISOString(),
            });

            // Optionally, update the local users array in the component
            fetchUsers(); // Refresh the users array

            // Display success message and redirect to login after a delay
            setSuccessMessage('Successfully signed up! Please log in.');
            setTimeout(() => {
                toggleAuthMode(); // Switch to sign-in mode
                navigate('/'); // Navigate to home or login page
            }, 500); // Delay to show the success message before redirecting

        } catch (signUpError) {
            setError(signUpError.message); // Display the error message
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword); // Toggle password visibility
    };

    return (
        <div className="login-page2">
            <h1>Welcome to Campus Market</h1>
            <h2 className="subheading2"> Please enter your details</h2>
            <form onSubmit={handleSignUp} className="login-form2">
                <div className="form-group2">
                    <label>Username </label>
                    <input
                        type="email"
                        value={email}
                        placeholder="john.doe@uni.edu"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group2">
                    <label>Password </label>
                    <div className="password-container2">
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
                <button type="submit" className="sign-in-button2">Sign Up</button>
            </form>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}
            <p>
                Already have an account?{' '}
                <span onClick={toggleAuthMode} className="sign-up-link2">
                    Sign in here
                </span>
            </p>
        </div>
    );
};

export default SignUp;
import React, { useState, useEffect } from 'react';
import { auth, db, fetchUsers } from '../firebaseConfig'; // Import Firestore functions
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Import sendEmailVerification
import { addDoc, collection } from 'firebase/firestore'; // Add user to Firestore
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import '../styling/SignUp.css';
import { storage } from '../firebaseConfig'; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary Firebase Storage functions

const SignUp = ({ toggleAuthMode }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        university: '',
        address: '',
        city: '',
        zip: '',
        state: '',
        cellphone: '',
    });

    const [universities, setUniversities] = useState([]);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate(); 

    const states = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
        'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
        'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
        'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
        'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
    ];

    useEffect(() => {
        // Fetch all universities in the US
        const fetchUniversities = async () => {
            try {
                const response = await fetch('/world_universities_and_domains.json');
                const data = await response.json();
                const filteredUniversities = data
                    .filter((university) => university.country === 'United States')
                    .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
    
                setUniversities(filteredUniversities);
            } catch (error) {
                console.error("Error fetching universities:", error);
            }
        };
    
        fetchUniversities();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            // Create a storage reference
            const storageRef = ref(storage, `profileImages/${file.name}`);
            
            // Upload the file
            try {
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
    
                // Save the download URL of the image
                setFormData((prevData) => ({
                    ...prevData,
                    profilePicture: downloadURL, // Store the URL of the image
                }));
            } catch (error) {
                setError("Error uploading profile picture: " + error.message);
            }
        }
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        setError(null); // Reset error message
        setSuccessMessage(''); // Reset success message
    
        const { email, password, firstName, lastName, university, address, city, zip, state, cellphone, profilePicture } = formData;
    
        if (!email.endsWith('.edu')) {
            setError('Please use a valid .edu email address.');
            return;
        }
        
        if (password.length <= 8) {
            setError('Password must be greater than 8 characters');
            return;
        }
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            await addDoc(collection(db, 'Users'), {
                userId: user.uid,
                email: user.email,
                firstName,
                lastName,
                university,
                address,
                city,
                zip,
                state,
                cellphone,
                profilePicture, // Include the profile picture URL
                createdAt: new Date().toISOString(),
                following: [],
            });
    
            fetchUsers(); // Optionally refresh users list
            await sendEmailVerification(user); // Send verification email
    
            setSuccessMessage('Successfully signed up! A verification email has been sent.');
            setTimeout(() => {
                toggleAuthMode(); // Switch to sign-in mode
                navigate('/'); // Navigate to home or login page
            }, 1000);
    
        } catch (signUpError) {
            setError(signUpError.message);
        }
    };
    

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <div className="login-page2">
            <div className='signUptitle'>
            <h1>Welcome to Campus Market</h1>
            </div>
            <h2 className="subheading2"> Please enter your details</h2>
            <form onSubmit={handleSignUp} className="login-form2">
                <div className="form-group2">
                    <label>First Name </label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        placeholder="First Name"
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group2">
                    <label>Last Name </label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        placeholder="Last Name"
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group2">
                    <label>University </label>
                    <select
                        name="university"
                        value={formData.university}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select University</option>
                        {universities.map((university, index) => (
                            <option key={index} value={university.name}>
                                {university.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group2">
                    <label>Email </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        placeholder="john.doe@uni.edu"
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group2">
                    <label>Password </label>
                    <div className="password-container2">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            placeholder="Password"
                            onChange={handleInputChange}
                            required
                        />
                        <FontAwesomeIcon
                            icon={showPassword ? faEye : faEyeSlash}
                            onClick={togglePasswordVisibility}
                            className="eye-icon"
                        />
                    </div>
                </div>
                <div className="form-group2">
                    <label>Address </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        placeholder="Street Address"
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group2">
                    <label>City </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        placeholder="City"
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group2">
                    <label>State</label>
                     <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                     >
                         <option value="">Select State</option>
                          {states.map((state, index) => (
                        <option key={index} value={state}>
                           {state}
                        </option>
                     ))}
                  </select>
                </div>
                <div className="form-group2">
                    <label>ZIP Code </label>
                    <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        placeholder="ZIP Code"
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group2">
                    <label>Cellphone Number </label>
                    <input
                        type="tel"
                        name="cellphone"
                        value={formData.cellphone}
                        placeholder="123-456-7890"
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group2">
                    <label>Profile Picture </label>
                     <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                />
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
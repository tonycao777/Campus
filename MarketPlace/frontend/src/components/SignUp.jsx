import React, { useState, useEffect } from 'react';
import { auth, db, fetchUsers } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styled, { keyframes } from 'styled-components';

// Reuse the same keyframes and styled components from SignIn
const pulse = keyframes`
  from {
    transform: scale(0.9);
    opacity: 1;
  }
  to {
    transform: scale(1.8);
    opacity: 0;
  }
`;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1448 0%, #2a1b6b 50%, #4527a0 100%);
  padding: 2rem;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 1px 8px rgba(0, 0, 0, 0.2),
    0 20px 40px rgba(69, 39, 160, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateZ(0);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: translateY(-10px) rotateX(2deg);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.2),
      0 15px 12px rgba(0, 0, 0, 0.15),
      0 30px 60px rgba(69, 39, 160, 0.25);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #6b46c1, #8b5cf6);
  }
`;

const Title = styled.h1`
  font-size: 28px;
  color: royalblue;
  font-weight: 600;
  letter-spacing: -1px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 30px;
  margin-bottom: 1rem;

  &::before, &::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 10%;
    background-color: royalblue;
  }

  &::before {
    width: 18px;
    height: 18px;
  }

  &::after {
    width: 18px;
    height: 18px;
    animation: ${pulse} 1s linear infinite;
  }
`;

const SubHeading = styled.h2`
  font-size:  1.1rem;
  color: rgba(88, 87, 87, 0.822);
  margin-bottom: 2rem;
  font-weight: 300;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
flex-direction: column;
  gap: 0.2 rem;
  padding-right: 1rem;
`;

const FormGroup = styled.div`
  
   display: flex;
flex-direction: row;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  
  display: block;
  display: flex;
flex-direction: column;
`;

const InputSpan = styled.span`
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.2rem;
  pointer-events: none;
  transition: all 0.2s ease-out;
  background: transparent;
`;

const Input = styled.input`
  width: 80%;
  padding: 12px 16px;
  border: 1px solid rgba(105, 105, 105, 0.397);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: white;

  &:focus {
    outline: none;
    border-color: royalblue;
    box-shadow: 0 0 0 2px rgba(65, 105, 225, 0.2);
  }
`;

const Input2 = styled.input`
  width: 145%;
  padding: 12px 16px;
  border: 1px solid rgba(105, 105, 105, 0.397);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  background: white;

  &:focus {
    outline: none;
    border-color: royalblue;
    box-shadow: 0 0 0 2px rgba(65, 105, 225, 0.2);
  }
`;

const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const EyeIcon = styled(FontAwesomeIcon)`
  position: absolute;
  right: 12px;
  top: 30%;
  transform: translateY(0%);
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  z-index: 1;

  &:hover {
    color: royalblue;
  }
`;

// Styled select component
const Select = styled.select`
  width: 80%;
  height: 90%
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 1rem;
  padding: 10px 10px 10px 10px;
    color: gray;
  cursor: pointer;
  
`;

const Button = styled.button`
  padding: 12px;
  background: linear-gradient(90deg, royalblue, #6b46c1);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(90deg, #4169e1,rgb(84, 56, 170));
    box-shadow: 0 8px 20px rgba(110, 92, 185, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  text-align: center;
  padding: 0.5rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 6px;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.p`
  color: #28a745;
  font-size: 0.875rem;
  text-align: center;
  padding: 0.5rem;
  background-color: rgba(40, 167, 69, 0.1);
  border-radius: 6px;
  margin-top: 0.5rem;
`;

const SignUpText = styled.p`
  text-align: center;
  color: rgba(88, 87, 87, 0.822);
  margin-top: 1.5rem;
  font-size: 14px;
`;

const SignUpLink = styled.span`
  color: royalblue;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

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
        profilePicture: '',
    });

    const [universities, setUniversities] = useState([]);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [focusedInput, setFocusedInput] = useState('');
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
        const fetchUniversities = async () => {
            try {
                const response = await fetch('/world_universities_and_domains.json');
                const data = await response.json();
                const filteredUniversities = data
                    .filter((university) => university.country === 'United States')
                    .sort((a, b) => a.name.localeCompare(b.name));
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
            const storageRef = ref(storage, `profileImages/${file.name}`);
            try {
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                setFormData((prevData) => ({
                    ...prevData,
                    profilePicture: downloadURL,
                }));
            } catch (error) {
                setError("Error uploading profile picture: " + error.message);
            }
        }
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage('');

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
                profilePicture,
                createdAt: new Date().toISOString(),
                following: [],
            });

            fetchUsers();
            await sendEmailVerification(user);

            setSuccessMessage('Successfully signed up! A verification email has been sent.');
            setTimeout(() => {
                toggleAuthMode();
                navigate('/');
            }, 1000);

        } catch (signUpError) {
            setError(signUpError.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleFocus = (inputName) => {
        setFocusedInput(inputName);
    };

    const handleBlur = () => {
        setFocusedInput('');
    };

    return (
        <Container>
            <Card>
                <Title>Welcome to Campus Market</Title>
                <SubHeading>Please enter your details</SubHeading>
                <Form onSubmit={handleSignUp}>
                    <FormGroup>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'firstName'} hasValue={formData.firstName}>
                                First Name
                            </InputSpan>
                            <Input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                placeholder="First Name"
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('firstName')}
                                onBlur={handleBlur}
                                required
                            />
                        </Label>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'lastName'} hasValue={formData.lastName}>
                                Last Name
                            </InputSpan>
                            <Input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                placeholder="Last Name"
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('lastName')}
                                onBlur={handleBlur}
                                required
                            />
                        </Label>
                    </FormGroup>
                    
                    <FormGroup>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'email'} hasValue={formData.email}>
                                Email
                            </InputSpan>
                            <Input2
                                type="email"
                                name="email"
                                value={formData.email}
                                placeholder="john.doe@uni.edu"
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('email')}
                                onBlur={handleBlur}
                                required
                            />
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'password'} hasValue={formData.password}>
                                Password
                            </InputSpan>
                            <PasswordContainer>
                                <Input2
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    placeholder="Password"
                                    onChange={handleInputChange}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={handleBlur}
                                    required
                                />
                                <EyeIcon
                                    icon={showPassword ? faEye : faEyeSlash}
                                    onClick={togglePasswordVisibility}
                                />
                            </PasswordContainer>
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'university'} hasValue={formData.university}>
                                University
                            </InputSpan>
                            <Select
                                name="university"
                                value={formData.university}
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('university')}
                                onBlur={handleBlur}
                                required
                            >
                                <option value="">Select University</option>
                                {universities.map((university, index) => (
                                    <option key={index} value={university.name}>
                                        {university.name}
                                    </option>
                                ))}
                            </Select>
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'address'} hasValue={formData.address}>
                                Address
                            </InputSpan>
                            <Input
                                type="text"
                                name="address"
                                value={formData.address}
                                placeholder="Street Address"
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('address')}
                                onBlur={handleBlur}
                                required
                            />
                        </Label>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'city'} hasValue={formData.city}>
                                City
                            </InputSpan>
                            <Input
                                type="text"
                                name="city"
                                value={formData.city}
                                placeholder="City"
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('city')}
                                onBlur={handleBlur}
                                required
                            />
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'state'} hasValue={formData.state}>
                                State
                            </InputSpan>
                            <Select
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('state')}
                                onBlur={handleBlur}
                                required
                            >
                                <option value="">Select State</option>
                                {states.map((state, index) => (
                                    <option key={index} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </Select>
                        </Label>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'zip'} hasValue={formData.zip}>
                                ZIP Code
                            </InputSpan>
                            <Input
                                type="text"
                                name="zip"
                                value={formData.zip}
                                placeholder="ZIP Code"
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('zip')}
                                onBlur={handleBlur}
                                required
                            />
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'cellphone'} hasValue={formData.cellphone}>
                                Cellphone Number
                            </InputSpan>
                            <Input
                                type="tel"
                                name="cellphone"
                                value={formData.cellphone}
                                placeholder="123-456-7890"
                                onChange={handleInputChange}
                                onFocus={() => handleFocus('cellphone')}
                                onBlur={handleBlur}
                                required
                            />
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <InputSpan isFocused={focusedInput === 'profilePicture'} hasValue={formData.profilePicture}>
                                Profile Picture
                            </InputSpan>
                            <Input
                                type="file"
                                name="profilePicture"
                                accept="image/*"
                                onChange={handleFileChange}
                                onFocus={() => handleFocus('profilePicture')}
                                onBlur={handleBlur}
                            />
                        </Label>
                    </FormGroup>
                    <Button type="submit">Sign Up</Button>
                    {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <SignUpText>
                        Already have an account?{' '}
                        <SignUpLink onClick={toggleAuthMode}>Sign in here</SignUpLink>
                    </SignUpText>
                </Form>
            </Card>
        </Container>
    );
};

export default SignUp;
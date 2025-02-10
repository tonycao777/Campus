import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

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
    left: 30%;
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
  font-size: 0.9rem;
  color: rgba(88, 87, 87, 0.822);
  margin-bottom: 2rem;
  font-weight: 300;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  position: relative;
  display: block;
`;

const InputSpan = styled.span`
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 0.9rem;
  pointer-events: none;
  transition: all 0.2s ease-out;
  background: transparent;
  padding: 0 5px;

  ${({ isFocused, hasValue }) => 
    (isFocused || hasValue) && `
    top: 0;
    transform: translateY(-50%) scale(0.8);
    color: royalblue;
    background: white;
    z-index: 1;
  `}
`;

const Input = styled.input`
  width: 100%;
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
  top: 65%;
  transform: translateY(-50%);
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  z-index: 1;

  &:hover {
    color: royalblue;
  }
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
    background: linear-gradient(90deg, #4169e1, #5f3dc4);
    box-shadow: 0 8px 20px rgba(65, 105, 225, 0.3);
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

const ForgotPasswordLink = styled.a`
  color: royalblue;
  cursor: pointer;
  font-size: 14px;
  text-align: right;
  display: block;
  margin-top: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #4169e1;
    text-decoration: underline;
  }
`;

const SignIn = ({ toggleAuthMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState('');
    const navigate = useNavigate();

    const handleFocus = (inputName) => {
        setFocusedInput(inputName);
    };

    const handleBlur = () => {
        setFocusedInput('');
    };

    const handleSignIn = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                setError('Please verify your email before signing in.');
                return;
            }

            setSuccess('Sign in Successful');
            navigate('/listing');
        } catch (signInError) {
            console.log(signInError);
            if (signInError.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
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
        <Container>
            <Card>
                <Title>Welcome Back</Title>
                <SubHeading>Please enter your details</SubHeading>
                <Form onSubmit={handleSignIn}>
                    <FormGroup>
                        <Label>
                        <InputSpan 
                            >
                                Email
                            </InputSpan>
                            <Input
                                type="email"
                                value={email}
                                placeholder="john.doe@uni.edu"
                                required
                                onFocus={() => handleFocus('email')}
                                onBlur={handleBlur}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            
                        </Label>
                    </FormGroup>
                    <FormGroup>
                        <Label>
                            <PasswordContainer>
                            <InputSpan 
                                >
                                    Password
                                </InputSpan>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    required
                                    onFocus={() => handleFocus('password')}
                                    placeholder="password"
                                    onBlur={handleBlur}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                               
                                <EyeIcon
                                    icon={showPassword ? faEye : faEyeSlash}
                                    onClick={togglePasswordVisibility}
                                />
                            </PasswordContainer>
                        </Label>
                        <ForgotPasswordLink>Forgot password?</ForgotPasswordLink>
                    </FormGroup>
                    <Button type="submit">Sign In</Button>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {success && <SuccessMessage>{success}</SuccessMessage>}
                    <SignUpText>
                        Don't have an account?{' '}
                        <SignUpLink onClick={toggleAuthMode}>
                            Sign up here
                        </SignUpLink>
                    </SignUpText>
                </Form>
            </Card>
        </Container>
    );
};

export default SignIn;
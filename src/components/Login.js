import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Input from "./Input";
import { FaArrowsRotate } from "react-icons/fa6";
import { useNavigationContext } from "../context/navigation";
import { useAuth } from '../context/auth';
import { useLoginMutation, useSignupMutation } from "../store";
import GoogleAuthButton from "./GoogleAuthButton";

const LoginFeature = () => {
    const [isSignUp, setIsSignUp] = useState(false);  // Default to login view
    const [opacity, setOpacity] = useState(false);
    const [localError, setLocalError] = useState(null);
    
    const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
    const [signup, { isLoading: isRegisterLoading, error: registerError }] = useSignupMutation();
    
    const { navigate } = useNavigationContext();
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        
        try {
            if (isSignUp) {
                // Handle Sign Up
                const userData = {
                    email: e.target.Email.value,
                    username: e.target.username.value,
                    password: e.target.password.value,
                };
                
                // Validate input fields
                if (!userData.email || !userData.username || !userData.password) {
                    setLocalError("All fields are required");
                    return;
                }
                
                // Validate email format
                const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email);
                if (!isValidEmail) {
                    setLocalError("Please enter a valid email address");
                    return;
                }
                
                // Validate password strength
                if (userData.password.length < 6) {
                    setLocalError("Password must be at least 6 characters long");
                    return;
                }
                
                // TEMPORARY: Create a mock user for testing
                // In production, this should be removed
                const mockUser = {
                    id: 'mock-id-' + Date.now(),
                    name: userData.username,
                    email: userData.email,
                    picture: null,
                    provider: 'email'
                };
                const mockToken = 'mock-token-' + Date.now();
                localStorage.setItem('authToken', mockToken);
                authLogin(mockUser);
                return;
                
                console.log('Attempting signup with:', { email: userData.email, username: userData.username });
                // Call signup mutation
                const result = await signup(userData).unwrap();
                console.log('Signup successful, result:', result);
                
                // Create user data object for AuthContext
                const authUser = {
                    id: result.user?.id || 'temp-id',
                    name: result.user?.username || userData.username,
                    email: userData.email,
                    picture: result.user?.picture || null,
                    provider: 'email'
                };
                
                // Store token and login via AuthContext
                localStorage.setItem('authToken', result.token);
                authLogin(authUser);
                
            } else {
                // Handle Login
                const userData = {
                    email: e.target.Email.value,
                    password: e.target.password.value,
                };
                
                // Validate input fields
                if (!userData.email || !userData.password) {
                    setLocalError("Email and password are required");
                    return;
                }
                
                // Validate email format
                const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email);
                if (!isValidEmail) {
                    setLocalError("Please enter a valid email address");
                    return;
                }
                
                // TEMPORARY: Email/password bypass for testing
                // In production, this should be removed
                if (userData.email === 'test@example.com' && userData.password === 'password123') {
                    const mockUser = {
                        id: 'mock-id-' + Date.now(),
                        name: 'Test User',
                        email: userData.email,
                        picture: null,
                        provider: 'email'
                    };
                    const mockToken = 'mock-token-' + Date.now();
                    localStorage.setItem('authToken', mockToken);
                    authLogin(mockUser);
                    return;
                }
                
                console.log('Attempting login with:', { email: userData.email });
                // Call login mutation
                const result = await login(userData).unwrap();
                console.log('Login successful, result:', result);
                
                // Create user data object for AuthContext
                const authUser = {
                    id: result.user?.id || 'temp-id',
                    name: result.user?.username || userData.email.split('@')[0],
                    email: userData.email,
                    picture: result.user?.picture || null,
                    provider: 'email'
                };
                
                // Store token and login via AuthContext
                localStorage.setItem('authToken', result.token);
                authLogin(authUser);
            }
        } catch (err) {
            console.error('Authentication failed:', err);
            // Handle different types of errors
            if (err.status === 'FETCH_ERROR') {
                setLocalError("Cannot connect to the server. Please check your internet connection or try again later.");
            } else if (err.status === 401) {
                setLocalError("Invalid email or password. Please try again.");
            } else {
                setLocalError(err.data?.message || "Authentication failed. Please check your credentials and try again.");
            }
        }
    };

    const InputsFields = [
        {
            name: "username",
            placeholder: "Username",
            minlength: 3,
            maxlength: 20,
            required: true,
            showOnLogin: false,
        },
        {
            name: "Email",
            placeholder: "Email",
            minlength: null,
            maxlength: null,
            required: true,
            showOnLogin: true,
        },
        {
            name: "password",
            placeholder: "Password",
            minlength: null,
            maxlength: null,
            required: true,
            showOnLogin: true,
            type: "password"
        },
    ];

    let ErrorsMap = new Map();
    let Inputs = InputsFields.map((data, i) => {
        const ErrorObject = ErrorsMap.get(data?.name);
        if (isSignUp || data.showOnLogin) {
            return (
                <Input key={i} data={data} ErrorObject={ErrorObject} />
            );
        }
        return null;
    }).filter(Boolean);

    const isLoading = isLoginLoading || isRegisterLoading;
    const error = localError || (loginError || registerError)?.data?.message;

    useEffect(() => {
        const opacityPause = setTimeout(() => {
            setOpacity(true)
        }, 1000);
        
        return () => {
            clearTimeout(opacityPause)
        }
    }, [])

    return (
        <div className={`flex flex-col justify-center items-center bg-white w-[42rem] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-lg transition-opacity duration-1000 ease-in-out ${opacity ? 'opacity-100' : 'opacity-0'}`}>
            <div className="p-6 text-[#3399ff] text-2xl font-semibold w-full text-center">
                {isSignUp ? "Create your account" : "Login to your account"}
            </div>
            
            {error && (
                <div className="p-2 text-red-500 text-sm font-medium bg-red-50 rounded-md mb-4 w-full max-w-md">
                    {error}
                </div>
            )}
            
            <form
                onSubmit={handleSubmit}
                className="flex flex-col justify-center items-center w-full max-w-md"
            >
                {Inputs}
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex justify-center items-center px-4 bg-[#3399ff] text-white rounded-md h-12 text-base font-semibold m-2 mt-8 outline-none w-full hover:bg-blue-600 transition-colors duration-300"
                >
                    {isLoading ? (
                        <AiOutlineLoading className="animate-spin text-2xl" />
                    ) : (
                        isSignUp ? 'Sign Up' : 'Sign In'
                    )}
                </button>
                
                <div className="flex justify-center items-center mt-4 w-full">
                    <span className="text-gray-600 mr-2">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[#3399ff] font-medium hover:underline"
                    >
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </div>
            </form>
            
            <div className="w-full max-w-md mt-6 flex flex-col items-center">
                <div className="w-full flex items-center justify-center my-4">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>
                <GoogleAuthButton 
                    buttonText={isSignUp ? "Sign up with Google" : "Sign in with Google"} 
                    className="w-full"
                />
            </div>
        </div>
    )
}

export default LoginFeature;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';

const Auth = () => {
    const [isActive, setIsActive] = useState(false);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ 
        username: '', 
        email: '', 
        password: '',
        role: 'BEGINNER' // Default role
    });
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "email": loginData.email,
                    "password": loginData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login. Please try again.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please login.');
                setIsActive(false); // Switch back to login form
            } else {
                alert(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-200 to-blue-100">
            <div className="relative w-[850px] h-[550px] bg-white m-5 rounded-3xl shadow-lg overflow-hidden">
                {/* Login Form Box - Only visible when not active */}
                <div className={`absolute w-1/2 h-full bg-white flex items-center text-gray-800 text-center p-10 z-10 transition-all duration-700 ease-in-out ${isActive ? 'opacity-0 pointer-events-none right-1/2' : 'opacity-100 right-0'}`}>
                    <form onSubmit={handleLoginSubmit} className="w-full">
                        <h1 className="text-4xl -mt-2.5 mb-0">Login</h1>
                        <div className="relative my-7">
                            <input 
                                type="email" 
                                placeholder="Email" 
                                required
                                value={loginData.email}
                                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                className="w-full py-3 px-5 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                            />
                            <i className='bx bxs-envelope absolute right-5 top-1/2 transform -translate-y-1/2 text-xl'></i>
                        </div>
                        <div className="relative my-7">
                            <input 
                                type="password" 
                                placeholder="Password" 
                                required
                                value={loginData.password}
                                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                className="w-full py-3 px-5 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                            />
                            <i className='bx bxs-lock-alt absolute right-5 top-1/2 transform -translate-y-1/2 text-xl'></i>
                        </div>
                        <div className="-mt-4 mb-4">
                            <a href="#" className="text-sm text-gray-800">Forgot Password?</a>
                        </div>
                        <button type="submit" className="w-full h-12 bg-blue-400 rounded-lg shadow-md border-none cursor-pointer text-base text-white font-semibold">Login</button>
                        <p className="text-sm my-4">or login with social platforms</p>
                        <div className="flex justify-center">
                            <a href="#" className="inline-flex p-2.5 border-2 border-gray-300 rounded-lg text-2xl text-gray-800 mx-2"><i className='bx bxl-google'></i></a>
                            <a href="#" className="inline-flex p-2.5 border-2 border-gray-300 rounded-lg text-2xl text-gray-800 mx-2"><i className='bx bxl-facebook'></i></a>
                            <a href="#" className="inline-flex p-2.5 border-2 border-gray-300 rounded-lg text-2xl text-gray-800 mx-2"><i className='bx bxl-github'></i></a>
                            <a href="#" className="inline-flex p-2.5 border-2 border-gray-300 rounded-lg text-2xl text-gray-800 mx-2"><i className='bx bxl-linkedin'></i></a>
                        </div>
                    </form>
                </div>

                {/* Register Form Box - Moved to LEFT side when active */}
                <div className={`absolute w-1/2 h-full bg-white flex items-center text-gray-800 text-center p-10 z-10 transition-all duration-700 ease-in-out ${isActive ? 'opacity-100 left-0' : 'opacity-0 pointer-events-none right-0'}`}>
                    <form onSubmit={handleRegisterSubmit} className="w-full">
                        <h1 className="text-4xl -mt-2.5 mb-0">Registration</h1>
                        <div className="relative my-7">
                            <input 
                                type="text" 
                                placeholder="Username" 
                                required
                                value={registerData.username}
                                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                className="w-full py-3 px-5 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                            />
                            <i className='bx bxs-user absolute right-5 top-1/2 transform -translate-y-1/2 text-xl'></i>
                        </div>
                        <div className="relative my-7">
                            <input 
                                type="email" 
                                placeholder="Email" 
                                required
                                value={registerData.email}
                                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                className="w-full py-3 px-5 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                            />
                            <i className='bx bxs-envelope absolute right-5 top-1/2 transform -translate-y-1/2 text-xl'></i>
                        </div>
                        <div className="relative my-7">
                            <input 
                                type="password" 
                                placeholder="Password" 
                                required
                                value={registerData.password}
                                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                className="w-full py-3 px-5 pr-12 bg-gray-100 rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                            />
                            <i className='bx bxs-lock-alt absolute right-5 top-1/2 transform -translate-y-1/2 text-xl'></i>
                        </div>
                        <button type="submit" className="w-full h-12 bg-blue-400 rounded-lg shadow-md border-none cursor-pointer text-base text-white font-semibold">Register</button>
                        <p className="text-sm my-4">or register with social platforms</p>
                        <div className="flex justify-center">
                            <a href="#" className="inline-flex p-2.5 border-2 border-gray-300 rounded-lg text-2xl text-gray-800 mx-2"><i className='bx bxl-google'></i></a>
                            <a href="#" className="inline-flex p-2.5 border-2 border-gray-300 rounded-lg text-2xl text-gray-800 mx-2"><i className='bx bxl-facebook'></i></a>
                            <a href="#" className="inline-flex p-2.5 border-2 border-gray-300 rounded-lg text-2xl text-gray-800 mx-2"><i className='bx bxl-github'></i></a>
                            <a href="#" className="inline-flex p-2.5 border-2 border-gray-300 rounded-lg text-2xl text-gray-800 mx-2"><i className='bx bxl-linkedin'></i></a>
                        </div>
                    </form>
                </div>

                {/* Toggle Box with sliding background - Updated for correct direction */}
                <div className="absolute w-full h-full">
                    {/* This creates the sliding blue background - Reversed for register view */}
                    <div className="absolute w-full h-full overflow-hidden">
                        <div className={`absolute bg-blue-400 w-[300%] h-full rounded-[150px] transition-all duration-[1.8s] ease-in-out transform ${isActive ? 'left-[calc(-50%+850px)]' : '-left-[250%]'}`}></div>
                    </div>

                    {/* Left panel - visible when not active */}
                    <div className={`absolute left-0 w-1/2 h-full text-white flex flex-col justify-center items-center z-20 transition-all duration-700 ease-in-out ${isActive ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}>
                        <h1 className="text-4xl">Hello, Welcome!</h1>
                        <p className="mb-5 text-sm">Don't have an account?</p>
                        <button 
                            className="w-40 h-[46px] bg-transparent border-2 border-white rounded-lg text-white font-semibold"
                            onClick={() => setIsActive(true)}
                        >
                            Register
                        </button>
                    </div>

                    {/* Right panel - visible when active */}
                    <div className={`absolute right-0 w-1/2 h-full text-white flex flex-col justify-center items-center z-20 transition-all duration-700 ease-in-out ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                        <h1 className="text-4xl">Welcome Back!</h1>
                        <p className="mb-5 text-sm">Already have an account?</p>
                        <button 
                            className="w-40 h-[46px] bg-transparent border-2 border-white rounded-lg text-white font-semibold"
                            onClick={() => setIsActive(false)}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

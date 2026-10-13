import React from 'react';
import { assets } from '../assets/assets';

const Login = () => {
  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col md:flex-row items-center justify-center p-6 md:p-12 lg:p-24 relative font-sans"
      style={{ backgroundImage: `url(${assets.bgImage})` }}
    >
      {/* Top Left Logo */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center">
        <img src={assets.logo} alt="pingup logo" className="h-8 md:h-10 w-auto" />
      </div>

      <div 
        className="w-full flex flex-col md:flex-row items-center justify-between gap-12 mt-16 md:mt-0"
        style={{ maxWidth: '1100px' }}
      >
        
        {/* Left Side: Hero Text & Social Proof */}
        <div className="w-full md:w-[55%] flex flex-col items-start">
          
          {/* Social Proof */}
          <div className="flex items-center gap-3.5 mb-5">
            <img 
              src={assets.group_users} 
              alt="User Avatars" 
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col justify-center">
              <div className="flex text-[#ff9c00] text-[15px] tracking-[0.15em] leading-none">
                ★★★★★
              </div>
              <span className="text-[13px] text-[#29226d] font-bold mt-1.5">Used by 12k+ developers</span>
            </div>
          </div>
          
          {/* Hero Heading - Adjusted to match exact Figma styling */}
          <h1 className="text-3xl md:text-6xl md:pb-2 font-bold bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">
          More than just friends truly connect
          </h1>
          
          {/* Hero Subtitle */}
          <p className="text-[1.1rem] md:text-[1.35rem] text-[#2c2474] font-medium leading-[1.4] mt-4 tracking-tight">
            connect with global community <br /> on pingup.
          </p>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-[400px] bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col mt-8 md:mt-0 overflow-hidden">
          
          {/* Card Body */}
          <div className="px-10 pt-12 pb-10 flex flex-col items-center">
            
            {/* Header */}
            <div className="text-center mb-10 w-full">
              <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Sign in to</h2>
              <p className="text-[13px] text-gray-500 mt-1.5 font-medium">Welcome back! Please sign in to continue</p>
            </div>

            {/* Form */}
            <form className="w-full flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-900 ml-1">Email address</label>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full text-[13px] text-gray-800 placeholder-gray-400 bg-transparent outline-none px-1 py-2 border-b border-transparent focus:border-gray-200 transition-colors"
                />
              </div>
              
              {/* Password Input */}
              <div className="flex flex-col gap-2 mt-1">
                <input 
                  type="password" 
                  placeholder="Password here" 
                  className="w-full text-[13px] text-gray-800 placeholder-gray-400 bg-transparent outline-none px-1 py-2 border-b border-transparent focus:border-gray-200 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full bg-[#363540] hover:bg-[#2a2932] transition-colors text-white rounded-[0.85rem] py-4 mt-3 text-[13px] font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                Continue
                <svg className="w-2.5 h-2.5 ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="bg-[#f9fafb] py-5 text-center border-t border-gray-100">
            <p className="text-[13px] text-gray-500 font-medium">
              Don't have an account? <a href="/signup" className="font-bold text-gray-900 hover:underline ml-1">Sign up</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { logo } from '../logo/images';
import '../css/splash.css';

const SplashScreen = () => {

    const navigate=useNavigate();

    useEffect(()=>{
        const timer= setTimeout(()=>{

            navigate('/home');

        },5000);
        return()=> clearTimeout(timer);

    },[navigate]);


  return (
    <div className="splash-container">

      <div className="logo-container">

            <img
            src={logo} 
            alt="Logo"
            className="splash-logo"
            />

            <h1 className="splash-title">Discover Your Next Favourite Meal</h1>
      
      </div>

    </div>
  )
}

export default SplashScreen
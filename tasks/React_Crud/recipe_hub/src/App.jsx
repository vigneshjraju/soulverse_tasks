import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from './assets/pages/HomePage';
import SplashScreen from './assets/components/SplashScreen';
import Details from './assets/pages/Details';


const App = () => {

  return (

    <Router>


        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/details/:id" element={<Details />} />


        </Routes>

        

    </Router>
    
  )
}

export default App
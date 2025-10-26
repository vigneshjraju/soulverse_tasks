import React,{ useEffect, useState }from 'react';
import { useNavigate } from "react-router-dom";
import { logo,middle } from "../logo/images.jsx";
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../css/homepage.css';
import '../css/App.css';




const HomePage = () => {

    const [meals, setMeals] = useState([]);
    const navigate = useNavigate();
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=')
            .then((res)=>res.json())
            .then((data)=>{
                setMeals(data.meals ? data.meals.slice(0,10) : []);
                setLoading(false);
            });
    },[]);

  return (

    <>

    <div className="body">

            <Header/>


            <div className="main-content">

                <div className="discover-section">

                    <img
                    src={middle}
                    alt="Meals"
                    className="discover-meals left" 
                    />


                    <h1>Discover Your Next Favourite Meal</h1>


                    <img
                    src={logo}
                    alt="Recipe Hub"
                    className="discover-logo"
                    />

                    <img
                    src={middle}
                    alt="Meals"
                    className="discover-meals right"
                    />

                </div>

                <div className="popular-section">

                        <h2>Popular Dishes</h2>

                        {loading ? (
                            
                            <p>Loading meals</p>

                        ):(

                        <div className="popular-list">

                            {meals.map((meal) => (

                                <div
                                className="popular-card"
                                key={meal.idMeal}
                                onClick={() => navigate(`/details/${meal.idMeal}`)}
                                >

                                    <img src={meal.strMealThumb} alt={meal.strMeal} />
                                    <div className="popular-title">{meal.strMeal}</div>
                                    <div className="popular-area">{meal.strCategory}</div>
                                
                                </div>
                            ))}

                        </div>
                        )}

                </div>

            </div>

            <Footer />

    </div>
    
    
    
    
    </>
  )
}

export default HomePage
import React , { useEffect, useState }from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { facebook,insta,pinterest } from '../logo/images'
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/details.css'
import '../css/App.css'

const Details = () => {

    const { id } = useParams();
    const [meal, setMeal] = useState(null);
    const [meals, setMeals] = useState([]);
    const [loading,setLoading]=useState(true);
    const navigate = useNavigate();

    useEffect(()=>{

        fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=')
            .then((res) => res.json())
            .then((data) =>{

                setMeals(data.meals ? data.meals.slice(0, 6) : []);
                setLoading(false);
            });

    },[]);

    useEffect(()=>{
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then((res) => res.json())
        .then((data) => {
            setMeal(data.meals[0]);
        });

    },[id]);

    if(!meal){
        return <p>Loading...</p>;
    }

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        if (ingredient) ingredients.push(ingredient);
    }


  return (

    <>

    <div className="body">

        <Header/>

            <div className="details-container">

                <h2 className="details-title">Recipe Details</h2>

                <div className="details-content">

                        <div className="details-image">

                            <img src={meal.strMealThumb} alt={meal.strMeal} />

                            <div className="basic-info">
                                <p><strong>Meal Name</strong> : {meal.strMeal}</p>
                                <p><strong>Category</strong> : {meal.strCategory}</p>
                                <p><strong>Area</strong> : {meal.strArea}</p>

                            </div>

                        </div>

                        <div className="details-info-box">

                            <h3>Instructions</h3>
                            <p>{meal.strInstructions}</p>

                            <h3>Ingredients</h3>
                            <ul>
                                {ingredients.map((ing, index) => (
                                <li key={index}>{ing}</li>
                                ))}
                            </ul>

                            <h3>Youtube</h3>

                            <div className="youtube-video">
                                <iframe
                                    width="100%"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${meal.strYoutube.split('v=')[1]}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            <h3>Share this recipe</h3>
                                <div className="social-icons">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meal.strYoutube)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <img src={facebook} alt="Facebook" />
                                </a>

                                <a
                                    href={`https://www.instagram.com/?url=${encodeURIComponent(meal.strYoutube)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <img src={insta} alt="Instagram" />
                                </a>

                                <a
                                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(meal.strYoutube)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <img src={pinterest} alt="Pinterest" />
                                </a>
                                </div>


                        </div>

                </div>

            </div>

            <div className="recommended-section">

                        <h2>Popular Dishes</h2>

                        {loading ? (
                        
                        <p>Loading meals</p>

                        ):(

                        <div className="recommended-list">

                            {meals.map((meal) => (

                                <div
                                className="recommended-card"
                                key={meal.idMeal}
                                onClick={() => navigate(`/details/${meal.idMeal}`)}
                                >

                                    <img src={meal.strMealThumb} alt={meal.strMeal} />
                                    <div className="recommended-title">{meal.strMeal}</div>
                                    <div className="recommended-area">{meal.strCategory}</div>
                                
                                </div>
                            ))}

                        </div>
                        )}

            </div>

            <Footer />

        </div>

    </>





  )
}

export default Details
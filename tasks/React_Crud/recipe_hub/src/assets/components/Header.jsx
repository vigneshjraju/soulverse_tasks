import React from 'react'
import { useState } from 'react';
import { animation } from '../logo/images';
import {useNavigate,Link} from 'react-router-dom';
import '../css/header.css';

const Header = () => {

    const[search,setSearch]=useState('');
    const navigate=useNavigate();

    const handleSearch=async(e)=>{
        e.preventDefault();

        if(!search.trim()){
            return;
        }

        try{
            let apiUrl='';

            if(!isNaN(search)){
                apiUrl=`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${search}`

            }
            else{
                apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`;
            }

            const res=await fetch(apiUrl);
            const data=await res.json();

            if(data.meals && data.meals.length>0){
                const meal=data.meals[0];
                navigate(`/details/${meal.idMeal}`);
            }

            else{
                alert('No Recipe Found' );
            }


        }

        catch (error){
            console.error('Search Error:',error);
            alert('Try again, Failed to search');
            
        }


        setSearch('');

    }



  return (

    <>
    <header className='header'>

            <div className='animation'>

                <Link to="/">
                        <img src={animation} alt="Animation" style={{height:'80px', margin: '0 20px'}} />
                </Link>

            </div>

            <div className='search'>

                <div className='description'>Let us help you find your perfect meal.</div>

                <form className='bar' onSubmit={handleSearch}>

                    <input type="text" placeholder='Search'
                    value={search} onChange={(e)=> setSearch(e.target.value)}
                    className='input'/>

                    <button type='submit'>

                        <span role='img'>🔍</span>

                    </button>


                </form>


            </div>

    </header>

    
    </>

  )
}

export default Header
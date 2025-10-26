import React from 'react'
import '../css/footer.css'
import { logo } from '../logo/images'

const Footer = () => {
  return (
    <footer className='footer'>

        <img src={logo} alt="Recipe Hub" className="footer-logo" />

        <div> &copy;2025 Recipe Hub</div>
        <div>Discover Your Next Favourite Meal</div>



    </footer>
  )
}

export default Footer
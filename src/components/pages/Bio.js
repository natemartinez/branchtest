import React, { useState } from 'react';
import '../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
// Placed hp here to display combat changes inside HUD

  const Menu = () => {
  // Controls menu appearing and disappearing
    const [isVisible, setIsVisible] = useState(false);
    
    const menuAppear = () => {
      setIsVisible(true);
    };
    const menuHide = () => {
      setIsVisible(false);
    };
    
    return (
    <div>
      <div className='open-menu-div'>
         <button onClick={menuAppear} className='open-menu-btn'>Open Menu</button>
      </div>
      {isVisible && ( 
         <div className='main-menu'>
           <div className='menu-div'>
             <Link to={'/bio'}>Bio</Link>
           </div>
           <div className='menu-div'>
             <a href="pages/inventory.php">Inventory</a>
           </div>
           <div className='menu-div'>
             <a href="pages/skills.php">Skills</a>
           </div>                
           <div className='menu-div'>
             <a href="pages/goals.php">Goals</a>
           </div>                           
           <div className='menu-div'>
            <button onClick={menuHide} className='close-menu-btn'>Close Menu</button>
           </div>                           
         </div>
      )}
    </div>
    );
  };

 const Bio = () => {
   return (
    <div>
      <Menu/>
    </div>
   );
 }

export default Bio;
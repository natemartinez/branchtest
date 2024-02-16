import React, { useState } from 'react';
import '../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import {useLocation} from 'react-router-dom';
const images = require.context('../../../public/images', true);
// Placed hp here to display combat changes inside HUD

  const Items = (player) => {
    //receive items from DB
    // but for now, make a mock array for items
    const [items, setItems] = useState(['medkit', 'jacket', 'stick', 'dice']);
    // iterate and display items
   // console.log(player)

      return (
        <>
          <div className='inv-grid'>
            {items.map((element, index ) => (
              <div key={index} className='item'>
               <h2 key={index}>{element}</h2> 
              </div>       
             ))}
          </div>
        </>
      )
  };

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
           <Link to={'#'}>Inventory</Link>
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

 const Inventory = () => {
  const location = useLocation();
  let currentUser = location.state.username;
  
   return (
    <>
      <div className='inv-top'>
         <Link to={'/main'} state={{username:currentUser}}><img className='back-arrow' src={images(`./back-arrow.png`)}></img></Link>    
        <h2>Inventory</h2>
      </div>
      <Items player={currentUser}/>
      <Menu/>
    </>
   );
 }

export default Inventory;
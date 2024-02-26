import React, { useState } from 'react';
import '../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Link } from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import serverUrl from '../Config';
const images = require.context('../../../public/images', true);
// Placed hp here to display combat changes inside HUD
  const Info = ({ playerName }) => {
    // search in DB for player's info
    // show name, traits, stats, 

    const testData = [
      { bgcolor: "#6a1b9a", completed: 60 },
      { bgcolor: "#00695c", completed: 30 },
      { bgcolor: "#ef6c00", completed: 53 },
    ];

    return (
      <>
        <div>
         {testData.map((item, index) => (
         <ProgressBar key={index} bgcolor={item.bgcolor} now={item.completed} />
         ))
         }
        </div>
      </>
    )
  };

  const Menu = ({playerName}) => {  
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
             <Link to={'/bio'} onClick={() => menuHide()} state={{username:playerName}}>Bio</Link>
           </div>
           <div className='menu-div'>
             <Link to={'/inventory'} state={{username:playerName}}>Inventory</Link>
           </div>
           <div className='menu-div'>
             <Link to={'/skills'} state={{username:playerName}}>Skills</Link>
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
    const location = useLocation();
    let currentUser = location.state.username;
   return (
    <div>
      <div className='bio-top'>
         <Link to={'/main'} state={{username:currentUser}}><img className='back-arrow' src={images(`./back-arrow.png`)}></img></Link>    
        <h2>Bio</h2>
      </div>
      <Info playerName={currentUser} />
      <Menu playerName={currentUser}/>
    </div>
   );
 }

export default Bio;
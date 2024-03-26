import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Link } from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import serverUrl from '../config';
const images = require.context('../../../public/images', true);

  const Info = ({ playerName }) => {
    // search in DB for player's info
    // show name, traits, stats, 
    // eventually I want to show archetype based on choices
    const [stats, setStats] = useState([]);
    const [personality, setPersonality] = useState([]);

   /* const testData = [
      { bgcolor: "#6a1b9a", completed: 60 },
      { bgcolor: "#00695c", completed: 30 },
      { bgcolor: "#ef6c00", completed: 53 },
    ]; */

    const getData = (username) => {

      let userInfo = {
        username:username
      };

      axios.post(serverUrl + '/receiveStatus', userInfo)
       .then(response => { 
        const userData = response.data.doc;
        setPersonality(userData.personality);
        setStats(userData.stats)
        console.log(userData.status);
       })
       .catch(error => {
       console.error('Error:', error);
       });  
    }

  
    useEffect(() => {
      getData(playerName)
    }, []);


    return ( 
      <>
        <header className='bio-header-wrapper'>
         <h2 id='bio-header'>Your Archetype:</h2>
        </header>
        
        <section id='type-section'>
          {personality.map((trait, index) => (
           <div id={trait} key={index} className='archetype-div'>    
             <img className='archetype-img' src={images(`./${trait}.png`)}></img>
             <h2>{trait}</h2>
           </div>
           ))
          }
        </section>
        <section id='stat-section'>
        {Object.keys(stats).map(category => (
         <div id={category} className='stat-div' key={category}>
          <div>
            <img className='stat-bkgrd' alt="icon"></img>
            <h2>{category}</h2>
            <ul>
             {Object.entries(stats[category]).map(([trait, value]) => (
             <li key={trait}>
              {trait}: {value}
             </li>
             ))}
            </ul>
          </div>
       </div> ))} 
        </section>
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
    let username = location.state.username;
   return (
    <div>
      <div className='bio-top'>
         <Link to={'/main'} state={{name:username}}><img className='back-arrow' src={images(`./back-arrow.png`)}></img></Link>    
        <h2>Bio</h2>
      </div>
      <Info playerName={username} />
      <Menu playerName={username}/>
    </div>
   );
 }

export default Bio;
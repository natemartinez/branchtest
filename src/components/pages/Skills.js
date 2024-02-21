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
    // This component is where skills are activated and grown
    const [skills, setSkills] = useState([]);

    let userInfo = {
      username: playerName
    };

    const getSkills = () => {
     axios.post(serverUrl + '/buildSkills', userInfo)
      .then(response => { 
       let userSkills = response.data.doc.stats;
       setSkills(userSkills);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    };
    
    useEffect(() => {
      getSkills(skills)
    }, [])
  
    return (
      <>
      <div id='skill-sec'>
        <div className='skill-div' id='phys-div'>
           <img className='skill-bkgrd' src={images(`./Physical.png`)} alt="icon"></img>
           <h2>Physical</h2>
           <div className='skill-boxes'>
             <div className='phys-box'>
              
             </div>
           </div>
        </div>
        <div className='skill-div' id='ment-div'>
           <img className='skill-bkgrd' src={images(`./Mental.png`)} alt="icon"></img>
           <h2>Mental</h2>
        </div>
        <div className='skill-div' id='soul-div'>
           <img className='skill-bkgrd' src={images(`./Soul.png`)} alt="icon"></img>
           <h2>Soul</h2>
        </div>
        <div className='skill-div' id='exp-div'>
           <img className='skill-bkgrd' src={images(`./Expression.png`)} alt="icon"></img>
           <h2>Expression</h2>
        </div>
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
             <Link onClick={() => menuHide()} state={{username:playerName}}>Skills</Link>
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

 const Skills = () => {
    const location = useLocation();
    let currentUser = location.state.username;
    
   return (
    <div>
      <div className='bio-top'>
         <Link to={'/main'} state={{username:currentUser}}><img className='back-arrow' src={images(`./back-arrow.png`)}></img></Link>    
        <h2>Skills</h2>
      </div>
      <Info playerName={currentUser} />
      <Menu playerName={currentUser}/>
    </div>
   );
 }

export default Skills;
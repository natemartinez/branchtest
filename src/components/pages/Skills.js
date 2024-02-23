import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import serverUrl from '../config';
const images = require.context('../../../public/images', true);


  const Info = ({ playerName }) => {
    // This component is where skills are activated and grown
    const [playerLevel, setPlayerLevel] = useState(null);
    const [curEXP, setCurEXP] = useState(null);
    const [levelCap, setLevelCap] = useState(null);
    const [skills, setSkills] = useState([]);

    // Check DB for skills that player has
    // then get it into 'active' state
    // all elements with active state will have their class name
    // changed to 'active']

    const userInfo = {
      username: playerName
    };

    const getSkills = () => {
     axios.post(serverUrl + '/buildSkills', userInfo)
      .then(response => { 
       let userSkills = response.data.doc.skills;
       let skillNameArr = [];
       for(let i = 0; i < userSkills.length; i++){
        skillNameArr.push(userSkills[i].name);
       };
       setSkills(skillNameArr);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    };

    const getCurEXP = () => {
     axios.post(serverUrl + '/buildSkills', userInfo)
      .then(response => { 
       let curEXP = response.data.doc.status.level;
       setPlayerLevel(curEXP.num);
       setCurEXP(curEXP.exp);
       setLevelCap(curEXP.cap);
      })
      .catch(error => {
      console.error('Error:', error);
      });
    };

    const makeSkillsActive = (activeSkills) => {
      document.querySelectorAll('.phys-box').forEach(function(element){
        for(let i=0; i<activeSkills.length;i++){
          if(activeSkills == element.id){
            element.className = 'phys-box active';
          }else{
            console.log('not a match')
          }
        };
      });
    };

    useEffect(() => {
      getSkills(); 
      getCurEXP();
    }, [])

    useEffect(() => {
      makeSkillsActive(skills);
    }, [skills]);

    return (
      <>
      <div className='level-div'>
        <div id='level-info'>
            <h2>Level: </h2>
            <h2>{playerLevel}</h2>
          </div>
        <div id='num-div'>   
          <h2>XP: </h2>
          <h3>{curEXP} / {levelCap}</h3>
        </div>
        
        <ProgressBar id='level-bar' max={levelCap} now={curEXP} />
      </div>
      <div id='skill-sec'>
        <div className='skill-div' id='phys-div'>
           <img className='skill-bkgrd' src={images(`./Physical.png`)} alt="icon"></img>
           <h2>Physical</h2>
           <div className='skill-boxes'>
             <div className='phys-box inactive' id='dodge'>
               <img src={images('./dodge.png')} className='phys-img'></img>
               <h3>Dodge</h3>
             </div>
             <div className='phys-box inactive'>
               <img src={images('./twoHands.png')} className='phys-img'></img>
               <h3>Two-Handed</h3>
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
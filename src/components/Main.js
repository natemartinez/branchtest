import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ProgressBar from 'react-bootstrap/ProgressBar';
import {useLocation} from 'react-router-dom';
import Combat from './Combat';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import serverUrl from './config';

// Placed hp here to display combat changes inside HUD
 const Game = ({playerName}) => {
  // count receives level number from player info
  const [stageType, setStageType] = useState(null);
  const [intro, setIntro] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showResultEvent, setShowResultEvent] = useState(false);
  const [options, setOptions] = useState([]);
  const [curStage, setCurStage] = useState('');
  const [curText, setCurText] = useState('');
  const [healthBar, setHealthBar] = useState(null);

  const buttons = document.querySelectorAll('.game-btn-clicked');

  const setHealth = (health) => {
    setHealthBar(health);
  };

  const getHealth = async(username) => {

    let userInfo = {
      username:username
    };

    axios.post(serverUrl + '/receiveStatus', userInfo)
      .then(response => { 
        let hpData = response.data.doc.status;
        setHealth(hpData.health)
      })
      .catch(error => {
       console.error('Error:', error);
      });
  };

  useEffect(() => {
    getHealth(playerName);
  }, []);


  const setInactive = (event) => {
   // sets the specific button chosen as a clicked class
    event.target.className = 'game-btn-clicked';
  };

  const displayOptions = (type, options, level) => {
    let optionNames = [];
    setStageType(type);

    if(type === 'location'){
      for(let i=0; i < options.length; i++){
        let optionObj = {
         "name" : options[i].name,
         "result" : options[i].result,
        }
        optionNames.push(optionObj);
      }
    } else if(type === 'combat'){
      setCurStage(level);
    } else if(type === 'search') {
      setCurStage(level);
      for(let i=0; i < options.length; i++){
        let optionObj = {
         "name" : options[i].name,
         "diff" : options[i].probability,
         "result" : options[i].result,
        }
        optionNames.push(optionObj);
      }
    }
    setOptions(optionNames);
  };

  const itemAdd = (item, playerName) => {
    const itemInfo = {
      username:playerName,
      itemName:item
    };

    axios.post(serverUrl + '/itemSearch', itemInfo)
      .then(response => { 
        let item = response.data;
        console.log(item);
      })
      .catch(error => {
       console.error('Error:', error);
      });
  };

  const triggerResult = (currentUser, result, prob) => {

     if(stageType === 'location'){
       setCurStage(result);
     } else if(stageType === 'search'){
       let outcome = Math.floor(Math.random() * 100);
       const decideOutcome = (outcome) => {
        if (prob === 'easy'){
        if(outcome < 90){
         setShowResult('Success');
         setShowResultEvent('You have received a ' + result);
         itemAdd(result, currentUser);
        // activate function that searches for result in DB
        // and sends to player's inventory
        } else {
         setShowResult('Fail');
         setShowResultEvent('You have received nothing');
        }
        } else if (prob === 'hard'){
        if(outcome > 90){
         setShowResult('Success' );
         setShowResultEvent('You have received a ' + result);
         itemAdd(result, currentUser);
        } else {
         setShowResult('Fail');
         setShowResultEvent('You have received nothing');
        }
        } else {
        if(outcome > 50){
         setShowResult('Success');
         setShowResultEvent('You have received a ' + result);
         itemAdd(result, currentUser);
        } else {
         setShowResult('Fail');
         setShowResultEvent('You have received nothing');
        }
        }
       };

       decideOutcome(outcome);
     }
  
  };

  async function buildAttacks(currentUser) {
    // This function will return the currentStage data
    // which will send to Levels to iterate over it
    let userInfo = {
      username:currentUser
    };

     axios.post(serverUrl + '/buildAttacks', userInfo)
      .then(response => { 
        let skills = response.data.doc;
        console.log(skills)
      })
      .catch(error => {
       console.error('Error:', error);
      });
  };

  async function getLevel(currentUser) {
    // This function will return the currentStage data
    // which will send to Levels to iterate over it
     let userInfo = {
      username: currentUser
     };

     axios.post(serverUrl + '/currentStage', userInfo)
      .then(response => { 
        let options = response.data.options;
        let type = response.data.stageType;
        let curLevel = response.data.curStage;
        let curText = response.data.curStageText;
        if(curLevel === 1.1){
          setIntro(true)
        }
        setCurText(curText);
        setStageType(type);
        displayOptions(type, options, curLevel);
      })
      .catch(error => {
       console.error('Error:', error);
      });
  };

  const nextLevel = (currentUser, level, type) => { 
      buttons.forEach((button) => {
        button.className = 'game-btn';
      });

      let stageInfo = {
        username: currentUser,
        level: level,
        type: type
      };

      axios.post(serverUrl + '/stageChange', stageInfo)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
       console.error('Error:', error);
      });

     getLevel(currentUser);
  }

  const endIntro = (bool) => {
    setIntro(bool)
  };

  useEffect(() => {
    buildAttacks(playerName);
    getLevel(playerName);
  }, []);

  useEffect(() => {
  }, [stageType]);


  return (
    <div> 
      {!intro ? (
        <>
         <div className='HUD'>
         <h2>{playerName}</h2>
         <h3 id='level-num'>Level: {curStage}</h3>
         <ProgressBar variant='danger' max={100} now={healthBar} label='HP' className='health-bar'/>
         </div>
         <div className='game-text'>
          <p>{curText}</p>
         </div>  
         <div className='game-options'>
        {(stageType === 'combat') ? <Combat level={curStage} username={playerName} playerHealth={setHealth}/> : 
        <div className='option-container'> 
         {options.map((option, index) => (
          <div key={index}>
            <button 
              onClick={(event) => {setInactive(event); triggerResult(playerName, option.result, option.diff)}}
              className='game-btn' id={option.diff} type="submit">
              {option.name}
            </button>
          </div>  
         ))}
         {showResult && (
         <div className='result-div'>
         <div className='result-info'>
           <h1>{showResult}</h1>
           <h3>{showResultEvent}</h3>
           <button id='result-btn' onClick = {() => setShowResult(false)}type="submit">Continue</button>
         </div> 
         </div>
         )}
         <button onClick={() => nextLevel(playerName, curStage, stageType)} id='next-btn'>Next</button>
        </div>
        }
         </div>
        </> 
      ) 
        : (
       <div className='intro'>
        <h1>TUTORIAL</h1>
        <button onClick={endIntro(false)} type="submit"></button>
       </div>
       )}   
    </div>
  );

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
            <Link to={'/bio'} state={{username:playerName}}>Bio</Link>
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

 const Main = () => {
  const location = useLocation();
  let currentUser = location.state.username;
   return (
    <div>
      <Game playerName={currentUser}/>
      <Menu playerName={currentUser}/>
    </div>
   );
 }

export default Main;
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ProgressBar from 'react-bootstrap/ProgressBar';
import {useLocation} from 'react-router-dom';
import Combat from './Combat';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import serverUrl from './Config';
const images = require.context('../../public/images', true);

// Placed hp here to display combat changes inside HUD
 const Game = ({playerName}) => {
  // count receives level number from player info
  const [stageType, setStageType] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showResultEvent, setShowResultEvent] = useState(false);
  const [options, setOptions] = useState([]);
  const [curStage, setCurStage] = useState(null);
  const [showText, setShowText] = useState(null);
  const [curText, setCurText] = useState('');
  const [healthBar, setHealthBar] = useState(null);
  const [isSelected, setIsSelected] = useState([]);

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

  const setInactive = (event, username, curStage) => {
   // sets the specific button chosen as a clicked class
   // look into player's progress and find the choices that
   event.target.className = 'game-btn-clicked';

   let selectedChoices = [...isSelected];
   selectedChoices.push(event.target.innerText);
   setIsSelected(selectedChoices);

    let choicesObj = {
      username:username,
      choices: selectedChoices,
      stage: curStage
    };

    axios.post(serverUrl + '/setInactive', choicesObj)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
       console.error('Error:', error);
      });


  };
  const sendOptions = (options, username) => {
   let optionObj = {
    choices: options,
    username:username
   };

    axios.post(serverUrl + '/startInactive', optionObj)
      .then(response => {
        setOptions(response.data);
      })
      .catch(error => {
       console.error('Error:', error);
      });
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
         "difficulty" : options[i].difficulty,
         "result" : options[i].result,
         "class" : options[i].class
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

  const levelUpdate = (exp, playerName, health) => {
    const itemInfo = {
      username:playerName,
      expUpdate:exp,
      health:health
    };
    axios.post(serverUrl + '/levelUpdate', itemInfo)
      .then(response => { 
        let messageUpdate = response.data;
        console.log(messageUpdate);
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
         setShowResultEvent('You have received a ' + result.item);
         itemAdd(result.item, currentUser);
         levelUpdate(result.xp, currentUser, healthBar);
        } else {
         setShowResult('Fail');
         setShowResultEvent('You have received nothing');
        }
        } else if (prob === 'hard'){
        if(outcome > 90){
         setShowResult('Success' );
         setShowResultEvent('You have received a ' + result.item);
         itemAdd(result.item, currentUser);
         levelUpdate(result.xp, currentUser, healthBar);
        } else {
         setShowResult('Fail');
         setShowResultEvent('You have received nothing');
        }
        } else {
        if(outcome > 50){
         setShowResult('Success');
         setShowResultEvent('You have received a ' + result.item);
         itemAdd(result.item, currentUser);
         levelUpdate(result.xp, currentUser);
        } else {
         setShowResult('Fail');
         setShowResultEvent('You have received nothing');
        }
        }
       };

       decideOutcome(outcome);
     }
  
  };

  async function buildSkills(currentUser) {
    // This function will return the currentStage data
    // which will send to Levels to iterate over it
    let userInfo = {
      username:currentUser
    };

     axios.post(serverUrl + '/buildSkills', userInfo)
      .then(response => { 
        let skills = response.data.doc;
      //  console.log(skills)
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
        let stageText = response.data.curStageText;

        sendOptions(options, playerName);

        if(stageText){
          setShowText(true);
        }
        setCurStage(curLevel);
        setCurText(stageText);
        setStageType(type);
        displayOptions(type, options, curLevel);
      })
      .catch(error => {
       console.error('Error:', error);
      });
  };

  const nextStage = (currentUser, level, type) => { 
      buttons.forEach((button) => {
        button.className = 'game-btn';
      });
      let stageInfo = {
        username: currentUser,
        level: level,
        type: type,
      };
      let resetChoices = {
        username: currentUser,
      };

      // clear choices here
      axios.post(serverUrl + '/clearInactive', resetChoices)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
       console.error('Error:', error);
      });

      axios.post(serverUrl + '/stageChange', stageInfo)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
       console.error('Error:', error);
      });

     getLevel(currentUser);
  }

  const showSquare = (bool) => {
    setShowText(bool);
  };

  useEffect(() => {
    getHealth(playerName);
    buildSkills(playerName);
    getLevel(playerName);
  }, []);

  console.log(options);
  
  return (
    <div> 
        <>
         <div className='HUD'>
           <h2>{playerName}</h2>
           <h3 id='level-num'>Level: {curStage}</h3>
           <ProgressBar variant='danger' max={100} now={healthBar} label='HP' className='health-bar'/>
          
         </div>

        {!showText ? (
          ''
        ) : (
          <>
           <div className='game-info-div'>
            <div className='game-info-square'>
              <div className='game-info-text' dangerouslySetInnerHTML={{ __html:curText }}>
            
              </div> 
              <button onClick={() => showSquare(false)} id='close-square' type="submit">Begin</button>
            </div>
           </div>
          </> 
        )}

         <div className='game-options'>
        {(stageType === 'combat') ? <Combat level={curStage} username={playerName} playerHealth={setHealth}/> : 
        <div className='option-container'> 
         {options.map((option, index) => (
          <div key={index}>
            <button 
              onClick={(event) => {setInactive(event, playerName, curStage); triggerResult(playerName, option.result, option.difficulty)}}
               className={option.class} id={option.difficulty} type="submit">
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
         <button onClick={() => nextStage(playerName, curStage, stageType)} id='next-btn'>Next</button>
        </div>
        }
         </div>
        </> 
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
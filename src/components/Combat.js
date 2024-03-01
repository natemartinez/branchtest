import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar } from 'react-bootstrap';
import serverUrl from './config';
const images = require.context('../../public/images', true);

const Combat = ({level, username, playerHealth}) => {
    const [curEnemies, setCurEnemies] = useState([]);   
    const [Options, setOptions] = useState([]);   
    const [text, setText] = useState("What's your move?");   
    const [showAttacks, setShowAttacks] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [Items, setItems] = useState([]);
    const [attackBegin, setAttackBegin] = useState(false);
    const [selectedEnemy, setSelectedEnemy] = useState(null);
    const [selectedAttack, setSelectedAttack] = useState(null);
    const [userTurn, setUserTurn] = useState(true);
    const [healthBar, setHealthBar] = useState(null);

    const setHealth = (health) => {
      setHealthBar(health);
      playerHealth(health); 
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

    const receiveEnemies = async (level) => {
      let curLevel = {
        level:level
      };

      try {
         const response = await axios.post(serverUrl + '/combatStart', curLevel);
         let enemies = response.data.enemies;
         setCurEnemies(Object.values(enemies));
      } catch (error) {
         console.error('Error:', error);
      }
    };

    const changeToAttack = async (username) => {
  
      let optionObj = {
        username:username,
      };
      
      try {
         const response = await axios.post(serverUrl + '/receiveSkills', optionObj);
         let data = response.data.combatData;
         setOptions(data);
      } catch (error) {
         console.error('Error:', error);
      }
    };

    // Enemy's attack 
    const enemyTurn = async (playerHP) => { 
      let enemyInfo = {
        enemies: curEnemies,
        playerHP:playerHP
      };

      try {
        const response = await axios.post(serverUrl + '/enemyAttack', enemyInfo);
        const updatedHP = response.data.newPlayerHP;
        setHealth(updatedHP);
        setUserTurn(true);
     } catch (error) {
        console.error('Error:', error);
     }
    };

    // User's attack 
    const attackStart = (option, enemyIndex) => {
      let curEnemiesUpdate = [...curEnemies];
      if(option !== null && enemyIndex !== null){
        const getAttack = async (attack) => {
          let curAttack = {
            attack:attack,
            enemy: curEnemies[enemyIndex],
          };
          try {
             const response = await axios.post(serverUrl + '/attackAction', curAttack);
             let attackResult = response.data.attackEvent;
             curEnemiesUpdate[enemyIndex] = attackResult.enemy;
             setCurEnemies(curEnemiesUpdate);
          } catch (error) {
             console.error('Error:', error);
          }
        }
        getAttack(option);
        setAttackBegin(false);
        setSelectedEnemy(null);
        setUserTurn(false);  
      } else{
        console.log('must choose enemy first');
      }
    };

    const holdAttack = (option) => {
      // use this function to set the attack
      console.log(option)
      if(userTurn != null){
        setAttackBegin(true);
        setSelectedAttack(option);
      }else {
        return
      }
    };

    const newText = (newText) => {
      setText(newText)
    };

    const getItems = (username) => {
      let userInfo = {
        username:username
      };

      axios.post(serverUrl + '/receiveInv', userInfo)
       .then(response => { 
        let userItems = response.data.playerItems;
        // only show consumables
        let usableItems = [];
        for(let i=0; i< userItems.length; i++){
          if(userItems[i].class === 'consumable'){
            usableItems.push(userItems[i]);
          }
        };
        setItems(usableItems);
       })
       .catch(error => {
       console.error('Error:', error);
       });
    };

    useEffect(() => {
       getItems(username);
    }, [showItems]);

    useEffect(() => {
      if(selectedEnemy !== null){
        // call attack function
        attackStart(selectedAttack, selectedEnemy)
      }
    }, [selectedEnemy]);

    useEffect(() => {
        if(userTurn && attackBegin){
          newText('Choose an enemy')
        }else if(userTurn === false){
          newText("Enemy's Turn")
          setTimeout(() => enemyTurn(healthBar), 1500);
          setTimeout(() => newText('Ghost slapped you!'), 3000);
          setTimeout(() => newText("What's your move?"), 5000);   
        }

    }, [userTurn, attackBegin]);
    
    useEffect(() => { 
        setAttackBegin(false);
        setSelectedEnemy(null);
        setSelectedAttack(null);
        changeToAttack(username);
    }, [showAttacks]);

    useEffect(() => {
      const fetchEnemies = async () => {
        await receiveEnemies(level);
      };
      fetchEnemies();
    }, [level]);

    useEffect(() => {
      getHealth(username)
    }, []);


  const Enemies = () => {
    return (
     <>
      <h2>{text}</h2>
      <div className='enemy-div'>      
        {curEnemies.map((element, index) => (
        <div key={index} className={curEnemies[index].status.condition} onClick={attackBegin ? () => setSelectedEnemy(index): undefined}>
         <img className='enemy-img'
         src={images(`./${element.name}.png`)} alt=""/>
         <p>{element.name}</p> 
         <ProgressBar max={20} now={curEnemies[index].status.curHealth} />
        </div> 
       ))}
      </div>
     </> 
   );
  }
    
  const UserCombat = () => {

    const RegOptions = () => {
      return (
       <>
         <button className='action-btn' type="submit" onClick={() => setShowAttacks(true)}>Attacks</button>
         <button className='action-btn' type="submit" onClick={() => setShowItems(true)}>Items</button>
         <button className='action-btn' type="submit" onClick={() => nextStage()}>Escape</button>
       </>
      );
    };
    const AttackOptions = () => {
      return (
        <>
          {Options.map((option, index) => (
           <div key={index}>
             <button 
                className='action-btn' type='button' onClick={() => {holdAttack(option)}}>
                {option.skillName}
             </button>
           </div>  
         ))}
          <button className='action-btn' type="button" onClick={() => setShowAttacks(false)}>Back</button>
        </>
      );
    };
    const ItemOptions = () => {
      return (
        <>
          {Items.map((option, index) => (
           <div key={index}>
             <button 
                className='action-btn' type='button' onClick={() => {holdAttack(option)}}>
                {option.name}
             </button>
           </div>  
         ))}
          <button className='action-btn' type="button" onClick={() => setShowItems(false)}>Back</button>
        </>
      );
    };
    

    return (
      <div className='option-div'>      
        {(!showAttacks && !showItems) && <RegOptions/> }
        {showAttacks && <AttackOptions/>}
        {showItems && <ItemOptions/>}
      </div>
    );
  }

  return (
    <div>
      <Enemies/>
      <UserCombat />
    </div>
  );
}

export default Combat;
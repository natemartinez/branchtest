import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar } from 'react-bootstrap';
import serverUrl from './config';
const images = require.context('../../public/images', true);

const Combat = ({level, username, playerHealth, stageChange}) => {
    const [curEnemies, setCurEnemies] = useState([]);   
    const [Options, setOptions] = useState([]);   
    const [text, setText] = useState("What's your move?");   
    const [showAttacks, setShowAttacks] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [Items, setItems] = useState([]);
    const [attackBegin, setAttackBegin] = useState(false);
    const [selectedEnemy, setSelectedEnemy] = useState(null);
    const [selectedAttack, setSelectedAttack] = useState(null);
    const [enemyAttacking, setEnemyAttacking] = useState(null);
    const [userTurn, setUserTurn] = useState(true);
    const [healthBar, setHealthBar] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const setHealth = (health) => {
      setHealthBar(health);
      playerHealth(health);

      let userInfo = {
        username: username,
        health: health
      }
      axios.post(serverUrl + '/healthUpdate', userInfo)
        .then(response => {
          console.log('Health updated')
        })
        .catch(error => {
         console.error('Error:', error);
        }); 

        if(health <= 0){
          setShowResult(true);
        }
        
    };

    const getHealth = async(username) => {
      let userInfo = {
        username:username
      };
  
      axios.post(serverUrl + '/receiveStatus', userInfo)
        .then(response => { 
          let hpData = response.data.doc.status.health;
          if(hpData <= 0){
            hpData = 100;
          };
          setHealth(hpData)
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
    const enemyTurn = async (enemies, playerHP, username) => { 
       let enemyInfo = {
         enemies: enemies,
         playerHP:playerHP,
         username:username,
       };

        try {
          const response = await axios.post(serverUrl + '/enemyAttack', enemyInfo);
          console.log(response.data)
          let hpUpdate = response.data.result;
          let text = response.data.message;
          const enemyTurns = (i) => {
            if(i < hpUpdate.length){
              setTimeout(() => {setHealth(hpUpdate[i])}, 3000);
              setTimeout(() => {newText(text)}, 1000);
              setTimeout(() => {i++; enemyTurns(i)}, 2000);
            }
          }; //Should use recursion more often
          enemyTurns(0);

          setUserTurn(true);

        } catch (error) {
          console.error('Error:', error);
        }
        
      //setUserTurn(true);
    };
    // User's attack 
    const attackStart = (option, enemyIndex, username) => {
      let curEnemiesUpdate = [...curEnemies];

      if(option !== null && enemyIndex !== null){
        const getAttack = async (attack) => {
          let curAttack = {
            attack:attack,
            enemy: curEnemies[enemyIndex],
            username: username
          };   
          try {
             const response = await axios.post(serverUrl + '/attackAction', curAttack);
             let attackResult = response.data.enemyUpdate;
             let attackMSG = response.data.message;   
             
             curEnemiesUpdate[enemyIndex] = attackResult; 
             setCurEnemies(curEnemiesUpdate);
             setText(attackMSG);
          } catch (error) {
             console.error('Error:', error);
          }
        }

        getAttack(option);
        setAttackBegin(false);
        setSelectedEnemy(null);
        setUserTurn(false);  

        newText("Enemy's Turn");   
        enemyTurn(curEnemiesUpdate, healthBar, username); 
      } else{
        console.log('must choose enemy first');
      }
    };

    const removeItem = (username, item) => {
      item.class = 'used-item';
      let itemInfo = {
        username: username,
        item: item
      };

      axios.post(serverUrl + '/removeItem', itemInfo)
       .then(response => { 
        console.log(response.data)
       })
       .catch(error => {
       console.error('Error:', error);
       });

    };

    const useItem = (item, health) => {
       let newHP;
       if(item.type === 'healing'){
         newHP = health + item.num;
         if(newHP > 100){
           newHP = 100;
         };
        setHealth(newHP); 
       }
       
       removeItem(username, item);
       setUserTurn(false);
       // send to function that removes item from database
    };
    
    const holdAttack = (option, health) => {
      if(option.class === 'consumable'){
        if(userTurn != null){
          useItem(option, health);
          return
         // setSelectedAttack(option);
        }else {
          return
        }
      }
      // use this function to set the attack
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

    const checkForDead = (curEnemies) => {
      let deadEnemies = [];
      for(let i=0; i < curEnemies.length; i++){
        if(curEnemies[i].status.condition === 'dead'){
          deadEnemies.push(curEnemies[i]);
          if(curEnemies.length == deadEnemies.length){
            setShowResult(true);
            setText('You Won!')
          }
        } else{
          break
        }  
      }
    };

    const nextStage = (username, level, type) =>{
      // dig into server to find the result of this current level
      let result = '';
      let userInfo = {
        level: level,
        username:username,
        type: type
      };

      axios.post(serverUrl + '/stageChange', userInfo)
       .then(response => { 
        result = response.data.nextStage;
        stageChange(username, result, type);
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
        attackStart(selectedAttack, selectedEnemy, username);
      }
    }, [selectedEnemy]);

    useEffect(() => {
        
        if(userTurn == true && attackBegin == true){
          newText('Choose an enemy');
        } 
       
    }, [userTurn, attackBegin]);
    
    useEffect(() => { 
        setAttackBegin(false);
        setSelectedEnemy(null);
        setSelectedAttack(null);
        changeToAttack(username);
    }, [showAttacks]);

    useEffect(() => {
      checkForDead(curEnemies);
    }, [curEnemies])

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
         <ProgressBar max={curEnemies[index].status.maxHealth} now={curEnemies[index].status.curHealth} />
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
                className={option.class} type='button' onClick={() => {holdAttack(option, healthBar)}}>
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
  const Result = () => {
    
    return (
      <div className='result-div'>
        {(healthBar <= 0) ? 
           <div className='result-info'>
             <h2 className='combat-result'>You Lost!</h2>
             <button className='action-btn' onClick={() => window.location.reload()}>Retry</button>
           </div> : 
           <div className='result-info'>
             <h2 className='combat-result'>You Won!</h2>
             <button className='action-btn' onClick={() => nextStage(username, level, 'combat')}>Next</button>
           </div>
        }
          
      </div>
    );
  }

  return (
    <div>
      {showResult && <Result/>}    
      {!showResult && <Enemies/>} 
      {!showResult && <UserCombat />}
    </div>
  );
}

export default Combat;
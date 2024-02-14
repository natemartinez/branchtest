import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ProgressBar } from 'react-bootstrap';
const images = require.context('../../public/images', true);

const Combat = ({level, username, playerHealth}) => {
    const [curEnemies, setCurEnemies] = useState([]);   
    const [Options, setOptions] = useState([]);   
    const [text, setText] = useState("What's your move?");   
    const [showAttacks, setShowAttacks] = useState(false);
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
  
      axios.post('https://localhost:3000/buildSkills', userInfo)
        .then(response => { 
          let hpData = response.data.doc.status;
          setHealth(hpData.health)
        })
        .catch(error => {
         console.error('Error:', error);
        });
    };

    useEffect(() => {
      getHealth(username)
    }, []);

    const receiveEnemies = async (level) => {
      let curLevel = {
        level:level
      };

      try {
         const response = await axios.post('https://localhost:3000/combatStart', curLevel);
         let enemies = response.data.enemies;
         setCurEnemies(Object.values(enemies));
      } catch (error) {
         console.error('Error:', error);
      }
    };
    
    useEffect(() => {
      const fetchEnemies = async () => {
        await receiveEnemies(level);
      };
      fetchEnemies();
    }, [level]);

    const changeToAttack = async (username) => {
      let optionObj = {
        username:username,
      };

      try {
         const response = await axios.post('https://branchtest-bkend.onrender.com/receiveSkills', optionObj);
         let data = response.data.userSkills;
         setOptions(data);
      } catch (error) {
         console.error('Error:', error);
      }
    };
  
    useEffect(() => { 
        setAttackBegin(false);
        setSelectedEnemy(null);
        setSelectedAttack(null);
        changeToAttack(username);
    }, [showAttacks]);

    // Enemy's attack 
    const enemyTurn = async (playerHP) => { 
      let enemyInfo = {
        enemies: curEnemies,
        playerHP:playerHP
      };

      try {
        const response = await axios.post('https://localhost:3000/enemyAttack', enemyInfo);
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
             const response = await axios.post('https://localhost:3000/attackAction', curAttack);
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
      if(userTurn != null){
        setAttackBegin(true);
        setSelectedAttack(option);
      }else {
        return
      }
    };

    useEffect(() => {
      if(selectedEnemy !== null){
        // call attack function
        attackStart(selectedAttack, selectedEnemy)
      }
    }, [selectedEnemy]);

    const newText = (newText) => {
     setText(newText)
    };

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


  const Enemies = () => {
    return (
     <div>
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
     </div> 
   );
  }
    
  const UserCombat = () => {

    const RegOptions = () => {
      const RegOptions = [{name:'Attack'},{name:'Skills'},{name:'Items'}, {name:'Escape'}]; 

      return (
        <div>
          <div className='option-div'>
           {RegOptions.map((option, index) => (
               <div key={index}>
                  <button 
                   className='action-btn' type="submit" onClick={() => setShowAttacks(true)}>
                   {option.name}
                  </button>
               </div>  
            ))}
          </div>
          
        </div>
      );
    };
    const AttackOptions = () => {
      // attackOptions need to disappear when isAttackMode is true
      return (
        <div>
          {Options.map((option, index) => (
           <div key={index}>
             <button 
                className='action-btn' type='button' onClick={() => {holdAttack(option)}}>
                {option.skillName}
             </button>
           </div>  
         ))}
          <button className='action-btn' type="button" onClick={() => setShowAttacks(false)}>Back</button>
        </div>
      );
    };

    return (
      <div>      
        {!showAttacks && <RegOptions/> }
        {showAttacks && <AttackOptions/>}
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
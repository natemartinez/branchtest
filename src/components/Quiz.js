import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import serverUrl from './config';
import axios from 'axios';
const images = require.context('../../public/images', true);


const Question = ({playerName}) => {
  const options = ['Agree', 'Slightly Agree', 'Slightly Disagree', 'Disagree'];
  const [chosenOption, setChosenOption] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [index, setIndex] = useState(0);
  const [answerSelected, setSelected] = useState(false);
  const [finish, setFinish] = useState(true); 

  async function getData() { 
    try {
      const response = await axios.get(serverUrl + "/startQuiz")
      setQuestions(response.data.questions);
      setStats(response.data.intTraits);
      setFinish(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function saveTraits(index, chosenOption, traits){
      let traitUpdate = {
        traits: traits,
        option: chosenOption,
        questionNum: index
      }; 

     try {
      const response = await axios.post(serverUrl + '/saveTraits', traitUpdate);
      setStats(response.data.traits);
      checkIndex(index)
    } catch (error) {
      console.error(error);
    }

    moveNextQuestion(index);
  };

  const checkIndex = (indexNum) => {
    if(indexNum == questions.length - 1){
      setFinish(true);
    }
  };

  const optionSelected = (optionName) => {
    // Only the chosen options will have their class changed
    setChosenOption(optionName);
    setSelected(true); 
  };
  const moveNextQuestion = (indexNum) => {
    setSelected(false);
    setChosenOption(null);
    setIndex(indexNum + 1);
    if(indexNum === questions.length){
      setFinish(true);
    };
  };

  useEffect(() => {
    getData();
  }, [])
 
  return (
    <>
      {!finish ?
         <div className='quiz-div'>
           <h3>{questions[index]}</h3>
           <ul className='option-list'>
            {options.map((option, index) => (
            <li key={index}>
            <button className={chosenOption === option ? 'option-btn-clicked' : 'option-btn'} onClick={() => optionSelected(option)}>
              {option}
            </button>
            </li>
            ))}
           </ul>
           {answerSelected && (
             <button className='next-btn' onClick={() => saveTraits(index, chosenOption, stats)}>Next</button>
           )}
         </div> : <Result results={stats} playerName={playerName}/>
      }
    </> 
  );
};
const Result = ({results, playerName}) => {
  const navigate = useNavigate();
  const [traits, setTraits] = useState([]);
  const [stats, setStats] = useState([]);

  async function checkTraits(results){
    let finalRes = {
      results: results
    };
    
   try {
    const response = await axios.post(serverUrl + '/calcResult', finalRes);
    const {traitArr, stats} = response.data;
    displayTraits(traitArr);
    setStats(stats);
  } catch (error) {
    console.error(error);
  }

  };

  const displayTraits = (traits, stats) => {
    let classNames = [];
    let percentages = [];

    traits.forEach((trait) => {
      classNames.push(trait.name);
      percentages.push(trait.weight);
    });
    setTraits(classNames);
    //console.log(percentages);
    // separate the name and weight properties
    //setStats(stats)
  };

 async function sendResults(traits, stats, name){
    
      let finalRes = {
        traits: traits,
        stats: stats,
        name: name
      };
      
     try {
      const response = await axios.post(serverUrl + '/sendUser', finalRes);
      const {traitArr, stats} = response.data;
      displayTraits(traitArr);
      setStats(stats);
    } catch (error) {
      console.error(error);
    }

    navigate('/main', {state:{name}});
  };


  useEffect(() => {
    if(results !== null){
      checkTraits(results)
    } else{
      console.log('No data received')
    }
  }, [results])

  return (
    <div className='result-page' >
      <p className='trait-title'>Your traits:</p>
      <ul className='trait-list'>{traits.map((answer, index) =>
      //add image with every iteration
       (
        <div key={index}>
          <img className='trait-img' src={images(`./${answer}.png`)}></img>
          <h2 className='trait-name'>{answer}</h2>
        </div>
       ))}
      </ul>
      <img id='scroll-arrow' src={images('./arrow.png')}></img>
      <div className='stats-list'>
        {Object.keys(stats).map(category => (
         <div id={category} className='stat-div' key={category}>
          <div>
            <img className='stat-bkgrd' src={images(`./${category}.png`)} alt="icon"></img>
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
      </div> 
      <button className='result-btn' onClick={() => sendResults(traits, stats, playerName)}>Continue</button>
    </div>
  );
};

const Quiz = ({user}) => {
  const [intro, setIntro] = useState(true);
  return (
    <>
    {intro ? 
      <div className='info-wrapper'>
       <div className='info-square'>
         <div className='info-text'>
          <h1>This is the BranchTest.</h1>
          <p>A personality-based RPG, where your best weapon is discovering yourself.</p>
          <p>You will take a test to determine your personality.</p>
         </div> 
         <button onClick={() => setIntro(false)} id='close-square' type="submit">Begin</button>
       </div> 
      </div>
       :<Question playerName={user}/>
    }
    </>
    
  );
};

export default Quiz;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { useNavigate } from 'react-router-dom';
const images = require.context('../../public/images', true);

// This component will output personality results

const Result = (props) => {
  const navigate = useNavigate();
  const { username, data } = props;
  const finalResults = [username, data];
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const sendtoServer = (results) => {
      axios.post('https://branchtest-bkend.onrender.com/sendUser', results)
        .then(response => {
          let statResults = response.data.stats;
          setStats(statResults);
        })
        .catch(error => {
          console.error('Error:', error);
        }); 
    };
    sendtoServer(finalResults);
  }, []);


  const moveToMain = (results) => {
    let username = results[0].user;
    let data = results[1];
    navigate('/main', {state:{data, username}});
  };

  return (
    <div className='result-page' >
      <p className='trait-title'>Your traits:</p>
      <ul className='trait-list'>{data.map((answer, index) =>
      //add image with every iteration
       (
        <div>
          <img className='trait-img' src={images(`./${answer}.png`)}></img>
          <li key={index}>{answer}</li>
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
      <button className='result-btn' onClick={() => moveToMain(finalResults)}>Continue</button>
    </div>
  );
};

export default Result;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { useNavigate } from 'react-router-dom';

// This component will output personality results

const Result = (props) => {
  const navigate = useNavigate();
  const { username, data } = props;
  const finalResults = [username, data];
  
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const sendtoServer = (results) => {
      axios.post('http://localhost:3000/sendUser', results)
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
       (<li key={index}>{answer}</li>
        
       ))}
      </ul>
      <div className='stats-list'>
        {Object.keys(stats).map(category => (
         <div id={category} className='stat-div' key={category}>
          <div>
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
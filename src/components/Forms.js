import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Question from './Question';
import Result from './Result';
const images = require.context('../../public/images', true);
const logo = images(`./branchTest-logo.png`);

const InfoForms = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const showRegisterForm = () => {
    setShowRegister(true);
    setShowLogin(false); // Hide login form
  };
  const showLoginForm = () => {
    setShowLogin(true);
    setShowRegister(false); // Hide register form
  };   
  
  
    const Register = () => {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [message, setMessage] = useState('');
      const [formSubmitted, setFormSubmitted] = useState(false);
     
      const submit = (e) => {
       e.preventDefault();

       const newUser = {
        username,
        password,
      };

      axios.post('https://branchtest-bkend.onrender.com/signup', newUser)
      .then(response => {
       const { message } = response.data;
       if (message === "User already exists") {
        setMessage(message);
        setFormSubmitted(false);  
       } else {
        console.log('Signup Complete');
        setMessage(message);
        setTimeout(() => { setFormSubmitted(true); }, 1000);
       }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Signup failed!');
      });
      };

      return (
        <div>
           {!formSubmitted ? (
            <div>
              <div className='form-logo-div'>
                <img className='form-logo' src={logo} alt="Description" /> 
                <h2>Register</h2>
                <p className='message'>{message}</p>
              </div>
    
              <form className='input-form' onSubmit={submit} setFormSubmitted={setFormSubmitted}>
              <input
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               placeholder='Username'
               required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password'
                required
              />
              <button className='submit-btn' type="submit">Submit</button>
              <button className='form-btn' onClick={showLoginForm}>Login</button>
              </form>
              
            </div>
           ) : (
            <Quiz user={username}/>
           )}
        </div>
      )
    };
     
    const Login = () => {
      const navigate = useNavigate();

      const [formSubmitted, setFormSubmitted] = useState(false);
      const [message, setMessage] = useState('');
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');

      const submit = (e) => {
         e.preventDefault();
        
         const existingUser = {
           username,
           password,
         };
       
         axios.post('https://branchtest-bkend.onrender.com/login', existingUser)
         .then(response => {
           console.log(response.data);
           const { message } = response.data;
  
           if (message === "User doesn't exist") {
             console.log('User does not exist');
             setMessage(message);
             setFormSubmitted(false);
             
           } else {
             console.log('Login Successful');
             setMessage(message);
             setTimeout(() => { setFormSubmitted(true); }, 1000);
             navigate('/main', {state:{username}});
           }
         })
         .catch(error => {
           console.error('Error:', error);
           setMessage("An error has occurred");
           setFormSubmitted(false);
         });
      }
  
       return (
        <div>           
          <div className='form-logo-div'>
                <img className='form-logo' src={logo} alt="Description" /> 
                <h2>Login</h2>
                <p className='message'>{message}</p>
          </div>
          <form className='input-form' onSubmit={submit}>
              <input
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               placeholder='Username'
               required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password'
                required
              />
              <button className='submit-btn' type="submit">Submit</button>
              <button className='form-btn' onClick={showRegisterForm}>Register</button> 
          </form>  
          
        </div>
       )
    };
     
    return (
      <div>
      {!showRegister && !showLogin && (
         <div>
          <div className='logo-div'>
          <h2>Welcome to the</h2>
          <img className='logo' src={logo} alt="Description" />
          
         </div>  
         <div className='form-btn-div'>
          <button className='form-btn' onClick={showRegisterForm}>Register</button>
          <button className='form-btn' onClick={showLoginForm}>Login</button>
         </div>
        </div>
        
      )}
      {showRegister && <Register />}
      {showLogin && <Login />}
    </div>
    )
};

const Quiz = (username) => {
  const currentUser = username;
  const quizData = [
    {
      question: 'Which side of your brain do you use more of?',
      options: ['Logical', 'Creative'],
    },
    {
      question: 'Describe yourself in social situations',
      options: ['Introvert', 'Extrovert'],
    },
    {
      question: 'Do you prefer the early morning or late night?',
      options: ['Early Bird', 'Night Owl'],
    },
    {
      question: 'Whats your temper like?',
      options: ['Fierce', 'Steady'],
    }
  ]

  const [currentQuestion, setQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(quizData.length).fill(' '));

  const handleAnswerSelect = (answer) => {
      // Need to set a new copy of array to update
      const updatedAnswers = [...userAnswers];
      updatedAnswers[currentQuestion] = answer;
      setUserAnswers(updatedAnswers);
  }

  const goToNextQuestion = () => {
    setQuestion(currentQuestion + 1);
  }; 
  
  return (
    <div>
      {currentQuestion < quizData.length ? (
        <Question
          data={quizData[currentQuestion]}
          answerSelect={handleAnswerSelect}
          nextQuestion={goToNextQuestion}
        />
      ) : (
        <Result data={userAnswers} username={currentUser}/>
      )}
    </div>
  );
};

const Forms = () => {
 
  return (
    <div>  
      <InfoForms/>
    </div>
  )
}

// I want to trigger Quiz when Register is done executing


export default Forms;
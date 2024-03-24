import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Quiz from './Quiz';
import ReactLoading from "react-loading";
import serverUrl from './config';

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
    const [formSubmitted, setFormSubmitted] = useState(null);
    const [dataSent, setDataSent] = useState(null);
   
    const submit = (e) => {
       e.preventDefault();
       const newUser = {
        username,
        password,
       };
       // loading screen starts here
       setDataSent(true);

      axios.post(serverUrl + '/signup', newUser)
      .then(response => {    
        const { message } = response.data;
        if (message === "User already exists") {
         setMessage(message);
         setDataSent(false);
         setFormSubmitted(false)
        } else {
         console.log('Signup Complete');
         setMessage(message);
         setDataSent(false);
         setFormSubmitted(true)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('Signup failed!');
      });
    };

    return (
      <>
        {!dataSent ? (
          ''
         ):(
          <div className='loading-container'>
            <ReactLoading
            type={"bars"}
            color={"#44342d"}
            height={100}
            width={100}
            />
          </div>
         )
        }

        {!formSubmitted ? (
         <div>
          <div className='form-logo-div'>
            <img className='form-logo' src={logo} alt="Description" /> 
            <h1>Register</h1>
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
             <button className='form-btn' onClick={showLoginForm}>Existing Player?</button>
          </form>
         </div>
            ): 
           (
            <Quiz user={username}/>
           )
         }
      </>     
    )
  };
     
  const Login = () => {
    const navigate = useNavigate();
    const [formSubmitted, setFormSubmitted] = useState(null);
    const [dataSent, setDataSent] = useState(null);
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const submit = (e) => {
         e.preventDefault();
         const existingUser = {
           username,
           password,
         };

         setDataSent(true);
      
         axios.post(serverUrl + '/login', existingUser)
         .then(response => {
           const { message, currentUser } = response.data;
           
           if (message === "User doesn't exist") {
             setMessage(message);
             setFormSubmitted(false);
             setDataSent(false);
           } else {
              if(!currentUser.hasOwnProperty('progress')){  
               setFormSubmitted(true);
               return;
              } else{
                setMessage(message);
                setTimeout(() => {setFormSubmitted(true);}, 1000);
                setDataSent(false);
                navigate('/main', {state:{username}});
              }        
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
        {!formSubmitted ? (
         <div>
           <div className='form-logo-div'>
             <img className='form-logo' src={logo} alt="Description" />
             <h1>Login</h1>
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
                <button className='form-btn' onClick={showRegisterForm}>New Player?</button>
           </form>
          
         </div>
            ): 
           (
            <Quiz user={username}/>
           )
         }
      </div>    
    )
  };
     
  return (
      <div>
      {!showRegister && !showLogin && (
         <div>
          <div className='logo-div'>
          <h1>Welcome to the</h1>
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

const Forms = () => {
 
  return (
    <div>  
      <InfoForms/>
    </div>
  )
}

// I want to trigger Quiz when Register is done executing


export default Forms;
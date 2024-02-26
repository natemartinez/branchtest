import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import serverUrl from '../Config';
const images = require.context('../../../public/images', true);
// Placed hp here to display combat changes inside HUD

  const Items = ({playerName}) => {
    const [items, setItems] = useState([]);

    const getItems = () => {
      let userInfo = {
        username:playerName
      };

      axios.post(serverUrl + '/receiveInv', userInfo)
       .then(response => { 
        let userItems = response.data.playerItems;
        setItems(userItems);
       })
       .catch(error => {
       console.error('Error:', error);
       });
    };

    useEffect(() => {
       getItems(items);
    }, []);

    // need to iterate thru items state

      return (
        <>
          <div className='inv-grid'>
            {items.map((element, index) => (
              <div key={index} id={element.rarity} className='item'>
                <img src={images(`./${element.name}.png`)} alt="" className='item-img'></img>
                <h3>{element.name}</h3>
                <p>{element.effect}</p>
                <p>{element.type}: {element.num}</p>
              </div> 
            ))}
          </div>
        </>
      )
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
             <Link to={'#'} onClick={() => menuHide()} state={{username:playerName}}>Inventory</Link>
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

 const Inventory = () => {
  const location = useLocation();
  let currentUser = location.state.username;
   return (
    <>
      <div className='inv-top'>
         <Link to={'/main'} state={{username:currentUser}}><img className='back-arrow' src={images(`./back-arrow.png`)}></img></Link>    
        <h2>Inventory</h2>
      </div>
      <Items playerName={currentUser}/>
      <Menu playerName={currentUser}/>
    </>
   );
 }

export default Inventory;
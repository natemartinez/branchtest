const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PlayerModel = require('./models/player');
const EnemyModel = require('./models/enemies');
const AttackModel = require('./models/attacks');
const SkillModel = require('./models/skills');
const ItemsModel = require('./models/items');

const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})
app.use(express.json());
app.use(cors());

const uri = 'mongodb+srv://natemartinez:Lj092101@players.m8tq7fu.mongodb.net/info?retryWrites=true&w=majority';
async function connect() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error);
  }
}

//Checks if there's not an existing user
app.post('/signup', (req, res) => {
  const userData = req.body;
  const newPlayer = new PlayerModel({
    username: userData.username,
    password: userData.password,
  });

  async function checkUser() {
    try {
      const results = await PlayerModel.find({ username: newPlayer.username });
      if (results.length > 0) {
        res.send({message:"User already exists"});
      } else {
        console.log('No documents found.');
        newPlayer.save()
        .then(updatedDocument => {
          console.log('Updated Document:', updatedDocument);
          res.send({message:'Signup Complete!'})
        })
        .catch(err => {
          console.error('Error:', err);
        });
      }
    } catch (err) {
      console.error('Error:', err);
    };
  };
 
  checkUser(); 
});
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    // Check the username and the password

    let doc = await PlayerModel.find({ $and: [
      { username: username },
      { password: password }
    ]});

    // use username to look 

    if (!doc || doc.length === 0) {
      res.status(200).json({ message: "User doesn't exist" });

    } else {
      console.log('Login Successful');
      let currentUser = doc[0];
      res.status(200).json({currentUser, message: 'Login Successful' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error updating document' });
  }
  
});
//Handles quiz results and initializes 'stats'
app.post('/sendUser', async (req, res) => {
  const username = req.body[0];
  const results = req.body[1];

  // Initializes all of player's info
  let stats = {
    'Physical': {
      'strength': 1,
      'dexterity': 4
    },
    'Mental': {
      'intuition': 1,
      'intelligence': 1
    },
    'Soul': {
      'willpower': 1,
      'resistance': 1
    },
    'Expression': {
      'creativity': 1,
      'presence': 1
    }
  };
  let skills = [];
  let attacks = [];
  let status = {
    'health': 100,
    'level': {
      num: 1,
      exp: 0,
      cap: 100,
      point: 0
    }
  };
  let progressStart = {
    levelNum:1.1,
    choices: []
  };
  let inventory = [];

  results.forEach(result => {
    switch (result) {
       case 'Logical':
       stats.Mental.intelligence += 2;
       stats.Mental.intuition += 1;
       break;
       case 'Creative':
       stats.Expression.creativity += 2;
       stats.Expression.presence += 1;
       break;
       case 'Introvert':
       stats.Mental.intuition += 2;
       stats.Expression.creativity += 1;
       break;
       case 'Extrovert':
       stats.Expression.presence += 2;
       stats.Soul.willpower += 1;
       break;
       case 'Early Bird':
       stats.Physical.strength += 1;
       stats.Physical.dexterity += 1;
       break;
       case 'Night Owl':
       stats.Soul.resistance += 1;
       stats.Soul.willpower += 2;
       break;
       case 'Fierce':
       stats.Physical.strength += 2;
       stats.Soul.willpower += 1;
       stats.Soul.resistance += 1;
       break;
       case 'Steady':
       stats.Mental.intuition += 2;
       stats.Expression.presence += 1;
       stats.Soul.willpower += 2;
       break;
    } 
  });
  //

  try {
    let doc = await PlayerModel.findOne({ username: username.user });
    if (!doc) {
      doc = new PlayerModel({ username: username.user, status:status, skills:skills, attacks:attacks, personality: results, stats: stats, inventory:inventory, progress: progressStart });
      await doc.save();
      res.status(200).json({ message: 'New document inserted successfully' });
    } else {
      await PlayerModel.updateOne({ username: username.user }, { $set: {status:status, skills:skills, attacks:attacks, personality: results, stats: stats, inventory:inventory, progress: progressStart} });
      res.status(200).json({ message: 'Document updated successfully', stats });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error updating document' });
  }
});

app.post('/buildSkills', async (req, res) => {
  const {username} = req.body;

  let doc = await PlayerModel.findOne({ username: username });
  let physicalClass = doc.stats.Physical;
  let mentalClass = doc.stats.Mental;
  let attacksArray = [];
  let skillsArray = [];

  if(doc){
    if(physicalClass.strength > 1){
    // get the punching skill
     let punch = await AttackModel.findOne({ skillName: 'Punch' });  
     let kick = await AttackModel.findOne({ skillName: 'Kick' });
     attacksArray.push(punch, kick);
    };
    if(physicalClass.dexterity > 3){
      let dodge = await SkillModel.findOne({ name: 'dodge' }); 
      skillsArray.push(dodge);
    };

    if(mentalClass.intelligence >= 3){
    // get the punching skill
     let distract = await AttackModel.findOne({ skillName: 'Distraction' });  
     let wps = await AttackModel.findOne({ skillName: 'Weak Point Strike' });
     attacksArray.push(distract, wps);
    };

    await PlayerModel.updateOne({ username: username }, { $set: {attacks: attacksArray, skills: skillsArray } });
  }
  try {
    res.status(200).send({doc});
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

// I should eventually put Stages into a database
const Stages = [
      {
          name: 'search1',
          text:
          "<h2>In the BranchTest, your personality affects the success and outcomes of your decisions</h2>" +
          "<div class='choice-diagram'>" +
             
            "<div class='diff-div'><img class='diff-exp' src='images/easy.png'></img><h3> = Easy</h3></div>" +
            "<div class='diff-div'><img class='diff-exp' src='images/medium.png'></img><h3> = Medium</h3></div>" +
            "<div class='diff-div'><img class='diff-exp' src='images/hard.png'></img><h3> = Hard</h3></div>" +
          "</div>",        
          stageInfo: {
             level:1.1,
             type: 'search',
             options:[
              {
                name:'Closet',
                type: 'Physical',
                stat: 'strength',
                probability: 1,
                result: {
                  item: 'Jacket',
                  xp: 25
                },
                class:'game-btn'
              },
              {
                name:'Drawer',
                type: 'Mental',
                stat: 'intuition',
                probability: 1,
                result: {
                  item: 'Med-kit',
                  xp:50
                },
                class:'game-btn'
              },
              {
                name:'Under the rug',
                type: 'Mental',
                stat: 'intuition',
                probability: 1,
                result: {
                  item: 'Safety Glasses',
                  xp:50
                },
                class:'game-btn'
              },
              {
                name:'Curtains',
                type: 'Mental',
                stat: 'intuition',
                probability: 0,
                result: {
                  item: 'Wooden Panel',
                  xp:50
                },
                class:'game-btn'
              },
             ],
             result:1.2
          },     
      },
      {
          name:'location1',
          text: 'hello',    
          stageInfo: {
             level:1.2,
             type: 'location', 
             options:[
              {
                name:'Office',
                result: 1.3,
                class:'game-btn'
              },
              {
                name:'Hallway',
                result: 1.4,
                class:'game-btn'
              },
              {
                name:'Downstairs',
                result: 1.5,
                class:'game-btn'
              },
             ]   
          },
      },
      {
        name: 'Office',
        text: 'hello',
        stageInfo: {
           level:1.3,
           type: 'search',
           options:[
            {
              name:'Desk',
              type: 'Physical',
              stat: 'strength',
              probability: 1,
              result: 'Jacket',
              class:'game-btn'
            },
            {
              name:'File cabinet',
              type: 'Mental',
              stat: 'intuition',
              probability: 1,
              result: 'Med-kit',
              class:'game-btn'
            },
            {
              name:'Check the whiteboard',
              type: 'Mental',
              stat: 'intuition',
              probability: 1,
              result: 'Med-kit',
              class:'game-btn'
            },
            {
              name:'Check the windows',
              type: 'Mental',
              stat: 'intuition',
              probability: 1,
              result: 'Med-kit',
              class:'game-btn'
            },
           ],
           result: 1.7
        }, 
      },
      {
        name:'battle1',
        text: 'hello',
        stageInfo: {
           level: 1.7,
           enemies:['ghost', 'ghost'],
           type: 'combat',
           result: {
            item: 'Med-kit',
            xp: 100
           }
        },
      },
];

// All stages
app.post('/currentStage', async (req, res) => {
    const {username} = req.body;
    
    async function buildOptions(level, playerStats){
      for (let i = 0; i < Stages.length; i++) {
        let curStageInfo = Stages[i].stageInfo;
        let curStageText = Stages[i].text;

        if (curStageInfo.level === level) {
          let stageType = curStageInfo.type;
          let options = curStageInfo.options;
          let curStage = curStageInfo.level;

           if(stageType === 'search') {
             options.map((option, index) => {             
              let optionType = option.type;
              let optionStat = option.stat;
              let userStat = playerStats[optionType][optionStat];

               if(userStat > option.probability){
                option.difficulty = 'easy'
               }else if(userStat < option.probability){
                option.difficulty = 'hard';
               } else{
                option.difficulty = 'medium';
               }
             });   
             res.status(200).json({stageType, options, curStage, curStageText});
           } else {
            console.log(options);
             res.status(200).json({stageType, options, curStage, curStageText});
           };
          break;
        }
      } 
    };

    try {
      let doc = await PlayerModel.findOne({ username: username });
      if (doc) { 
        const userProgress = doc.progress.levelNum;
        console.log("Player's progress "+ userProgress)
        const userStats = doc.stats;
        await buildOptions(userProgress, userStats);
      }

    } catch (err) {
        console.error('Error', err);
        res.status(500).json({ message: "An error has occurred" });
    };
});

app.post('/receiveStatus', async (req, res) => {
  const {username} = req.body;
  let doc = await PlayerModel.findOne({ username: username });
  try {
    res.status(200).send({doc});
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

app.post('/itemSearch', async (req, res) => {
  const {itemName, username} = req.body;

  let itemDoc = await ItemsModel.findOne({ name: itemName });
  let playerDoc = await PlayerModel.findOne({ username: username }); 
  if(itemDoc){
    playerDoc.inventory.push(itemDoc);
  }
  await PlayerModel.updateOne({ username: username }, { $set: {inventory: playerDoc.inventory} });
  try {
    res.send({itemName})
  } catch (err) {
      console.error('Error', err);
      res.status(500).json({ message: "An error has occurred" });
  };
});

app.post('/receiveInv', async (req, res) => {
  const {username} = req.body;
  let doc = await PlayerModel.findOne({ username: username });
  
  let playerItems = doc.inventory;
try {
  res.send({playerItems})
} catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
};
});

// Stage progression
app.post('/stageChange', async (req, res) => {
    const {username, level, type} = req.body;
    let nextStage;

    const levelUpdate = {
      levelNum: level,
      choices: []
    }; // wipe choices array

    // used to update database for progression
    if(type === 'location'){
       for (let i = 0; i < Stages.length; i++) {
         if(Stages[i].stageInfo.level === level){
          await PlayerModel.updateOne({username: username},{ $set: {progress: levelUpdate}});
          break;
         }
       };
    } else if(type === 'search'){
       for (let i = 0; i < Stages.length; i++) {
        let stageInfo = Stages[i].stageInfo;
         if(stageInfo.level === level) {
          nextStage = stageInfo.result;
          console.log('Next Stage: ' + nextStage);
          levelUpdate.levelNum = nextStage;
          await PlayerModel.updateOne({username: username},{ $set: { progress:levelUpdate}});
          break;
         } 
       };
    };
    //

    try {
      res.send({nextStage});
    } catch (err) {
        console.error('Error', err);
        res.status(500).json({ message: "An error has occurred" });
    };
});

app.post('/setInactive', async (req, res) => {
  const {choices, stage, username} = req.body;

  const levelUpdate = {
    levelNum: stage,
    choices: choices,
  };

  await PlayerModel.updateOne({username: username},{ $set: {progress: levelUpdate}});
});

app.post('/startInactive', async (req, res) => {
  const {choices, username} = req.body;
  let doc = await PlayerModel.findOne({username: username});

  const selectedChoices = doc.progress.choices;
  let curChoices = choices;

  for(let i=0; i<curChoices.length; i++){
    if(selectedChoices[i] === curChoices[i].name){
      curChoices[i].class = 'game-btn-clicked';
      console.log(curChoices[i].name + ' was selected');
    }
  };
  try {
    res.send(curChoices);
  } catch (err) {
      console.error('Error', err);
      res.status(500).json({ message: "An error has occurred" });
  };
  
});

app.post('/clearInactive', async (req, res) => {
  const {level, username} = req.body;
  const emptyChoices = [];
  const levelUpdate = {
    levelNum: level,
    choices: emptyChoices,
  };

  await PlayerModel.updateOne({username: username},{ $set: {progress: levelUpdate}});
  try {
    res.send('Choices cleared');
  } catch (err) {
      console.error('Error', err);
      res.status(500).json({ message: "An error has occurred" });
  };
  
});



// Combat Level
app.post('/combatStart', async (req, res) => {
  const {level} = req.body;
  for (let i = 0; i < Stages.length; i++) {
    let stageInfo = Stages[i].stageInfo;
     if(stageInfo.level === level) {
       let enemies = [];  
       for(let i = 0; i < stageInfo.enemies.length; i++){
        let curEnemy = await EnemyModel.findOne({ name:stageInfo.enemies});
        enemies.push(curEnemy); 
       }
      try {
        res.status(200).send({enemies});
        break;
      } catch (err) {
        console.error('Error', err);
        res.status(500).json({ message: "An error has occurred" });
      };
     } 
  };
});

app.post('/receiveSkills', async (req, res) => {
   const {username} = req.body;
   let doc = await PlayerModel.findOne({ username:username});
   const userSkills = doc.skills;

  try {
    res.status(200).send({userSkills});
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

app.post('/attackAction', async(req, res) => {
  const {attack, enemy} = req.body;
  let attackedEnemy = enemy;
  attackedEnemy.status.curHealth -= attack.baseDMG;

  if(attackedEnemy.status.curHealth > 0){
    attackedEnemy.status.condition = 'alive'
  }else{
    attackedEnemy.status.condition = 'dead'
  };

  let attackEvent = {
     enemy: attackedEnemy
  };

  try {
    res.send({attackEvent});
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

app.post('/enemyAttack', async(req, res) => {
  const {enemies, playerHP} = req.body;
  let newPlayerHP = playerHP;
  
  for(let i=0; i < enemies.length; i++){
    let enemySkills = enemies[i].skills;

    newPlayerHP -= enemySkills.attackDMG;
  };

  // must set a way so that each enemy hits one at a time

  try {
    res.send({newPlayerHP});
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

// Leveling up
app.post('/levelUpdate', async(req, res) => {
  const {expUpdate, username, health} = req.body;
  // if player's exp >= level cap
  // then update level by 1 and level cap by 100
  // also give 1 skill point to use
  let doc = await PlayerModel.findOne({ username:username});
  let userEXP = doc.status.level.exp;
  let expCap = doc.status.level.cap;
  let levelNum = doc.status.level.num;
  let skillPts = doc.status.level.point;
  let message = 'Player Level updated';

  userEXP = userEXP + expUpdate;

  if(userEXP >= expCap){
    message = 'Level Up!';
    levelNum++;
    skillPts++;
    expCap = expCap + 200;
  }

  const expPropertyUpdate = {
    $set: {
      status: {
        health: health,
        level:{
          num:levelNum,
          exp:userEXP,
          cap:expCap,
          point:skillPts,
        }
      }
    }
  };

  await PlayerModel.updateOne({ username: username }, expPropertyUpdate);

  try {
    res.send(message);
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});


connect();

app.listen(3000, () => {
//  console.log('Server started on port 3000');
});
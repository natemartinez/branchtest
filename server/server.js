const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PlayerModel = require('./models/player');
const EnemyModel = require('./models/enemies');
const SkillModel = require('./models/skills');
const app = express();
app.use(cors());
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
  });

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
//Handles quiz results and intializes 'stats'
app.post('/sendUser', async (req, res) => {
  const username = req.body[0];
  const results = req.body[1];

  let stats = {
    'Physical': {
      'strength': 1,
      'dexterity': 1
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

  let status = {
    'health': 100
  };
  let progressStart = 1.1;

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

  try {
    let doc = await PlayerModel.findOne({ username: username.user });
    if (!doc) {
      doc = new PlayerModel({ username: username.user, status:status, skills:skills, personality: results, stats: stats, progress: progressStart });
      await doc.save();
      res.status(200).json({ message: 'New document inserted successfully' });
    } else {
      await PlayerModel.updateOne({ username: username.user }, { $set: {status:status, skills:skills, personality: results, stats: stats, progress: progressStart} });
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

  let physicalClass = doc.stats.physical;
  let mentalClass = doc.stats.mental;
  let skillArray = [];

  if(doc){
    if(physicalClass.strength > 1){
    // get the punching skill
     let punch = await SkillModel.findOne({ skillName: 'Punch' });  
     let kick = await SkillModel.findOne({ skillName: 'Kick' });
     skillArray.push(punch, kick);
   };

   if(mentalClass.intelligence >= 3){
    // get the punching skill
     let distract = await SkillModel.findOne({ skillName: 'Distraction' });  
     let wps = await SkillModel.findOne({ skillName: 'Weak Point Strike' });
     skillArray.push(distract, wps);
   };
   await PlayerModel.updateOne({ username: username }, { $set: {skills: skillArray } });
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
          text: 'hello',        
          stageInfo: {
             level:1.1,
             type: 'search',
             options:[
              {
                name:'Closet',
                type: 'physical',
                stat: 'strength',
                difficulty: 1,
                result: 'Jacket',
                probability:''
              },
              {
                name:'Drawer',
                type: 'mental',
                stat: 'intuition',
                difficulty: 1,
                result: 'Med-kit',
                probability:''
              },
              {
                name:'Under the rug',
                type: 'mental',
                stat: 'intuition',
                difficulty: 1,
                result: 'Med-kit',
                probability:''
              },
              {
                name:'On top of your head',
                type: 'mental',
                stat: 'intuition',
                difficulty: 0,
                result: 'Note',
                probability:''
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
              },
              {
                name:'Hallway',
                result: 1.4,
              },
              {
                name:'Downstairs',
                result: 1.5,
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
              type: 'physical',
              stat: 'strength',
              difficulty: 1,
              result: 'Jacket',
              probability:''
            },
            {
              name:'File cabinet',
              type: 'mental',
              stat: 'intuition',
              difficulty: 1,
              result: 'Med-kit',
              probability:''
            },
            {
              name:'Check the whiteboard',
              type: 'mental',
              stat: 'intuition',
              difficulty: 1,
              result: 'Med-kit',
              probability:''
            },
            {
              name:'Check the windows',
              type: 'mental',
              stat: 'intuition',
              difficulty: 1,
              result: 'Med-kit',
              probability:''
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
           type: 'combat'
        },
      },
];

// All stages
app.post('/currentStage', async (req, res) => {
    const {username} = req.body;
    
    async function buildOptions(level, playerStats){
      for (let i = 0; i < Stages.length; i++) {
        let curStageInfo = Stages[i].stageInfo;
        if (curStageInfo.level === level) {

          let stageType = curStageInfo.type;
          let options = curStageInfo.options;
          let curStage = curStageInfo.level;

           if(stageType === 'search') {
              // search events will compare user stats with options' difficulty
              // to come out to a probability of success
             options.map((option, index) => {             

              let optionType = option.type;
              let optionStat = option.stat;
             // console.log('OPTION TYPE: ', optionType );
              console.log('PLAYER STATS: ', playerStats );

              let userStat = playerStats[optionType][optionStat];

               if(userStat > option.difficulty){
                option.probability = 'easy'
               }else if(userStat < option.difficulty){
                option.probability = 'hard';
               } else{
                option.probability = 'medium';
               }
             });   
             console.log(options)
             res.status(200).json({stageType, options, curStage});
           } else {
             res.status(200).json({stageType, options, curStage});
           };
          break;
        }
      } 
    };

    try {
      let doc = await PlayerModel.findOne({ username: username });
      if (doc) { 
        const userProgress = doc.progress;
        const userStats = doc.stats;
        await buildOptions(userProgress, userStats);
      }

    } catch (err) {
        console.error('Error', err);
        res.status(500).json({ message: "An error has occurred" });
    };
});

// Stage progression
app.post('/stageChange', async (req, res) => {
    const {username, level, type} = req.body;
    
    let nextStage = '';

    // used to update database for progression
    if(type === 'location'){
       for (let i = 0; i < Stages.length; i++) {
         if(Stages[i].stageInfo.level === level){
          await PlayerModel.updateOne({username: username},{ $set: { progress:level}});
          break;
         }
       };
    } else if(type === 'search'){
       for (let i = 0; i < Stages.length; i++) {
        let stageInfo = Stages[i].stageInfo;
         if(stageInfo.level === level) {
          nextStage = stageInfo.result;
          await PlayerModel.updateOne({username: username},{ $set: { progress:nextStage}});
          //console.log('next stage:', nextStage);
          break;
         } 
       };
    };
    //

    try {
      res.send('Level updated');
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

connect();

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
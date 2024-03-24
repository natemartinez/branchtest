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
    let doc = await PlayerModel.find({ $and: [
      { username: username },
      { password: password }
    ]});

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

app.get('/startQuiz', async (req, res) => {
  const intTraits = {
  // In the future I want to make semi-traits
  // ones that's in the middles of both traits, leaning slightly towards one or the other
    mental: [
      {name:'Logical', weight: 0},
      {name:'Creative', weight: 0}
    ],
    social: [
      {name:'Introvert', weight: 0},
      {name:'Extrovert', weight: 0}
    ],
    sleep: [
      {name:'Early Bird', weight: 0},
      {name:'Night Owl', weight: 0}
    ],
    temper: [
      {name:'Hothead', weight: 0},
      {name:'Pacifist', weight: 0}
    ],
  };

  const questions = [
   "You make decisions based on what is effective, rather than how others may feel",
   "Being at a quiet place is your cup of tea, over being in large gatherings",
   "You have a reliable sleep schedule",
   "You're usually the first to speak up if something goes wrong",
   "You feel your social battery drains faster than most",
   "The advice you give is based on what worked for you, rather than what makes them feel better",
  ];

  try {
    res.send({intTraits, questions});
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error updating document' });
  }
});
app.post('/saveTraits', async (req, res) => {
  const {traits, option, questionNum} = req.body;
  //make sure there's an odd number of questions
  // so that the traits can't match
   switch(questionNum) {
    case 0:
      if(option == 'Agree'){
        traits.mental[0].weight += 2;
      } else if(option == 'Slightly Agree'){
        traits.mental[0].weight += 1;
      } else if(option == 'Slightly Disagree'){
        traits.mental[1].weight += 1;
      }else if(option == 'Disagree'){
        traits.mental[1].weight += 2;
    }
    break;
    case 1:
      if(option == 'Agree'){
        traits.social[0].weight += 2;
      } else if(option == 'Slightly Agree'){
        traits.social[0].weight += 1;
      } else if(option == 'Slightly Disagree'){
        traits.social[1].weight += 1;
      }else if(option == 'Disagree'){
        traits.social[1].weight += 2;
    }
    break;
    case 2:
      if(option == 'Agree'){
        traits.sleep[0].weight += 2;
      } else if(option == 'Slightly Agree'){
        traits.sleep[0].weight += 1;
      } else if(option == 'Slightly Disagree'){
        traits.sleep[1].weight += 1;
      }else if(option == 'Disagree'){
        traits.sleep[1].weight += 2;
    }
    break;
    case 3:
      if(option == 'Agree'){
        traits.temper[0].weight += 2;
      } else if(option == 'Slightly Agree'){
        traits.temper[0].weight += 1;
      } else if(option == 'Slightly Disagree'){
        traits.temper[1].weight += 1;
      }else if(option == 'Disagree'){
        traits.temper[1].weight += 2;
      }
      break;
    case 4:
      if(option == 'Agree'){
        traits.social[0].weight += 3;
      } else if(option == 'Slightly Agree'){
        traits.social[0].weight += 2;
      } else if(option == 'Slightly Disagree'){
        traits.social[1].weight += 2;
      }else if(option == 'Disagree'){
        traits.social[1].weight += 3;
      }
      break;
    case 5:
      if(option == 'Agree'){
        traits.mental[0].weight += 2;
      } else if(option == 'Slightly Agree'){
        traits.mental[0].weight += 1;
      } else if(option == 'Slightly Disagree'){
        traits.mental[1].weight += 1;
      }else if(option == 'Disagree'){
        traits.mental[1].weight += 2;
      }
      break;
   }

  try {
    res.send({traits});
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error updating document' });
  }
});
app.post('/calcResult', async (req, res) => {
   const {results} = req.body;
   let traitArr = [];
   let stats = {
    "Physical": {
      "strength": 1,
      "dexterity": 1
    },
    "Mental": {
      "intuition": 1,
      "intelligence": 1
    },
    "Soul": {
      "willpower": 1,
      "resistance": 1
    },
    "Expression": {
      "creativity": 1,
      "presence": 1
    }
   };

   // sets traits
   Object.entries(results).forEach(function([key, traits]) {
     let trait;
     results[key].forEach(function(compTrait){
       if(trait == undefined){
        trait = compTrait;
       }else if(compTrait.weight > trait.weight){
         trait = compTrait;
       } else if(trait.weight > compTrait.weight){
         console.log('keep this trait', trait);
       }
     });
    traitArr.push(trait);
   });

   //sets stats based on chosen traits
   traitArr.forEach(result => {
    switch (result.name) {
       case "Logical":
       stats.Mental.intelligence += 2;
       break;
       case "Creative":
       stats.Expression.creativity += 2;
       break;
       case "Introvert":
       stats.Mental.intuition += 1;
       break;
       case "Extrovert":
       stats.Soul.willpower += 1;
       break;
       case "Early Bird":
       stats.Physical.strength += 1;
       break;
       case "Night Owl":
       stats.Soul.resistance += 1;
       break;
       case "Hothead":
       stats.Soul.willpower += 1;
       stats.Soul.resistance += 1;
       break;
       case "Pacifist":
       stats.Expression.presence += 1;
       stats.Soul.willpower += 1;
       break;
    } 
   });
   console.log(stats);
  try {
    res.send({traitArr, stats});
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error updating document' });
  }
});

//Handles quiz results and initializes 'stats'
app.post('/sendUser', async (req, res) => {
  const {traits, stats, name} = req.body;

  // Initializes all of player's info
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

  try {
    let doc = await PlayerModel.findOne({ username: name });
    if (!doc) {
      doc = new PlayerModel({ username: name, status:status, skills:skills, attacks:attacks, personality: traits, stats: stats, inventory:inventory, progress: progressStart });
      await doc.save();
      res.status(200).json({ message: 'New document inserted successfully' });
    } else {
      await PlayerModel.updateOne({ username: name }, { $set: {status:status, skills:skills, attacks:attacks, personality: traits, stats: stats, inventory:inventory, progress: progressStart} });
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
    if(physicalClass.strength >= 0){
      let punch = await AttackModel.findOne({ skillName: 'Punch' });  
      attacksArray.push(punch);
    };
    if(physicalClass.strength > 1){
    // get the punching skill
     let kick = await AttackModel.findOne({ skillName: 'Kick' });
     attacksArray.push(kick);
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
            "<div class='diff-div'><img class='diff-exp' src='images/easy.png'></img><p> = Easy</p></div>" +
            "<div class='diff-div'><img class='diff-exp' src='images/medium.png'></img><p> = Medium</p></div>" +
            "<div class='diff-div'><img class='diff-exp' src='images/hard.png'></img><p> = Hard</p></div>" +
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
                stat: 'strength',
                probability: 3,
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
                probability: 4,
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
                probability: 2,
                result: {
                  item: 'Wooden Panel',
                  xp:50
                },
                class:'game-btn'
              },
             ],
             result:1.2
          },     
      },//1.1
      {
          name:'location1',
          text: "<h1>Choose your next location</h1>",    
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
      },//1.2
      {
        name: 'Office',
        text: '<h1>Looking in the office</h1>',
        stageInfo: {
           level:1.3,
           type: 'search',
           options:[
            {
              name:'Desk',
              type: 'Mental',
              stat: 'intelligence',
              probability: 3,
              result: {
                item: 'Coins',
                xp: 0
              },
              class:'game-btn'
            },
            {
              name:'File cabinet',
              type: 'Physical',
              stat: 'strength',
              probability: 2,
              result: {
                item: 'Coins',
                xp: 0
              },
              class:'game-btn'
            },
            {
              name:'Check the whiteboard',
              type: 'Mental',
              stat: 'intelligence',
              probability: 2,
              result: {
                item: 'Stick',
                xp: 30
              },
              class:'game-btn'
            },
            {
              name:'Check the windows',
              type: 'Mental',
              stat: 'intuition',
              probability: 2,
              result: {
                item: 'Tape',
                xp: 50
              },
              class:'game-btn'
            },
           ],
           result: 1.7
        }, 
      },//1.3
      {
        name: 'Hallway',
        text: '<h1>Looking in the hallway</h1>',
        stageInfo: {
           level:1.4,
           type: 'search',
           options:[
            {
              name:'Janitor closet',
              type: 'Physical',
              stat: 'strength',
              probability: 4,
              result: {
                item: 'Coins',
                xp: 0
              },
              class:'game-btn'
            },
            {
              name:'File cabinet',
              type: 'Mental',
              stat: 'intuition',
              probability: 3,
              result: {
                item: 'Coins',
                xp: 0
              },
              class:'game-btn'
            },
            {
              name:'Check the whiteboard',
              type: 'Mental',
              stat: 'intuition',
              probability: 3,
              result: {
                item: 'Stick',
                xp: 30
              },
              class:'game-btn'
            },
            {
              name:'Check the windows',
              type: 'Mental',
              stat: 'intuition',
              probability: 2,
              result: {
                item: 'Tape',
                xp: 50
              },
              class:'game-btn'
            },
           ],
           result: 1.7
        }, 
      },//1.4
      {
        name:'battle1',
        text: '<h2>You have been attacked by ghosts!</h2> <br> <h2>Time to fight!</h2>',
        stageInfo: {
           level: 1.7,
           enemies:['ghost', 'ghost'],
           type: 'combat',
           result: {
            item: 'Med-kit',
            xp: 100,
            next: 1.8,
            type: 'location'
           }
        },
      },//1.7
      {
        name:'location1',
        text: "<h1>Choose your next location</h1>",    
        stageInfo: {
           level:1.8,
           type: 'location', 
           options:[
            {
              name:'Upstairs',
              result: 5.1,
              class:'game-btn'
            },
            {
              name:'Downstairs',
              result: 4.1,
              class:'game-btn'
            },
            {
              name:'Outside',
              result: 3.1,
              class:'game-btn'
            },
           ]   
        },
      },//1.8
];

// DB info -> stage info
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

app.post('/removeItem', async (req, res) => {
  const {username, item} = req.body;
  let doc = await PlayerModel.findOne({ username: username });
  let newInventory = doc.inventory;

  for(let i=0; i < newInventory.length; i++){
    if(newInventory[i].name === item.name){
      newInventory.splice(i, 1);
    }
  }

  await PlayerModel.updateOne({ username: username }, { $set: {inventory: newInventory} });

try {
  res.send('Item removed')
} catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
};
});

// Stage progression
app.post('/stageChange', async (req, res) => {
    const {username, level, type} = req.body;
    let nextStage;

    let levelUpdate = {
      levelNum: level,
      choices: []
    };
;

    if(type === 'location'){
       for (let i = 0; i < Stages.length; i++) {
         let stageInfo = Stages[i].stageInfo;
         if(stageInfo.level === level){
          levelUpdate.levelNum = level;
          await PlayerModel.updateOne({username: username},{ $set: {progress: levelUpdate}});
         }
       };
    } else if(type === 'search'){
       for (let i = 0; i < Stages.length; i++) {
        let stageInfo = Stages[i].stageInfo;
         if(stageInfo.level === level) {
          nextStage = stageInfo.result;
          console.log('Level: ', nextStage);

          levelUpdate.levelNum = nextStage;
          await PlayerModel.updateOne({username: username},{ $set: { progress:levelUpdate}});
         } 
       };
    } else if(type === 'combat'){
       for (let i = 0; i < Stages.length; i++) {
        let curStageLevel = Stages[i].stageInfo.level;
          if(curStageLevel === level) {
            nextStage = Stages[i].stageInfo.result;
            levelUpdate.levelNum = nextStage.next;
            await PlayerModel.updateOne({username: username},{ $set: { progress:levelUpdate}});
          } 
       };
    };

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
    }
  };
  try {
    res.send(curChoices);
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
   const {username, type} = req.body;
   let doc = await PlayerModel.findOne({ username:username });
   let combatData = doc.attacks;

  try {
    res.status(200).send({combatData});
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

app.post('/attackAction', async(req, res) => {
  const {attack, enemy, username} = req.body;
  let enemyUpdate = enemy;
  let doc = await PlayerModel.findOne({ username:username });

  let wpStat = doc.stats.Soul.willpower;
  let message = 'Nice attack!'

  const checkForCrit = (attack, willpower) => {
    let crit = Math.floor(Math.random() * 100); // if result is greater than 80, then crit works
    if(willpower >= 2) {
      if(crit >= 75){
        attack.baseDMG += 20;
        message = 'Critical Hit!'
      }
    };
  };
  checkForCrit(attack, wpStat);
  enemyUpdate.status.curHealth -= attack.baseDMG;
  
  // stats like willpower will increase critical rate as health goes down
  // use stats to increase or possibility decrease attack success and DMG

  try {
    res.send({enemyUpdate, message});
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

app.post('/enemyAttack', async(req, res) => {
  const {enemies, playerHP, username} = req.body;
  let doc = await PlayerModel.findOne({ username:username });

  let enemyAttacks = [5, 10]; //examples: eventually will be enemies.attacks
  let result = [];
  let message = 'Enemy is attacking';


  const enemyHit = (attacks, hp) => {
    let hpHit = hp;
   for(let i=0; i < attacks.length; i++){
     let curAttack = enemyAttacks[i];
     hpHit = hpHit - curAttack;
     result.push(hpHit);
   };
  }

  enemyHit(enemyAttacks, playerHP);

 // Look at skills and stats to determine what happens
 // Skills like dodge have a certain chance of happening
 // increases as dexterity is grown and leveled up (starts with 10% of success)
 
 // Stats like resistance will lower the damage if the attack does succeed
 
 // let userStats = doc.stats;
 // let userSkills = doc.skills;
 // let resist = userStats.Soul.resistance;
  // If Resistance is between 1-5 then remove 5 points from the DMG
  // 5-10 = 10 points from DMG
  // 10-15 = 20 points from DMG
  // and so on...

  // need to check for enemies' speed to determine who hits

  // also need to randomize what attack the enemy chooses - not priority
  
  // 3 functions:
  // - Resist
  // - Critical
  // - Does it land?


  try {
    res.send({result, message});
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

// Leveling up
app.post('/levelUpdate', async(req, res) => {
  const {expUpdate, username, health} = req.body;
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

app.post('/healthUpdate', async(req, res) => {
  const {username, health} = req.body;
  let doc = await PlayerModel.findOne({ username:username });

  let userEXP = doc.status.level.exp;
  let expCap = doc.status.level.cap;
  let levelNum = doc.status.level.num;
  let skillPts = doc.status.level.point;
 
  // check if healthUpdate clears user.status.level
  const healthUpdate = {
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

  await PlayerModel.updateOne({ username: username }, healthUpdate);
  try {
    res.send('health updated');
  } catch (err) {
    console.error('Error', err);
    res.status(500).json({ message: "An error has occurred" });
  };
});

connect();

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database')


// User schema

const UserSchema = mongoose.Schema({
    admin: {type:Boolean, required:false},
    admincode: {type: String, required:false},
    first_name: {type: String},
    last_name: {type: String},
    email: {type: String,unique: true},
    password: {type: String},
    participation_code: {type: String},
    role: {type: String},
    group_id: {type: Number},
    session: {type: String},
    ku_id: {type: String},
    register_date: {type: Date},
    tasks:{type: Array},
    extra_allocation_info:{type:Boolean},
    minimal_work:{type:Number},
    work_assignment: {type:Object, requiered:false},
    resetcode:{type:String, required:false},
    timestamps:{type:Array, required:false},
    instructionreports:{type:Array, required:false},
    payoffweek:{type:Number, required:false},
    reset_info:{type:Object, required:false},
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.addUser = function(newUser, callback){
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(callback);
    })
  });
}

module.exports.newPassword = function(email, password, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        console.log(err);
      }
      User.updateOne({email:email}, {$set:{ password:hash }}, callback)
    })
  })
}

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

// Get user by username
module.exports.getUserByEmail = function(email, callback) {
  const query = {email: email};
  User.findOne(query, callback);
}

// Check password
module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}

// Find partner
module.exports.findPartner = function(user, callback) {
  User.find( { session: user.session, group_id:user.group_id, _id:{$ne:user._id} }, (err, response) => {
    if (err) throw err;
    if (response.length == 0) {
      callback(true)
    } else {
      callback(null, response[0])
    }
  })
}

// Update user
module.exports.updateUser = function(info, callback) {
  if (info.update_type == 'complete_instructions' || info.update_type == 'complete_survey') {
    User.updateOne({ _id: info.user.id }, {$set: { tasks: info.user.tasks }}, callback)
  }
}

// Update timestamps
module.exports.updateTimestamps = function(info, callback) {
    User.getUserById(info.user._id, (err, dbuser) => {
      if (err) {
        console.log(err);
      } else {
        if (!dbuser.timestamps | dbuser.timestamps.map(e=>e.stamp_tag).indexOf(info.stamp_tag) == -1 | ['work','minwork'].indexOf(info.stamp_tag) != -1) {
          let newstamps = [{time:info.time, stamp_tag:info.stamp_tag}];
          if (dbuser.timestamps.length > 0) {
              newstamps = dbuser.timestamps.concat(newstamps);
          }
          User.updateOne({ _id: info.user._id }, { $set: { timestamps:newstamps } }, callback)
        }
      }
    })
}

// Register work
module.exports.registerWork = function(task_info, user, callback) {
  User.findById(user.id, (err, dbUser) => {
    let updateTasks = dbUser.tasks
    updateTasks.find(e => e.task_tag === task_info.tag).work_completed = task_info.completed;
    if (task_info.tag.substr(0,4)=="work") {
      if ((task_info.tag=="work1" & task_info.completed >= dbUser.work_assignment.week2) || (task_info.tag=="work2" & task_info.completed >= dbUser.work_assignment.week3+10)) {
        updateTasks.find(e => e.task_tag === task_info.tag).work_finished = true;
      }
    }
    User.updateOne({_id: user.id}, {$set: { tasks: updateTasks }}, callback)
  })
}

// Register sentiment
module.exports.registerSentiment = function(info, user, callback) {
  User.findById(user.id, (err, dbUser) => {
    let updateTasks = dbUser.tasks
    if (info.type == 'before') {
      updateTasks.find(e => e.task_tag === info.task_tag).sentiment_before = info.sentiment;
    } else if (info.type == 'after') {
      updateTasks.find(e => e.task_tag === info.task_tag).sentiment_after = info.sentiment;

      if (info.task_tag.substr(0,4)=='work') {
        updateTasks.find(e => e.task_tag === info.task_tag).completed = true;
      }
    }
    User.updateOne({_id: user.id}, {$set: { tasks: updateTasks }}, callback)
  })
}

// Register min work
module.exports.registerMinWork = function(task_info, user, callback) {
  User.findById(user.id, (err, dbUser) => {
    let updateTasks = dbUser.tasks
    updateTasks.find(e=> e.task_tag === task_info.tag).min_work_completed = task_info.completed;
    User.updateOne({_id: user.id}, {$set: { tasks: updateTasks }}, callback)
  })
}


// Register allocation
module.exports.registerChoice = function(choice_info, user, callback) {
  User.findById(user.id, (err, dbUser) => {

    let updateTasks = dbUser.tasks;
    updateTasks.find(e => e.task_tag === choice_info.tag).allocation = choice_info.choices;
    // if (choice_info.completed) {
    //   updateTasks[updateTasks.map(e => e.task_tag).indexOf(choice_info.tag)].completed = true;
    // }
    User.updateOne({_id: user.id }, {$set: { tasks: updateTasks }}, callback);
  })
}

// Register allocation text
module.exports.registerAllocationText = function(choice_info, user, callback) {
  User.findById(user.id, (err, dbUser) => {
    let updateTasks = dbUser.tasks;
    updateTasks.find(e => e.task_tag === choice_info.tag).free_text = choice_info.text;
    updateTasks.find(e=> e.task_tag === choice_info.tag).completed = true;

    // Whereas updateOne only return information about how many where updated, findOneAndUpdate also returns the updated object (set new:true to include last updates)
    User.findOneAndUpdate({_id: user.id }, {$set: {tasks: updateTasks }}, {new: true}, callback);
  })
}

// Register regulation choice
module.exports.registerRegChoice = function(submit, user, callback) {
  User.findById(user.id, (err, dbUser) => {
    if (err) {
      res.json({success:false, msg:'Could not find user'})
    } else {
      let updateTasks = dbUser.tasks
      if (submit.name == 'part1') {
        updateTasks.find(e => e.task_tag === 'regulation'+submit.week).parts = []
      }
      updateTasks.find(e => e.task_tag === 'regulation'+submit.week).parts.push(submit)
      if (submit.name == 'part4') {
        updateTasks.find(e => e.task_tag === 'regulation'+submit.week).payoffchoice = Math.floor(Math.random()*12);
        updateTasks.find(e => e.task_tag === 'regulation'+submit.week).completed = true;
      }
      User.updateOne({_id: user.id}, {$set: {tasks:updateTasks }}, callback)
    }
  })
}

// Instructions report 
module.exports.instructionsReport = function(user, report, callback) {
  User.findById(user._id, (err, dbUser) => {
    let reports = [{report:report, time:now.toString()}].concat(dbUser.instructionreports ? dbUser.instructionreports : []);
    User.updateOne({_id: user._id }, {$set: { instructionreports: reports }}, callback);
  });
  let now = new Date()
}

// Set allocation
module.exports.setAllocation = function(user, callback) {
  // Make draws that apply to both roles.
  let week1_probability = 0.1;

  let work_assignment = {
    week : Math.random() < week1_probability ? 1 : 2,
    choice_number : Math.floor(Math.random() * 5)
  }
  work_assignment.exchange_rate = user.tasks.find(e => e.task_tag === 'allocation'+work_assignment.week).allocation[work_assignment.choice_number].exchange_rate;
  work_assignment.choice = user.tasks.find(e => e.task_tag === 'allocation'+work_assignment.week).allocation[work_assignment.choice_number].choice;
  if (user.role == 'worker') {
    this.findPartner(user, (err, partner) => {
      // What if the partner hasn't made a choice?
      if (err) {
        work_assignment.regulation_min = 0;
        work_assignment.regulator_found = false;
        work_assignment.regulation_set = false;
      }
      else {
        if (partner) {
          let index = partner.tasks.map(e => e.task_tag).indexOf('regulation'+work_assignment.week);
          if (index != -1 && partner.tasks[index].parts && partner.tasks[index].parts[0].choices) {
            work_assignment.regulation_min = partner.tasks[index].parts[0].choices[work_assignment.choice_number];
            work_assignment.regulator_found = true;
            work_assignment.regulation_set = true;
          } else {
            work_assignment.regulation_min = 0;
            work_assignment.regulator_found = true;
            work_assignment.regulation_set = false;
          }
        } else {
          work_assignment.regulation_min = 0;
          work_assignment.regulator_found = false;
          work_assignment.regulation_set = false;
        }
      }
      work_assignment.week2 = work_assignment.regulation_min > work_assignment.choice ? work_assignment.regulation_min : work_assignment.choice;
      work_assignment.week3 = (50-work_assignment.week2)*work_assignment.exchange_rate;
      User.updateOne({_id: user._id}, {$set: {work_assignment:work_assignment}}, (err) => {
        callback(err, work_assignment);
      });
  });
    // So we have to find the person in the same session and with the same group id
  }
  else if (user.role == 'regulator') {
    work_assignment.week2 = work_assignment.choice;
    work_assignment.week3 = (50-work_assignment.choice)*work_assignment.exchange_rate;
    User.updateOne({_id:user._id}, {$set: {work_assignment:work_assignment}}, (err) => {
      callback(err, work_assignment);
    });
  }
  else {
    callback('User has no role');
  }
}

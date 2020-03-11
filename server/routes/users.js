const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const moment = require('moment');
const crypto = require('crypto');
const mailgun = require('mailgun-js');

const User = require('../models/user');
const Session = require('../models/session');
const nodemailer = require('nodemailer');

const url = "http://localhost:4200"

// Register users
router.post('/register', (req, res, next) => {

    if (req.body.participation_code === "ceb1X8492") {
        // Register admin
        let admin = new User({
            admin:true,
            first_name:req.body.first_name,
            last_name:req.body.last_name,
            email:req.body.email,
            password:req.body.password,
            admincode:'79k8uioa3l8',
        })

        User.addUser(admin, (err) => {
            if (err) {
                res.json({success:false, msg:"Unable to register admin"});
            } else {
                res.json({success:true, msg:"Admin registered"})
            }
        })
    } else {

        // (1) Validate that the user is in a session - and validate ku if ku_student
        // (2) Register in session as registered
        // (3) Apply session to user
        // (4) check for KU
        // (5) Assign role and group_id

        let newUser = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
            participation_code: req.body.participation_code,
            register_date:new Date().toString(),
            extra_allocation_info:Math.random() >= .25,
            minimal_work:10,
            payoffweek:Math.floor(Math.random()*2)+1,
            reset_info:req.body.reset_info,
        });
    
        if (req.body.ku_id) {
            newUser.ku_id = req.body.ku_id;
        }
    
        Session.find({}, (err, sessions) => {
            let user_found = false;
            let already_registered = false;
            let ku_login_problem = false;
    
            let new_logins = [];
    
            sessions.forEach(session => {
                let index = session.logins.map(x => x.participation_code).indexOf(newUser.participation_code);
                if (index != -1) {
                    user_found = true;
    
                    // Check if already registered
                    if (session.logins[index].registered) {
                        already_registered = true;
                    } else {
                        // Set session for user
                        newUser.session = session.session_number;
                        newUser.role = session.logins[index].role;
                        newUser.group_id = session.logins[index].group_id;
    
                        // Set tasks
                        if (newUser.role == 'worker') {
                            newUser.tasks = [
                                { task_tag:'instructions', name:'Instructions', completed:false, completion_week: 1, link:'instructions' },
                                { task_tag:'survey1', name:'Survey 1', completed:false, completion_week: 1, link:'surveyone'},
                                { task_tag:'allocation1', name:'Allocation choice', completed:false, completion_week: 1, link:'allocation'},
                                { task_tag:'allocation2', name:'Allocation choice', completed:false, completion_week: 2, link:'allocation'},
                                { task_tag:'work1', name:'Week 2 work', completed:false, completion_week: 2, link:'workweek2'},
                                { task_tag:'work2', name:'Week 3 work', completed:false, completion_week: 3, link:'workweek3'},
                                { task_tag:'survey2', name:'Survey 2', completed:false, completion_week: 3, link:'surveytwo'},
                            ]
                        } else if (newUser.role == 'regulator') {
                            newUser.tasks = [
                                { task_tag:'instructions', name:'Instructions', completed:false, completion_week: 1, link:'instructions' },
                                { task_tag:'allocation1', name:'Allocation choice', completed:false, completion_week: 1, link:'allocation'},
                                { task_tag:'regulation1', name:'Regulation choice', completed:false , completion_week: 1, link:'regulation'},
                                { task_tag:'allocation2', name:'Allocation choice', completed:false, completion_week: 2, link:'allocation'},
                                { task_tag:'regulation2', name:'Regulation choice', completed:false , completion_week: 2, link:'regulation'},
                                { task_tag:'work1', name:'Week 2 work', completed:false, completion_week: 2, link:'workweek2'},
                                { task_tag:'work2', name:'Week 3 work', completed:false, completion_week: 3, link:'workweek3'},
                                { task_tag:'survey1', name:'Survey 1', completed:false, completion_week: 3, link:'surveyone'},
                                { task_tag:'survey2', name:'Survey 2', completed:false, completion_week: 3, link:'surveytwo'},
                            ]
                        }
    
                        // Check KU
                        if (session.logins[index].ku_student) {
                            const valid_ku = /^[a-zA-Z]{3}\d{3}$/;
                            if (!valid_ku.test(String(newUser.ku_id).toLowerCase())) {
                                ku_login_problem = true;
                                return false;
                            }
                        }
                        if (!ku_login_problem) {
                            // Set as registered in sessions
                            new_logins = session.logins;
                            new_logins[index].registered = true;
                         }
                    }
    
                }
            });
            if (user_found && !already_registered && !ku_login_problem) {
                // addd user
                User.addUser(newUser, (err, user) => {
                    if(err) {
                        console.log(err);
                        res.json({success:false, msg:'Failed to register user'});
                    } else {
                        Session.updateLogin(newUser.session, new_logins, (err, response) => {
                            if (err) {
                                console.log('Error'+err)
                            }
                        });
                        res.json({success:true, msg:'User registered'});
                    }
                });
    
            } else if (!user_found) {
                res.json({success:false, msg:'Invalid participation code'});
            } else if (already_registered) {
                res.json({success:false, msg:'Participation code has already been used'});
            } else if (ku_login_problem) {
                res.json({success:false, msg:'Please input a valid KU ID'});
            }
            else {
                res.json({success:false, msg:'Invalid participation code'});
            }
        });
    }
});

// Authenticate/login
router.post('/authenticate', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.getUserByEmail(email, (err, user) => {
        if(err) throw err;
        if(!user) {
            return res.json({success:false, msg: 'User not found'});
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                const token = jwt.sign({data:user}, config.secret, {
                    expiresIn:10800 // Three hours in seconds
                });
                sendUser = {
                    id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role:user.role,
                    session:user.session,
                    register_date:user.register_date,
                    tasks: user.tasks,                    
                }
                if (user.admin) {
                    sendUser.admin = true;
                }

                res.json({
                    success:true,
                    token:'JWT '+token,
                    user: sendUser,
                });
            } else {
                return res.json({success: false, msg: 'Wrong password'});
            }
        });
    });
});

// --> Get and post new password

// Get profile
// router.post('/profile', passport.authenticate('jwt', {session:false}), (req, res) => {
router.post('/profile', (req, res) => {
        // res.json({user:req.user});
    User.getUserByEmail(req.body.email, (err, dbUser) => {
        if (err) {
            res.json({success:false});
        } else {
            res.json({success:true, user:dbUser});
        }
    })
});

// Complete instructions
router.post('/completeinstructions', passport.authenticate('jwt', {session:false}), (req, res) => {
    let user = req.user;
    user.tasks[0].completed = true;
    const info = { update_type: 'complete_instructions', user:user }
    User.updateUser(info, (err, response) => {
        if(err) {
            console.log(err)
        } else {
            let timestamp = new Date();
            User.updateTimestamps({user:user, time:timestamp.toString(), stamp_tag:'instructions_complete'}, (error, resp) => {
                if (error) {
                    console.log(error)
                } else {
                    res.json({success:true})
                }
            })
        }
    });
});

// Complete survey
router.post('/completesurvey', passport.authenticate('jwt', {session:false}), (req, res) => {
    let num = req.body.surveynum;
    let user = req.user;
    let choices = req.body.choices;

    let index = user.tasks.map(e => e.task_tag).indexOf('survey'+num)
    user.tasks[index].completed = true;
    user.tasks[index].answers = choices;
    user.tasks[index].bombplacement = Math.floor(Math.random()*101);
    const info = { update_type: 'complete_survey', user:user}
    User.updateUser(info, (err, response) => {
        if(err) {
            console.log(err)
        } else {
            // Set timestamp
            let timestamp = new Date();
            User.updateTimestamps({user:user, time:timestamp.toString(), stamp_tag:"survey_complete"+num}, (error, resp) => {
                if (error) {
                    console.log(error);
                } else {
                    res.json({success:true})
                }
            })
        }
    })
})

// Register sentiment
router.post('/sentiment',passport.authenticate('jwt',{session:false}), (req,res) => {
    let info = req.body;
    let user = req.user;
    User.registerSentiment(info, user, (err, response) => {
        if (err) {
            console.log(err);
            res.json({success:false, msg:'Something went wrong'});
        } else {
            let timestamp = new Date();
            User.updateTimestamps({user:user, time:timestamp.toString(), stamp_tag:`${info.task_tag}_${info.type}`}, (error, response) => {
                if (error) {
                    console.log(error)
                } else {
                    res.json({success:true, msg:'Sentiment registered'})
                }
            })
        }
    })
})

// Register work
router.post('/registerwork', passport.authenticate('jwt',{session:false}), (req, res) => {
    let task_info = req.body;
    let user = req.user;
    User.registerWork(task_info, user, (err, response) => {
        if (err) {
            console.log(err);
            res.json({success:false, msg:'Registration was not possible'})
        } else {
            let now = new Date();
            User.updateTimestamps({user:user, time:now.toString(), stamp_tag:"work"}, (error, response) => {
                if (error) {
                    console.log(error);
                } else {
                    res.json({success:true, msg:'Work registered'});
                }
            })
        }
    });
});

// Register min work
router.post('/registerminwork', passport.authenticate('jwt',{session:false}), (req, res) => {
    let task_info = req.body;
    let user = req.user;
    User.registerWork(task_info, user, (err, response) => {
        if (err) {
            console.log(err);
            res.json({success:false, msg:'Registration was not possible'})
        } else {
            let now = new Date();
            User.updateTimestamps({user:user, time:now.toString(), stamp_tag:"minwork"}, (error, response) => {
                if (error) {
                    console.log(error);
                } else {
                    res.json({success:true, msg:'Work registered'});
                }
            })
        }
    });
});


// Register allocation
router.post('/registerchoice', passport.authenticate('jwt',{session:false}), (req, res) => {
    let choice_info = req.body;
    let user = req.user;

    // The problem previously was probably that I didn't use the updated user but used the user from here!!

    User.registerChoice(choice_info, user, err => {
        if (err) {
            res.json({success:false, msg:'Error registering choice..'})
        } else {
            let timestamp = new Date();
            User.updateTimestamps({user:user, time:timestamp.toString(), stamp_tag:choice_info.tag+'_completed'}, (error, response) => {
                if (error) {
                    console.log(error)
                } else {
                    res.json({success:true, msg:'Choices submitted'})
                }
            })
        }
    })
});

// Register free text
router.post('/registerAllocationText', passport.authenticate('jwt',{session:false}), (req, res) => {
    let choice_info = req.body;
    User.registerAllocationText(choice_info, req.user, (err, user) => {
        if (err) {
            res.json({success:false, msg:'Error registering text...'});
        } else if (choice_info.tag == 'allocation2') {
            // Now we set allocation
            User.setAllocation(user, (err) => {
                if (err) {
                    res.json({success:false, msg:err})
                } else {
                    let timestamp = new Date();
                    User.updateTimestamps({user:user, time:timestamp.toString(), stamp_tag:choice_info.tag}, (error, response) => {
                        if (error) {
                            console.log(error);
                        } else {
                            res.json({success:true, msg:'Choice submitted'})
                        }
                    })
                }
            })
        } else {
            res.json({success:true, msg:'Choices have been registered'})
        }
    });
});


// Register regulation choice
router.post('/registerregchoice', passport.authenticate('jwt',{session:false}), (req, res) => {
    let submit = req.body;
    let user = req.user;
    User.registerRegChoice(submit, user, err => {
        if (err) {
            res.json({success:false,msg:'Failed to submit choices'});
        } else {
            let timestamp = new Date()
            User.updateTimestamps({user, time:timestamp.toString(), stamp_tag: `regulation${submit.week}_${submit.name}`}, (error, response) => {
                if (error) {
                    console.log(error);
                } else {
                    res.json({success:true, msg:'Choices have been submitted'});
                }
            })
        }
    })
});

// Reset password email
router.post('/resetpassword', (req, res) => {{
    // Set reset domain-code for user
    let email = req.body.email;
    if (email) {
        // Find user, add resetcode, send email with link(/:resetcode)
        User.getUserByEmail(email, (err, user) => {
            if (err || !user || user.length == 0) {
                res.json({success:false, msg:'Email not registered'})
            } else {
                res.json({success:true, data:user.reset_info});
            }
        })
    }
    else {
        res.json({success:false, msg:'No email recieved'})
    }
}});

// Set new password using answer
router.post('/setnewpassword', (req, res) => {
    User.getUserByEmail(req.body.email, (err, dbUser) => {
        if (err) {
            res.json({success:false, msg:"Email not found"})
        } else {
            if (req.body.answer.toLowerCase().trim() === dbUser.reset_info.answer.toLowerCase().trim()) {
                // Set new password
                User.newPassword(req.body.email, req.body.password, (err, response) => {
                    if (err) {
                    } else {
                        res.json({success:true, msg:"Password has been changed"})
                    }
                })
            } else {
                res.json({success:false, msg:"Your reset answer does not match"});
            }
        }
    })
})

// Reset password link
router.post('/newpassword', (req, res) => {
    let password = req.body.password;
    let resetcode = req.body.resetcode;
    // Find user by resetcode -> if one is returned, update password
    User.newPassword(resetcode, password, (err, user) => {
        if (err) {
            res.json({success:false, msg:'Unable to update password'});
        }
        else {
            res.json({success:true, msg:'Password updated'});
        }
    })
});

// Get suggestion
router.post('/getsuggestion', (req, res) => {
    let user = req.body.user;
    let week = req.body.week
    User.findPartner(user, (err, partner) => {
        if (err) {
            res.json({success:false, suggestions:null})
        } else {
            let index = partner.tasks.map(e => e.task_tag).indexOf('regulation'+week);
            if (index != undefined && index > -1 && partner.tasks[index].parts) {
                res.json({success:true, suggestions:partner.tasks[index].parts.filter(e => e.name == 'part1')[0].suggestions.min})
            } else {
                res.json({success: true, suggestions:null})
            }
        }
    })
})

// Set timestamp
router.post('/timestamp', (req, res) => {
    let user = req.body.user;
    // We should move all of this to the function so it will be easier to use...
    let info = { user:req.body.user, time:req.body.time, stamp_tag:`${req.body.task}_${req.body.part}`};
    User.updateTimestamps(info, (err, response) => {
        if (err) {
            res.json({success:false})
        } else {
            res.json({success:true, msg:'Timestamp set'})
        }
    })
})

// Instrctions report
router.post('/instructionsreport', (req, res) => {
    User.instructionsReport(req.body.user, req.body.report, (err) => {
        if (err) {
            res.json({success:false})
        } else {
            res.json({success:true, msg:'report sent'})
        }
    })
})

module.exports = router;
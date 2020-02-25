const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');
const Session = require('../models/session');
const mailgun = require('mailgun-js');
const url = "http://localhost:4200"

// Create session
router.post('/session', (req,res) => {
    let newLogins = [];
    if (req.body.ku_students == undefined) {
        for (let i = 0; i < req.body.participants; i++) {
            let participation_code = Math.random().toString(36).substring(3);
            newLogins.push({ participation_code: participation_code, ku_student: false, registered: false });
        }
    } else {
        for (let i = 0; i < req.body.ku_students; i++) {
            let participation_code = Math.random().toString(36).substring(7);
            newLogins.push({ participation_code: participation_code, ku_student: true, registered: false });
        }
        for (let i = 0; i < req.body.participants - req.body.ku_students; i++) {
            let participation_code = Math.random().toString(36).substring(3);
            newLogins.push({ participation_code: participation_code, ku_student: false, registered: false });
        }
    }
    // Generate shuffled array with equal number of roles for each and a pair-id
    let roles = Array(req.body.participants/2).fill('regulator');
    roles.fill('worker', req.body.participants/2);
    // Shuffle the array
    roles.sort(function() { return 0.5 - Math.random() });
    newLogins.forEach((login, index) => login.role = roles[index]);

    let worker_num = 0;
    let regulator_num = 0;

    for(let i = 0; i < newLogins.length; i++) {
        if (roles[i] == 'regulator') {
            newLogins[i].role = 'regulator';
            newLogins[i].group_id = regulator_num;
            regulator_num++;
        } else {
            newLogins[i].role = 'worker';
            newLogins[i].group_id = worker_num;
            worker_num++;
        }
    }

    let newSession = new Session({
        session_number:req.body.session_number,
        logins:newLogins,
        running:false,
    });
    // Shuffle logins
    newSession.logins = newSession.logins.sort(function() { return 0.5 - Math.random() });

    Session.createSession(newSession, (err, session) => {
        if (err) {
            res.json({success:false, msg:'Failed to create session'});
        } else {
            res.json({success:true, msg:'Session created', data: session});
        }
    });
});

// Begin session
router.post('/sessionbegin', passport.authenticate('jwt', {session:false}), (req, res) => {
    let session_number = req.body.session_number;
    Session.updateOne({session_number:session_number}, {running:true}, (err, session) => {
        if (!err) {
            res.json({success:true});
        } else {
            res.json({success: false, msg: 'Could not begin session'})
        }
    })
})

// Get session
router.get('/session', passport.authenticate('jwt',{session:false}), (req, res) => {
    Session.find({}, (err, session) => {
        if(!err) {
            res.json({success:true, data:session});
        } else {
            res.json({success:false});
        }
    });
});

// Send reminder
router.post('/sendreminder', passport.authenticate('jwt',{session:false}), (req, res) => {
    let recievers = req.body;
    let success = true;
    recievers.forEach(r => {
        const DOMAIN = "sandbox91d1cf210a154a5489a09502321e87f6.mailgun.org";
        const mg = mailgun({apiKey: "77f75174a3f4cc3adabc29491b91b379-7238b007-7a0849c6", domain: DOMAIN});
        const data = {
            from: "Experiment <postmaster@sandbox91d1cf210a154a5489a09502321e87f6.mailgun.org>",
            to: r.email,
            subject: "Experiment reminder",
            text: `Dear ${r.name},
            We are writing to remind you that you have tasks to complete in our experiment today. Today's tasks must be completed before midnight. If you have not already completed them, follow the link above to sign in:
            
            ${url}
            
            If you have any questions, please contact uc.experiment2019@gmail.com
            
            Thank you`
        };
        mg.messages().send(data, function (error, body) {
            if (error) {
                success = false;
            } else {
                success = true;
            }
        });
        if (success) {
            res.json({success:true, msg:"Emails sent"})
        } else {
            res.json({success:false, msg:"Something went wrong"})
        }
    })
})

// Get data
router.get('/data', passport.authenticate('jwt',{session:false}), (req, res) => {
    if (req.user.admincode != "79k8uioa3l8") {
        res.json({success:false, msg:'Authentication failed'})
    } else {
        User.find({}, (err, users) => {
            if(!err) {
                sendUsers = [];
                users.forEach(user => {
                    newUser = {
                        _id:user._id,
                        first_name:user.first_name,
                        last_name:user.last_name,
                        ku_id:user.ku_id,
                        email:user.email,
                        participation_code:user.participation_code,
                        session:user.session,
                        role:user.role,
                        group_id:user.group_id,
                        register_date:user.register_date,
                        tasks:user.tasks,
                        extra_allocation_info:user.extra_allocation_info,
                        minimal_work:user.minimal_work,
                        timestamps:user.timestamps,
                        instructionreports:user.instructionreports,
                        payoffweek:user.payoffweek,
                        work_assignment:user.work_assignment,
                    }
                    if (!user.admin) {
                        sendUsers.push(newUser);
                    }
                });
                res.json( sendUsers );
            } else {
                res.json({success: false, msg: 'Could not get users'})
            }
        })
    }
});

router.post('/deletesession',  passport.authenticate('jwt',{session:false}), (req, res) => {
    let info = req.body;
    if (info.password === "ceb14l1fe") {
        Session.deleteOne({session_number:info.sessionnum}, (error, response) => {
            if (error) {
                res.json({success:false, msg:"Could not delete session"})
            } else {
                User.deleteMany({session:info.sessionnum}, (e, r) => {
                    if (e) {
                        res.json({success:false, msg:'Could not delete participants'})
                    } else {
                        res.json({success:true, msg:"Everything deleted"})
                    }
                })
            }
        });
    } else {
        res.json({success:false, msg:"Wrong password"})
    }
});

module.exports = router;
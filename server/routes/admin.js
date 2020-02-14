const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');
const Session = require('../models/session');

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

module.exports = router;
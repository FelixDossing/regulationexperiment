const mongoose = require('mongoose');
const config = require('../config/database')


const SessionSchema = mongoose.Schema({
    session_number: {
        type:Number,
        required:true,
        unique:true,
    },
    logins: {
        type:Array,
        required:true,
    },
    running: {
        type:Boolean,
    }
});

const Session = module.exports = mongoose.model('Session', SessionSchema);

// Add/register user
module.exports.createSession = function(newSession, callback){
    newSession.save(callback);
}

// Update login info (set registered to true)
module.exports.updateLogin = function(session_number, new_logins, callback) {
    Session.updateOne({ session_number : session_number }, { $set: { logins:new_logins }}, callback)
}
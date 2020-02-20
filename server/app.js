const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

// Connect to database
mongoose.connect(config.database, { useNewUrlParser: true, useFindAndModify:false });

// Check connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database '+config.database);
});
mongoose.connection.on('error', (err) => {
    console.log('Database error: '+err);
})


const app = express();

// ROUTES //

// Import routes
const users = require('./routes/users');
const admin = require('./routes/admin');

// Port number
const port = process.env.PORT || 8080;

// Cors middleware
app.use(cors())

// Body Parser middleware
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Users route
app.use('/users', users);
// Admin route
app.use('/admin', admin);

// Handle production
if (process.env.NODE_ENV == 'production') {
    app.use(express.static(__dirname+'../client'));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname,'..client/index.html'));
    })
}

// Index route
// app.get('/', (req, res) => {
//     res.send('Invalid endpoint and something');
// });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start server
app.listen(port, () => {
    console.log('Server started on port '+port);
});
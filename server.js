const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profiles = require('./routes/api/profile');
const posts = require('./routes/api/posts')

const app = express();

// db config
const db = require('./config/keys').mongoURI;

// db connect
mongoose.connect(db)
    .then(() => console.log('db connect'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello')
})

app.use('/api/users', users);
app.use('/api/profiles', profiles);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('running...'));
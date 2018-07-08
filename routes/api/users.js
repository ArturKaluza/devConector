const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const keys = require('../../config/keys')
const User = require('../../models/User');

router.get('/', (req, res) => {
    res.json({msg: "Users Works"});
});


router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email})
        .then(user => {
            if (user) {
                res.status(400).json({email: 'Email alredy exsist'})
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: 200,     // Size
                    r: 'pg',    // Rating
                    d: 'mm'     // Default
                })

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        })
})

// user/login returning token
router.post('/login', (req, res) => {
    const {email, password} = req.body;
    
    User.findOne({email})
        .then(user => {
            
            if (!user) {
                return res.status(404).json({email: 'User not found'})
            }
        
        // compare hashed password
        bcrypt.compare(password, user.password)
            .then(isMatch => {
                // if user pass - generate token
                if (isMatch) {
                    const payload = { id: user._id, name: user.name, avatar: user.avatar } // create jwt payload
                    
                    jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                        res.json({success: true, token: 'Bearer ' + token})
                    })
                    
                    
                } else {
                    return res.status(400).json({password: 'password not correct'});
                }
            })
        })
})

// return current user
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({msg: 'succes'})
})


module.exports = router;
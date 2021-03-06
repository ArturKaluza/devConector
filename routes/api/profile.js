const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const validateProfileInput = require('../../validation/profile');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

router.get('/test', (req, res) => {
    res.json({msg: "Profile Works"});
});


router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
        
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile of this user';
                res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(e => res.status(404).json(e))
});

//get all profiles
router.get('/all', (req, res) => {
    const errors = {}

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = 'There are no profiles';
                res.status(404).json(errors)
            }

            res.json(profiles)
        })
        .catch(err => res.status(404).json({profile: 'There are no profiles'}))
})

// get profile by user name
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    
    Profile.findOne({ handle: req.params.handle})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors)
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
});

// get profile by user id
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    
    Profile.findOne({ user: req.params.user_id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors)
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for this user'}))
});

// create profile
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    // validation
    if (!isValid) {
        return res.status(400).json({errors})
    }
    
    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubUserName) profileFields.githubUserName = req.body.githubUserName;
    // split skills into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    // social
    profileFields.social = {};
    if (req.body.youtube) profileFields.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.instagram = req.body.instagram;

    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (profile) {
                // if profile exist then update profile
                Profile.findOneAndUpdate(
                    { user: req.user.id}, 
                    { $set: profileFields}, 
                    {new: true})
                    .then(profile => res.json(profile))
            } else {
                // if prfile not exsist then create
                Profile.findOne({ handle: profileFields.handle})
                    .then(profile => {
                        // if profile exsits
                        if (profile) {
                            errors.handle = 'Profile alrady exist';
                            res.status(400).json(errors);
                        }
                        // save profile
                        new Profile(profileFields).save()
                            .then(profile => res.json(profile))
                            

                    })

            }
        })

});

// add experience
router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile)
})

module.exports = router;
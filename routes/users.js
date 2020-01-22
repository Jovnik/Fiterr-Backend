const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Profile = require('../models/Profile');
const Professional = require('../models/Professional')
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const storage = multer.memoryStorage();

// @route       /api/users/register
// @desc        Register a user and log them in using passport
router.post('/register', async (req, res) => {

  const { firstname, lastname, email, username, gender, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).send('This user already exists');
    }

    const hash = await bcrypt.hash(password, 10);
    user = new User(req.body);
    user.password = hash;
    await user.save()

    req.login(user, (err) => {
      if (err) {
        return res.status(404).send('error')
      } else {
        return res.status(200).send(user)
      }
    })
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route       /api/users/login
// @desc        Login as a user
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('These are the errors', errors.array());
    return res.status(400).json({ errors: errors.array() })
  }

  // desc     Passport is authenticating the user
  passport.authenticate('local', (err, user, info) => {
    if (err) { res.status(500).send(err) } // server error (eg. cant fetch data)
    else if (info) { return res.send(info) }   // login error messages from the local strategy (email not registered or password invalid)
    else {
      req.login(user, (err) => {
        if (err) { return res.status(500).send(err) } // is this a different error to the 500 above?
      });
      return res.status(200).json(req.user);
    }
  })
});

// @route       /api/users/logout
// @desc        Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.status(200).send('logged out')
});

// @route       /api/users/search-users
// @desc        search users in the database with the search term entered
// Note: this needs to be an authenticated route
router.post('/search-users', async (req, res) => {
  try {
    const { search } = req.body
    // this query checks whether the firstname or lastname contains the search term
    const searchRegex = { "$regex": search, "$options": "i" };
    let searchResults = await User.find({ $or: [{ "firstname": searchRegex }, { "lastname": searchRegex }] });
    // console.log(searchResults);  // log the users that you find in the search
    res.status(200).json({ searchedUsers: searchResults });
  } catch (err) {
    res.status(500).send(err)
  }
})

// @route       /api/users/get-user
// @desc        find both the user and their profile (for when their profile page is viewed on the frontend)
router.post('/get-viewing-user-profile', async (req, res) => {
  try {
    const ObjectId = require('mongoose').Types.ObjectId;
    const { id } = req.body;

    let user;
    if (ObjectId.isValid(id)) {
      user = await User.findOne({ _id: id });
    } else {
      user = await User.findOne({ username: id });
    }
    //then find the profile by the user id
    const profile = await Profile.findOne({ user: user._id });

    res.status(200).json({ user, profile });
  } catch (err) {
    res.status(500).send(err)
  }
});

// @route   /api/users/professional-activate
// @desc    converts user to a professional once they enter their mobile number that must be Australian
const fields = [
  { name: 'phoneNumber' }
]
const upload = multer({ storage: storage }).fields(fields)
router.post("/professional-activate", upload, async (req, res) => {

  const { phoneNumber } = req.body;
  const { userID } = req.user.id;
  const user = await User.findOne({ _id: req.user.id })
  try {
    let errors = [];
    let phoneNumberArr = [];
    phoneNumberArr = phoneNumber.split('')
    if (phoneNumber.length != 10) {
      errors.push({ msg: "Phone Number must be 10 lengths long" })
    }
    if (phoneNumberArr[0] != "0" && phoneNumber[1] != "4") {
      errors.push({ msg: "Please enter an Australian Number starting with 04" })
    }
    if (errors.length != 0) {
      res.status(500).send(errors)
    }
    else {
      user.phoneNumber = phoneNumber;
      user.isProfessional = true;
      const professional = new Professional
      professional.userId = userID
      await professional.save()
      user.professional = professional._id
      await user.save()
      res.status(200).send(user)
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;

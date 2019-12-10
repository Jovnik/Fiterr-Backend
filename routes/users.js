const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.post('/register', async (req, res) => {

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        
        if(user){
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
            return res.send(user)
          }
        })

    } catch (err) {
        console.error(err.message);
        res.status(400).send('Server error');
    }
});


router.post('/login', (req, res) => {
    console.log('asdfasdfasdf');

    passport.authenticate('local', (err, user, info) => {
      if (err) { res.status(500).send(err) } // server error (eg. cant fetch data)
      else if (info) { return res.send(info) }   // login error messages from the local strategy (email not registered or password invalid)
      else {   
        // console.log('at this point a user has been found in the local strategy');
        req.login(user, (err) => {
          if(err) { return res.status(500).send(err) } // is this a different error to the 500 above?
        });    
        // now have access to req.user after logging in
        return res.status(200).json(req.user); 
      }
    })(req, res);
  }
)

router.get('/test', (req, res) => {
  console.log(req.user);
  res.json({ msg: 'Testing for req.user'})
})  


router.get('/logout', (req, res) => {
  console.log('logged out');
  console.log('1', req.user);
  req.logout();
  console.log('2', req.user);
  res.status(200).send('logged out')
})


module.exports = router;
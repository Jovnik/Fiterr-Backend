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

        // res.send(user);

        req.login(user, (err) => {
          if (err) {
            return res.status(404).send('error')
          } else {
            return res.send(user)
          }
        })

        console.log(req.user);  //after calling req.login on the backend, you have access to req.user in any route

    } catch (err) {
        console.error(err.message);
        res.status(400).send('Server error');
    }
});

router.post('/login',
  (req, res) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { res.status(500).send(err) } // server error (eg. cant fetch data)
      else if (info) { res.send(info) }   // login error messages from the local strategy
      else { res.status(200).send(req.user) } // if you the log in credentials arent valid, the string 'Unauthorized' is stored in req.user
    })(req, res);
  }
)

router.get('/test', (req, res) => {
  res.json({ msg: 'Testing for req.user'})
  console.log(req.user);
})  


router.get('/logout', (req, res) => {
  req.logout();
  res.send('logged out')
})


module.exports = router;
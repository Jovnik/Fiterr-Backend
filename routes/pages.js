const express = require('express');
const router = express.Router();
const Page = require('../models/Page')
const multer = require('multer');
const storage = multer.memoryStorage();
const User = require('../models/User')


router.get('/get-page/:handle', async(req,res)=> {
    try{
        console.log(req.user)
        const handle = req.params.handle
        console.log(handle)
        const page = await Page.findOne({pageHandle: handle})
        console.log(page)
        res.status(200).send(page)
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }
    

})

router.get('/find-role/:handle', async(req,res) => {
    const handle = req.params.handle

    const page = await Page.findOne({pageHandle: handle})
    
    if(req.user._id == page.pageOwner){
        res.send('Owner')
    }else if(page.trainers.includes(req.user._id)){
        res.send('Trainer')
    }else if(page.contentCreators.includes(req.user._id)){
        res.send('Content-Creator')
    }else{
        res.send('Visitor')
    }
})

const fields = [
    {name: 'pageOwner'},
    {name: 'pageHandle'},
    {name: 'pageTitle'},
    {name: 'pageAbout'}
  ]
const upload = multer({storage: storage}).fields(fields)

router.post('/create', upload, async(req,res)=> {
    try{
        console.log(req.body)
        const professionalUser = req.user.isProfessional;
        const currentUser = await User.findOne({ _id: req.user.id })
        if(professionalUser){
            const {pageOwner, pageHandle, pageTitle, pageAbout} = req.body
    
            let page = await Page.findOne({ pageHandle });
            if(page){
                return res.status(400).send('This Handle is Already Taken')
            }
            page = new Page(req.body)
            await page.save()
            currentUser.pageOwned = page._id
            await currentUser.save()
            res.status(200).send('page created')
        }
        
    }catch(err){
        res.status(400).send(err)
    }

    
})

module.exports = router;
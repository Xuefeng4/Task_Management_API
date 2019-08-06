const express = require('express')
const router = new express.Router()
const User = require('../models/users.js')
const auth = require('../middlewares/authentication.js')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
//sign up token
router.post('/users', async (req,res)=>{
  const oneUser = new User(req.body)

  try {
    await oneUser.save()
    sendWelcomeEmail(user.email, user.name) //async no need to wait for
    const token = await oneUser.generateToken();
    res.status(201).send({oneUser, token})
  }catch(e){
    res.status(400).send(e)
  }
})

//login
router.post('users/login', async (req, res)=>{
  try{
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateToken();
    res.send({user,token})
  }catch(e){
    res.status(400).send(e)
  }
})
//logout
router.post('users/logout',auth, async (req, res)=>{
  try{
      req.user.tokens = req.user.tokens.filter((item)=>{
      return item !== req.token
    })
    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send(e)
  }
})
//logout all
router.post('users/logoutall',auth, async (req, res)=>{
  try{
    req.user.tokens = []
    await req.user.save()
    res.send()
  }catch(e){
    res.status(500).send(e)
  }
})
//get user own profile
router.get('users/me',auth, async (req,res)=>{
  rep.send(req.user) //req user was created at the authentication middlewares
})

// router.get('/users/:id',async (req,res)=>{
//   const _id = req.params.id
//
//   try{
//     const user = await User.findByID(_id)
//     if(!user){
//       return res.status(404).send()
//     }
//     res.send(user)
//   }catch(e){
//     res.status(500).send()
//   }
// })

router.patch('/users/me',auth, async(req,res)=>{
  const updates = Object.keys(req.body)
  const allowUpdates = ['name','email','password','age']
  const isValid = updates.every((item)=>{
    return allowUpdates.includes(item)
  })

  if(!isValid){
    return res.status(400).send({error:'Invalid updates'})
  }

  try{
    const user = req.user
    updates.forEach((item)=>{
      return user[item] = req.body[item]
    })
    await user.save()
    res.send(user)
  }catch(e){
    res.status(400).send(e)
  }
})
//users/:id
router.delete("users/me",auth, async(req, rep)=>{
  const _id = req.user._id//req.params.id no longer exits

  try{
    await req.user.remove()
    sendCancelationEmail(req.user.email,req.auser.name)
    res.send(req.user)
  }catch(e){
    res.status(500).send()
  }
})

//profile photo uploads
//  dest:'avatars' can be erased if you do not want to save but pass in the router
const upload = multer({
  limits:{
    fileSize:1000000 //1mb
  },
  fileFilter(req, file ,cb){
      if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
          cb(new Error('File must be an image'))
      }
      cb(null, true)
  }
})

//avator will be the key we want to find in the request
//this is used created and change the avator
//sharp is used to format and resize the picture
router.post('users/me/avator',auth, upload.single('avator'),async (req,res) => {
  const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
  req.user.avator = req.file.buffer
  await req.user.save()
  res.send()
},(error, req, res, next)=>{
  res.status(400).send({error:error.message})
})//error parameters must be like this so the user can understand this is the error handle function


router.delete('users/me/avator', auth, async(req, res)=>{
  try{
    req.user.avator = undefined
    await req.user.save()
    res.send()
  }catch(e){
    res.status(404).send()
  }
})

router.get('/users/:id/avator',async (req,res)=>{
  try{
    const user = await User.findByID(req.params.id)

    if(!user){
      throw new Error('No such user')
    }
    //set response header most of time express will do it
    res.set('Content-Type','image/png')
    res.send(user.avator)
  }catch(e){
    res.status(400).send()
  }
})
// router.patch('/users/me', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
//
//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }
//
//     try {
//         updates.forEach((update) => req.user[update] = req.body[update])
//         await req.user.save()
//         res.send(req.user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })
//
// router.delete('/users/me', auth, async (req, res) => {
//     try {
//         await req.user.remove()
//         res.send(req.user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

module.exports = router

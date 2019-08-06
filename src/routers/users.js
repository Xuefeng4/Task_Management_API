const express = require('express')
const router = new express.Router()
const User = require('../models/users.js')
const auth = require('../middlewares/authentication.js')

//sign up token
router.post('/users', async (req,res)=>{
  const oneUser = new User(req.body)

  try {
    await oneUser.save()
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
    res.send(req.user)
  }catch(e){
    res.status(500).send()
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

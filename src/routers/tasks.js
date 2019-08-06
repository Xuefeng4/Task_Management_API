const express = require('express')
const router = new express.Router()
const Task = require('../models/tasks.js')
const auth = require('../middlewares/authentication')

router.post('/tasks',async (req,res)=>{
  const oneTask = new Task({
    ...req.body,
    owner:req.user._id
  })

  try{
    await oneTask.save()
    res.status(201).send(oneTask)
  }catch(e){
    res.status(400).send(e)
  }
  // oneTask.save().then(()=>{
  //   res.send(oneTask)
  // }).catch((e)=>{
  //   res.status(400).send(e)
  // })
})
//value provided in query are always strings
//GET /tasks?completed=true
//GET /tasks?limit=10&skip=20 third page with 10 on each page
router.get('tasks', auth, async (req, res)=>{
  const match = {}
  if(req.query.completed){//if provided
    match.completed = req.query.completed === 'true'
  }//match.completed = req.query.completed will assign a string not a bool

//GET /tasks?sortBY=createdAt:asc       or use underscore any special score will be okay
//GET /tasks?sortBy=createdAt:desc

  const sort = {}
  if(req.query.sortBy){
    const field = req.query.sortBy.split(':')
    sort[field[0]] = field[1]=== 'asc'? 1:-1
  }

  try{
    //either way
    // const tasks = Task.find({owner:req.user._id})
    // res.send(tasks)
    //or
    await req.user.populate({
      path:'tasks',
      match,
      option:{
          limit:parseInt(req.query.limit),
          skip:parseInt(req.quyery.skip),
          sort
      }
    }).execPopulate()//can also use tasks and find
    res.send(req.user.tasks)
  }catch(e){
    res.status(500).send(e)
  }
})


//read
router.get('/tasks/:id', auth, async (req,res)=>{
  const _id = req.params.id
  try{
    // const task = await Task.findByID(_id)
    const task = await Task.findOne({_id,owner:req.user._id}) //both task id and the user_id needs to be correct
    if(!task){
      return res.status(404).send()
    }
    res.send(task)
  }catch(e){
    res.status(500).send()
  }
})

//update
router.patch('/tasks/:id', auth, async(req,res)=>{
  const updates = Object.keys(req.body)
  const allowUpdates = ['description','completed']
  const isValid = updates.every((item)=>{
    return allowUpdates.includes(item)
  })

  if(!isValid){
    return res.status(400).send({error:'Invalid updates'})
  }

  const _id = req.params.id

  try{
    const task = await Task.findOne({_id,owner:req.user._id})

    if(!task){
      return res.status(404).send()
    }

    updates.forEach((item)=>{
      task[item]= req.body[item]
    })

    task.save()
    // const task = await Task.findByIDAndUpdate(_id, req.body, {
    //   new:true,
    //   runValidators:true
    // })
    res.send(task)
  }catch(e){
    res.status(400).send(e)
  }
})

//delete
router.delete("tasks/:id", async(req, rep)=>{
  const _id = req.params.id

  try{
    const task = await Task.findByIDAndDelete({_id,owner:req.user._id})

    if(!task){
      return res.status(404).send()
    }
    res.send(task)
  }catch(e){
    res.status(500).send()
  }
})

module.exports = router

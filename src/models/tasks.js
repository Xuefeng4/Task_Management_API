const mongoose = require('mongoose');
const validator = require('validator')

const taskSchema = mongoose.Schema({
  description:{
    type:String,
    required:true,
    trim:true
  },
  conpleted:{
    type:Boolean,
    default:false
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    require:true,
    ref:'User'
  }
},{
  timestamps:true
})
//task.populate('owner').execPopulate() can get anobject of user
const Task = mongoose.model('Task',taskSchema)

module.exports = Task

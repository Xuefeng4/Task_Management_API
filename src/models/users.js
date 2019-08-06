const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks.js')

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true
  },
  email: {
      type: String,
      required: true,
      unique:true,
      trim: true,
      lowercase: true,
      validate(value) {
          if (!validator.isEmail(value)) {
              throw new Error('Email is invalid')
          }
      }
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
          if (value.toLowerCase().includes('password')) {
              throw new Error('Password cannot contain "password"')
          }
       }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
          if (value < 0) {
              throw new Error('Age must be a postive number')
          }
        }
    },
    tokens:[{
      token:{
        type:String,
        required:true
      }
    }]
},{
  timestamps:true
});

userSchema.virtual('tasks',{
  ref:"Task",
  localField:'_id',
  foreignField:'owner'
})
//do not include tasks in the database just to tell mongoose how things are releated

const User = mongoose.model('User',userSchema)

//hash the passwords
//notice no arrow function here cause arrow do not bind
userSchema.pre('save',async function(next){
  if(this.isModified('password')){
    this.password = await bcrypt.hash(user.password, 8)
  }
  next()//tell this has finished because async function end doesn't mean is over
})

//delete all the tasks when delete the user
userSchema.pre('save', async function(next){
  await Task.deleteMany({owner:this._id})
  next()
})

//login
userSchema.statics.findByCredentials = async (email, password)=>{
   const user = await User.findOne({email})

   if(!user){
     throw new Error("Your user name does not exist")
   }

   const isMatch = await bcrypt.compare(password, user.password)

   if(!isMatch){
     throw new Error('The password you just inputed is not correct')
   }
   return user
}
//token generation
userSchema.methods.generateToken = async function(){

  const token = jwt.sign({_id:this._id.toString()}, 'Thisistokensecret')
  this.tokens = this.tokens.concat({token})

  await this.save()
  return token
}
//hide private data
//toJSON will be called in the json.stringify() of the response.send
userSchema.methods.toJSON = function(){
  const user = this.toObject()
  delete user.tokens
  delete user.password
  return user
}

module.exports = User

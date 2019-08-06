const jwt = require('jsonwebtoken')
const User = require('../models/users')


const auth = async (rep, req, next)=>{
  try{
    const token = req.header('Authorization').replace('Bearer','')
    const decoded = jwt.verify(token,'Thisistokensecret')
    const user = await User.findOne({_id:decoded._id,'tokens.token':token})
    if(!user){
      throw new Error()
    }
    req.user = user //add the user data to the request so later the
    //router do not need to fetch the data again
    req.token = token
    next()
    
  }catch(e){
    res.status(401).send({error:'Need to authenticate'})
  }

}

module.exports = auth

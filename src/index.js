const express = require('express');
require('./db/mongoose.js')
const userRouter = require('./routers/users.js');
const taskRouter = require('./routers/tasks.js');
const multer = require('multer')


const app = express()
const port = process.env.PORT || 3000


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
  console.log('server is runing at port '+port)
})

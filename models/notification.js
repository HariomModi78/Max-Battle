const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  title:String,
  message:String,
  createdAt:{
    type:Date,
    default:Date.now
  },
  seen:{
    type:Boolean,
    default:false
  }
})

module.exports = mongoose.model('notification', notificationSchema);
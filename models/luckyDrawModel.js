const mongoose = require("mongoose");

const luckyDrawSchema = new mongoose.Schema({  
    description:String,
    drawDateAndTime:Date,
    winnerTicketNumber:String,
    slotsFilled:{
        type:Number,
        default:0
    },
    slots:[mongoose.Schema.Types.ObjectId],
    totalSlots:Number,
    price:Number,
    prizePool:Number,
    status:{
        type:String,
        default:"ongoing"
    }

})

module.exports = mongoose.model("luckyDraw",luckyDrawSchema);
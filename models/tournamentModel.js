const mongoose = require("mongoose");

const tournamentSchema = mongoose.Schema({
    description:String,
    dateAndTime:String,
    entryFee:Number,
    perKillAmount:Number,
    prizePool:Number,
    matchType:String, //solo,duo,squad
    totalSlots:Number,
    slots:[mongoose.Schema.Types.ObjectId],
    slotsFilled:{
        type:Number,
        default:0
    },
    slotsBooked:Array,
    map:String,
    status:{
        type:String,
        default:"upcomming"
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    modeType:String, //fullmap or cs
    firstPrize:Number,
    secondPrize:Number,
    roomId:String,
    roomPassword:String
})

module.exports = mongoose.model("tournament",tournamentSchema);
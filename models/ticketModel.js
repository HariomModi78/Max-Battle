const mongoose = require("mongoose");
const ticketSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    ticketNumber:String,
    luckyDrawId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"luckyDraw"
    }

})

module.exports = mongoose.model("ticket",ticketSchema);
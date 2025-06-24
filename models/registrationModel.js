const mongoose = require("mongoose");

const registrationSchema = mongoose.Schema({
    tournamentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"tournament",
        require:true
    },
    player:[
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"user"
            },
            userGameName:String,
            userGameId:String,
            slotNumber:Number,
            teamName:String,
            kill:Number
        }
    ]
})

module.exports = mongoose.model("registration",registrationSchema);
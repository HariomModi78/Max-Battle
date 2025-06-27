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
            kills:Number
        }
    ]
})

module.exports = mongoose.model("registration",registrationSchema);
const userDataBase = require("../models/userModel.js");
    //.log("is admin");

const isAdmin = async function(adminId){
    let user = await userDataBase.findOne({_id:adminId});
    if(user &&user.role == "admin"){
        return true;
    }else{
        return false;
    }
}

module.exports = isAdmin;
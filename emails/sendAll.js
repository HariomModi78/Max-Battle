const transporter = require("./transporter.js");

const sendAll = async function(to,sub,message){
    //.log("Sending deposit email to:", to);
    // let retry = new Array();
   await transporter.sendMail({
        to:to,
        subject:sub,
        html:`
            ${message}
            <hr>
            <p><strong>Best Regards,</strong></p>
            <p><strong>Max Battle Team</strong></p>
            <p>Contact us: maxbattlehelp@gmail.com</p>
`
    }).then(function(){
        //.log(to,"✅");
    }).catch(function(e){
        //.log(to,"❌");
        // retry.push({to,sub,message});
    })
}

module.exports = sendAll;
const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const fs = require("fs");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");

const crypto = require("crypto");

const userDataBase = require("./models/userModel.js");
const tournamentDataBase = require("./models/tournamentModel.js");
const tournamentLeadboardDataBase = require("./models/tournamentLeadboard.js");
const transactionDataBase = require("./models/transactionModel.js");
const soloDataBase = require("./models/soloModel.js");
const duoDataBase = require("./models/duoModel.js");
const squadDataBase = require("./models/squadModel.js");
const notificationDataBase = require("./models/notification.js");
const nodemailer = require("nodemailer");
const notification = require("./models/notification.js");
const { channel } = require("diagnostics_channel");
const { permission } = require("process");

const transporter = nodemailer.createTransport({
    secure:true,
    host:"smtp.gmail.com",
    port:465,
    auth:{
        user:process.env.email,
        pass:process.env.pass

    }
})

function sendMail(to,sub,msg){
    transporter.sendMail({
        to:to,
        subject:sub,
        html:`<p>Hello,</p>
<p>Your OTP is: <strong>${msg}</strong></p>
<p>This OTP is valid for 5 minutes.</p>
<hr>
<p>Best Regards,</p>
<p><strong>Max Battle</strong></p>
<p>Contact us: maxBattle@gmail.com</p>
`
    }).catch(function(e){
        //.log("error aya ")
    })
}

app.use(compression({
  filter: (req, res) => {
    if (req.path.startsWith("/paymentCheck")) return false; // don't compress webhook
    return compression.filter(req, res);
  }
}));
// ✅ Security Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(hpp());
app.use(cors());
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 50,                 // allow 500 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
   message: "Too many attempts. Try again after 10 minutes."
});

// Apply to auth routes only
app.use("/login", authLimiter);
app.use("/register", authLimiter);
app.use("/otp", authLimiter); 
app.set('trust proxy', 1);
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use(cookieParser());
app.listen(3000,()=>{
    ////.log("Server is running ");
})

function isAdmin(user){
    if(user.role=="admin"){
        return true;
    }else{
        return false;
    }
}
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.get("/",async function(req,res){ 
    if(req.cookies.token){
        try{
            let token = jwt.verify(req.cookies.token,`${process.env.PIN}`);
            let user = await userDataBase.findOne({email:token.email}).lean();
            res.redirect(`/home/${user._id}`);
        }catch(e){
            res.redirect("/register")
        }
        
    }else{
        res.render("start");
    }

})
app.post("/admin/automaticCreateTournament/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let oldTournament = await tournamentDataBase.findOne({status:"upcoming"});
    if(oldTournament){
        return res.send("Please kal ke din try karna❌");
    }
    let now = new Date();
    let tournament = {};
    for(let i=0;i<14;i++){
    let date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        21,
        40 + i * 10,
        0,
        0
    );
        
        if(i==0){
            tournament = {
                description:"FULL MAP SOLO TOURNAMENT (SUNDAY SPECIAL 🎁)",
                entryFee:1,
                prizePool:200,
                perKillAmount:2,
                totalSlots:48,
                matchType:"solo",
                modeType:"fullmap",
                firstPrize:5,
                secondPrize:5,
                dateAndTime:date,map:"Bermunda"  
            }
            
        }else if(i==1){
            tournament = {
                description:"FULL MAP SOLO TOURNAMENT (SUNDAY SPECIAL 🎁)",
                entryFee:0,
                prizePool:50,
                perKillAmount:1,
                totalSlots:48,
                matchType:"solo",
                modeType:"fullmap",
                firstPrize:2,
                secondPrize:1,
                dateAndTime:date,map:"Bermunda"  
            }
        }else if(i==2 || i==6 || i==10){
            tournament = {
                description:"FULL MAP SOLO TOURNAMENT ",
                entryFee:10,
                prizePool:384,
                perKillAmount:8,
                totalSlots:48,
                matchType:"solo",
                modeType:"fullmap",
                firstPrize:0,
                secondPrize:0,
                dateAndTime:date,map:"Bermunda" ,map:"Bermunda" 
            }
        }else if(i==3 || i==7 || i==11){
            tournament = {
                description:"CLASH SQUAD 1v1",
                entryFee:25,
                prizePool:45,
                perKillAmount:0,
                totalSlots:2,
                matchType:"solo",
                modeType:"cs",
                firstPrize:0,
                secondPrize:0,
                dateAndTime:date,map:"Bermunda" 
            }
        }else if(i==4 || i==8 || i==12){
            tournament = {
                description:"CLASH SQUAD 2v2",
                entryFee:20,
                prizePool:70,
                perKillAmount:0,
                totalSlots:4,
                matchType:"duo",
                modeType:"cs",
                firstPrize:0,
                secondPrize:0,
                dateAndTime:date,map:"Bermunda" 
            }
        }else if(i==5 || i==9 || i==13){
            tournament = {
                description:"CLASH SQUAD 4v4",
                entryFee:10,
                prizePool:70,
                perKillAmount:0,
                totalSlots:8,
                matchType:"squad",
                modeType:"cs",
                firstPrize:0,
                secondPrize:0,
                dateAndTime:date,map:"Bermunda" 
            }
        }
        await tournamentDataBase.create(tournament);
    }
    res.send("All tournament are successful created✅");
})
app.get("/register",async function(req,res){
    res.render("register");
})
app.get("/registerOtp",function(req,res){
    res.render("registerOtp",{error: null});
})
app.get("/referralCodes",async function(req,res){
    let referralCode = await userDataBase.find();
    referralCode = referralCode.map(user=>user.referralCode);
    referralCode.push("NEW1")
    //.log(referralCode);
    res.json(referralCode);
})
app.post("/registerOtp",async function(req,res){
    try{
    let user = await userDataBase.findOne({email:req.body.email}).lean();
    let otp = (Math.random()*9999+1000).toFixed(0);
    let usec;
    let friend = await userDataBase.findOne({referralCode:req.body.referralCode}).lean();
    if(friend){
        usec = jwt.sign({email:req.body.email,otp:otp,gameName:req.body.gameName,gameId:req.body.gameId,username:req.body.username,password:req.body.password,age:req.body.age,referredBy:friend._id,referralCode:req.body.referralCode},process.env.PIN);
    }if(req.body.referralCode=="NEW1"){
        usec = jwt.sign({email:req.body.email,otp:otp,gameName:req.body.gameName,gameId:req.body.gameId,username:req.body.username,password:req.body.password,age:req.body.age,referralCode:req.body.referralCode},process.env.PIN);
    }
    else{
        
        usec = jwt.sign({email:req.body.email,otp:otp,gameName:req.body.gameName,gameId:req.body.gameId,username:req.body.username,password:req.body.password,age:req.body.age},process.env.PIN);
    }
     
    sendMail(req.body.email,"OTP FOR VERIFICATION",otp);
    res.cookie("usec",usec);
    res.redirect("/registerOtp");
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/verifyRegisterOtp",async function(req,res){
    try{
    let secret = jwt.verify(req.cookies.usec,process.env.PIN);
    //.log(secret);
    if(secret.otp==req.body.otp){
         let oldUser = await userDataBase.findOne({email:secret.email}).lean();
        if(!oldUser){
        var newUser;
        bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(secret.password,salt,async function(err,hash){
            let isEighteenPlus = secret.age === "on";
            newUser =  await userDataBase.create({
                gameName:secret.gameName,
                gameId:secret.gameId,
                username:secret.username,
                email:secret.email,
                referralCode:secret.email.split("@")[0],
                password:hash,
                isEighteenPlus: isEighteenPlus,
                referredBy:secret.referredBy || undefined
            })
            await notificationDataBase.create({
                title:"Welcome",
                message:`Welcome ${newUser.username}, new tournaments are waiting for you!"` ,
                userId:newUser._id,
            })
            if (secret.referredBy) {
  await userDataBase.findOneAndUpdate(
    { _id: secret.referredBy },
    {
      $push: {
        totalReferral: newUser._id
      },
      $inc: {
        referrals: 1
      }
    }
  );
}else if(secret.referralCode=="NEW1"){
                    await userDataBase.findOneAndUpdate({_id:newUser._id},{
                        $inc:{
                            totalBalance:1,
                            bonus:1
                        }
                    })
                    await notificationDataBase.create({
                title:"Joining Bonus🎉",
               message: ` Hi ${newUser.username}, you earn 1 Max Coins as your joining bonus you can play matches from these coins`,
                userId:newUser._id,
            })
                }

            let token = jwt.sign({email:secret.email,role:"user"},`${process.env.PIN}`);
            res.cookie("token",token, {
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            httpOnly: true
            });
            
            res.redirect(`/home/${newUser._id}`);
            })
    
    })
    
    }else{
        res.redirect("/register");
    }
    }else{
        res.render("registerOtp", { error: "Invalid OTP. Please try again." });
    }
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/referAndEarn/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let referrals = await userDataBase.find({referredBy:user._id});
    //.log(referrals);
    res.render("referAndEarn",{user:user,referrals:referrals});
})
app.get("/login",async function(req,res){
    try{
    if(req.cookies.token){
           var token = jwt.verify(req.cookies.token,`${process.env.PIN}`);
        
        let user = await userDataBase.findOne({email:token.email}).lean();
        res.redirect(`/home/${user._id}`);
    }else{
        res.render("login");
    }
    }catch(e){
            res.render("login");
    }
})
app.post("/login",async function(req,res){
    let user = await userDataBase.findOne({email:req.body.email}).lean();
    ////.log(user)
    if(user){
        bcrypt.compare(req.body.password,user.password,function(err,result){
        if(result){
            let token = jwt.sign({email:req.body.email,role:"user"},`${process.env.PIN}`);
            res.cookie("token",token, {
  maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  httpOnly: true
});
            res.redirect(`/home/${user._id}`);
        }else{
            res.redirect("/login");
        }
    })
    }else{
        res.redirect("/register")
    }
    
})
// app.get("/notification",function(req,res){
//     res.render("notification");
// })
app.get("/error",function(req,res){
    res.render("error");
})
app.post("/seenTrue", async function (req, res) {
  try {
    //.log("🔥 /seenTrue route hit");
    const notificationId = new mongoose.Types.ObjectId(req.body.notificationId);
    //.log("✅ Converted ID:", notificationId);

    await notificationDataBase.findOneAndUpdate(
      { _id: notificationId },
      { seen: true }
    );

    res.json({ message: "✅ Marked as seen" });
  } catch (err) {
    //.error("❌ Error in /seenTrue:", err.message);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

app.post("/deleteMessage", async function (req, res) {
  try {
    //.log("🔥 /deleteMessage route hit");
    const userId = new mongoose.Types.ObjectId(req.body.userId);
    //.log(userId);
    await notificationDataBase.deleteMany({userId:userId,seen:true});

    res.json({ message: "✅ Marked as seen" });
  } catch (err) {
    //.error("❌ Error in /deleteMessage:", err.message);
    res.status(500).json({ error: "Failed to update notification" });
  }
});


app.get("/home/:userId",async function(req,res){
    try{
        let user = await userDataBase.findOne({_id:req.params.userId}).lean();
        let notification = await notificationDataBase.find({userId:req.params.userId,seen:false}).lean();
        //.log(notification.length)
        res.render("home",{user:user,notification:notification.length});
    }catch(e){
        res.redirect("/error");
    }
    
})
app.get("/profile/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let notification = await notificationDataBase.find({userId:req.params.userId,seen:false}).lean();
    res.render("profile",{user:user,notification:notification.length});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/leadboard/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let users = await userDataBase.find().sort({monthlyWinning:-1}).lean();
    let notification = await notificationDataBase.find({userId:req.params.userId,seen:false}).lean();
    //.log(users)
    res.render("leadboard",{user:user,users:users,notification:notification.length});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/notification/:userId",async function(req,res){
    try{
        let user = await userDataBase.findOne({_id:req.params.userId}).lean();    
    let notification = await notificationDataBase.find({userId:req.params.userId}).lean();
    res.render("notification",{user:user,notification:notification});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/wallet/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let notification = await notificationDataBase.find({userId:req.params.userId,seen:false}).lean();
    res.render("wallet",{user:user,notification:notification.length});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/deposit/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    res.render("deposit",{user:user});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/withdraw/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    res.render("withdraw",{user:user});
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/withdraw/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    if(user.winning >=req.body.amount){
        await userDataBase.findOneAndUpdate({_id:user._id},{
            $inc:{
                totalBalance:-Number(req.body.amount),
                winning:-Number(req.body.amount),
            },
        })
        let random = Date.now()
        await transactionDataBase.create({
                paymentId:random,
              upiId:req.body.upiId,
              amount: req.body.amount,
              status: "withdraw",                   
              userId: user._id,
        })
        await notificationDataBase.create({
                title:"Withdraw🎉",
                message: `⚙️ Hi ${user.username}, your ₹${req.body.amount} withdrawal is being processed. You'll be notified once it's completed. 🕒`,
                userId:req.params.userId
            })
    }
    res.redirect(`/wallet/${req.params.userId}`);
    }catch(e){
        //.log(e);
        res.redirect("/error");
    }
})
app.get("/privacyPolicy",function(req,res){
    res.render("privacyPolicy");
})
app.get("/termsAndCondition",function(req,res){
    res.render("termsAndCondition");
})
app.get("/pendingWithdrawRequest/:adminId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    let withdraw = await transactionDataBase.find({status:"withdraw",flag:false}).populate("userId");
    //.log(withdraw);
    res.render("withdrawRequest",{withdraw:withdraw,admin:admin});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/transaction/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let transaction = await transactionDataBase.find({userId:user._id}).sort({createdAt:-1});
    res.render("transaction",{user:user,transaction:transaction});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/editProfile/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    res.render("editProfile",{user:user});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/faq",function(req,res){
    res.render("faq");
})

app.get("/myupcoming/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let tournament = await tournamentDataBase.find({status:"upcoming"});

    res.render("myUpcoming",{user:user,tournament:tournament});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/myOngoing/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let tournament = await tournamentDataBase.find({status:"ongoing"});
    res.render("myOngoing",{user:user,tournament:tournament});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/myCompleted/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let tournament = await tournamentDataBase.find({status:"completed"});
    res.render("myCompleted",{user:user,tournament:tournament});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/tournament/result/:modeType/:matchType/:variable/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let tournament
    if(req.params.variable=="free"){
         tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"completed",entryFee:0}).sort({dateAndTime:1});
    }else if(req.params.variable=="1rs"){
        tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"completed",entryFee:1}).sort({dateAndTime:1});
    }else{
        tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"completed",entryFee:{$nin:[0,1]}}).sort({dateAndTime:1});
    }
    res.render("result",{user:user,tournament:tournament,modeType:req.params.modeType,matchType:req.params.matchType,variable:req.params.variable});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/tournament/upcoming/:modeType/:matchType/:variable/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let tournament
    if(req.params.variable=="free"){
         tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"upcoming",entryFee:0}).sort({dateAndTime:1});
    }else if(req.params.variable=="1rs"){
        tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"upcoming",entryFee:1}).sort({dateAndTime:1});
    }else{
        tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"upcoming",entryFee:{$nin:[0,1]}}).sort({dateAndTime:1});
    }
     
    // //.log(tournament);
    
    res.render("upcoming",{user:user,tournament:tournament,modeType:req.params.modeType,matchType:req.params.matchType,variable:req.params.variable});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/tournament/ongoing/:modeType/:matchType/:variable/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let tournament
    if(req.params.variable=="free"){
         tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"ongoing",entryFee:0}).sort({dateAndTime:1});
    }else if(req.params.variable=="1rs"){
        tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"ongoing",entryFee:1}).sort({dateAndTime:1});
    }else{
        tournament = await tournamentDataBase.find({modeType:req.params.modeType,matchType:req.params.matchType,status:"ongoing",entryFee:{$nin:[0,1]}}).sort({dateAndTime:1});
    }
    res.render("ongoing",{user:user,tournament:tournament,modeType:req.params.modeType,matchType:req.params.matchType,variable:req.params.variable});
    }catch(e){
        res.redirect("/error");
    }
}) 
app.get("/tournament/slot/:userId/:tournamentId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let tournamentTemp = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    let bookedSlots;
    // //.log(tournamentTemp)
    let matchType = tournamentTemp.matchType;
    let slots;
    if(matchType == "solo"){
        bookedSlots = await soloDataBase.find({tournamentId:tournamentTemp._id});
        slots = bookedSlots.map((slot)=>slot.slotNumber);
    }else if(matchType == "duo"){
        bookedSlots = await duoDataBase.find({tournamentId:tournamentTemp._id});
        slots = bookedSlots.map((slot)=>slot.slotId);
    }else if(matchType == "squad"){
        bookedSlots = await squadDataBase.find({tournamentId:tournamentTemp._id});
        slots = bookedSlots.map((slot)=>slot.slotId);
    }
    
    //.log(slots);

    res.render("slot",{user:user,slots:slots,matchType:matchType,tournamentTemp:tournamentTemp});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/tournament/payment/:userId/:tournamentId/:slotNumber",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let slotNumber = req.params.slotNumber;
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    // //.log(slotNumber);
    let slot;
    if(tournament.matchType == "solo"){
        slot = await soloDataBase.findOne({tournamentId:tournament._id,slotNumber: req.params.slotNumber}).lean();
    }else if(tournament.matchType == "duo"){
        slot = await duoDataBase.findOne({tournamentId:tournament._id,slotId: req.params.slotNumber}).lean();
    }else if(tournament.matchType == "squad"){
        slot = await squadDataBase.findOne({tournamentId:tournament._id,slotId: req.params.slotNumber}).lean();
    }
    if(slot){
        return res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
    }
    let alreadyJoined;
    if(tournament.matchType == "solo"){
        alreadyJoined = await soloDataBase.findOne({tournamentId:tournament._id,userId:user._id}).lean();
    }else if(tournament.matchType == "duo"){
        alreadyJoined = await duoDataBase.findOne({tournamentId:tournament._id,userId:user._id}).lean();
    }else if(tournament.matchType == "squad"){
        alreadyJoined = await squadDataBase.findOne({tournamentId:tournament._id,userId:user._id}).lean();
    } 
    if (alreadyJoined) {
         return res.redirect("/");
    }
    
        res.render("tournamentPayment",{user:user,tournament:tournament,slotNumber:slotNumber});
        }catch(e){
        res.redirect("/error");
    }
})
app.get("/tournamentLeadboard/:tournamentId",async function(req,res){
    try{
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    let tournamentLeadboard = await tournamentLeadboardDataBase.findOne({tournamentId:req.params.tournamentId}).populate("player.userId");
    //.log(tournamentLeadboard.player)
    let players = (tournamentLeadboard?.player || []).sort((a,b)=>b.kills-a.kills);
    //.log(players);
    res.render("tournamentLeadboard",{players:players,tournament:tournament});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/tournamentLeadboard/cs/:tournamentId",async function(req,res){
    try{
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    let usersTemp = tournament.slots.filter((user)=>user!=null);
    // //.log(users);
    let users = await userDataBase.find({_id:usersTemp});
    //.log(users);
    let tournamentLeadboard = await tournamentLeadboardDataBase.findOne({tournamentId:req.params.tournamentId}).lean();
    let players = (tournamentLeadboard?.player || [])
    players = players.map((player)=>String(player.userId));
    //.log(players);
    res.render("tournamentLeadboard",{players:players,tournament:tournament,users:users});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/tournament/detail/:userId/:tournamentId",async function(req,res){
    try{
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    let joined;
    if(tournament.matchType == "solo"){
        joined = await soloDataBase.findOne({tournamentId:tournament._id,userId: req.params.userId}).lean();
    }else if(tournament.matchType == "duo"){
        joined = await duoDataBase.findOne({tournamentId:tournament._id,userId: req.params.userId});
    }else if(tournament.matchType == "squad"){
        joined = await squadDataBase.findOne({tournamentId:tournament._id,userId: req.params.userId}).lean();
    }
    res.render("tournamentDetail",{tournament:tournament,user:user,joined:joined});
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/changeDetail/:userId",async function(req,res){
    try{
    await userDataBase.findOneAndUpdate({_id:req.params.userId},{
        gameName:req.body.gameName,
        gameId:req.body.gameId
    })
    res.redirect(`/editProfile/${req.params.userId}`);
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/resetPassword/:userId",async function(req,res){
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).lean();
    bcrypt.compare(req.body.oldPassword,user.password,async function(err,result){
        if(result){
            bcrypt.genSalt(10,function(err,salt){
            bcrypt.hash(req.body.newPassword,salt,async function(err,hash){
                //.log(hash);
                await userDataBase.findOneAndUpdate({_id:req.params.userId},{
                password:hash
        })
            })
        })
            res.send("Password is successfuly changed")
        }else{
            res.send("Old Password is incorrect")
        }
    })
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/formatePassword",function(req,res){
    res.render("formatePassword");
})
app.post("/formatePassword",async function(req,res){
    try{
    let user = await userDataBase.findOne({email:req.body.email}).lean();
    let otp = (Math.random()*9999+1000).toFixed(0);
    let secret = jwt.sign({email:req.body.email,otp:otp},process.env.PIN);
    sendMail(req.body.email,"OTP FOR PASSWORD FORMATE",otp);
    res.cookie("secret",secret);
    res.redirect("/otp");
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/otp",function(req,res){
    res.render("otp");
})
app.post("/verifyOtp",async function(req,res){
    try{
    let secret = jwt.verify(req.cookies.secret,process.env.PIN);
    //.log(secret);
    if(secret.otp==req.body.otp){
        bcrypt.genSalt(10,function(err,salt){
            bcrypt.hash(req.body.newPassword,salt,async function(err,hash){
                //.log(hash);
                await userDataBase.findOneAndUpdate({email:secret.email},{
                password:hash
        })
            })
        })
        
        let token = jwt.sign({email:secret.email,role:"user"},`${process.env.PIN}`);
        res.cookie("token",token, {
  maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  httpOnly: true
});
        res.redirect(`/`);
    }else{
        res.redirect("/otp")
    }
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/adminPanel/:adminId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let user = await userDataBase.find();
    let tournament = await tournamentDataBase.find();
    let upcomingTournament = await tournamentDataBase.find({status:"upcoming"});
    let withdraw = await transactionDataBase.find({status:"withdraw",flag:false});
    let ongoing = tournament.filter(function(val){
        if(val.status =="ongoing"){
            return val;
        }else{
            return false;
        }
    })
    let transaction = await transactionDataBase.find({upiId:null});
    
    res.render("adminPanel",{user:user,tournament:tournament.length,ongoing:ongoing.length,admin:admin,upcomingTournament:upcomingTournament.length,withdraw:withdraw.length,transaction:transaction});
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/adminApproveWithdraw/:adminId/:transactionId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let transaction = await transactionDataBase.findOneAndUpdate({_id:req.params.transactionId},{
        flag:true
    },{ new: true })
    await notificationDataBase.create({
                title:"withdraw Completed✅",
                message: `🚀 ₹${transaction.amount} sent successfully! Withdrawal processed — check your account. 👍`,
                userId:transaction.userId,
            })
    res.redirect(`/pendingWithdrawRequest/${req.params.adminId}`);
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/adminSendRoomDetails/:adminId/:tournamentId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        roomId:req.body.roomId,
        roomPassword:req.body.roomPassword
    },{new:true});
    let users = tournament.slots.filter(val=>val!=null);
    users = await userDataBase.find({_id:users});
    //.log(users);
    for(let i=0;i<users.length;i++){
        await notificationDataBase.create({
            title:"Room id & pass😊",
            message: `👋Hi ${users[i].username},your room id is ${req.body.roomId} and password is ${req.body.roomPassword} for ${tournament.description} join fast⏩`,
            userId:users[i]._id,
        })
    }
    
    //.log(tournament);
    res.redirect(`/adminEditTournament/${req.params.adminId}/${req.params.tournamentId}`);
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/adminTotalUser/:adminId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let users = await userDataBase.find();
    res.render("adminTotalUser",{users:users,admin:admin});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/adminCreateTournament/:adminId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    res.render("adminCreateTournament",{admin:admin});
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/adminCreateTournament/:adminId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.create({
        description:req.body.description,
        dateAndTime:req.body.dateAndTime,
        entryFee:req.body.entryFee,
        perKillAmountAmount:req.body.perKillAmountAmount,
        prizePool:req.body.prizePool,
        matchType:req.body.matchType,
        totalSlots:req.body.totalSlots,
        map:req.body.map,
        firstPrize:req.body.firstPrize,
        secondPrize:req.body.secondPrize,
        modeType:req.body.modeType,
        slots: Array(Number(req.body.totalSlots)).fill(null),
    })
    //.log(tournament);
    res.redirect(`/adminCreateTournament/${admin._id}`);
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/admin/tournament/:status/:adminId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament;
    if(req.params.status=="total"){
        tournament = await tournamentDataBase.find().sort({dateAndTime:1});
    }else if(req.params.status=="upcoming"){
        tournament = await tournamentDataBase.find({status:"upcoming"}).sort({dateAndTime:1});
    }else if(req.params.status=="ongoing"){
        tournament = await tournamentDataBase.find({status:"ongoing"}).sort({dateAndTime:1});
    }
    res.render("adminTotalTournament",{tournament:tournament,admin:admin});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/adminEditTournament/:adminId/:tournamentId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    res.render("adminEditTournament",{tournament:tournament,admin:admin});
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/adminPrizeDistribute/:adminId/:tournamentId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).sort({dateAndTime:1});
    let user;
    if(tournament.matchType == "solo"){
        user = await soloDataBase.find({tournamentId:tournament._id}).sort({slotId:-1});
    }else if(tournament.matchType == "duo"){
        user = await duoDataBase.find({tournamentId:tournament._id}).lean();
    }else if(tournament.matchType == "squad"){
        user = await squadDataBase.find({tournamentId:tournament._id}).lean();
    } 

    if(tournament.modeType == "cs"){
        //.log(user);
        let team1 = user.filter((user)=>user.teamId=="team1");
        let team2 = user.filter((user)=>user.teamId=="team2");
        return res.render("teamBasedPrizeDistribution",{user:user,tournament:tournament,admin:admin,team1:team1,team2:team2});
    }
    res.render("prizeDistribution",{user:user,tournament:tournament,admin:admin});
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/adminPrizeDistribution/:adminId/:tournamentId",async function(req,res){
    try{
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    if(tournament.status == "completed"){
        return res.redirect(`/adminPanel/${req.params.adminId}`);
    }
    let users = JSON.parse(req.body.users);
    //.log(users.sort((a,b)=>{b-a}));
    for(let i=0;i<users.length;i++){
        if(i==0){
            await userDataBase.findOneAndUpdate({_id:users[i].userId},{
            $inc:{
                totalKill:users[i].kills,
                winning:(users[i].kills*tournament.perKillAmountAmount)+tournament.firstPrize,
                monthlyWinning:(users[i].kills*tournament.perKillAmountAmount)+tournament.firstPrize,
                totalBalance:(users[i].kills*tournament.perKillAmountAmount)+tournament.firstPrize
            }
        })
        }else if(i==1){
            await userDataBase.findOneAndUpdate({_id:users[i].userId},{
            $inc:{
                totalKill:users[i].kills,
                winning:(users[i].kills*tournament.perKillAmountAmount)+tournament.secondPrize,
                monthlyWinning:(users[i].kills*tournament.perKillAmountAmount)+tournament.secondPrize,
                totalBalance:(users[i].kills*tournament.perKillAmountAmount)+tournament.secondPrize
            }
        })
        }else{
            await userDataBase.findOneAndUpdate({_id:users[i].userId},{
            $inc:{
                totalKill:users[i].kills,
                winning:users[i].kills*tournament.perKillAmountAmount,
                monthlyWinning:users[i].kills*tournament.perKillAmountAmount,
                totalBalance:users[i].kills*tournament.perKillAmountAmount
            }
        })
        }
        
    }
    await tournamentLeadboardDataBase.create({
        tournamentId:tournament._id,
        player:users
    })
    await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        status:"completed"
    })
    res.redirect(`/adminPanel/${req.params.adminId}`)
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/adminPrizeDistribution/cs/:adminId/:tournamentId",async function(req,res){
    try{
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    if(tournament.status == "completed"){
        return res.redirect(`/adminPanel/${req.params.adminId}`);
    }
    let users = JSON.parse(req.body.users);
    //.log(users);
    //.log(users.sort((a,b)=>{b-a}));
    let amount = tournament.prizePool;
    for(let i=0;i<users.length;i++){
        if(tournament.matchType == "solo"){
            await userDataBase.findOneAndUpdate({_id:users[i].userId},{
            $inc:{
                winning:amount,
                monthlyWinning:amount,
                totalBalance:amount
            }
            })  
        }else if(tournament.matchType == "duo"){
            await userDataBase.findOneAndUpdate({_id:users[i].userId},{
            $inc:{
                winning:amount/2,
                monthlyWinning:amount/2,
                totalBalance:amount/2
            }
            })  
        }else if(tournament.matchType == "squad"){
            await userDataBase.findOneAndUpdate({_id:users[i].userId},{
            $inc:{
                winning:amount/4,
                monthlyWinning:amount/4,
                totalBalance:amount/4
            }
            })  
        }
        
    }
    await tournamentLeadboardDataBase.create({
        tournamentId:tournament._id,
        player:users
    })
    await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        status:"completed"
    })
    res.redirect(`/adminPanel/${req.params.adminId}`)
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/adminEditTournament/:adminId/:tournamentId",async function(req,res){
    try{
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    if(req.body.delete){
        await tournamentDataBase.findOneAndDelete({_id:req.params.tournamentId});
        let leaderboard = await tournamentLeadboardDataBase.findOne({ tournamentId: req.params.tournamentId });
            if (leaderboard) {
                await tournamentLeadboardDataBase.findOneAndDelete({ tournamentId: req.params.tournamentId });
            }
    }else{
        await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        description:req.body.description,
        dateAndTime:req.body.dateAndTime,
        entryFee:req.body.entryFee,
        perKillAmountAmount:req.body.perKillAmountAmount,
        prizePool:req.body.prizePool,
        matchType:req.body.matchType,
        totalSlots:req.body.totalSlots,
        map:req.body.map,
        firstPrize:req.body.firstPrize,
        secondPrize:req.body.secondPrize,
        modeType:req.body.modeType
    })
    }
    
    res.redirect(`/adminPanel/${admin._id}`);
    }catch(e){
        res.redirect("/error");
    }
})
app.post("/adminRefund/:adminId/:tournamentId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).lean();
    let players = tournament.slots.filter((userId)=>userId!==null);
    //.log(players);
    for(let i=0;i<players.length;i++){
        await userDataBase.findOneAndUpdate({_id:players[i]},{
            $inc:{
                totalBalance:tournament.entryFee,
                bonus:tournament.entryFee,
                totalMatch:-1
            }
        })
        await notificationDataBase.create({
                title:"Tournament Cancelled😞",
                message: `We're sorry! The tournament has been cancelled. Your entry fee of ₹${tournament.entryFee} has been successfully refunded to your wallet.`,
                userId:players[i],
            })
    }
    await tournamentDataBase.findOneAndDelete({_id:req.params.tournamentId});
    res.redirect(`/adminPanel/${admin._id}`);
})
app.post("/roomIdAndPassword/:userId/:tournamentId/:slotNumber",async function(req,res){
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
    let user = await userDataBase.findOne({_id:req.params.userId}).session(session);
    let slotNumber = req.params.slotNumber;
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).session(session);
    // //.log(slotNumber);
    let slot;
    if(tournament.matchType == "solo"){
        slot = await soloDataBase.findOne({tournamentId:tournament._id,slotNumber: req.params.slotNumber}).session(session);
    }else if(tournament.matchType == "duo"){
        slot = await duoDataBase.findOne({tournamentId:tournament._id,slotId: req.params.slotNumber}).session(session);
    }else if(tournament.matchType == "squad"){
        slot = await squadDataBase.findOne({tournamentId:tournament._id,slotId: req.params.slotNumber}).session(session);
    } 
    
    if(slot){
         await session.abortTransaction();
        session.endSession();
        return res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
    }
    let alreadyJoined;
    if(tournament.matchType == "solo"){
        alreadyJoined = await soloDataBase.findOne({tournamentId:tournament._id,userId:user._id}).session(session);
    }else if(tournament.matchType == "duo"){
        alreadyJoined = await duoDataBase.findOne({tournamentId:tournament._id,userId:user._id}).session(session);
    }else if(tournament.matchType == "squad"){
        alreadyJoined = await squadDataBase.findOne({tournamentId:tournament._id,userId:user._id}).session(session);
    } 
    if (alreadyJoined) {
        await session.abortTransaction();
        session.endSession();
         return res.redirect("/");
    }

        if(user.totalBalance>=tournament.entryFee){
    const entryFee = tournament.entryFee;
    let depositedToDeduct = 0;
    let winningToDeduct = 0;
    let bonusToDeduct = 0;
    let remaining = 0;

    if (user.deposited >= entryFee) {
        depositedToDeduct = entryFee;
    } else {
     depositedToDeduct = user.deposited;
     remaining = entryFee - depositedToDeduct;
    }
    if (user.winning >= remaining) {
        winningToDeduct = remaining;
    } else {
    winningToDeduct = user.winning;
    remaining -= winningToDeduct;
    }
    if (user.bonus >= remaining) {
      bonusToDeduct = remaining;
    } 
        
    const updatedTournament = await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{

        $inc:{
            slotsFilled:1
            },
        $push: { slots: req.params.userId },
        },{session})
        //.log(updatedTournament);
        if (!updatedTournament) {
            return res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
        }
        if(tournament.matchType == "solo"){
            await soloDataBase.create([{
                tournamentId:tournament._id,
                userId:user._id,
                slotNumber:req.params.slotNumber,
                gameName:user.gameName
            }],{session});
        }else if(tournament.matchType == "duo"){
            await duoDataBase.create([{
                tournamentId:tournament._id,
                userId:user._id,
                slotId:req.params.slotNumber,
                teamId:"team"+req.params.slotNumber.slice(0, -1),
                gameName:user.gameName
            }],{session});
        }else if(tournament.matchType == "squad"){
            await squadDataBase.create([{
                tournamentId:tournament._id,
                userId:user._id,
                slotId:req.params.slotNumber,
                teamId:"team"+req.params.slotNumber.slice(0, -1),
                gameName:user.gameName
            }],{session});
        } 
        await userDataBase.findOneAndUpdate({_id:user._id},{
            $inc:{
                totalBalance:-tournament.entryFee,
                deposited:-depositedToDeduct,
                winning:-winningToDeduct,
                bonus:-bonusToDeduct,
                totalMatch:1
            }
        },{session})
        await notificationDataBase.create([{
                title:"Tournament succesfully joined",
               message: `⚠️ Hi ${user.username}, your slot number is ${req.params.slotNumber} for "${tournament.description}". Be in the room before time ⏰. ❌ You’ll be responsible.`,
                userId:user._id,
            }],{session})
        if(user.referredBy && !user.isReferred && tournament.entryFee >0){
            await userDataBase.findOneAndUpdate({_id:user._id},{
                isReferred:true
            },{session})
            let friend = await userDataBase.findOneAndUpdate({_id:user.referredBy},{
                $inc:{
                    earning:5,
                    totalBalance:5,
                    bonus:5,
                    
                }
            },{session});
            await notificationDataBase.create([{
                title:"Refer completed✅",
               message: ` Hi ${friend.username}, you earn 5 Max Coins as your referral bonus you can play matches from these coins`,
                userId:user.referredBy,
            }],{session})
        }

        await session.commitTransaction();
        session.endSession();
        
    res.redirect(`/tournament/upcoming/${updatedTournament.modeType}/${updatedTournament.matchType}/${tournament.entryFee>0?"paid":"free"}/${req.params.userId}`);
    }else{
        await session.abortTransaction();
        session.endSession()
        res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
    }
        
    }catch(e){
        res.redirect("/");
    }
})
app.post("/tournament/setOngoing/:tournamentId/:adminId",async function(req,res){
    try{
    await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        status:req.body.status
    })
    res.redirect(`/adminPanel/${req.params.adminId}`);
    }catch(e){
        res.redirect("/error");
    }
})
app.get("/monthlyPrizeDistribution/verification/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let otp = (Math.random()*9999+1000).toFixed(0);
    var token = jwt.verify(req.cookies.token,`${process.env.PIN}`);
    sendMail(process.env.email,"OTP FOR MONTHLY PRIZE DISTRIBUTION",otp);
    let pri = jwt.sign({otp:otp},process.env.PIN);
    res.cookie("pri",pri);
    res.render("monthlyPrizeDistributionVerification",{admin:admin});
})
app.post("/monthlyPrizeDistribution/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId}).lean();
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }

    let otp = jwt.verify(req.cookies.pri,process.env.PIN);
    //.log(req.cookies.pri);
    //.log(req.body.otp);
    //.log(otp.otp);

    if(String(req.body.otp) != String(otp.otp)){
        return res.redirect(`/monthlyPrizeDistribution/verification/${admin._id}`);
    }
    let users = await userDataBase.find().sort({monthlyWinning:-1}).lean();
    for(let i=0;i<users.length;i++){
        if(users[i].monthlyWinning>100){
            if(i==0){
            await userDataBase.findOneAndUpdate({_id:users[i]._id},{
                $inc:{
                    totalBalance:30,
                    bonus:30
                },
            })
            await notificationDataBase.create({
                title:"🎉 Monthly Leaderboard Winners! 🎉",
                message: `🎉 Congratulations ${users[i].username}!
You are the #1 Champion of this month's leaderboard! 🏆
Your gameplay was outstanding—keep ruling the battlefield! 💪🔥
💰 Reward: ₹30 has been added to your wallet.`,
                userId:users[i]._id,
            })
        }else if(i==1){
            await userDataBase.findOneAndUpdate({_id:users[i]._id},{
                $inc:{
                    totalBalance:20,
                    bonus:20
                },
            })
            await notificationDataBase.create({
                title:"🎉 Monthly Leaderboard Winners! 🎉",
                message: `👏 Well done ${users[i].username}!
You secured 2nd place in this month's leaderboard! 🥈
A little more push and the crown could be yours next time! 🚀
💰 Reward: ₹20 has been added to your wallet.`,
                userId:users[i]._id,
            })
        }else if(i==2){
            await userDataBase.findOneAndUpdate({_id:users[i]._id},{
                $inc:{
                    totalBalance:20,
                    bonus:20
                },
            })
             await notificationDataBase.create({
                title:"🎉 Monthly Leaderboard Winners! 🎉",
                message: `🙌 Nice work ${users[i].username}!
You made it to 3rd place on the leaderboard! 🥉
Great effort—keep grinding and aim for the top next month! 🎮💥
💰 Reward: ₹20 has been added to your wallet.
`,
                userId:users[i]._id,
            })
        }
    }
    await notificationDataBase.create({
                title:"🎉 Monthly Leaderboard Winners! 🎉",
                message: `🥇 1st Place : ${users[0].username} - ₹30
🥈 2nd Place : ${users[1].username} - ₹20
🥉 3rd Place : ${users[2].username} - ₹20
💪 You gave a tough fight!
Your performance was awesome, but the top 3 grabbed the crown this time.

🔥 Don't worry — a new month means a new chance!
Play more matches, score high, and your name could be on the leaderboard next time!

⚔️ Keep battling, keep rising!
— Team Max Battle
`,
                userId:users[i]._id,
            })
            await userDataBase.findOneAndUpdate({_id:users[i]._id},{
                monthlyWinning:0
            })
    } 

    res.send("Monthly prize successfuly distributed✅");
})

app.get("/logout",function(req,res){
    res.clearCookie("token");
    res.redirect("/login");
})



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Read/write helper functions
const readData = () => {
  const file = path.join(__dirname, "orders.json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
};

const writeData = (data) => {
  fs.writeFileSync(path.join(__dirname, "orders.json"), JSON.stringify(data, null, 2));
};

// Create order route
app.post("/create-order", async (req, res) => {
  try {
    let user = jwt.verify(req.cookies.token,`${process.env.PIN}`);
    ////.log(user);
    const { amount, currency, receipt, notes } = req.body;

    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);
    ////.log(order);
    const orders = readData();
    orders.push({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: "created"
    });
    writeData(orders);

    res.json(order);
  } catch (error) {
    ////.error(error);
    res.status(500).json({ error: "error creating order" });
  }
});

// Success page (GET)
app.get("/payment-success", (req, res) => {
  res.sendFile(path.join(__dirname, "success.html"));
});

// Verify payment route
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  ////.log(req.body);
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const isValid = validateWebhookSignature(body, razorpay_signature, razorpay.key_secret);

  if (!isValid) {
    return res.status(400).json({ status: "verification_failed" });
  }

  const orders = readData();
  const order = orders.find(o => o.order_id === razorpay_order_id);

  if (order) {
    order.status = "paid";
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature;
    order.paidAt = new Date().toISOString(); // Save timestamp
    writeData(orders);

    // ✅ Also log transaction info separately (optional)
    const txns = fs.existsSync("transactions.json")
      ? JSON.parse(fs.readFileSync("transactions.json"))
      : [];
    txns.push({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      amount: order.amount,
      currency: order.currency,
      paidAt: order.paidAt,
    });
    fs.writeFileSync("transactions.json", JSON.stringify(txns, null, 2));

    res.status(200).json({ status: "ok", payment_id: razorpay_payment_id });
  } else {
    res.status(404).json({ status: "order_not_found" });
  }
});




// Your webhook secret from Razorpay dashboard
const WEBHOOK_SECRET = `${process.env.WEBHOOK_SECRET}`;

app.post("/paymentCheck", express.json({ type: '*/*' }), async (req, res) => {
  try {
    const razorpaySignature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (razorpaySignature === expectedSignature) {
      const payment = req.body.payload.payment.entity;

      const alreadyExists = await transactionDataBase.findOne({ paymentId: payment.id });
      if (!alreadyExists) {
        await transactionDataBase.create({
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          status: payment.status,
          userId: payment.notes.userId
        });

        await notificationDataBase.create({
                title:"Deposit💰",
                message: `💸 Boom! ₹${payment.amount / 100} loaded to your wallet. Ready to conquer the battleground? 🔥`,
                userId:payment.notes.userId,
            })

        await userDataBase.findOneAndUpdate(
          { _id: payment.notes.userId },
          {
            $inc: {
              totalBalance: payment.amount / 100,
              deposited: payment.amount / 100
            }
          }
        );
      }

      return res.status(200).json({ status: "ok" });
    } else {
      return res.status(400).json({ error: "Invalid signature" });
    }
  } catch (err) {
    //.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

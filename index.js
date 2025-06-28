const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
app.get("/",async function(req,res){
    if(req.cookies.token){
        
        try{
            let token = jwt.verify(req.cookies.token,`${process.env.PIN}`);
            let user = await userDataBase.findOne({email:token.email});
            res.redirect(`/home/${user._id}`);
        }catch(e){
            res.redirect("/register")
        }
        
    }else{
        res.render("start");
    }

})
app.get("/register",async function(req,res){
    res.render("register");
})
app.post("/register",async function(req,res){
    let oldUser = await userDataBase.findOne({email:req.body.email});
    if(!oldUser){
        let promocode =String(req.body.email).split("@");
        var newUser;
        //.log(promocode[0]);
        bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(req.body.password,salt,async function(err,hash){
            newUser =  await userDataBase.create({
                gameName:req.body.gameName,
                gameId:req.body.gameId,
                username:req.body.username,
                email:req.body.email,
                password:hash,
                promocode:promocode[0]
            })
            let token = jwt.sign({email:req.body.email,role:"user"},`${process.env.PIN}`);
    res.cookie("token",token);
    res.redirect(`/home/${newUser._id}`);
        })
    
    })
    
    }else{
        res.redirect("/register");
    }
    
})
app.get("/login",async function(req,res){
    if(req.cookies.token){
        try{
           var token = jwt.verify(req.cookies.token,`${process.env.PIN}`);
        }catch(e){
            res.render("login");
        }
        let user = await userDataBase.findOne({email:token.email});
        res.redirect(`/home/${user._id}`);
    }else{
        res.render("login");
    }
})
app.post("/login",async function(req,res){
    let user = await userDataBase.findOne({email:req.body.email});
    ////.log(user)
    if(user){
        bcrypt.compare(req.body.password,user.password,function(err,result){
        if(result){
            let token = jwt.sign({email:req.body.email,role:"user"},`${process.env.PIN}`);
            res.cookie("token",token);
            res.redirect(`/home/${user._id}`);
        }else{
            res.redirect("/login");
        }
    })
    }else{
        res.redirect("/register")
    }
    
})
app.get("/home/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("home",{user:user});
})
app.get("/profile/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("profile",{user:user});
})
app.get("/leadboard/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let users = await userDataBase.find().sort({monthlyWinning:-1});
    //.log(users)
    res.render("leadboard",{user:user,users:users});
})
app.get("/earn/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    
    res.render("earn",{user:user});
})
app.get("/refer/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("refer",{user:user});
})
app.get("/wallet/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("wallet",{user:user});
})
app.get("/deposit/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("deposit",{user:user});
})
app.get("/withdraw/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("withdraw",{user:user});
})
app.post("/withdraw/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    if(user.winning >=req.body.amount){
        await userDataBase.findOneAndUpdate({_id:user._id},{
            $inc:{
                totalBalance:-Number(req.body.amount),
                winning:-Number(req.body.amount),
            },
        })
        await transactionDataBase.create({
              upiId:req.body.upiId,
              amount: req.body.amount,
              status: "withdraw",                   
              userId: user._id,
        })
    }
    res.redirect(`/wallet/${req.params.userId}`);
})
app.get("/pendingWithdrawRequest/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    let withdraw = await transactionDataBase.find({status:"withdraw",flag:false}).populate("userId");
    //.log(withdraw);
    res.render("withdrawRequest",{withdraw:withdraw,admin:admin});
})
app.get("/transaction/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let transaction = await transactionDataBase.find({userId:user._id}).sort({createdAt:-1});
    res.render("transaction",{user:user,transaction:transaction});
})
app.get("/editProfile/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("editProfile",{user:user});
})
app.get("/faq",function(req,res){
    res.render("faq");
})

app.get("/myUpcomming/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.find({status:"upcomming"});

    res.render("myUpcomming",{user:user,tournament:tournament});
})
app.get("/myOngoing/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.find({status:"ongoing"});
    res.render("myOngoing",{user:user,tournament:tournament});
})
app.get("/myCompleted/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.find({status:"completed"});
    res.render("myCompleted",{user:user,tournament:tournament});
})
app.get("/tournament/result/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.find({status:"completed"}).sort({dateAndTime:1});
    res.render("result",{user:user,tournament:tournament});
})
app.get("/tournament/upcomming/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.find({status:"upcomming"}).sort({dateAndTime:1});
    res.render("upcomming",{user:user,tournament:tournament});
})
app.get("/tournament/ongoing/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.find({status:"ongoing"}).sort({dateAndTime:1});
    res.render("ongoing",{user:user,tournament:tournament});
}) 
app.get("/tournament/slot/:userId/:tournamentId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    res.render("slot",{user:user,tournament:tournament});
})
app.get("/tournament/payment/:userId/:tournamentId/:slotNumber",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let slotNumber = parseInt(req.params.slotNumber);
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    // //.log(slotNumber);
    
    let tournamentUsers = tournament.slots.filter(function(val){
        if(val!=null) return val;
    })
    if(tournament.slots[slotNumber-1]!=null){
        return res.redirect("/");
    }else{
        for(let i=0;i<tournamentUsers.length;i++){
            
            if(tournamentUsers[i].toString() == user._id.toString()){
                return res.redirect("/");
            }
        }
    }
    
        res.render("tournamentPayment",{user:user,tournament:tournament,slotNumber:slotNumber});
})
app.get("/tournamentLeadboard/:tournamentId",async function(req,res){
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    let tournamentLeadboard = await tournamentLeadboardDataBase.findOne({tournamentId:req.params.tournamentId}).populate("player.userId");
    //.log(tournamentLeadboard.player)
    //.log(tournament);
    let players = (tournamentLeadboard.player).sort((a,b)=>b.kills-a.kills);
    res.render("tournamentLeadboard",{players:players,tournament:tournament});
})
app.get("/tournament/detail/:userId/:tournamentId",async function(req,res){
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("tournamentDetail",{tournament:tournament,user:user});
})

app.get("/adminPanel/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let user = await userDataBase.find();
    let tournament = await tournamentDataBase.find();
    let upcommingTournament = await tournamentDataBase.find({status:"upcomming"});
    let withdraw = await transactionDataBase.find({status:"withdraw",flag:false});
    let ongoing = tournament.filter(function(val){
        if(val.status =="ongoing"){
            return val;
        }else{
            return false;
        }
    })
    let transaction = await transactionDataBase.find({paymentId:{$ne:null}});
    
    res.render("adminPanel",{user:user.length,tournament:tournament.length,ongoing:ongoing.length,admin:admin,upcommingTournament:upcommingTournament.length,withdraw:withdraw.length,transaction:transaction});
})
app.post("/adminApproveWithdraw/:adminId/:transactionId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    await transactionDataBase.findOneAndUpdate({_id:req.params.transactionId},{
        flag:true
    })
    res.redirect(`/pendingWithdrawRequest/${req.params.adminId}`);
})
app.post("/adminSendRoomDetails/:adminId/:tournamentId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        roomId:req.body.roomId,
        roomPassword:req.body.roomPassword
    });
    //.log(tournament);
    res.redirect(`/adminEditTournament/${req.params.adminId}/${req.params.tournamentId}`);
})
app.get("/adminTotalUser/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let users = await userDataBase.find();
    res.render("adminTotalUser",{users:users,admin:admin});
})
app.get("/adminCreateTournament/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    res.render("adminCreateTournament",{admin:admin});
})
app.post("/adminCreateTournament/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.create({
        description:req.body.description,
        dateAndTime:req.body.dateAndTime,
        entryFee:req.body.entryFee,
        perKillAmount:req.body.perKillAmount,
        prizePool:req.body.prizePool,
        matchType:req.body.matchType,
        totalSlots:req.body.totalSlots,
        map:req.body.map,
        createdBy:req.params.adminId,
        firstPrize:req.body.firstPrize,
        secondPrize:req.body.secondPrize,
        slots: Array(Number(req.body.totalSlots)).fill(null),
    })
    //.log(tournament);
    res.redirect(`/adminCreateTournament/${admin._id}`);
})
app.get("/admin/tournament/:status/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament;
    if(req.params.status=="total"){
        tournament = await tournamentDataBase.find().sort({dateAndTime:1});
    }else if(req.params.status=="upcomming"){
        tournament = await tournamentDataBase.find({status:"upcomming"}).sort({dateAndTime:1});
    }else if(req.params.status=="ongoing"){
        tournament = await tournamentDataBase.find({status:"ongoing"}).sort({dateAndTime:1});
    }
    res.render("adminTotalTournament",{tournament:tournament,admin:admin});
})
app.get("/adminEditTournament/:adminId/:tournamentId",async function(req,res){
    
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    res.render("adminEditTournament",{tournament:tournament,admin:admin});
})
app.get("/adminPrizeDistribute/:adminId/:tournamentId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId}).sort({dateAndTime:1});
    let temp = tournament.slots.filter(function(val){
        if(val!==null){
            return true;
        }
    })
    // //.log(temp)
    let user = await userDataBase.find({_id:temp});
    // //.log(user);
    res.render("prizeDistribution",{user:user,tournament:tournament,admin:admin});
})
app.post("/adminPrizeDistribution/:adminId/:tournamentId",async function(req,res){
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    if(tournament.status == "completed"){
        return res.redirect(`/adminPanel/${req.params.adminId}`);
    }
    let users = JSON.parse(req.body.users);
    for(let i=0;i<users.length;i++){
        await userDataBase.findOneAndUpdate({_id:users[i].userId},{
            $inc:{
                totalKill:users[i].kills,
                winning:users[i].kills*tournament.perKillAmount,
                monthlyWinning:users[i].kills*tournament.perKillAmount,
                totalBalance:users[i].kills*tournament.perKillAmount
            }
        })
    }
    await tournamentLeadboardDataBase.create({
        tournamentId:tournament._id,
        player:users
    })
    await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        status:"completed"
    })
    res.redirect(`/adminPanel/${req.params.adminId}`)
})
app.post("/adminEditTournament/:adminId/:tournamentId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    if (!isAdmin(admin)) {
        return res.redirect("/");
    }
    if(req.body.delete){
        await tournamentDataBase.findOneAndDelete({_id:req.params.tournamentId});
    }else{
        await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        description:req.body.description,
        dateAndTime:req.body.dateAndTime,
        entryFee:req.body.entryFee,
        perKillAmount:req.body.perKillAmount,
        prizePool:req.body.prizePool,
        matchType:req.body.matchType,
        totalSlots:req.body.totalSlots,
        map:req.body.map,
        firstPrize:req.body.firstPrize,
        secondPrize:req.body.secondPrize
    })
    }
    
    res.redirect(`/adminPanel/${admin._id}`);
})
app.post("/roomIdAndPassword/:userId/:tournamentId/:slotNumber",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let slotNumber = parseInt(req.params.slotNumber);
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    // //.log(slotNumber);
    
    if(tournament.slots[slotNumber-1]!=null){
        return res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
    }
    const alreadyJoined = tournament.slots.some(slot => {
        return slot?.toString() === user._id.toString(); /// ? userd for skip any null value //if the condition is true is return true
    });
    if (alreadyJoined) {
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
        
    const updatedTournament = await tournamentDataBase.findOneAndUpdate({
            _id:req.params.tournamentId,
            [`slots.${parseInt(req.params.slotNumber) - 1}`]: null
        },{
        $inc:{
            slotsFilled:1
            },
        $set:{
            [`slots.${req.params.slotNumber-1}`]:req.params.userId
            }
        })
        //.log(updatedTournament);
        if (!updatedTournament) {
            return res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
        }
        
        await userDataBase.findOneAndUpdate({_id:user._id},{
            $inc:{
                totalBalance:-tournament.entryFee,
                deposited:-depositedToDeduct,
                winning:-winningToDeduct,
                bonus:-bonusToDeduct,
                totalMatch:1
            }
        })
    res.redirect(`/tournament/detail/${req.params.userId}/${req.params.tournamentId}`);
    }else{
        res.redirect(`/tournament/slot/${req.params.userId}/${req.params.tournamentId}`);
    }
        
    

    
    
   
})
app.post("/tournament/setOngoing/:tournamentId/:adminId",async function(req,res){
    await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        status:req.body.status
    })
    res.redirect(`/adminPanel/${req.params.adminId}`);
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
    // //.log("Webhook triggered for payment:", payment.id);
    ////.log("hariom modi ye body Hai =",req.body);
    const razorpaySignature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto.createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    //.log("razorpaySignature = ",razorpaySignature);
    ////.log("expextedSignature = ",expectedSignature);
    if (razorpaySignature === expectedSignature) {
        //.log("Working hariom")
        let payment = req.body.payload.payment.entity;
        //.log("payment",payment);
        //.log("payment.amount",payment.notes)
        // const existingPayment = await transaction.findOne({ paymentId: payment.id });

        // if (existingPayment) {
        //  // Payment already processed — ignore the duplicate webhook
        //  return res.status(200).json({ message: 'Duplicate payment webhook ignored.' });
        // }
        let doubleCheck = await transactionDataBase.findOne({paymentId:payment.id});
        if(!doubleCheck){
       let transaction = await transactionDataBase.create({
            paymentId:payment.id,
            orderId:payment.order_id,
            amount:payment.amount/100,
            status:payment.status,
            userId:payment.notes.userId
        })
        
            await userDataBase.findOneAndUpdate({_id:payment.notes.userId},{
            $inc:{
                totalBalance: payment.amount / 100,
                deposited: payment.amount / 100
            },
        })
        }
        
        ////.log("✅ Verified Razorpay Webhook");
        ////.log("Payment Details:", req.body);

        res.status(200).json({ status: "ok" });
    } else {
        ////.log("❌ Invalid Webhook Signature");
        res.status(400).json({ error: "Invalid signature" });
    }
});


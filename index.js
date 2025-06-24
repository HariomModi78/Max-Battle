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
const registrationDataBase = require("./models/registrationModel.js");
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use(cookieParser());
app.listen(3000,()=>{
    //console.log("Server is running ");
})
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
        let promocode =(req.body.promocode).toString().split("@");
        //console.log(promocode[0]);
        bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(req.body.password,salt,async function(err,hash){
           let newUser =  await userDataBase.create({
                gameName:req.body.gameName,
                gameId:req.body.gameId,
                username:req.body.username,
                email:req.body.email,
                password:hash,
                promocode:promocode[0]
            })
        })
        
    })
    let token = jwt.sign({email:req.body.email,role:"user"},`${process.env.PIN}`);
    res.cookie("token",token);
    res.redirect(`/home/${newUser._id}`);
    }else{
        res.redirect("/register");
    }
    
})
app.get("/login",async function(req,res){
    if(req.cookies.token){
        try{
           let token = jwt.verify(req.cookies.token,`${process.env.PIN}`);
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
    //console.log(user)
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
    let users = await userDataBase.find();
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
app.get("/transaction/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("transaction",{user:user});
})
app.get("/editProfile/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("editProfile",{user:user});
})
app.get("/faq",function(req,res){
    res.render("faq");
})
app.get("/tournament/upcomming/:type/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.find().sort({dateAndTime:1});
    res.render("upcomming",{user:user,tournament:tournament});
})
app.get("/myUpcomming/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("myUpcomming",{user:user});
})
app.get("/myOngoing/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("myOngoing",{user:user});
})
app.get("/myStatistics/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("myStatistics");
})
app.get("/myCompleted/:userId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("myCompleted",{user:user});
})
app.get("/tournament/result/:type",function(req,res){
    res.render("result");
})
app.get("/tournament/ongoing/:type",function(req,res){
    res.render("ongoing");
}) 
app.get("/tournament/slot/:userId/:tournamentId",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    res.render("slot",{user:user,tournament:tournament});
})
app.get("/tournament/payment/:userId/:tournamentId/:slotNumber",async function(req,res){
    let user = await userDataBase.findOne({_id:req.params.userId});
    let slotNumber = req.params.slotNumber;
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    res.render("tournamentPayment",{user:user,tournament:tournament,slotNumber:slotNumber});
})
app.get("/tournament/detail/:userId/:tournamentId",async function(req,res){
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    let user = await userDataBase.findOne({_id:req.params.userId});
    res.render("tournamentDetail",{tournament:tournament,user:user});
})
app.get("/adminPanel/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    let user = await userDataBase.find();
    let tournament = await tournamentDataBase.find();
    let ongoing = tournament.filter(function(val){
        if(val.status =="ongoing"){
            return val;
        }else{
            return false;
        }
    })
    res.render("adminPanel",{user:user.length,tournament:tournament.length,ongoing:ongoing.length,admin:admin});
})
app.get("/adminTotalUser/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    let users = await userDataBase.find();
    res.render("adminTotalUser",{users:users,admin:admin});
})
app.get("/adminCreateTournament/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    res.render("adminCreateTournament",{admin:admin});
})
app.post("/adminCreateTournament/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    await tournamentDataBase.create({
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
        secondPrize:req.body.secondPrize
    })
    res.redirect(`/adminCreateTournament/${admin._id}`);
})
app.get("/adminTotalTournament/:adminId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    let tournament = await tournamentDataBase.find();
    res.render("adminTotalTournament",{tournament:tournament,admin:admin});
})
app.get("/adminEditTournament/:adminId/:tournamentId",async function(req,res){
    let tournament = await tournamentDataBase.findOne({_id:req.params.tournamentId});
    let admin = await userDataBase.findOne({_id:req.params.adminId});
    res.render("adminEditTournament",{tournament:tournament,admin:admin});
})
app.post("/adminEditTournament/:adminId/:tournamentId",async function(req,res){
    let admin = await userDataBase.findOne({_id:req.params.adminId});
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
    
    res.redirect(`/adminTotalTournament/${admin._id}`);
})
app.post("/roomIdAndPassword/:userId/:tournamentId/:slotNumber",async function(req,res){
    await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        $set:{
            [`slots.${req.params.slotNumber-1}`]:req.params.userId
            }
    })
    await tournamentDataBase.findOneAndUpdate({_id:req.params.tournamentId},{
        $inc:{
            slotsFilled:1
        }
    })
    res.redirect(`/tournament/detail/${req.params.userId}/${req.params.tournamentId}`);
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
    //console.log(user);
    const { amount, currency, receipt, notes } = req.body;

    const options = {
      amount: amount * 100,
      currency: currency || "INR",
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);
    //console.log(order);
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
    //console.error(error);
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
  //console.log(req.body);
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
    //console.log("Webhook triggered for payment:", payment.id);
    //console.log("hariom modi ye body Hai =",req.body);
    const razorpaySignature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto.createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    console.log("razorpaySignature = ",razorpaySignature);
    //console.log("expextedSignature = ",expectedSignature);
    if (razorpaySignature === expectedSignature) {
        //console.log("Working hariom")
        let payment = req.body.payload.payment.entity;
        //console.log("payment",payment);
        //console.log("payment.amount",payment.notes)
        
        await userDataBase.findOneAndUpdate({_id:payment.notes.userId},{
            $inc:{
                totalBalance: payment.amount / 100,
                deposited: payment.amount / 100
            },
        })
        //console.log("✅ Verified Razorpay Webhook");
        //console.log("Payment Details:", req.body);

        res.status(200).json({ status: "ok" });
    } else {
        //console.log("❌ Invalid Webhook Signature");
        res.status(400).json({ error: "Invalid signature" });
    }
});

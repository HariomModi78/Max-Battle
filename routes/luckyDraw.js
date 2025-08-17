const express = require("express");
const router = express.Router();
const userDataBase = require("../models/userModel")
const luckyDrawDataBase = require("../models/luckyDrawModel");
const notificationDataBase = require("../models/notification.js")
const ticketDataBase = require("../models/ticketModel");
const isAdmin = require("../authentications/isAdmin");
const mongoose = require("mongoose");
const sendAll = require("../emails/sendAll.js");
const luckyDraw = router.get("/luckyDraw/:userId/:status",async function(req,res){
    try{
        let user = await userDataBase.findOne({_id:req.params.userId});
        if(user){
            let luckyDraw;
            if(req.params.status == "ongoing"){
                luckyDraw = await luckyDrawDataBase.find({status:"ongoing"});
            }else{
                luckyDraw = await luckyDrawDataBase.find({status:"result"});
            }
            
            console.log(luckyDraw);
            res.render("luckyDraw",{luckyDraw,user});
        }else{
            res.redirect("/error");
        }
    }catch(e){
        res.redirect("/error");
    }
})
const adminCreateLuckyDraw = router.post("/adminCreateLuckyDraw/:adminId",async function(req,res){
    try{
        //.log("Working")
        if(isAdmin(req.params.adminId)){
            
            const {description,drawDateAndTime,price,prizePool,totalSlots} = req.body;
            await luckyDrawDataBase.create({
                description,
                drawDateAndTime,
                price,
                prizePool,
                totalSlots,
            })
            let luckyDraw = await luckyDrawDataBase.find();
            //.log(luckyDraw);
            res.send("Done ✅");
        }
    }catch(e){
        res.send("error")
    }
})
const adminCreateLuckyDrawGet = router.get("/adminCreateLuckyDraw/:adminId",async function(req,res){
    try{
        if(isAdmin(req.params.adminId)){
            //.log("Eorkignfdingai")
            let admin  = await userDataBase.findOne({_id:req.params.adminId})
            res.render("adminCreateLuckyDraw",{admin:admin});
        }
    }catch(e){
        res.send("erroru")
    }
})
const luckyDrawPaymentGet = router.get("/luckyDrawPayment/:luckyDrawId/:userId",async function(req,res){
    try{
        let user = await userDataBase.findOne({_id:req.params.userId});
        let luckyDraw = await luckyDrawDataBase.findOne({_id:req.params.luckyDrawId})
        if(user){
            res.render("tournamentPayment",{luckyDrawFlag:true,user:user,luckyDraw:luckyDraw});
        }else{
            res.redirect("/error");
        }
    }catch(e){
        res.redirect("/error");
    }
})
const luckyDrawPayment =  router.post("/luckyDrawPayment/:luckyDrawId/:userId",async function(req,res){
    try{

        const session = await mongoose.startSession();
            session.startTransaction();
        
        let user = await userDataBase.findOne({_id:req.params.userId}).session(session);
        
        let luckyDraw = await luckyDrawDataBase.findOne({_id:req.params.luckyDrawId}).session(session);

        if(user){
///     
            
            
                    if(user.totalBalance>=luckyDraw.price){
                const entryFee = luckyDraw.price;
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
                const updatedLuckyDraw = await luckyDrawDataBase.findOneAndUpdate({_id:req.params.luckyDrawId},{
            
                    $inc:{
                        slotsFilled:1
                        },
                    $push: { slots: req.params.userId },
                    },{session})

                    // console.log(updatedLuckyDraw);
                    if (!updatedLuckyDraw) {
                        return res.redirect(`/luckyDraw/${req.params.luckyDrawId}/${req.params.userId}`);
                    }
                    
                        await ticketDataBase.create([{
                            luckyDrawId:req.params.luckyDrawId,
                            userId:req.params.userId,
                            ticketNumber:updatedLuckyDraw.slots.length+1,
                        }],{session});
                    
                    await userDataBase.findOneAndUpdate({_id:user._id},{
                        $inc:{
                            totalBalance:-luckyDraw.price,
                            deposited:-depositedToDeduct,
                            winning:-winningToDeduct,
                            bonus:-bonusToDeduct,
                            
                        }
                    },{session})
                    await notificationDataBase.create([{
                            title:"Ticket succesfully confirmed",
                           message: `👋 Hi ${user.username}, your  ticket is confirmed and its number is ${updatedLuckyDraw.slots.length+1}`,
                            userId:user._id,
                        }],{session})
                    if(Number(luckyDraw.slotsFilled)+1 == Number((luckyDraw.totalSlots)/2)){
                        let users = await userDataBase.find({emailPermission:true});
                        //.log(users.length);
                        //.log("Han yahe hai users")
                            for(let i=0;i<users.length;i++){
                            sendAll(users[i].email,"Max Battle🏆",
                                `<div style="padding: 20px; background: linear-gradient(90deg, #fceabb, #f8b500); border-radius: 10px; font-family: 'Segoe UI', sans-serif; color: #333; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center;">
              <strong style="font-size: 18px;">🚨 50% Slots Booked!</strong><br>
              The lottery ticket is filling up fast. <strong>Buy now</strong> to confirm your slot before it's full!
              <br><br>
            
            
            
              <a href="max-battle.onrender.com/luckyDraw/${users[i]._id}" style="padding: 10px 20px; background-color: #ff6f00; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                🔥 Buy Now
              </a>
            </div>
            `
                            )
                            }
                        
                    }
                    if(Number(luckyDraw.slotsFilled)+1 == Number((luckyDraw.totalSlots)-1)){
                        let users = await userDataBase.find({emailPermission:true});
                        //.log(users.length);
                        //.log("Han yahe hai users")
                        
                            for(let i=0;i<users.length;i++){
                            sendAll(users[i].email,"Max Battle🏆",
                                `<div style="padding: 20px; background: linear-gradient(90deg, #fceabb, #f8b500); border-radius: 10px; font-family: 'Segoe UI', sans-serif; color: #333; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center;">
              <strong style="font-size: 18px;">🚨  Only 1 slot left!</strong><br>
              The lottry ticket is filling up fast. <strong>Buy now</strong> to confirm your ticket before it's full!
              <br><br>
            
            
            
              <a href="max-battle.onrender.com/luckyDraw/${users[i]._id}" style="padding: 10px 20px; background-color: #ff6f00; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                🔥 Buy Now
              </a>
            </div>
            `
                            )
                            }
                        
                    }
                    
                    console.log("final step")
                    
                    await session.commitTransaction();
                    session.endSession();
                    
                res.redirect(`/luckyDraw/${req.params.userId}`);
                }else{
                    await session.abortTransaction();
                    session.endSession();
                    res.redirect(`/luckyDraw/${req.params.userId}`);
                }

//////

        }
    }catch(e){
        res.redirect("/error");
    }
})
module.exports = {luckyDraw,adminCreateLuckyDraw,luckyDrawPaymentGet,luckyDrawPayment,adminCreateLuckyDrawGet};
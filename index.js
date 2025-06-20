const express = require("express");
const app = express();
const path = require("path");
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.listen(3000,()=>{
    console.log("Server is running ");
})

app.get("/",function(req,res){
    res.render("start");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/home",function(req,res){
    res.render("home");
})
app.get("/profile",function(req,res){
    res.render("profile");
})
app.get("/leadboard",function(req,res){
    res.render("leadboard");
})
app.get("/earn",function(req,res){
    res.render("earn");
})
app.get("/refer",function(req,res){
    res.render("refer");
})
app.get("/wallet",function(req,res){
    res.render("wallet");
})
app.get("/deposit",function(req,res){
    res.render("deposit");
})
app.get("/withdraw",function(req,res){
    res.render("withdraw");
})
app.get("/transaction",function(req,res){
    res.render("transaction");
})
app.get("/tournament/upcomming/:type",function(req,res){
    res.render("upcomming");
})
app.get("/tournament/result/:type",function(req,res){
    res.render("result");
})
app.get("/tournament/ongoing/:type",function(req,res){
    res.render("ongoing");
}) 
app.get("/tournament/slot",function(req,res){
    res.render("slot");
})
app.get("/tournament/payment",function(req,res){
    res.render("tournamentPayment");
})
app.get("/tournament/detail",function(req,res){
    res.render("tournamentDetail");
})

require('dotenv').config();
const exp = require("constants");
const express =require("express");
const app=express();
const hbs=require("hbs");
const path=require("path");
const bcrypt=require("bcrypt");
const cookieParser=require("cookie-parser");
const auth=require("./middleware/auth")


const port=process.env.port|| 3000;

require("./db/conn");
const Register=require("./model/register");

const static_path=path.join(__dirname,"../public");
app.use(express.static(static_path));
const template_path=path.join(__dirname,"../templates/views");
const partials_path=path.join(__dirname,"../templates/partials");

app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    res.render("index");
})

app.get("/home",(req,res)=>{
    res.render("home");
})
app.get("/registration",(req,res)=>{
    res.render("registration");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/register",(req,res)=>{
    res.render("register")
})
app.get("/profile",(req,res)=>{
    res.render("profile")
})

app.get("/complainBox",(req,res)=>{
    res.render("complainBox")
})

app.get("/canteenReg",(req,res)=>{
    res.render("canteenReg")
})
app.get("/secret",auth,(req,res)=>{
    // console.log(`this is my login cookies ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/afterlogin", auth, async (req, res) => {
    try {  
        res.render("afterlogin"); // Pass the userName to the view
    } catch (error) {
        res.status(500).send(error);
    }
});
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmPassword; // Corrected variable name

        if (password === cpassword) {
            const Employee = new Register({
                name: req.body.name,
                contact: req.body.contact,
                date: req.body.date,
                prn: req.body.prn,
                password:req.body.password,
                branch: req.body.branch,
                roomReference: req.body.roomReference,
                email:req.body.email,
                preference:req.body.preference,
                confirmPassword: cpassword, // Corrected variable name
            });

            //console.log(Employee);

             // concept of middle ware
             const token=await Employee.generateAuthToken();
            //  console.log("the token part"+token);

             res.cookie("jwt",token,{
                 expires:new Date(Date.now()+3000),
                 httpOnly:true,
             });
            const savedEmployee = await Employee.save();
            // The correct way to send a response with status 201 and render a view
            res.status(201).render("login");
        } else {
            res.send("Wrong password. Please enter the correct password.");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});


//logiin validation
app.post("/login",async(req,res)=>{
    try{
     const email=req.body.email;
     const password=req.body.password;
     const usermail=await Register.findOne({email:email});
    //console.log(usermail)
     const isMatch=await bcrypt.compare(password,usermail.password);
 // middle ware
     const token=await usermail.generateAuthToken();
    // console.log("the token part"+token);
 
    res.cookie("jwt",token,{
     expires:new Date(Date.now()+3600000),
     httpOnly:true,
     //secure:true
 });
     if(isMatch){
         res.status(201).render("afterlogin", {userName:usermail.name});
     }else{
         res.send("invalid password details")
     }
 
 
    }catch(error){
     res.status(400).send('invalid details')
    }
  })

  app.get("/logout",auth,async(req,res)=>{
    try{
        //logout for multiple user
        req.user.tokens=[];
        res.clearCookie("jwt");

        await req.user.save();
        console.log("logout successfully");
        res.render("login");
    }catch(error){
        res.status(500).send(error);
    }
})


app.listen(port,()=>{
    console.log(`server is runing at port no ${port}`);
})
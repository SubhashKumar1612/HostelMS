require('dotenv').config();
const exp = require("constants");
const express =require("express");
const app=express();
const hbs=require("hbs");
const path=require("path");
const bcrypt=require("bcrypt");
const cookieParser=require("cookie-parser");
const auth=require("./middleware/auth");
const Leave = require("./model/leave"); // Make sure to create this model
const CanteenRegistration = require("./model/canteen"); // Make sure to create this model
const SportRegistration = require("./model/sports"); // Make 


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
    res.render("index", { nav: "navbar" });
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
// app.get("/profile",(req,res)=>{
//     res.render("profile")
// })


app.get('/edit_profile', auth, (req, res) => {
    res.render('edit_profile', { user: req.user }); // Ensure 'edit_profile' matches your view/template name
});

app.post('/edit_profile', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        const updatedUser = await Register.findByIdAndUpdate(
            userId,
            {
                name: req.body.name,
                email: req.body.email,
                contact: req.body.contact,
                address: req.body.address,
                date: req.body.date,
                branch: req.body.branch,
                year: req.body.year,
                roomReference: req.body.roomReference,
                roomNo: req.body.roomNo
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Server error');
    }
});




// Updated profile route to fetch user data and pass it to the profile template
app.get('/profile', auth, async (req, res) => {
    try {
        const user = req.user; // User data from authentication middleware
        const complaints = await Complaint.find({ userId: user._id });
        const leaves = await Leave.find({ userId: user._id });
        const canteenOrders = await CanteenRegistration.find({ userId: user._id });
        console.log(canteenOrders)
        res.render('profile', {
            user,
            complaints,
            leaves,
            canteenOrders
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});




// app.get("/complainBox",(req,res)=>{
//     res.render("complainBox", { nav: "nav" })
// })
app.get('/complainBox', auth, async (req, res) => {
    try {
        const user = await Register.findById(req.user._id);
        res.render('complainBox', { user, nav: "nav"  }); // Assuming the form template is named 'complainBox.hbs'
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to render the canteen registration form
app.get('/canteen', auth, async (req, res) => {
    try {
        // Find user details using Register model if needed
        const user = await Register.findById(req.user.id);
        
        // Render the form with user details if necessary
        res.render('canteen', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// app.get("/leave",(req,res)=>{
//     res.render("leave", { nav: "nav" })
// })


// In your Express route handler
app.get('/leave', auth, async (req, res) => {
    try {
        // Fetch the user data from the database
        const user = await Register.findById(req.user._id); // Adjust this according to how you get the current user

        // Render the form and pass the user data
        res.render('leave', {
            user: {
                rollNo: user.prn,
                name: user.name
            },
            nav: "nav"  // Combine nav with the other data
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

  



app.get("/sports",auth,async(req,res)=>{
      // Find user details using Register model if needed
      const user = await Register.findById(req.user.id);
    res.render("sports",{user})
})

app.get("/secret",auth,(req,res)=>{
    // console.log(`this is my login cookies ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/afterlogin", auth, async (req, res) => {
    try {  
        res.render("afterlogin", { nav: "nav" }); // Pass the userName to the view
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


//sports
app.post('/sports-registration',auth, async (req, res) => {
    try {
        const clubs = req.body;
        const user=req.user;
        const userId =user._id;

        // if (!userId || !Array.isArray(clubs) || clubs.length === 0) {
        //     return res.status(400).json({ message: 'User ID and selected sports are required' });
        // }

        // Create a new SportRegistration document
        const registration = new SportRegistration({
            userId,
            clubs
        });

        // Save the document to the database
        await registration.save();

        // Send a success response
        res.status(201).json({ message: 'Sports registration successful', registration });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Handle POST request for canteen orders

app.post('/canteen', auth, async (req, res) => {
    try {
        const { veg, NonVeg, order } = req.body;
        const user = req.user;

        console.log('Received data:', { veg, NonVeg, order });
        console.log('User:', user);

        // Ensure user ID is correctly set
        if (!user) {
            return res.status(401).send('User not authenticated');
        }

        // Create a new canteen registration entry
        const newCanteenRegistration = new CanteenRegistration({
            userId: user._id,
            veg: veg || [], // Ensure veg is an array
            NonVeg: NonVeg || [], // Ensure NonVeg is an array
            order: order || ''
        });

        // Save the entry to the database
        await newCanteenRegistration.save();

        // Redirect or respond as necessary
        res.redirect('/profile');
    } catch (error) {
        console.error('Error saving canteen registration:', error);
        res.status(500).send('Server Error');
    }
});






app.post('/leave', auth, async (req, res) => {
    try {
        
        const { rollNo, name, leaveDate, leaveTo, leaveReason } = req.body;
        const user = req.user;

        // Check if user is available
        if (!user) {
            return res.status(400).send('User not found');
        }
        
        const newLeave = new Leave({
            rollNo,
            name,
            leaveDate,
            leaveTo,
            leaveReason,
            userId: user._id // Use userId instead of refId
        });
        
        await newLeave.save();
        res.redirect('/profile'); // Adjust redirect as needed
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});



const Complaint = require("./model/complaints"); // Import the Complaint model

// POST method for submitting a complaint
app.post('/complainBox', auth, async (req, res) => {
    try {
        const { category, message } = req.body;

        // Retrieve the user from the database using the authenticated user's ID
        const user = await Register.findById(req.user._id);

        // Create a new complaint document
        const newComplaint = new Complaint({
            category,
            message,
            userId: user._id
        });

        // Save the complaint to the database
        await newComplaint.save();

        // Redirect to a success page or handle the response as needed
        res.redirect('/profile'); // Adjust redirect as needed
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port,()=>{
    console.log(`server is runing at port no ${port}`);
})
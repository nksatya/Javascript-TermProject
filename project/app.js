// Assignment done by:
//      Satya Nilamegam Kumaran - C0886405
//      Mani Rathna Reddy Bellamkonda - C0887487
//      Karthik Saride - C0886429
//      Ravi Varman Ravichandran - C0885920
// This js file is the entry point of this application which has user crud and car crud.


// Importing the necessary frameworks or plugin need for the application functionality
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./schema').User;
const Car = require('./schema').Car;
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create an Express application
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({ // Configure session management
    secret: 'term-project', // Secret used to sign the session ID cookie
    resave: true, // Force the session to be saved back to the session store, even if it was not modified
    saveUninitialized: true, // Save new sessions that have not been modified
    cookie: {
        secure: true, // Set to true if your server is using HTTPS
        maxAge: 3600000, // Set the maxAge of the session cookie to 1 hour (in milliseconds)
        httpOnly: true // Set the httpOnly flag to prevent client-side access to the cookie
    }
}));

// Set the port number for the server to listen on
const PORT = process.env.PORT || 3000;

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/term-project', {
    useNewUrlParser: true, // Use new URL parser
    useUnifiedTopology: true // Use new server discover and monitoring engine
});

// All User schema Routes

// Application landing page (login) 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'index.html'));
});

// Signup route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'signup.html'));
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body; // Extract username and password from request body
    try {
        const user = await User.findOne({ username }); // Find user by username
        if (user && await bcrypt.compare(password, user.password)) { // Check if user exists and password is correct
            req.session.user = user; // Store user information in session
            res.redirect('/home'); // Send success response
        } else {
            res.status(401).send('Invalid credentials!'); // Send unauthorized response
        }
    } catch (error) {
        res.status(500).send('Login failed!'); // Send error response
    }
});

// Sign up route
app.post('/signup', async (req, res) => {
    console.log(req.body);
    const { email, username, password, role } = req.body; // Extract username, password, email and role from request body
    // Find user by username
    const user = await User.findOne({ username });
    if (user != null && (user.username === username || user.email === email)) {
        res.status(409).send('User already exists! Login to continue.');
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    try {
        await User.create({ username, password: hashedPassword, role }); // Create a new user with hashed password
        let createdUser = await User.findOne({ username });
        req.session.user = createdUser;
        res.redirect('/home'); // Send success response
    } catch (error) {
        console.log(error);
        res.status(500).send('Registration failed!'); // Send error response
    }
});

// Home route
app.get('/home', (req, res) => {
    const user = req.session.user; // Get user information from session
    // Check if user is logged in and has admin role
    Car.find({}).then(cars => {
        if (user && user.role === 'admin') {
            res.render('admin-home', { cars: cars });
        }
        else {
            res.render('home', { cars: cars }); // Send unauthorized response
        }
    })
        .catch(err => {
            console.log(err);
        });
});

//All Car Routes

app.get('/create-car', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'create-car.html'));
});

app.post('/create-car', async (req, res) => {
    const user = req.session.user;
    var { make, model, year, price, color, vin, variant, engineCapacity, gasType, isAutomatic } = req.body;
    if (!isAutomatic) {
        isAutomatic = false;
    }
    console.log(req.body.gasType);
    try {
        if (user.role === 'admin') {
            await Car.create({ make, model, year, price, color, vin, variant, engineCapacity, gasType, isAutomatic }); // Create a new Car
            res.redirect('/home'); // Send success response
        }
        else {
            res.status(403).send('Car creation unauthorized!');
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Car creation failed!');
    }
});

app.post('/edit/:id', (req, res) => {
    Car.findById(req.params.id).then(cars => {
        res.render('edit-car', { cars: cars });
    })
        .catch(err => {
            console.log(err);
        });
});

app.post('/update-car/:id', async (req, res) => {
    const user = req.session.user;
    var { make, model, year, price, color, vin, variant, engineCapacity, gasType, isAutomatic } = req.body;
    if (!isAutomatic) {
        isAutomatic = false;
    }
    try {
        const result = await Car.updateOne({ _id: req.params.id }, { $set: { make, model, year, price, color, vin, variant, engineCapacity, gasType, isAutomatic } });
        console.log(result);
        res.redirect('/home'); // Send success response
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Car update failed!');
    }
});


app.post('/delete/:id', async (req, res) => {
    const user = req.session.user;
    try {
        if (user.role === 'admin') {
            const result = await Car.deleteOne({ _id: req.params.id });
            console.log(result);
            res.redirect('/home'); // Send success response
        }
        else {
            res.status(403).send('Car Delete unauthorized!');
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Car Delete failed!');
    }
});


// HTTP configuration
const httpsOptions = {
    key: fs.readFileSync('key.pem'), // Read private key file
    cert: fs.readFileSync('certificate.pem') // Read certificate file
};

// Create HTTPS server
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`); // Start HTTPS server and log port
});

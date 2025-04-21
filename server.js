const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require('path');
require('dotenv').config();
const port = process.env.PORT || 3000;

// ใช้ URI จาก .env file
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not defined in .env file');
    process.exit(1);
}

const app = express();

// Middleware
// app.use(cors()); // Comment out or remove the old simple cors usage

// Configure CORS
const allowedOrigins = ['https://ecomsite-add-login.netlify.app'];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    // or origins in the allowedOrigins list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // Use the configured CORS options

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB with detailed error handling
console.log('Attempting to connect to MongoDB...');
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
})
.catch(err => {
    console.error('MongoDB connection error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
    });
    console.error('Please check your MongoDB connection string and make sure MongoDB is running');
});

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', {
        name: err.name,
        message: err.message,
        code: err.code
    });
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

// ปรับปรุง Schema ให้มีการตรวจสอบข้อมูลละเอียดขึ้น
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9_]+$/.test(v);
            },
            message: 'Username can only contain letters, numbers, and underscores'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    email:{
        type: String,
        required: [true,'Email is required'],
        unique: true,
        validate :{
            validator: function(v){
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Middleware ก่อนบันทึกข้อมูล
userSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

const User = mongoose.model("User", userSchema);

// Get all users endpoint
app.get("/users", async(req, res) => {
    try {
        const users = await User.find({}, { 
            username: 1, 
            email: 1,
            createdAt: 1, 
            lastUpdated: 1,
            _id: 1 
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            message: "Error fetching users",
            error: error.message 
        });
    }
});

// Registration endpoint with enhanced validation and error handling
app.post("/register", async(req, res) => {
    console.log('Received registration request:', { username: req.body.username, email: req.body.email });
    
    try {
        const {username, password, email} = req.body;
        
        // Basic validation
        if (!username || !password || !email) {
            console.log('Missing required fields:', { username: !username, password: !password });
            return res.status(400).json({ 
                message: "Username and password are required",
                errors: {
                    username: !username ? 'Username is required' : null,
                    password: !password ? 'Password is required' : null,
                    email: !email ? 'Email is required' : null
                }
            });
        }

        // Password strength validation
        if (password.length < 6) {
            console.log('Password too short');
            return res.status(400).json({ 
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        console.log('Checking if user exists...');
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ message: "Username already exists" });
        }else{
            const existingEmail = await User.findOne({ email });
            if(existingEmail){
                console.log('Email already exists:', email);
                return res.status(400).json({message: "Email already exists"});
            }
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        console.log('Creating new user...');
        const user = new User({
            username, 
            password: hashedPassword,
            email
        });

        await user.save();
        console.log('User created successfully:', user._id);

        // Return success without password
        res.json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                id: user._id
            }
        });
    } catch (error) {
        console.error('Registration error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({
                message: "Validation error",
                errors
            });
        }

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Username already exists",
                error: "Duplicate username"
            });
        }

        res.status(500).json({ 
            message: "Error during registration",
            error: error.message
        });
    }
});

// Login endpoint with enhanced error handling
app.post("/login", async(req, res) => {
    console.log('Received login request:', { identifier: req.body.username });

    try {
        const { username: identifier, password } = req.body;

        if (!identifier || !password) {
            console.log('Missing required fields:', { identifier: !identifier, password: !password });
            return res.status(400).json({
                message: "Username/Email and password are required",
                errors: {
                    identifier: !identifier ? 'Username or Email is required' : null,
                    password: !password ? 'Password is required' : null
                }
            });
        }

        console.log('Finding user by username or email...');
        const user = await User.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });

        if (!user) {
            console.log('User not found:', identifier);
            return res.status(404).json({ message: "User not found or invalid credentials" });
        }

        console.log('Checking password for user:', user.username);
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
            console.log('Login successful for user:', user.username);
            res.json({
                message: "Login successful",
                user: {
                    username: user.username,
                    email: user.email,
                    id: user._id
                }
            });
        } else {
            console.log('Invalid password for user:', user.username);
            res.status(401).json({ message: "Invalid password or credentials" });
        }
    } catch (error) {
        console.error('Login error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ 
            message: "Error during login",
            error: error.message
        });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

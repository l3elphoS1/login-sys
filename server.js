const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
// app.use(cors()); // Comment out or remove the old simple cors usage

// Configure CORS
const allowedOrigins = ['https://ecomsite-add-login.netlify.app'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Add response headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const originalJson = res.json;
    res.json = function(data) {
        console.log('Sending JSON response:', data);
        return originalJson.call(this, data);
    };

    console.log('Received request:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        // Log the incoming request
        console.log('Received registration request with body:', req.body);

        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            const response = {
                success: false,
                message: 'All fields are required'
            };
            console.log('Sending validation error response:', response);
            return res.status(400).send(JSON.stringify(response));
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            const response = {
                success: false,
                message: 'User with this email or username already exists'
            };
            console.log('Sending existing user error response:', response);
            return res.status(400).send(JSON.stringify(response));
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        console.log('User saved successfully with ID:', user._id);

        // Prepare success response
        const response = {
            success: true,
            message: 'Registration successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        };

        // Set response headers explicitly
        res.setHeader('Content-Type', 'application/json');
        
        // Log the response we're about to send
        console.log('Sending success response:', response);
        
        // Send the response
        return res.status(201).send(JSON.stringify(response));
    } catch (error) {
        console.error('Registration error:', error);
        
        const errorResponse = {
            success: false,
            message: 'Error during registration',
            error: error.message
        };
        
        // Set response headers explicitly
        res.setHeader('Content-Type', 'application/json');
        
        // Log the error response we're about to send
        console.log('Sending error response:', errorResponse);
        
        return res.status(500).send(JSON.stringify(errorResponse));
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
});

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Test endpoint with explicit response
app.get('/test', (req, res) => {
    const testResponse = {
        message: 'Server is working!',
        timestamp: new Date().toISOString()
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(testResponse));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    
    const errorResponse = {
        success: false,
        message: 'Something broke!',
        error: err.message
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify(errorResponse));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

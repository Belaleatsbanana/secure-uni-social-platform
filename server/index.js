import express from "express"; // Express framework for building the server
import bodyParser from "body-parser"; // Middleware for parsing request bodies
import mongoose from "mongoose"; // Mongoose for MongoDB object modeling
import cors from "cors"; // Middleware for enabling CORS (Cross-Origin Resource Sharing)
import dotenv from "dotenv"; // Load environment variables from .env file
import multer from "multer"; // uploading files
import helmet from "helmet"; // security middleware against common vulnerabilities
import morgan from "morgan"; // HTTP request logger middleware
import path from "path"; // Node.js module for handling file paths
import { fileURLToPath } from "url"; // Utility to get the filename and directory name in ES modules
import rateLimit from "express-rate-limit"; // prevent brute-force attacks and abuse
import mongoSanitize from "express-mongo-sanitize"; // sanitize user input to prevent NoSQL injection attacks
import hpp from "hpp"; // prevent HTTP Parameter Pollution attacks where attackers can send multiple parameters with the same name to manipulate server behavior
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import messageRoutes from "./routes/messages.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express(); 

/* SECURITY MIDDLEWARE */
// Rate limiting - prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { error: "Too many login attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: "Too many requests from this IP." },
});

app.use(generalLimiter);
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

// CORS configuration - restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
// Allowed file types for upload
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|gif/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    // Sanitize filename - remove path traversal attempts and use timestamp
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${Date.now()}-${sanitizedName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  // Check file extension
  const extname = ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase());
  // Check MIME type
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter
});

/* ROUTES WITH FILES */
app.post("/auth/register", authLimiter, upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* HEALTH CHECK ENDPOINT */
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/* ROUTES */
app.use("/auth", loginLimiter, authRoutes);
app.use("/users", authLimiter, userRoutes);
app.use("/posts", authLimiter, postRoutes);
app.use("/messages", authLimiter, messageRoutes);

/* ERROR HANDLING MIDDLEWARE */
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  if (err.message.includes('Only image files')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));

// MongoDB initialization script
// This runs when MongoDB container is first created

// Connect to the target database
db = db.getSiblingDB('uni_social_db');

// Create application user with limited privileges
// User credentials match those in docker-compose.yml defaults
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'uni_social_db'
    }
  ]
});

// Create indexes for better performance and security
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.posts.createIndex({ userId: 1 });
db.posts.createIndex({ createdAt: -1 });

print('MongoDB initialized successfully!');

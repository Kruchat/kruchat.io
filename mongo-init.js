// MongoDB initialization script
db = db.getSiblingDB('teacher-documents');

// Create collections
db.createCollection('users');
db.createCollection('documents');
db.createCollection('folders');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.documents.createIndex({ "title": "text", "description": "text", "tags": "text" });
db.documents.createIndex({ "category": 1, "subject": 1 });
db.documents.createIndex({ "uploadedBy": 1, "createdAt": -1 });
db.documents.createIndex({ "folder": 1 });

db.folders.createIndex({ "path": 1 });
db.folders.createIndex({ "createdBy": 1, "category": 1 });
db.folders.createIndex({ "parentFolder": 1 });

// Create default admin user
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK", // admin123
  fullName: "ผู้ดูแลระบบ",
  role: "admin",
  department: "IT",
  subjects: ["คอมพิวเตอร์"],
  isActive: true,
  preferences: {
    theme: "light",
    language: "th",
    notifications: {
      email: true,
      push: true
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create default teacher user
db.users.insertOne({
  username: "teacher",
  email: "teacher@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK", // password123
  fullName: "ครูตัวอย่าง",
  role: "teacher",
  department: "คณิตศาสตร์",
  subjects: ["คณิตศาสตร์", "วิทยาศาสตร์"],
  isActive: true,
  preferences: {
    theme: "light",
    language: "th",
    notifications: {
      email: true,
      push: true
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Database initialized successfully!");
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [100, 'Folder name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  path: {
    type: String,
    required: [true, 'Folder path is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'คณิตศาสตร์', 'ภาษาไทย', 'ภาษาอังกฤษ', 'วิทยาศาสตร์', 
      'สังคมศึกษา', 'ประวัติศาสตร์', 'ภูมิศาสตร์', 'ศิลปะ', 
      'ดนตรี', 'พลศึกษา', 'คอมพิวเตอร์', 'อื่นๆ'
    ]
  },
  subject: {
    type: String,
    trim: true
  },
  accessLevel: {
    type: String,
    enum: ['private', 'department', 'public'],
    default: 'private'
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  icon: {
    type: String,
    default: 'folder'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documentCount: {
    type: Number,
    default: 0
  },
  subfolderCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
folderSchema.index({ path: 1 });
folderSchema.index({ createdBy: 1, category: 1 });
folderSchema.index({ parentFolder: 1 });

// Virtual for full path
folderSchema.virtual('fullPath').get(function() {
  return this.path;
});

// Method to check if user can access folder
folderSchema.methods.canAccess = function(userId, userRole) {
  if (userRole === 'admin') return true;
  if (this.createdBy.toString() === userId.toString()) return true;
  if (this.accessLevel === 'public') return true;
  if (this.accessLevel === 'department' && this.allowedUsers.includes(userId)) return true;
  if (this.allowedUsers.includes(userId)) return true;
  return false;
};

// Method to get all subfolders
folderSchema.methods.getSubfolders = async function() {
  const Folder = mongoose.model('Folder');
  return await Folder.find({ parentFolder: this._id, isActive: true });
};

// Method to get all documents in folder
folderSchema.methods.getDocuments = async function() {
  const Document = mongoose.model('Document');
  return await Document.find({ folder: this._id, isActive: true });
};

module.exports = mongoose.model('Folder', folderSchema);
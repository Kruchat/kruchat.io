const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  fileExtension: {
    type: String,
    required: [true, 'File extension is required']
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
  tags: [{
    type: String,
    trim: true
  }],
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
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
  version: {
    type: Number,
    default: 1
  },
  parentDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    default: null
  },
  versions: [{
    version: Number,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeNote: String
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  metadata: {
    author: String,
    created: Date,
    modified: Date,
    pages: Number,
    duration: Number, // for videos/audio
    dimensions: {
      width: Number,
      height: Number
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });
documentSchema.index({ category: 1, subject: 1 });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });

// Virtual for file size in human readable format
documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to check if user can access document
documentSchema.methods.canAccess = function(userId, userRole) {
  if (userRole === 'admin') return true;
  if (this.uploadedBy.toString() === userId.toString()) return true;
  if (this.accessLevel === 'public') return true;
  if (this.accessLevel === 'department' && this.allowedUsers.includes(userId)) return true;
  if (this.allowedUsers.includes(userId)) return true;
  return false;
};

module.exports = mongoose.model('Document', documentSchema);
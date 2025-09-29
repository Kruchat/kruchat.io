const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const Document = require('../models/Document');
const Folder = require('../models/Folder');
const { auth } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Upload document
router.post('/upload', auth, upload.array('files', 10), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { title, description, category, subject, tags, folderId, accessLevel } = req.body;
    const uploadedDocuments = [];

    for (const file of req.files) {
      const document = new Document({
        title: title || path.basename(file.originalname, path.extname(file.originalname)),
        description: description || '',
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension: path.extname(file.originalname).toLowerCase(),
        category: category || 'อื่นๆ',
        subject: subject || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        folder: folderId || null,
        uploadedBy: req.user._id,
        accessLevel: accessLevel || 'private'
      });

      await document.save();
      await document.populate('uploadedBy', 'username fullName');
      uploadedDocuments.push(document);
    }

    res.status(201).json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocuments
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// Get all documents with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subject,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      accessLevel
    } = req.query;

    const query = { isActive: true };
    
    // Apply filters
    if (category) query.category = category;
    if (subject) query.subject = new RegExp(subject, 'i');
    if (accessLevel) query.accessLevel = accessLevel;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Access control - only show documents user can access
    if (req.user.role !== 'admin') {
      query.$or = [
        { uploadedBy: req.user._id },
        { accessLevel: 'public' },
        { accessLevel: 'department', allowedUsers: req.user._id },
        { allowedUsers: req.user._id }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const documents = await Document.find(query)
      .populate('uploadedBy', 'username fullName')
      .populate('folder', 'name path')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'username fullName')
      .populate('folder', 'name path')
      .populate('allowedUsers', 'username fullName');

    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permission
    if (!document.canAccess(req.user._id, req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment view count
    document.viewCount += 1;
    await document.save();

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download document
router.get('/:id/download', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permission
    if (!document.canAccess(req.user._id, req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Increment download count
    document.downloadCount += 1;
    await document.save();

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Length', document.fileSize);

    // Stream file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error during download' });
  }
});

// Update document
router.put('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user can edit (owner or admin)
    if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { title, description, category, subject, tags, accessLevel, allowedUsers } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (subject) updateData.subject = subject;
    if (tags) updateData.tags = tags;
    if (accessLevel) updateData.accessLevel = accessLevel;
    if (allowedUsers) updateData.allowedUsers = allowedUsers;

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'username fullName')
     .populate('folder', 'name path');

    res.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user can delete (owner or admin)
    if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Soft delete
    document.isActive = false;
    await document.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
});

// Bulk download
router.post('/bulk-download', auth, async (req, res) => {
  try {
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ message: 'No documents selected' });
    }

    const documents = await Document.find({
      _id: { $in: documentIds },
      isActive: true
    });

    // Check access permissions
    const accessibleDocuments = documents.filter(doc => 
      doc.canAccess(req.user._id, req.user.role)
    );

    if (accessibleDocuments.length === 0) {
      return res.status(403).json({ message: 'No accessible documents found' });
    }

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.attachment('documents.zip');
    archive.pipe(res);

    for (const doc of accessibleDocuments) {
      if (fs.existsSync(doc.filePath)) {
        archive.file(doc.filePath, { name: doc.originalName });
        // Increment download count
        doc.downloadCount += 1;
        await doc.save();
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Bulk download error:', error);
    res.status(500).json({ message: 'Server error during bulk download' });
  }
});

// Get document statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const matchQuery = isAdmin ? { isActive: true } : {
      isActive: true,
      $or: [
        { uploadedBy: userId },
        { accessLevel: 'public' },
        { accessLevel: 'department', allowedUsers: userId },
        { allowedUsers: userId }
      ]
    };

    const stats = await Document.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          totalDownloads: { $sum: '$downloadCount' },
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);

    const categoryStats = await Document.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overview: stats[0] || {
        totalDocuments: 0,
        totalSize: 0,
        totalDownloads: 0,
        totalViews: 0
      },
      categories: categoryStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
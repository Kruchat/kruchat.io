const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');
const Folder = require('../models/Folder');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, department } = req.query;

    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { fullName: new RegExp(search, 'i') }
      ];
    }
    
    if (role) query.role = role;
    if (department) query.department = new RegExp(department, 'i');

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users can only view their own profile unless admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user statistics
    const stats = await Document.aggregate([
      {
        $match: {
          uploadedBy: user._id,
          isActive: true
        }
      },
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

    const folderStats = await Folder.countDocuments({
      createdBy: user._id,
      isActive: true
    });

    res.json({
      user,
      stats: {
        ...stats[0] || {
          totalDocuments: 0,
          totalSize: 0,
          totalDownloads: 0,
          totalViews: 0
        },
        totalFolders: folderStats
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only or self)
router.put('/:id', auth, async (req, res) => {
  try {
    const { fullName, department, subjects, role, isActive, preferences } = req.body;
    
    // Check if user can update (self or admin)
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (department) updateData.department = department;
    if (subjects) updateData.subjects = subjects;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };
    
    // Only admin can change role and active status
    if (req.user.role === 'admin') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
});

// Delete user (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete user
    user.isActive = false;
    await user.save();

    // Soft delete user's documents and folders
    await Document.updateMany(
      { uploadedBy: user._id },
      { isActive: false }
    );

    await Folder.updateMany(
      { createdBy: user._id },
      { isActive: false }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
});

// Get user's documents
router.get('/:id/documents', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    // Check if user can view documents (self or admin)
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = {
      uploadedBy: req.params.id,
      isActive: true
    };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const documents = await Document.find(query)
      .populate('folder', 'name path')
      .sort({ createdAt: -1 })
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
    console.error('Get user documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's folders
router.get('/:id/folders', auth, async (req, res) => {
  try {
    // Check if user can view folders (self or admin)
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const folders = await Folder.find({
      createdBy: req.params.id,
      isActive: true
    })
    .populate('parentFolder', 'name path')
    .sort({ name: 1 });

    res.json({ folders });
  } catch (error) {
    console.error('Get user folders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system statistics (admin only)
router.get('/stats/system', adminAuth, async (req, res) => {
  try {
    const userStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalTeachers: { $sum: { $cond: [{ $eq: ['$role', 'teacher'] }, 1, 0] } },
          totalAdmins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
        }
      }
    ]);

    const documentStats = await Document.aggregate([
      { $match: { isActive: true } },
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

    const folderStats = await Folder.countDocuments({ isActive: true });

    const recentUsers = await User.find({ isActive: true })
      .select('username fullName createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: userStats[0] || { totalUsers: 0, totalTeachers: 0, totalAdmins: 0 },
      documents: documentStats[0] || { totalDocuments: 0, totalSize: 0, totalDownloads: 0, totalViews: 0 },
      folders: folderStats,
      recentUsers
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const path = require('path');
const Folder = require('../models/Folder');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create folder
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, parentFolder, category, subject, accessLevel, color, icon } = req.body;

    // Check if parent folder exists and user has access
    let parentPath = '';
    if (parentFolder) {
      const parent = await Folder.findById(parentFolder);
      if (!parent || !parent.isActive) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
      if (!parent.canAccess(req.user._id, req.user.role)) {
        return res.status(403).json({ message: 'Access denied to parent folder' });
      }
      parentPath = parent.path;
    }

    // Create folder path
    const folderPath = parentPath ? `${parentPath}/${name}` : name;

    // Check if folder with same name exists in same location
    const existingFolder = await Folder.findOne({
      name,
      parentFolder: parentFolder || null,
      isActive: true
    });

    if (existingFolder) {
      return res.status(400).json({ message: 'Folder with this name already exists' });
    }

    const folder = new Folder({
      name,
      description: description || '',
      parentFolder: parentFolder || null,
      path: folderPath,
      createdBy: req.user._id,
      category: category || 'อื่นๆ',
      subject: subject || '',
      accessLevel: accessLevel || 'private',
      color: color || '#3B82F6',
      icon: icon || 'folder'
    });

    await folder.save();
    await folder.populate('createdBy', 'username fullName');

    // Update parent folder's subfolder count
    if (parentFolder) {
      await Folder.findByIdAndUpdate(parentFolder, {
        $inc: { subfolderCount: 1 }
      });
    }

    res.status(201).json({
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Server error during folder creation' });
  }
});

// Get all folders
router.get('/', auth, async (req, res) => {
  try {
    const { parentFolder, category, search } = req.query;

    const query = { isActive: true };
    
    if (parentFolder !== undefined) {
      query.parentFolder = parentFolder || null;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Access control
    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user._id },
        { accessLevel: 'public' },
        { accessLevel: 'department', allowedUsers: req.user._id },
        { allowedUsers: req.user._id }
      ];
    }

    const folders = await Folder.find(query)
      .populate('createdBy', 'username fullName')
      .populate('parentFolder', 'name path')
      .sort({ name: 1 });

    res.json({ folders });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get folder by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('createdBy', 'username fullName')
      .populate('parentFolder', 'name path')
      .populate('allowedUsers', 'username fullName');

    if (!folder || !folder.isActive) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check access permission
    if (!folder.canAccess(req.user._id, req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get subfolders
    const subfolders = await folder.getSubfolders();
    
    // Get documents in folder
    const documents = await folder.getDocuments();

    res.json({
      folder,
      subfolders,
      documents
    });
  } catch (error) {
    console.error('Get folder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update folder
router.put('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder || !folder.isActive) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if user can edit (creator or admin)
    if (folder.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { name, description, category, subject, accessLevel, color, icon, allowedUsers } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (subject) updateData.subject = subject;
    if (accessLevel) updateData.accessLevel = accessLevel;
    if (color) updateData.color = color;
    if (icon) updateData.icon = icon;
    if (allowedUsers) updateData.allowedUsers = allowedUsers;

    const updatedFolder = await Folder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username fullName')
     .populate('parentFolder', 'name path');

    res.json({
      message: 'Folder updated successfully',
      folder: updatedFolder
    });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
});

// Delete folder
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder || !folder.isActive) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if user can delete (creator or admin)
    if (folder.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Check if folder has subfolders or documents
    const subfolders = await folder.getSubfolders();
    const documents = await folder.getDocuments();

    if (subfolders.length > 0 || documents.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete folder with subfolders or documents. Please move or delete them first.' 
      });
    }

    // Soft delete
    folder.isActive = false;
    await folder.save();

    // Update parent folder's subfolder count
    if (folder.parentFolder) {
      await Folder.findByIdAndUpdate(folder.parentFolder, {
        $inc: { subfolderCount: -1 }
      });
    }

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
});

// Get folder tree structure
router.get('/tree/structure', auth, async (req, res) => {
  try {
    const buildTree = async (parentId = null) => {
      const query = { 
        parentFolder: parentId, 
        isActive: true 
      };

      // Access control
      if (req.user.role !== 'admin') {
        query.$or = [
          { createdBy: req.user._id },
          { accessLevel: 'public' },
          { accessLevel: 'department', allowedUsers: req.user._id },
          { allowedUsers: req.user._id }
        ];
      }

      const folders = await Folder.find(query)
        .populate('createdBy', 'username fullName')
        .sort({ name: 1 });

      const tree = [];
      for (const folder of folders) {
        const children = await buildTree(folder._id);
        tree.push({
          ...folder.toObject(),
          children
        });
      }
      return tree;
    };

    const tree = await buildTree();
    res.json({ tree });
  } catch (error) {
    console.error('Get folder tree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move folder
router.put('/:id/move', auth, async (req, res) => {
  try {
    const { newParentFolder } = req.body;
    const folder = await Folder.findById(req.params.id);

    if (!folder || !folder.isActive) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if user can move (creator or admin)
    if (folder.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Check if new parent exists and user has access
    let newParentPath = '';
    if (newParentFolder) {
      const newParent = await Folder.findById(newParentFolder);
      if (!newParent || !newParent.isActive) {
        return res.status(404).json({ message: 'New parent folder not found' });
      }
      if (!newParent.canAccess(req.user._id, req.user.role)) {
        return res.status(403).json({ message: 'Access denied to new parent folder' });
      }
      newParentPath = newParent.path;
    }

    // Check if folder with same name exists in new location
    const existingFolder = await Folder.findOne({
      name: folder.name,
      parentFolder: newParentFolder || null,
      isActive: true,
      _id: { $ne: folder._id }
    });

    if (existingFolder) {
      return res.status(400).json({ message: 'Folder with this name already exists in the new location' });
    }

    const oldParentId = folder.parentFolder;
    const newPath = newParentPath ? `${newParentPath}/${folder.name}` : folder.name;

    // Update folder
    folder.parentFolder = newParentFolder || null;
    folder.path = newPath;
    await folder.save();

    // Update subfolder counts
    if (oldParentId) {
      await Folder.findByIdAndUpdate(oldParentId, {
        $inc: { subfolderCount: -1 }
      });
    }
    if (newParentFolder) {
      await Folder.findByIdAndUpdate(newParentFolder, {
        $inc: { subfolderCount: 1 }
      });
    }

    res.json({ message: 'Folder moved successfully' });
  } catch (error) {
    console.error('Move folder error:', error);
    res.status(500).json({ message: 'Server error during move' });
  }
});

module.exports = router;
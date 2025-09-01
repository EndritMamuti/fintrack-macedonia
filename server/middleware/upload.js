const multer = require('multer');
const path = require('path');

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const userId = req.user ? req.user.id : 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${userId}_${timestamp}_${name}${ext}`);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// Middleware for single receipt upload
const uploadReceipt = upload.single('receipt');

// Middleware wrapper with error handling
const handleReceiptUpload = (req, res, next) => {
  uploadReceipt(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 5MB.' 
        });
      }
      return res.status(400).json({ 
        message: `Upload error: ${err.message}` 
      });
    } else if (err) {
      return res.status(400).json({ 
        message: err.message 
      });
    }
    
    // Add file info to request if file was uploaded
    if (req.file) {
      req.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }
    
    next();
  });
};

// Utility function to delete uploaded file
const deleteReceipt = (filename) => {
  const fs = require('fs');
  const filePath = path.join('uploads/receipts', filename);
  
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error deleting receipt file:', err);
    }
  });
};

module.exports = {
  handleReceiptUpload,
  deleteReceipt
};
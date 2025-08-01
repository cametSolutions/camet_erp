import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Image, Trash2, Crop, Info, AlertCircle } from 'lucide-react';

const LogoUploadModal = ({ isOpen, onClose, onSubmit, loading, currentLogo }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentLogo || null);
  const [dragActive, setDragActive] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropData, setCropData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [originalImage, setOriginalImage] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const cropCanvasRef = useRef(null);

  if (!isOpen) return null;

  // Image compression function
  const compressImage = (file, maxSizeMB = 2, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate dimensions for banner format (8:1 ratio)
        const targetWidth = 2480;
        const targetHeight = 310; // 8:1 ratio
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Validation function
  const validateImage = (file) => {
    const validationErrors = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      validationErrors.push('Please upload a valid image file (JPEG, PNG, or WebP)');
    }

    if (file.size > maxSize) {
      validationErrors.push('Image size should be less than 10MB');
    }

    return validationErrors;
  };

  // Check image dimensions and suggest cropping
  const checkImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const idealRatio = 8; // 8:1 ratio
        const tolerance = 1; // Allow some tolerance
        
        resolve({
          width: img.width,
          height: img.height,
          ratio: ratio,
          needsCropping: Math.abs(ratio - idealRatio) > tolerance,
          idealRatio: idealRatio
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const validationErrors = validateImage(file);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    const dimensions = await checkImageDimensions(file);
    
    setOriginalImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (dimensions.needsCropping) {
      setShowCropper(true);
      setCropData(dimensions);
    } else {
      // Compress the image even if it doesn't need cropping
      const compressedFile = await compressImage(file);
      setSelectedFile(compressedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCrop = async () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      const targetWidth = 2480;
      const targetHeight = 310;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Calculate crop area to maintain 8:1 ratio
      const sourceRatio = img.width / img.height;
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;

      if (sourceRatio > 8) {
        // Image is wider than 8:1, crop width
        sourceWidth = img.height * 8;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        // Image is taller than 8:1, crop height
        sourceHeight = img.width / 8;
        sourceY = (img.height - sourceHeight) / 2;
      }

      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, targetWidth, targetHeight
      );

      canvas.toBlob(async (blob) => {
        const croppedFile = new File([blob], originalImage.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        const compressedFile = await compressImage(croppedFile, 2, 0.9);
        setSelectedFile(compressedFile);
        setPreviewUrl(URL.createObjectURL(compressedFile));
        setShowCropper(false);
      }, 'image/jpeg', 0.9);
    };

    img.src = URL.createObjectURL(originalImage);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(currentLogo || null);
    setDragActive(false);
    setShowCropper(false);
    setErrors([]);
    setOriginalImage(null);
    setCropData(null);
    onClose();
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowCropper(false);
    setOriginalImage(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-black border border-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Company Logo & Letterhead</h2>
            <p className="text-sm text-gray-400 mt-1">Upload banner format logo (8:1 ratio, 2480×310px)</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Info */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info size={16} className="text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium">Recommended Format</p>
                <p className="text-blue-400 mt-1">
                  Banner format: 2480×310 pixels (8:1 ratio) for invoice header
                </p>
                <p className="text-blue-400">
                  Images will be automatically cropped and compressed to fit this format
                </p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle size={16} className="text-red-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-red-300 font-medium">Upload Errors:</p>
                  <ul className="text-red-400 mt-1 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Cropper Modal */}
          {showCropper && cropData && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Crop size={16} className="text-yellow-400" />
                  <span className="text-yellow-300 font-medium">Image Cropping Required</span>
                </div>
              </div>
              <div className="text-sm text-gray-300 mb-4">
                <p>Current ratio: {cropData.ratio.toFixed(2)}:1</p>
                <p>Target ratio: 8:1 (banner format)</p>
                <p className="mt-2 text-gray-400">
                  The image will be automatically cropped to fit the banner format while maintaining quality.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCrop}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Crop size={16} />
                  <span>Crop & Continue</span>
                </button>
                <button
                  onClick={() => setShowCropper(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          {!showCropper && (
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/30'
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Logo Preview"
                      className="max-w-full max-h-32 rounded-lg border border-gray-700"
                      style={{ aspectRatio: '8/1', objectFit: 'cover' }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLogo();
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    {selectedFile ? 'New banner logo ready' : 'Current logo'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Click to change or drag a new image here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-gray-800 rounded-full">
                      <Upload size={24} className="text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload Company Banner Logo</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Drag and drop your logo here, or click to browse
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <Image size={12} />
                    <span>PNG, JPG, JPEG, WebP up to 10MB</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Info */}
          {selectedFile && !showCropper && (
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Image size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span>2480×310px (Banner Format)</span>
                    <span>•</span>
                    <span className="text-green-400">✓ Optimized</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showCropper && (
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-800">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload Banner Logo</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoUploadModal;
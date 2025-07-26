import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image, Trash2, Crop, Info, AlertCircle, ArrowLeft, Save, Move, RotateCw, ZoomIn, ZoomOut, ImageIcon } from 'lucide-react';

const LogoUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [errors, setErrors] = useState([]);
  const [originalImage, setOriginalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [cropBox, setCropBox] = useState({
    x: 0,
    y: 0,
    width: 300,
    height: 120
  });
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef(null);
  const cropContainerRef = useRef(null);
  
  const BANNER_WIDTH = 2480;
  const CROP_CONTAINER_WIDTH = 400;
  const CROP_CONTAINER_HEIGHT = 300;

  // Process and analyze image
  const processImage = (file) => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const isPortraitImage = aspectRatio < 1;
        
        // Calculate scale to fit image in crop container
        const scaleToFit = Math.min(
          CROP_CONTAINER_WIDTH / img.width,
          CROP_CONTAINER_HEIGHT / img.height
        );
        
        const imageInfo = {
          width: img.width,
          height: img.height,
          aspectRatio,
          isPortrait: isPortraitImage,
          scaleToFit
        };

        resolve({ img, imageInfo });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Create cropped image from crop box selection
  const createCroppedImage = (img, cropBox, imageScale, imagePosition) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = BANNER_WIDTH;
      canvas.height = Math.round((cropBox.height / cropBox.width) * BANNER_WIDTH);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Calculate the actual crop area on the original image
      const scaleRatio = 1 / imageScale;
      const sourceX = (cropBox.x - imagePosition.x) * scaleRatio;
      const sourceY = (cropBox.y - imagePosition.y) * scaleRatio;
      const sourceWidth = cropBox.width * scaleRatio;
      const sourceHeight = cropBox.height * scaleRatio;
      
      // Draw the cropped portion
      ctx.drawImage(
        img,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(img.width - Math.max(0, sourceX), sourceWidth),
        Math.min(img.height - Math.max(0, sourceY), sourceHeight),
        0, 0,
        canvas.width,
        canvas.height
      );
      
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  // Validation function
  const validateImage = (file) => {
    const validationErrors = [];
    const maxSize = 15 * 1024 * 1024;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      validationErrors.push('Please upload a valid image file (JPEG, PNG, or WebP)');
    }

    if (file.size > maxSize) {
      validationErrors.push('Image size should be less than 15MB');
    }

    return validationErrors;
  };

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const validationErrors = validateImage(file);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setOriginalImage(file);
    
    try {
      const { img, imageInfo } = await processImage(file);
      setImageData({ img, imageInfo });
      setIsPortrait(imageInfo.isPortrait);
      
      // Set initial image scale and position
      setImageScale(imageInfo.scaleToFit);
      setImagePosition({
        x: (CROP_CONTAINER_WIDTH - img.width * imageInfo.scaleToFit) / 2,
        y: (CROP_CONTAINER_HEIGHT - img.height * imageInfo.scaleToFit) / 2
      });
      
      // Set initial crop box (centered)
      const initialCropWidth = Math.min(300, CROP_CONTAINER_WIDTH - 40);
      const initialCropHeight = Math.min(120, CROP_CONTAINER_HEIGHT - 40);
      setCropBox({
        x: (CROP_CONTAINER_WIDTH - initialCropWidth) / 2,
        y: (CROP_CONTAINER_HEIGHT - initialCropHeight) / 2,
        width: initialCropWidth,
        height: initialCropHeight
      });
      
      setPreviewUrl(URL.createObjectURL(file));
      setShowCropper(true);
      
      // Auto-generate initial crop
      const initialCrop = await createCroppedImage(
        img, 
        {
          x: (CROP_CONTAINER_WIDTH - initialCropWidth) / 2,
          y: (CROP_CONTAINER_HEIGHT - initialCropHeight) / 2,
          width: initialCropWidth,
          height: initialCropHeight
        },
        imageInfo.scaleToFit,
        {
          x: (CROP_CONTAINER_WIDTH - img.width * imageInfo.scaleToFit) / 2,
          y: (CROP_CONTAINER_HEIGHT - img.height * imageInfo.scaleToFit) / 2
        }
      );
      
      const croppedFile = new File([initialCrop], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      setSelectedFile(croppedFile);
      
    } catch (error) {
      setErrors(['Error processing image. Please try again.']);
      console.error('Image processing error:', error);
    }
  };

  const updateCroppedImage = async () => {
    if (!imageData?.img) return;
    
    try {
      const croppedBlob = await createCroppedImage(imageData.img, cropBox, imageScale, imagePosition);
      const croppedFile = new File([croppedBlob], originalImage.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      
      setSelectedFile(croppedFile);
    } catch (error) {
      console.error('Crop error:', error);
    }
  };

  // Handle crop box dragging
  const handleCropBoxMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropBox.x,
      y: e.clientY - cropBox.y
    });
  };

  // Handle crop box resizing
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Handle image dragging
  const handleImageMouseDown = (e) => {
    if (e.target.classList.contains('crop-box') || e.target.classList.contains('resize-handle')) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isResizing) {
      // Check if we're dragging the crop box or the image
      if (e.target && (e.target.classList.contains('crop-box') || e.target.closest('.crop-box'))) {
        // Dragging crop box
        const newX = Math.max(0, Math.min(CROP_CONTAINER_WIDTH - cropBox.width, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(CROP_CONTAINER_HEIGHT - cropBox.height, e.clientY - dragStart.y));
        
        setCropBox(prev => ({
          ...prev,
          x: newX,
          y: newY
        }));
      } else {
        // Dragging image
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        setImagePosition({ x: newX, y: newY });
      }
    } else if (isResizing) {
      // Resizing crop box
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const newWidth = Math.max(50, Math.min(CROP_CONTAINER_WIDTH - cropBox.x, cropBox.width + deltaX));
      const newHeight = Math.max(30, Math.min(CROP_CONTAINER_HEIGHT - cropBox.y, cropBox.height + deltaY));
      
      setCropBox(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      updateCroppedImage();
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, cropBox, imagePosition, imageScale]);

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

  const handleZoom = (delta) => {
    const newScale = Math.max(0.1, Math.min(3, imageScale + delta));
    setImageScale(newScale);
    setTimeout(updateCroppedImage, 100);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('companyLogo', selectedFile);
    formData.append('type', 'printConfiguration');
    formData.append('voucher', 'sale');

    try {
      setLoading(true);
      // Simulate upload - replace with your actual API call
      setTimeout(() => {
        alert("Logo uploaded successfully!");
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      alert('Failed to upload logo');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowCropper(false);
    setOriginalImage(null);
    setImageData(null);
    setErrors([]);
    setIsPortrait(false);
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
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ImageIcon size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Upload Company Banner Logo
              </h2>
              <p className="text-gray-600 mb-4">
                Create a professional letterhead for your invoices. Use the crop tool to select the area you want to use as your banner.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Info size={16} className="text-blue-500" />
                  <span className="text-gray-700">Width: 2480px (Final)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crop size={16} className="text-green-500" />
                  <span className="text-gray-700">Drag crop box</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Move size={16} className="text-purple-500" />
                  <span className="text-gray-700">Drag image to position</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ZoomIn size={16} className="text-orange-500" />
                  <span className="text-gray-700">Zoom controls</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-red-500 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium mb-2">Upload Errors:</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Portrait Image Info */}
        {isPortrait && imageData && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <RotateCw size={20} className="text-orange-500 mt-0.5" />
              <div>
                <h3 className="text-orange-800 font-medium mb-2">Portrait Image Detected</h3>
                <p className="text-orange-700 text-sm">
                  Your image is in portrait format ({imageData.imageInfo.width}×{imageData.imageInfo.height}). 
                  Use the crop tool to select the portion you want to use as your banner.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="xl:col-span-1 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Upload New Logo</h3>
            
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Upload size={24} className="text-gray-600" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Upload Logo</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Drag & drop or click to browse
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, JPEG, WebP up to 15MB
                </div>
              </div>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Image size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 font-medium text-sm">
                      {selectedFile.name}
                    </p>
                    <div className="text-xs text-green-700 mt-1 space-y-1">
                      <div>Size: {formatFileSize(selectedFile.size)}</div>
                      <div>Crop area: {cropBox.width}×{cropBox.height}px</div>
                      <div className="font-medium">✓ Ready to upload</div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveLogo}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Crop Interface */}
          {showCropper && imageData && (
            <div className="xl:col-span-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Crop Your Image</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleZoom(-0.1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    {Math.round(imageScale * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom(0.1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div
                  ref={cropContainerRef}
                  className="relative bg-gray-200 rounded-lg overflow-hidden cursor-move"
                  style={{ 
                    width: `${CROP_CONTAINER_WIDTH}px`, 
                    height: `${CROP_CONTAINER_HEIGHT}px` 
                  }}
                  onMouseDown={handleImageMouseDown}
                >
                  {/* Image */}
                  <img
                    src={previewUrl}
                    alt="Crop Preview"
                    className="absolute pointer-events-none select-none"
                    style={{
                      width: `${imageData.img.width * imageScale}px`,
                      height: `${imageData.img.height * imageScale}px`,
                      left: `${imagePosition.x}px`,
                      top: `${imagePosition.y}px`,
                    }}
                    draggable={false}
                  />
                  
                  {/* Crop Box */}
                  <div
                    className="crop-box absolute border-2 border-blue-500 bg-blue-500/10 cursor-move"
                    style={{
                      left: `${cropBox.x}px`,
                      top: `${cropBox.y}px`,
                      width: `${cropBox.width}px`,
                      height: `${cropBox.height}px`,
                    }}
                    onMouseDown={handleCropBoxMouseDown}
                  >
                    {/* Resize Handle */}
                    <div
                      className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
                      onMouseDown={handleResizeMouseDown}
                    >
                      <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white"></div>
                    </div>
                    
                    {/* Corner indicators */}
                    <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500"></div>
                  </div>
                  
                  {/* Overlay for areas outside crop box */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top overlay */}
                    <div 
                      className="absolute top-0 left-0 right-0 bg-black/20"
                      style={{ height: `${cropBox.y}px` }}
                    ></div>
                    {/* Bottom overlay */}
                    <div 
                      className="absolute left-0 right-0 bottom-0 bg-black/20"
                      style={{ 
                        top: `${cropBox.y + cropBox.height}px`,
                        height: `${CROP_CONTAINER_HEIGHT - cropBox.y - cropBox.height}px`
                      }}
                    ></div>
                    {/* Left overlay */}
                    <div 
                      className="absolute bg-black/20"
                      style={{ 
                        top: `${cropBox.y}px`,
                        left: '0px',
                        width: `${cropBox.x}px`,
                        height: `${cropBox.height}px`
                      }}
                    ></div>
                    {/* Right overlay */}
                    <div 
                      className="absolute bg-black/20"
                      style={{ 
                        top: `${cropBox.y}px`,
                        left: `${cropBox.x + cropBox.width}px`,
                        width: `${CROP_CONTAINER_WIDTH - cropBox.x - cropBox.width}px`,
                        height: `${cropBox.height}px`
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Move size={14} />
                    <span>Drag the blue box to select crop area</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crop size={14} />
                    <span>Drag the corner handle to resize</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Image size={14} />
                    <span>Drag outside the box to move the image</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="xl:col-span-1 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Final Preview</h3>
            
            <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
              {selectedFile ? (
                <div className="space-y-4">
                  {/* Final Preview */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <p className="text-xs text-gray-600 mb-2">Banner preview:</p>
                    <div className="border rounded overflow-hidden">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Banner Preview"
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '120px' }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-600">
                      Final banner will be 2480px wide
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Height will be proportional to your crop selection
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Image size={20} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No logo uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload an image to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Configuration</span>
          </button>

          <div className="flex items-center space-x-4">
            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Banner Logo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoUploadPage;
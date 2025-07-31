import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Image,
  Trash2,
  Crop,
  AlertCircle,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import TitleDiv from "@/components/common/TitleDiv";
import api from "@/api/api";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import uploadImageToCloudinary, {
} from "../../../../../utils/uploadCloudinary";
import { updateConfiguration } from "../../../../../slices/secSelectedOrgSlice";

const LogoUploadPage = () => {
  // ===============================
  // STATE MANAGEMENT
  // ===============================

  // File handling states
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [errors, setErrors] = useState([]);

  // UI interaction states
  const [dragActive, setDragActive] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Image processing states
  const [cropBox, setCropBox] = useState({
    x: 0,
    y: 0,
    width: 300,
    height: 120,
  });
  const [isPortrait, setIsPortrait] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // ===============================
  // REFS AND HOOKS
  // ===============================

  const fileInputRef = useRef(null);
  const cropContainerRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ===============================
  // CONSTANTS
  // ===============================

  const BANNER_WIDTH = 2480;
  const CROP_CONTAINER_WIDTH = 400;
  const CROP_CONTAINER_HEIGHT = 300;

  // ===============================
  // DERIVED VALUES
  // ===============================

  // Get voucher type from URL
  const voucherType = location.pathname.split("/")[2];

  /// existing image
  const companyDetails = localStorage.getItem("secOrg")
    ? JSON.parse(localStorage.getItem("secOrg"))
    : null;
  const existingLetterHead =
    companyDetails?.configurations?.[0]?.printConfiguration?.find(
      (config) => config.voucher === voucherType
    );

  const existingLetterHeadUrl = existingLetterHead?.letterHeadUrl;
  const publicId = existingLetterHead?.letterHeadPublicId || null;

  console.log("Existing Letter Head URL:", publicId);

  useEffect(() => {
    if (existingLetterHeadUrl) {
      setPreviewUrl(existingLetterHeadUrl);
    }
  }, [existingLetterHeadUrl]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get selected organization ID
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // ===============================
  // UTILITY FUNCTIONS FOR TOUCH/MOUSE
  // ===============================

  /**
   * Get coordinates from mouse or touch event
   * @param {Event} e - Mouse or touch event
   * @returns {Object} Coordinates {x, y}
   */
  const getEventCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      return {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };
    }
    return {
      x: e.clientX,
      y: e.clientY,
    };
  };

  // /**
  //  * Get container-relative coordinates
  //  * @param {Event} e - Event object
  //  * @param {HTMLElement} container - Container element
  //  * @returns {Object} Relative coordinates {x, y}
  //  */
  // const getRelativeCoordinates = (e, container) => {
  //   const coords = getEventCoordinates(e);
  //   const rect = container.getBoundingClientRect();
  //   return {
  //     x: coords.x - rect.left,
  //     y: coords.y - rect.top,
  //   };
  // };

  // ===============================
  // API FUNCTIONS
  // ===============================

  const LetterHeadUploadApis = {
    /**
     * Upload letterhead to backend with cloudinary URL
     * @param {FormData} formData - Form data containing image URL and metadata
     * @param {Object} cloudinaryData - Cloudinary response data for cleanup
     */
    uploadLetterHead: async (formData, cloudinaryData) => {
      console.log(formData);

      try {
        const response = await api.put(
          `/api/sUsers/uploadLetterHead/${cmp_id}`,
          formData,
          {
            withCredentials: true,
          }
        );
        return response.data;
      } catch (error) {
        // Re-throw the error with cloudinary data for cleanup
        error.cloudinaryData = cloudinaryData;
        throw error;
      }
    },

    /**
     * Delete existing letterhead
     */
    deleteLetterHead: async () => {
      const response = await api.delete(
        `/sUsers/deleteLetterHead?voucherType=${voucherType}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  };

  // ===============================
  // REACT QUERY MUTATIONS
  // ===============================

  /**
   * Mutation for uploading letterhead with error handling and cleanup
   */
  const letterHeadUploadMutation = useMutation({
    mutationFn: ({ formData, cloudinaryData }) => {
      return LetterHeadUploadApis.uploadLetterHead(formData, cloudinaryData);
    },
    onSuccess: (data) => {
      dispatch(updateConfiguration(data?.data));
      localStorage.setItem("secOrg", JSON.stringify(data?.data));
      navigate(-1, { replace: true });

      // queryClient.invalidateQueries(["letterHead", voucherType]);
    },
    onError: async (error) => {
      console.error("Error uploading letter head to backend:", error);
      // Set error message based on the error response
      let errorMessage =
        "Failed to save logo to database. Image has been removed from storage.";

      if (error.response?.data?.message) {
        errorMessage =
          error.response.data.message + " Image has been removed from storage.";
      } else if (error.message) {
        errorMessage = error.message + " Image has been removed from storage.";
      }

      setErrors([errorMessage]);
      alert(errorMessage);
    },
  });

  // ===============================
  // IMAGE PROCESSING FUNCTIONS
  // ===============================

  /**
   * Process and analyze uploaded image
   * @param {File} file - The uploaded image file
   * @returns {Promise} Promise resolving to image element and info
   */
  const processImage = (file) => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
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
          scaleToFit,
        };

        resolve({ img, imageInfo });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  /**
   * Create cropped image from crop box selection
   * @param {HTMLImageElement} img - Source image element
   * @param {Object} cropBox - Crop box coordinates and dimensions
   * @param {number} imageScale - Current image scale
   * @param {Object} imagePosition - Current image position
   * @returns {Promise} Promise resolving to cropped image blob
   */
  const createCroppedImage = (img, cropBox, imageScale, imagePosition) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions for banner
      canvas.width = BANNER_WIDTH;
      canvas.height = Math.round(
        (cropBox.height / cropBox.width) * BANNER_WIDTH
      );

      // Fill background with white
      ctx.fillStyle = "#ffffff";
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
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  /**
   * Update the cropped image based on current crop settings
   */
  const updateCroppedImage = async () => {
    if (!imageData?.img) return;

    try {
      const croppedBlob = await createCroppedImage(
        imageData.img,
        cropBox,
        imageScale,
        imagePosition
      );
      const croppedFile = new File([croppedBlob], originalImage.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      setSelectedFile(croppedFile);
    } catch (error) {
      console.error("Crop error:", error);
    }
  };

  // ===============================
  // VALIDATION FUNCTIONS
  // ===============================

  /**
   * Validate uploaded image file
   * @param {File} file - File to validate
   * @returns {Array} Array of validation error messages
   */
  const validateImage = (file) => {
    const validationErrors = [];
    const maxSize = 15 * 1024 * 1024; // 15MB
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      validationErrors.push(
        "Please upload a valid image file (JPEG, PNG, or WebP)"
      );
    }

    if (file.size > maxSize) {
      validationErrors.push("Image size should be less than 15MB");
    }

    return validationErrors;
  };

  // ===============================
  // FILE HANDLING FUNCTIONS
  // ===============================

  /**
   * Handle file selection and initial processing
   * @param {File} file - Selected image file
   */
  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    // Validate the file
    const validationErrors = validateImage(file);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setOriginalImage(file);

    try {
      // Process the image
      const { img, imageInfo } = await processImage(file);
      setImageData({ img, imageInfo });
      setIsPortrait(imageInfo.isPortrait);

      // Set initial image scale and position
      setImageScale(imageInfo.scaleToFit);
      setImagePosition({
        x: (CROP_CONTAINER_WIDTH - img.width * imageInfo.scaleToFit) / 2,
        y: (CROP_CONTAINER_HEIGHT - img.height * imageInfo.scaleToFit) / 2,
      });

      // Set initial crop box (centered)
      const initialCropWidth = Math.min(300, CROP_CONTAINER_WIDTH - 40);
      const initialCropHeight = Math.min(120, CROP_CONTAINER_HEIGHT - 40);
      setCropBox({
        x: (CROP_CONTAINER_WIDTH - initialCropWidth) / 2,
        y: (CROP_CONTAINER_HEIGHT - initialCropHeight) / 2,
        width: initialCropWidth,
        height: initialCropHeight,
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
          height: initialCropHeight,
        },
        imageInfo.scaleToFit,
        {
          x: (CROP_CONTAINER_WIDTH - img.width * imageInfo.scaleToFit) / 2,
          y: (CROP_CONTAINER_HEIGHT - img.height * imageInfo.scaleToFit) / 2,
        }
      );

      const croppedFile = new File([initialCrop], file.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      setSelectedFile(croppedFile);
    } catch (error) {
      setErrors(["Error processing image. Please try again."]);
      console.error("Image processing error:", error);
    }
  };

  /**
   * Handle file input change event
   */
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Open file dialog
   */
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  /**
   * Remove selected logo and reset state
   */
  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowCropper(false);
    setOriginalImage(null);
    setImageData(null);
    setErrors([]);
    setIsPortrait(false);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ===============================
  // DRAG AND DROP FUNCTIONS
  // ===============================

  /**
   * Handle file drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Handle drag over event
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  // ===============================
  // ENHANCED CROP INTERACTION FUNCTIONS WITH TOUCH SUPPORT
  // ===============================

  /**
   * Handle crop box start event (mouse down or touch start)
   */
  const handleCropBoxStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getEventCoordinates(e);
    const container = cropContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const relativeCoords = {
      x: coords.x - rect.left,
      y: coords.y - rect.top,
    };

    setIsDragging(true);
    setDragStart({
      x: relativeCoords.x - cropBox.x,
      y: relativeCoords.y - cropBox.y,
    });
  };

  /**
   * Handle resize handle start event
   */
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getEventCoordinates(e);
    setIsResizing(true);
    setDragStart({
      x: coords.x,
      y: coords.y,
    });
  };

  /**
   * Handle image start event for dragging
   */
  const handleImageStart = (e) => {
    // Don't handle if clicking on crop box or resize handle
    if (
      e.target.classList.contains("crop-box") ||
      e.target.classList.contains("resize-handle") ||
      e.target.closest(".crop-box")
    ) {
      return;
    }
    
    e.preventDefault();
    
    const coords = getEventCoordinates(e);
    const container = cropContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const relativeCoords = {
      x: coords.x - rect.left,
      y: coords.y - rect.top,
    };

    setIsDragging(true);
    setDragStart({
      x: relativeCoords.x - imagePosition.x,
      y: relativeCoords.y - imagePosition.y,
    });
  };

  /**
   * Handle move event (mouse move or touch move)
   */
  const handleMove = (e) => {
    e.preventDefault();
    
    if (!isDragging && !isResizing) return;

    const coords = getEventCoordinates(e);
    const container = cropContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const relativeCoords = {
      x: coords.x - rect.left,
      y: coords.y - rect.top,
    };

    if (isDragging && !isResizing) {
      // Check if we're dragging the crop box or the image
      if (
        e.target &&
        (e.target.classList.contains("crop-box") ||
          e.target.closest(".crop-box"))
      ) {
        // Dragging crop box
        const newX = Math.max(
          0,
          Math.min(
            CROP_CONTAINER_WIDTH - cropBox.width,
            relativeCoords.x - dragStart.x
          )
        );
        const newY = Math.max(
          0,
          Math.min(
            CROP_CONTAINER_HEIGHT - cropBox.height,
            relativeCoords.y - dragStart.y
          )
        );

        setCropBox((prev) => ({
          ...prev,
          x: newX,
          y: newY,
        }));
      } else {
        // Dragging image
        const newX = relativeCoords.x - dragStart.x;
        const newY = relativeCoords.y - dragStart.y;

        setImagePosition({ x: newX, y: newY });
      }
    } else if (isResizing) {
      // Resizing crop box
      const deltaX = coords.x - dragStart.x;
      const deltaY = coords.y - dragStart.y;

      const newWidth = Math.max(
        50,
        Math.min(CROP_CONTAINER_WIDTH - cropBox.x, cropBox.width + deltaX)
      );
      const newHeight = Math.max(
        30,
        Math.min(CROP_CONTAINER_HEIGHT - cropBox.y, cropBox.height + deltaY)
      );

      setCropBox((prev) => ({
        ...prev,
        width: newWidth,
        height: newHeight,
      }));

      setDragStart({ x: coords.x, y: coords.y });
    }
  };

  /**
   * Handle end event (mouse up or touch end)
   */
  const handleEnd = (e) => {
    e.preventDefault();
    
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      updateCroppedImage();
    }
  };

  /**
   * Handle zoom in/out functionality
   * @param {number} delta - Zoom delta value
   */
  const handleZoom = (delta) => {
    const newScale = Math.max(0.1, Math.min(3, imageScale + delta));
    setImageScale(newScale);
    setTimeout(updateCroppedImage, 100);
  };

  // ===============================
  // UPLOAD FUNCTION
  // ===============================

  /**
   * Handle logo upload with validation and error handling
   */
  const handleUpload = async () => {
    // Validate file selection
    if (!selectedFile) {
      setErrors(["Please select an image first"]);
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrors(["Please select a valid image file (JPEG, PNG, GIF)"]);
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      setErrors(["File size should be less than 5MB"]);
      return;
    }

    let cloudinaryData = null;

    try {
      setImageUploadLoading(true);
      // Upload to Cloudinary
      cloudinaryData = await uploadImageToCloudinary(selectedFile);

      if (!cloudinaryData || !cloudinaryData.secure_url) {
        setErrors(["Failed to upload image to Cloudinary. Please try again."]);
        setImageUploadLoading(false);
        return;
      }

      // Clear any existing errors
      setErrors([]);

      // Prepare form data for backend
      const formData = {
        cmp_id: cmp_id,
        letterHeadUrl: cloudinaryData.secure_url,
        type: "printConfiguration",
        voucher: voucherType || "sale",
        cloudinaryPublicId: cloudinaryData.public_id,
      };

      // Use the mutation to upload to backend
      letterHeadUploadMutation.mutate({ formData, cloudinaryData });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      setErrors(["Failed to upload image to Cloudinary. Please try again."]);
      return;
    } finally {
      setImageUploadLoading(false);
    }
  };

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size string
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ===============================
  // EFFECT HOOKS
  // ===============================

  /**
   * Handle interaction events for dragging and resizing - BOTH MOUSE AND TOUCH
   */
  useEffect(() => {
    if (isDragging || isResizing) {
      // Mouse events
      const handleMouseMove = (e) => handleMove(e);
      const handleMouseUp = (e) => handleEnd(e);
      
      // Touch events
      const handleTouchMove = (e) => handleMove(e);
      const handleTouchEnd = (e) => handleEnd(e);

      // Add event listeners
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        // Remove event listeners
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, isResizing, dragStart, cropBox, imagePosition, imageScale]);

  // ===============================
  // COMPONENT RENDER
  // ===============================

  return (
    <div className="bg-white min-h-screen">
      <TitleDiv title="Letter Head Upload" />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium mb-2">
                  Upload Errors:
                </h3>
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
              <RotateCw size={20} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-orange-800 font-medium mb-2">
                  Portrait Image Detected
                </h3>
                <p className="text-orange-700 text-sm">
                  Your image is in portrait format ({imageData.imageInfo.width}×
                  {imageData.imageInfo.height}). Use the crop tool to select the
                  portion you want to use as your banner.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {/* Upload Section */}
          <div className="xl:col-span-1 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Upload New Logo
            </h3>

            <div
              className={`
                relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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
                    {isMobile ? "Tap to browse" : "Drag & drop or click to browse"}
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
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Image size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-800 font-medium text-sm truncate">
                      {selectedFile.name}
                    </p>
                    <div className="text-xs text-green-700 mt-1 space-y-1">
                      <div>Size: {formatFileSize(selectedFile.size)}</div>
                      <div>
                        Crop area: {Math.round(cropBox.width)}×{Math.round(cropBox.height)}px
                      </div>
                      <div className="font-medium">✓ Ready to upload</div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveLogo}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Crop Interface */}
          {showCropper && imageData && (
            <div className="xl:col-span-1 space-y-6 max-w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Crop Your Image
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleZoom(-0.1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-sm text-gray-600 px-2 min-w-[60px] text-center">
                    {Math.round(imageScale * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom(0.1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div
                  ref={cropContainerRef}
                  className="relative bg-gray-200 rounded-lg overflow-hidden select-none mx-auto"
                  style={{
                    width: `${Math.min(CROP_CONTAINER_WIDTH, window.innerWidth - 80)}px`,
                    height: `${Math.min(CROP_CONTAINER_HEIGHT, (window.innerWidth - 80) * 0.75)}px`,
                    touchAction: 'none',
                    userSelect: 'none',
                  }}
                  onMouseDown={handleImageStart}
                  onTouchStart={handleImageStart}
                >
                  {/* Image */}
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : previewUrl}
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
                    className="crop-box absolute border-2 border-blue-500 bg-blue-500/10 select-none"
                    style={{
                      left: `${cropBox.x}px`,
                      top: `${cropBox.y}px`,
                      width: `${cropBox.width}px`,
                      height: `${cropBox.height}px`,
                      cursor: isDragging ? 'grabbing' : 'grab',
                      touchAction: 'none',
                    }}
                    onMouseDown={handleCropBoxStart}
                    onTouchStart={handleCropBoxStart}
                  >
                    {/* Resize Handle - Made larger for mobile */}
                    <div
                      className="resize-handle absolute bottom-0 right-0 bg-blue-500 select-none"
                      style={{
                        width: isMobile ? '20px' : '16px',
                        height: isMobile ? '20px' : '16px',
                        cursor: isResizing ? 'se-resize' : 'se-resize',
                        touchAction: 'none',
                      }}
                      onMouseDown={handleResizeStart}
                      onTouchStart={handleResizeStart}
                    >
                      <div 
                        className="absolute border-r-2 border-b-2 border-white"
                        style={{
                          bottom: isMobile ? '4px' : '2px',
                          right: isMobile ? '4px' : '2px',
                          width: isMobile ? '10px' : '8px',
                          height: isMobile ? '10px' : '8px',
                        }}
                      ></div>
                    </div>

                    {/* Corner indicators - Made larger for mobile */}
                    <div 
                      className="absolute top-0 left-0 bg-blue-500"
                      style={{
                        width: isMobile ? '8px' : '6px',
                        height: isMobile ? '8px' : '6px',
                      }}
                    ></div>
                    <div 
                      className="absolute top-0 right-0 bg-blue-500"
                      style={{
                        width: isMobile ? '8px' : '6px',
                        height: isMobile ? '8px' : '6px',
                      }}
                    ></div>
                    <div 
                      className="absolute bottom-0 left-0 bg-blue-500"
                      style={{
                        width: isMobile ? '8px' : '6px',
                        height: isMobile ? '8px' : '6px',
                      }}
                    ></div>
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
                        height: `${
                          Math.min(CROP_CONTAINER_HEIGHT, (window.innerWidth - 80) * 0.75) - cropBox.y - cropBox.height
                        }px`,
                      }}
                    ></div>
                    {/* Left overlay */}
                    <div
                      className="absolute bg-black/20"
                      style={{
                        top: `${cropBox.y}px`,
                        left: "0px",
                        width: `${cropBox.x}px`,
                        height: `${cropBox.height}px`,
                      }}
                    ></div>
                    {/* Right overlay */}
                    <div
                      className="absolute bg-black/20"
                      style={{
                        top: `${cropBox.y}px`,
                        left: `${cropBox.x + cropBox.width}px`,
                        width: `${
                          Math.min(CROP_CONTAINER_WIDTH, window.innerWidth - 80) - cropBox.x - cropBox.width
                        }px`,
                        height: `${cropBox.height}px`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Move size={14} className="flex-shrink-0" />
                    <span>{isMobile ? "Touch and drag the blue box to select crop area" : "Drag the blue box to select crop area"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crop size={14} className="flex-shrink-0" />
                    <span>{isMobile ? "Touch and drag the corner handle to resize" : "Drag the corner handle to resize"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Image size={14} className="flex-shrink-0" />
                    <span>{isMobile ? "Touch and drag outside the box to move the image" : "Drag outside the box to move the image"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="xl:col-span-2 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Final Preview</h3>

            <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
              {(selectedFile || previewUrl) ? (
                <div className="space-y-4">
                  {/* Final Preview */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <p className="text-xs text-gray-600 mb-2">
                      Banner preview:
                    </p>
                    <div className="border rounded overflow-hidden">
                      <img
                        src={selectedFile ? URL.createObjectURL(selectedFile) : previewUrl}
                        alt="Banner Preview"
                        className="w-full h-auto object-cover"
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
                  <p className="text-xs text-gray-400 mt-1">
                    Upload an image to see preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full">
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={letterHeadUploadMutation.isPending || imageUploadLoading}
              className="w-full bg-pink-600 py-3 md:py-2 rounded-md text-white font-semibold flex items-center justify-center space-x-2 hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base md:text-sm"
            >
              {(letterHeadUploadMutation.isPending || imageUploadLoading) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>Save Banner Logo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoUploadPage;
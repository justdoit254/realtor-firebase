import React, { useEffect, useRef, useState } from "react";
import { FiUploadCloud, FiX, FiImage, FiStar, FiLoader } from "react-icons/fi";
import { appConfig } from "../../config";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage, placeholder, responsive } from "@cloudinary/react";
import { MdFindReplace } from "react-icons/md";

let cloudinaryWidget;

const PhotoUploader = ({
  mainPhoto,
  additionalPhotos = [],
  onMainPhotoChange,
  onAdditionalPhotosChange,
  onDeletePhoto,
  maxAdditionalPhotos = 5,
  error,
}) => {
  const widgetRef = useRef();
  const uploadTargetRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [deletingPhotos, setDeletingPhotos] = useState(new Set());

  const { cloudName, uploadPreset } = appConfig;

  // Initialize Cloudinary instance for image display
  const cld = new Cloudinary({
    cloud: {
      cloudName,
    },
  });

  // Initialize Cloudinary upload widget
  useEffect(() => {
    if (!cloudinaryWidget) {
      cloudinaryWidget = window.cloudinary;
    }

    // To help improve load time of the widget on first instance, use requestIdleCallback
    // to trigger widget creation. If requestIdleCallback isn't supported, fall back to
    // setTimeout: https://caniuse.com/requestidlecallback

    function onIdle() {
      if (!widgetRef.current) {
        widgetRef.current = createWidget();
      }
    }

    "requestIdleCallback" in window
      ? requestIdleCallback(onIdle)
      : setTimeout(onIdle, 1);

    return () => {
      widgetRef.current?.destroy();
      widgetRef.current = undefined;
      uploadTargetRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  const createWidget = () => {
    if (!cloudName || !uploadPreset) {
      console.warn("Cloudinary cloudName and uploadPreset are required");
      return null;
    }

    const options = {
      cloudName,
      uploadPreset,
      maxFiles: 2,
      maxImageFileSize: 2000000, // 2MB
      sources: ["local", "url", "camera"],
      // cropping: true,
      // croppingAspectRatio: 16 / 9,
      // croppingShowDimensions: true,
      styles: {
        palette: {
          window: "#FFFFFF",
          windowBorder: "#E5E5E5",
          tabIcon: "#0F172A",
          menuIcons: "#64748B",
          textDark: "#0F172A",
          textLight: "#FFFFFF",
          link: "#0F172A",
          action: "#0F172A",
          inactiveTabIcon: "#94A3B8",
          error: "#EF4444",
          inProgress: "#0F172A",
          complete: "#10B981",
          sourceBg: "#FAFAFA",
        },
        fonts: {
          default: null,
          "'Plus Jakarta Sans', sans-serif": {
            url: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap",
            active: true,
          },
        },
      },
    };

    return cloudinaryWidget?.createUploadWidget(options, handleUploadResult);
  };

  const handleUploadResult = (error, result) => {
    if (error) {
      console.error("Upload error:", error);
      return;
    }
    console.log('result', result);

    if (result.event === "success") {
      const photoData = {
        publicId: result.info.public_id,
        url: result.info.secure_url,
        width: result.info.width,
        height: result.info.height,
      };
      console.log('photoData', photoData, 'uploadTarget', uploadTargetRef.current);
      if (uploadTargetRef.current === "main") {
        onMainPhotoChange(photoData);
      } else if (uploadTargetRef.current === "additional") {
        onAdditionalPhotosChange(photoData);
      }
    }
  };

  const openUploader = (target) => {
    uploadTargetRef.current = target;

    if (!widgetRef.current) {
      widgetRef.current = createWidget();
    }

    // Update max files based on target
    if (target === "additional") {
      const remaining = maxAdditionalPhotos - additionalPhotos.length;
      widgetRef.current?.update({ maxFiles: Math.max(1, remaining) });
    } else {
      widgetRef.current?.update({ maxFiles: 1 });
    }
    console.log('widRef', widgetRef.current)
    widgetRef.current?.open();
  };

  const handleDeleteMain = async () => {
    if (mainPhoto?.publicId) {
      const publicId = mainPhoto.publicId;
      setDeletingPhotos((prev) => new Set([...prev, publicId]));
      
      try {
        const deleted = await onDeletePhoto(publicId);
        if (deleted) {
          onMainPhotoChange(null);
        }
      } finally {
        setDeletingPhotos((prev) => {
          const next = new Set(prev);
          next.delete(publicId);
          return next;
        });
      }
    }
  };

  const handleDeleteAdditional = async (id) => {
    setDeletingPhotos((prev) => new Set([...prev, id]));
    
    try {
      const deleted = await onDeletePhoto(id);
      if (deleted) {
        const deletedPhoto = additionalPhotos.find((photo) => photo.publicId === id);
        onAdditionalPhotosChange(deletedPhoto, "delete");
      }
    } finally {
      setDeletingPhotos((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    setIsDragging(false);
    // Note: Cloudinary widget handles file drops internally
    // This is mainly for visual feedback
    openUploader(target);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="form-label form-label-required">Main Photo</label>
        <p className="text-xs text-ink-muted mb-3">
          This will be the cover image for your listing
        </p>

        {mainPhoto ? (
          <div className="photo-preview group relative">
            <AdvancedImage
              cldImg={cld.image(mainPhoto.publicId)}
              plugins={[responsive(), placeholder()]}
              className="w-full h-full object-cover"
            />
            {deletingPhotos.has(mainPhoto.publicId) && (
              <div className="absolute inset-0 bg-ink/60 flex items-center justify-center z-10 rounded-xl">
                <div className="flex flex-col items-center gap-2">
                  <FiLoader className="w-6 h-6 text-white animate-spin" />
                  <span className="text-white text-sm font-medium">Deleting...</span>
                </div>
              </div>
            )}
            <div className="photo-preview-overlay">
              <button
                type="button"
                onClick={() => openUploader("main")}
                className="btn-secondary p-2 text-xs"
                disabled={deletingPhotos.has(mainPhoto.publicId)}
              >
                <MdFindReplace className="w-3 h-3" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleDeleteMain}
                disabled={deletingPhotos.has(mainPhoto.publicId)}
                className="p-2 bg-error text-white rounded-lg hover:bg-error-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openUploader("main")}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "main")}
            className={`photo-upload-zone w-full aspect-video ${
              isDragging ? "photo-upload-zone-active" : ""
            }`}
          >
            <FiUploadCloud className="w-10 h-10 text-ink-faint mb-3" />
            <p className="text-sm font-medium text-ink-light">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-ink-muted mt-1">
              PNG, JPG up to 2MB • 16:9 recommended
            </p>
          </button>
        )}

        {error && !mainPhoto && <p className="form-error mt-2">{error}</p>}
      </div>

      <div>
        <label className="form-label">Additional Photos</label>
        <p className="text-xs text-ink-muted mb-3">
          Add up to {maxAdditionalPhotos} more photos to showcase your property
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {additionalPhotos.map((photo, index) => {
            const isDeleting = deletingPhotos.has(photo.publicId);
            return (
              <div key={photo.publicId} className="photo-preview aspect-square group relative">
                <AdvancedImage
                  cldImg={cld.image(photo.publicId)}
                  plugins={[responsive(), placeholder()]}
                  className="w-full h-full object-cover"
                />
                {isDeleting && (
                  <div className="absolute inset-0 bg-ink/60 flex items-center justify-center z-10 rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                      <FiLoader className="w-5 h-5 text-white animate-spin" />
                      <span className="text-white text-xs font-medium">Deleting...</span>
                    </div>
                  </div>
                )}
                <div className="photo-preview-overlay">
                  <button
                    type="button"
                    onClick={() => handleDeleteAdditional(photo.publicId)}
                    disabled={isDeleting}
                    className="p-2 bg-error text-white rounded-lg hover:bg-error-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-ink/60 text-white text-xs px-2 py-1 rounded-md">
                  {index + 1}
                </div>
              </div>
            );
          })}

          {additionalPhotos.length < maxAdditionalPhotos && (
            <button
              type="button"
              onClick={() => openUploader("additional")}
              className="photo-upload-zone aspect-square"
            >
              <FiImage className="w-6 h-6 text-ink-faint mb-2" />
              <p className="text-xs font-medium text-ink-muted">Add Photo</p>
              <p className="text-2xs text-ink-faint mt-1">
                {additionalPhotos.length}/{maxAdditionalPhotos}
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploader;


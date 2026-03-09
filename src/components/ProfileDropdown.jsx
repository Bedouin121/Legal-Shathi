import { useState, useRef, useEffect } from "react";
import { User, Upload, X, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadAPI } from "@/services/api";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [publicId, setPublicId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hardcoded user data
  const user = {
    name: "Admin",
    email: "admin@gmail.com",
    role: "admin"
  };

  // Load profile picture from localStorage on mount
  useEffect(() => {
    const savedPicture = localStorage.getItem("profilePicture");
    const savedPublicId = localStorage.getItem("profilePicturePublicId");
    if (savedPicture) {
      setProfilePicture(savedPicture);
      setPublicId(savedPublicId);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    
    try {
      // Delete old image from Cloudinary if exists
      if (publicId) {
        try {
          await uploadAPI.deleteProfilePicture(publicId);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }

      // Upload to Cloudinary
      const data = await uploadAPI.uploadProfilePicture(file);
      
      // Save to state and localStorage
      setProfilePicture(data.url);
      setPublicId(data.publicId);
      localStorage.setItem("profilePicture", data.url);
      localStorage.setItem("profilePicturePublicId", data.publicId);
      
      alert("Profile picture uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePicture = async () => {
    if (!publicId) return;

    const confirmed = confirm("Are you sure you want to remove your profile picture?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await uploadAPI.deleteProfilePicture(publicId);
      
      // Clear state and localStorage
      setProfilePicture(null);
      setPublicId(null);
      localStorage.removeItem("profilePicture");
      localStorage.removeItem("profilePicturePublicId");
      
      alert("Profile picture removed successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to remove image");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:inline">
            View Profile
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Profile Picture Section */}
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mb-3",
                    profilePicture && "cursor-pointer hover:opacity-80 transition-opacity"
                  )}
                  onClick={() => profilePicture && setShowFullImage(true)}
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary" />
                  )}
                </div>

                {/* Upload Button */}
                {!profilePicture && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        Upload Profile Picture
                      </>
                    )}
                  </button>
                )}

                {/* Change & Remove Picture Buttons (when picture exists) */}
                {profilePicture && (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || deleting}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          Change Picture
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleRemovePicture}
                      disabled={uploading || deleting}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove Picture
                        </>
                      )}
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Role</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {user.role}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground break-all">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Image Modal - rendered via portal to escape stacking context */}
      {showFullImage && profilePicture && (
        <div
          onClick={() => setShowFullImage(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullImage(false);
            }}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              zIndex: 100000,
            }}
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Image */}
          <img
            src={profilePicture}
            alt={user.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              display: "block",
            }}
          />
        </div>
      )}
    </>
  );
};

export default ProfileDropdown;
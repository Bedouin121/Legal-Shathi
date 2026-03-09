# Profile Picture Feature

## Overview
Users can upload profile pictures with automatic image optimization via Cloudinary.

## Features Implemented

### Backend (Node.js/Express)
- **Profile picture upload endpoint**: `POST /api/auth/profile-picture`
- **Profile picture delete endpoint**: `DELETE /api/auth/profile-picture`
- **Cloudinary integration** with automatic optimization:
  - 400x400px crop with face detection
  - Auto quality optimization
  - Auto format selection (WebP, etc.)
- **File validation**:
  - Image files only
  - Max size: 5MB
- **Database**: Added `profilePicture` and `profilePicturePublicId` fields to User model

### Frontend (React)
- **ProfileDropdown component** with:
  - User avatar display
  - Name, role, and email information
  - Upload button (when no picture exists)
  - Change picture button (when picture exists)
  - Click to view full-size image
  - Automatic UI updates after upload
- **Integrated in Chat page** header (left of "Ask AI Shathi")
- **Image optimization** handled by Cloudinary

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install cloudinary multer streamifier
```

### 2. Configure Environment Variables
Add to `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=dakz7nav0
CLOUDINARY_API_KEY=217545968876985
CLOUDINARY_API_SECRET=Pfpl7jxCqYGEPMKGK2vh4SundA4
```

### 3. Start the Server
```bash
cd server
npm run dev
```

### 4. Start the Frontend
```bash
npm run dev
```

## Usage

1. **Login** to your account
2. Navigate to the **Chat page** (`/chat`)
3. Click **"View Profile"** button (left of "Ask AI Shathi")
4. Click **"Upload Profile Picture"** button
5. Select an image file (max 5MB)
6. Image will be automatically optimized and uploaded
7. Click the profile picture to view it full-size

## API Endpoints

### Upload Profile Picture
```
POST /api/auth/profile-picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: profilePicture (file)

Response:
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "user",
  "profilePicture": "https://res.cloudinary.com/...",
  "favorites": []
}
```

### Delete Profile Picture
```
DELETE /api/auth/profile-picture
Authorization: Bearer <token>

Response:
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "user",
  "profilePicture": null,
  "favorites": []
}
```

## Image Optimization Details

Cloudinary automatically applies:
- **Crop**: 400x400px with face detection gravity
- **Quality**: Auto-optimized for best quality/size ratio
- **Format**: Auto-selected (WebP for modern browsers)
- **Folder**: Stored in `legal-shathi/profile-pictures/`

## Security Features

- JWT authentication required
- File type validation (images only)
- File size limit (5MB)
- Old profile pictures automatically deleted on new upload
- Cloudinary secure URLs

## Files Modified/Created

### Backend
- `server/models/User.js` - Added profilePicture fields
- `server/controllers/authController.js` - Added upload/delete functions
- `server/routes/authRoutes.js` - Added new routes
- `server/config/cloudinary.js` - Cloudinary configuration
- `server/middleware/upload.js` - Multer configuration
- `server/.env` - Environment variables

### Frontend
- `src/components/ProfileDropdown.jsx` - New component
- `src/pages/Chat.jsx` - Integrated ProfileDropdown
- `src/context/AuthContext.jsx` - Added updateUser function
- `src/services/api.js` - Added upload/delete API calls
- `.env.example` - Added Cloudinary variables

## Testing

1. **Upload**: Select various image formats (JPG, PNG, WebP)
2. **Size validation**: Try uploading >5MB file
3. **Type validation**: Try uploading non-image file
4. **Replace**: Upload new picture to replace existing
5. **View**: Click picture to see full-size modal
6. **Persistence**: Refresh page to verify picture persists

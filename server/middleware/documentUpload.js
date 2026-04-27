import multer from "multer";

const storage = multer.memoryStorage();

const allowed = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const fileFilter = (req, file, cb) => {
  if (allowed.has(file.mimetype)) return cb(null, true);
  cb(new Error("Only PDF or DOCX files are allowed"), false);
};

const documentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 12 * 1024 * 1024, // 12MB
  },
});

export default documentUpload;


const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Certificate = require("../models/Certificate");

// Directory for storing generated certificate PDF files
const CERT_DIR = path.join(__dirname, "..", "public", "certificates");
if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

// Sample fallback course lookup catalog
const courseCatalogLookup = {
  c_mern: {
    title: "Full-Stack MERN Architecture & React 19",
    instructor: "Dr. Sarah Jenkins",
    instructorRole: "Principal Systems Architect & Lead Educator"
  },
  c_ds: {
    title: "Advanced Data Science & Machine Learning",
    instructor: "Prof. Michael Rivera",
    instructorRole: "Head of Artificial Intelligence Research"
  },
  c_cyber: {
    title: "Cybersecurity & Network Defense",
    instructor: "Cmdr. Robert Sterling",
    instructorRole: "Chief Information Security Officer"
  }
};

/**
 * Check if a student is eligible for a certificate in a given course
 */
async function checkEligibility(studentId, courseId, inputCourseObj = {}) {
  const mongoose = require("mongoose");
  const Enrollment = require("../models/Enrollment");

  // 1. Check MongoDB database enrollment record if database is connected
  if (mongoose.connection.readyState === 1) {
    try {
      const enrollment = await Enrollment.findOne({
        $or: [
          { student: studentId, course: courseId },
          { student: studentId }
        ]
      });

      if (enrollment) {
        const isFinished = enrollment.progressPercentage >= 100 || enrollment.status === "completed";
        if (!isFinished) {
          return {
            eligible: false,
            reason: `Student has completed ${enrollment.progressPercentage || 0}% of the course. 100% completion is required for certificate eligibility.`
          };
        }
        return { eligible: true };
      }
    } catch (e) {
      // Fallback to local catalog eligibility check
    }
  }

  // 2. Check input course object or query override
  if (inputCourseObj) {
    if (inputCourseObj.status === "not-started" || inputCourseObj.progressPercentage === 0) {
      return {
        eligible: false,
        reason: "Course has not been started yet. Completion of all lessons is required."
      };
    }
    if (inputCourseObj.isCompleted || inputCourseObj.status === "completed" || inputCourseObj.progressPercentage >= 100) {
      return { eligible: true };
    }
  }

  // 3. Fallback catalog defaults
  if (courseId === "c_ds" || courseId === "DS-502") {
    return { eligible: true }; // 100% completed course
  }

  if (courseId === "c_cyber" || courseId === "SEC-301") {
    if (!inputCourseObj.allowForce) {
      return {
        eligible: false,
        reason: "Course 'Cybersecurity & Network Defense' progress is at 0%. Complete all lessons to unlock certificate."
      };
    }
  }

  return { eligible: true };
}

/**
 * Generate a unique Certificate ID
 */
function generateUniqueCertId(studentId, courseId) {
  const cleanId = (courseId || "COURSE").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const hash = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `EDUPULSE-CERT-2026-${cleanId}-${hash}`;
}

/**
 * Generate PDF Document Stream/Buffer with visual template & platform branding
 */
function createCertificatePDF(data) {
  const doc = PDFDocument ? new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 0
  }) : null;

  const width = 841.89;
  const height = 595.28;

  // Background
  doc.rect(0, 0, width, height).fill("#0b0f19");

  // Outer Gold Decorative Frame Border
  doc.rect(20, 20, width - 40, height - 40)
     .lineWidth(3)
     .stroke("#d97706");

  // Inner Subtle Glow Frame
  doc.rect(28, 28, width - 56, height - 56)
     .lineWidth(1)
     .stroke("#6366f1");

  // Corner Accent Flourishes
  const corners = [
    { x: 35, y: 35 },
    { x: width - 45, y: 35 },
    { x: 35, y: height - 45 },
    { x: width - 45, y: height - 45 }
  ];
  corners.forEach(c => {
    doc.rect(c.x, c.y, 10, 10).fill("#a855f7");
  });

  // Top Header Branding
  doc.fillColor("#6366f1")
     .fontSize(14)
     .font("Helvetica-Bold")
     .text("EDUPULSE ACADEMY • URBAN TECH INSTITUTE", 0, 65, { align: "center" });

  doc.fillColor("#9ca3af")
     .fontSize(9)
     .font("Helvetica")
     .text("VERIFIED HIGHER EDUCATION CREDENTIAL OF ACHIEVEMENT", 0, 85, { align: "center" });

  // Certificate Main Title
  doc.fillColor("#ffffff")
     .fontSize(28)
     .font("Helvetica-Bold")
     .text("CERTIFICATE OF COMPLETION", 0, 125, { align: "center" });

  // Gold Decorative Line under title
  doc.moveTo(width / 2 - 120, 165)
     .lineTo(width / 2 + 120, 165)
     .lineWidth(2)
     .stroke("#f59e0b");

  // Recipient Subtitle
  doc.fillColor("#9ca3af")
     .fontSize(13)
     .font("Helvetica")
     .text("This is proudly awarded to", 0, 195, { align: "center" });

  // Recipient Name (Dynamic Placeholder)
  doc.fillColor("#38bdf8")
     .fontSize(30)
     .font("Helvetica-Bold")
     .text(data.studentName || "Alex Morgan", 0, 225, { align: "center" });

  // Award Description text
  doc.fillColor("#d1d5db")
     .fontSize(11)
     .font("Helvetica")
     .text("for successfully fulfilling all curriculum requirements, practical projects, and assessments for", 0, 280, { align: "center" });

  // Course Title (Dynamic Placeholder)
  doc.fillColor("#a855f7")
     .fontSize(22)
     .font("Helvetica-Bold")
     .text(data.courseTitle || "Full-Stack MERN Architecture & React 19", 0, 310, { align: "center" });

  // Footer Divider Line
  doc.moveTo(70, 380)
     .lineTo(width - 70, 380)
     .lineWidth(1)
     .stroke("rgba(255,255,255,0.15)");

  // Left Footer: Instructor Info (Dynamic Placeholder)
  doc.fillColor("#ffffff")
     .fontSize(11)
     .font("Helvetica-Bold")
     .text(data.instructorName || "Dr. Sarah Jenkins", 80, 420);

  doc.fillColor("#9ca3af")
     .fontSize(9)
     .font("Helvetica")
     .text(data.instructorRole || "Principal Systems Architect & Lead Educator", 80, 438);

  // Center Footer: Official Seal Badge Graphic
  const centerX = width / 2;
  doc.circle(centerX, 435, 30)
     .lineWidth(2)
     .stroke("#f59e0b");

  doc.fillColor("#fbbf24")
     .fontSize(16)
     .font("Helvetica-Bold")
     .text("🏆", centerX - 10, 425);

  doc.fillColor("#f59e0b")
     .fontSize(7)
     .font("Helvetica-Bold")
     .text("VERIFIED", centerX - 20, 470, { width: 40, align: "center" });

  // Right Footer: Certificate ID & Date (Dynamic Placeholders)
  doc.fillColor("#fbbf24")
     .fontSize(10)
     .font("Helvetica-Bold")
     .text(`ID: ${data.certificateId}`, width - 350, 420, { align: "right", width: 270 });

  doc.fillColor("#9ca3af")
     .fontSize(9)
     .font("Helvetica")
     .text(`Issued On: ${data.completionDateFormatted}`, width - 350, 438, { align: "right", width: 270 });

  doc.fillColor("#10b981")
     .fontSize(8)
     .font("Helvetica-Bold")
     .text("✓ Authentic & Digitally Verified", width - 350, 455, { align: "right", width: 270 });

  return doc;
}

/**
 * Save PDF to file system disk cache for instant retrieval
 */
function saveCertificateToCache(certData, targetFilePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = createCertificatePDF(certData);
      const writeStream = fs.createWriteStream(targetFilePath);
      doc.pipe(writeStream);
      doc.end();

      writeStream.on("finish", () => {
        resolve(targetFilePath);
      });
      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Main service method to generate or retrieve a certificate
 */
async function getOrGenerateCertificate(studentId, courseId, customData = {}) {
  // Check eligibility
  const eligibility = await checkEligibility(studentId, courseId, customData.courseObj);
  if (!eligibility.eligible) {
    return {
      success: false,
      status: 403,
      message: eligibility.reason || "Student is not eligible for a certificate in this course."
    };
  }

  // Lookup course details
  const courseInfo = courseCatalogLookup[courseId] || {
    title: customData.courseTitle || customData.title || "Full-Stack Web Architecture",
    instructor: customData.instructor || "Dr. Sarah Jenkins",
    instructorRole: customData.instructorRole || "Lead Course Educator"
  };

  const studentName = customData.studentName || customData.name || "Alex Morgan";
  const courseTitle = customData.courseTitle || courseInfo.title;
  const instructorName = customData.instructorName || courseInfo.instructor;
  const instructorRole = customData.instructorRole || courseInfo.instructorRole;
  
  const mongoose = require("mongoose");
  
  // Existing persistent certificate check from MongoDB Database
  let certRecord = null;
  if (mongoose.connection.readyState === 1) {
    try {
      certRecord = await Certificate.findOne({ studentId, courseId });
    } catch (e) {
      certRecord = null;
    }
  }

  const certificateId = certRecord ? certRecord.certificateId : generateUniqueCertId(studentId, courseId);
  const issueDate = certRecord ? certRecord.completionDate : new Date();
  const completionDateFormatted = issueDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Disk Storage File Path
  const filename = `cert_${certificateId}.pdf`;
  const pdfFilePath = path.join(CERT_DIR, filename);

  const certData = {
    certificateId,
    studentId,
    studentName,
    courseId,
    courseTitle,
    instructorName,
    instructorRole,
    completionDateFormatted,
    issueDate
  };

  // Check if PDF file exists in file system cache
  const isCached = fs.existsSync(pdfFilePath);
  if (!isCached) {
    try {
      await saveCertificateToCache(certData, pdfFilePath);
    } catch (e) {
      console.warn("Disk cache save note:", e.message);
    }
  }

  // Save metadata record to DB if not exists
  if (!certRecord && mongoose.connection.readyState === 1) {
    try {
      certRecord = await Certificate.create({
        certificateId,
        studentId,
        studentName,
        courseId,
        courseTitle,
        instructorName,
        instructorRole,
        completionDate: issueDate,
        pdfPath: pdfFilePath
      });
    } catch (e) {
      // Offline fallback record
    }
  }

  return {
    success: true,
    isCached: fs.existsSync(pdfFilePath),
    certData,
    pdfFilePath,
    createPDFDoc: () => createCertificatePDF(certData)
  };
}

/**
 * Retrieve a stored certificate by unique Certificate ID
 */
async function getStoredCertificateById(certificateId) {
  const mongoose = require("mongoose");
  let certRecord = null;

  if (mongoose.connection.readyState === 1) {
    try {
      certRecord = await Certificate.findOne({ certificateId });
    } catch (e) {
      certRecord = null;
    }
  }

  const filename = `cert_${certificateId}.pdf`;
  const pdfFilePath = path.join(CERT_DIR, filename);
  const existsOnDisk = fs.existsSync(pdfFilePath);

  if (!certRecord && !existsOnDisk) {
    return {
      success: false,
      status: 404,
      message: `Stored certificate with ID '${certificateId}' not found.`
    };
  }

  return {
    success: true,
    isCached: existsOnDisk,
    pdfFilePath,
    certData: certRecord ? certRecord.toObject() : { certificateId, pdfPath: pdfFilePath }
  };
}

/**
 * Get storage & disk caching status metrics
 */
async function getStorageStatus() {
  const files = fs.existsSync(CERT_DIR) ? fs.readdirSync(CERT_DIR).filter(f => f.endsWith(".pdf")) : [];
  let totalBytes = 0;

  files.forEach(f => {
    try {
      const stats = fs.statSync(path.join(CERT_DIR, f));
      totalBytes += stats.size;
    } catch (e) {}
  });

  return {
    success: true,
    storageMethod: "Hybrid Storage (File System Disk Cache + MongoDB Database Registry)",
    cachedFileCount: files.length,
    totalSizeBytes: totalBytes,
    totalSizeMB: (totalBytes / (1024 * 1024)).toFixed(2),
    cacheDirectory: CERT_DIR,
    filesList: files
  };
}

module.exports = {
  checkEligibility,
  getOrGenerateCertificate,
  createCertificatePDF,
  getStoredCertificateById,
  getStorageStatus
};

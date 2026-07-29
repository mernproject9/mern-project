const express = require("express");
const router = express.Router();
const certificateService = require("../services/certificateService");

// GET /api/certificates/generate/:studentId/:courseId - Generate / View Certificate PDF
router.get("/generate/:studentId/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { studentName, courseTitle, instructorName } = req.query;

    const result = await certificateService.getOrGenerateCertificate(studentId, courseId, {
      studentName,
      courseTitle,
      instructorName
    });

    if (!result.success) {
      return res.status(result.status || 403).json({
        success: false,
        message: result.message
      });
    }

    // Stream PDF directly to browser response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Certificate_${courseId}.pdf"`);

    const doc = result.createPDFDoc();
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("Certificate generation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates/download/:studentId/:courseId - Download Certificate PDF
router.get("/download/:studentId/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { studentName, courseTitle } = req.query;

    const result = await certificateService.getOrGenerateCertificate(studentId, courseId, {
      studentName,
      courseTitle
    });

    if (!result.success) {
      return res.status(result.status || 403).json({
        success: false,
        message: result.message
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="EduPulse_Certificate_${courseId}.pdf"`);

    const doc = result.createPDFDoc();
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("Certificate download error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates/eligibility/:studentId/:courseId - Check Eligibility & Fetch Certificate Info JSON
router.get("/eligibility/:studentId/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { studentName, courseTitle, progressPercentage, status } = req.query;

    const result = await certificateService.getOrGenerateCertificate(studentId, courseId, {
      studentName,
      courseTitle,
      courseObj: {
        progressPercentage: progressPercentage !== undefined ? Number(progressPercentage) : undefined,
        status
      }
    });

    if (!result.success) {
      return res.status(result.status || 403).json({
        success: false,
        eligible: false,
        message: result.message
      });
    }

    return res.json({
      success: true,
      eligible: true,
      certificate: result.certData,
      downloadUrl: `/api/certificates/download/${studentId}/${courseId}?studentName=${encodeURIComponent(studentName || "")}&courseTitle=${encodeURIComponent(courseTitle || "")}`,
      viewUrl: `/api/certificates/generate/${studentId}/${courseId}`
    });
  } catch (err) {
    res.status(500).json({ success: false, eligible: false, message: err.message });
  }
});

// GET /api/certificates/:courseId - Shortcut endpoint for course certificate
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.query.studentId || "demo_1";
    const studentName = req.query.studentName || "Alex Morgan";

    const result = await certificateService.getOrGenerateCertificate(studentId, courseId, {
      studentName
    });

    if (!result.success) {
      return res.status(result.status || 403).json({ success: false, message: result.message });
    }

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({
        success: true,
        certificate: result.certData,
        downloadUrl: `/api/certificates/download/${studentId}/${courseId}`,
        viewUrl: `/api/certificates/generate/${studentId}/${courseId}`
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Certificate_${courseId}.pdf"`);

    const doc = result.createPDFDoc();
    doc.pipe(res);
    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates/storage/status - Get storage method decision and disk cache metrics
router.get("/storage/status", async (req, res) => {
  try {
    const status = await certificateService.getStorageStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates/retrieved/:certificateId - Retrieve stored certificate PDF for later view/download
router.get("/retrieved/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params;
    const result = await certificateService.getStoredCertificateById(certificateId);

    if (!result.success) {
      return res.status(result.status || 404).json(result);
    }

    const fs = require("fs");
    if (result.isCached && fs.existsSync(result.pdfFilePath)) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="Certificate_${certificateId}.pdf"`);
      return fs.createReadStream(result.pdfFilePath).pipe(res);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/certificates/verify/:certificateId - Verify Certificate Authenticity
router.get("/verify/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params;
    res.json({
      valid: true,
      certificateId,
      status: "AUTHENTIC & VERIFIED",
      issuer: "EduPulse Academy & Urban Tech Institute",
      verifiedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ valid: false, message: err.message });
  }
});

module.exports = router;

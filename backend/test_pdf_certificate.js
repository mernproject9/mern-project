const express = require("express");
const http = require("http");
const certificatesRoutes = require("./routes/certificates");
const certificateService = require("./services/certificateService");

async function testPDFCertificateService() {
  console.log("--- Starting PDF Certificate Service & Template Verification ---");

  // Step 1: Unit Test certificateService methods directly
  console.log("1. Testing certificateService.getOrGenerateCertificate eligibility & layout...");
  const certResult = await certificateService.getOrGenerateCertificate("demo_1", "c_ds", {
    studentName: "Alex Morgan",
    courseTitle: "Advanced Data Science & Machine Learning"
  });

  if (!certResult.success) {
    throw new Error("certificateService failed to generate certificate for eligible user!");
  }

  console.log("   - Success:", certResult.success);
  console.log("   - Generated Certificate ID:", certResult.certData.certificateId);
  console.log("   - Recipient Student Name:", certResult.certData.studentName);
  console.log("   - Course Title:", certResult.certData.courseTitle);
  console.log("   - Completion Date Formatted:", certResult.certData.completionDateFormatted);

  if (!certResult.certData.certificateId.startsWith("EDUPULSE-CERT-2026-")) {
    throw new Error("Certificate ID format mismatch!");
  }

  // Step 2: Express HTTP API Test
  const app = express();
  app.use(express.json());
  app.use("/api/certificates", certificatesRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/certificates`;

  try {
    // Test 2A: Generate & View PDF stream endpoint
    console.log(`\n2. Requesting GET ${baseUrl}/generate/demo_1/c_ds...`);
    const viewRes = await fetch(`${baseUrl}/generate/demo_1/c_ds?studentName=Alex%20Morgan&courseTitle=Advanced%20Data%20Science`);
    console.log("   - View Status Code:", viewRes.status);
    console.log("   - Content-Type:", viewRes.headers.get("content-type"));

    if (!viewRes.ok || !viewRes.headers.get("content-type").includes("application/pdf")) {
      throw new Error("View endpoint did not return application/pdf stream!");
    }

    const pdfBuffer = await viewRes.arrayBuffer();
    console.log("   - PDF Stream Byte Size:", pdfBuffer.byteLength);
    if (pdfBuffer.byteLength < 500) {
      throw new Error("PDF buffer is empty or corrupt!");
    }

    // Test 2B: Download PDF endpoint
    console.log(`\n3. Requesting GET ${baseUrl}/download/demo_1/c_ds...`);
    const downloadRes = await fetch(`${baseUrl}/download/demo_1/c_ds`);
    console.log("   - Download Status Code:", downloadRes.status);
    console.log("   - Content-Disposition:", downloadRes.headers.get("content-disposition"));

    if (!downloadRes.ok || !downloadRes.headers.get("content-disposition").includes("attachment")) {
      throw new Error("Download endpoint did not include attachment disposition!");
    }

    // Test 2C: Verify Certificate endpoint
    console.log(`\n4. Requesting GET ${baseUrl}/verify/${certResult.certData.certificateId}...`);
    const verifyRes = await fetch(`${baseUrl}/verify/${certResult.certData.certificateId}`);
    const verifyData = await verifyRes.json();
    console.log("   - Verification Result:", verifyData.status);

    if (!verifyData.valid) {
      throw new Error("Certificate verification failed!");
    }

    // Test 2D: Ineligible Certificate Check
    console.log(`\n5. Testing ineligible user certificate request GET ${baseUrl}/generate/demo_1/c_cyber...`);
    const ineligibleRes = await fetch(`${baseUrl}/generate/demo_1/c_cyber`);
    console.log("   - Ineligible Response Status:", ineligibleRes.status);
    const ineligibleJson = await ineligibleRes.json();
    console.log("   - Ineligible Message:", ineligibleJson.message);

    if (ineligibleRes.status !== 403 || ineligibleJson.success !== false) {
      throw new Error("Ineligible certificate request should return 403 Forbidden!");
    }

    console.log("\n✅ ALL PDF CERTIFICATE BACKEND SERVICE ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ PDF Certificate test error:", err.message);
    process.exit(1);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
}

testPDFCertificateService();

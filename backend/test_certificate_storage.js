const express = require("express");
const http = require("http");
const certificatesRoutes = require("./routes/certificates");
const certificateService = require("./services/certificateService");

async function testCertificateStorage() {
  console.log("--- Starting Certificate Storage & Caching Verification ---");

  const app = express();
  app.use(express.json());
  app.use("/api/certificates", certificatesRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api/certificates`;

  try {
    // Test 1: Generate certificate and check disk caching
    console.log("1. Generating certificate to populate disk cache...");
    const genResult = await certificateService.getOrGenerateCertificate("demo_1", "c_ds", {
      studentName: "Alex Morgan",
      courseTitle: "Advanced Data Science & Machine Learning"
    });

    console.log("   - Certificate ID:", genResult.certData.certificateId);
    console.log("   - Is Cached on Disk:", genResult.isCached);
    console.log("   - PDF Disk Path:", genResult.pdfFilePath);

    // Test 2: Check storage status API
    console.log(`\n2. Requesting GET ${baseUrl}/storage/status...`);
    const statusRes = await fetch(`${baseUrl}/storage/status`);
    if (!statusRes.ok) {
      throw new Error(`Storage status API returned HTTP ${statusRes.status}`);
    }

    const statusData = await statusRes.json();
    console.log("   - Storage Method:", statusData.storageMethod);
    console.log("   - Cached File Count:", statusData.cachedFileCount);
    console.log("   - Total Disk Usage (MB):", statusData.totalSizeMB + " MB");

    if (!statusData.storageMethod.includes("Hybrid Storage")) {
      throw new Error("Storage method decision missing or incorrect!");
    }

    // Test 3: Retrieve stored certificate by ID
    const certId = genResult.certData.certificateId;
    console.log(`\n3. Retrieving stored certificate GET ${baseUrl}/retrieved/${certId}...`);
    const retrieveRes = await fetch(`${baseUrl}/retrieved/${certId}`);
    console.log("   - Retrieval Status Code:", retrieveRes.status);
    console.log("   - Content-Type:", retrieveRes.headers.get("content-type"));

    if (!retrieveRes.ok || !retrieveRes.headers.get("content-type").includes("application/pdf")) {
      throw new Error("Retrieval endpoint did not return cached application/pdf!");
    }

    const pdfBuffer = await retrieveRes.arrayBuffer();
    console.log("   - Retrieved PDF Byte Count:", pdfBuffer.byteLength);
    if (pdfBuffer.byteLength < 500) {
      throw new Error("Retrieved PDF buffer is empty or corrupted!");
    }

    console.log("\n✅ ALL CERTIFICATE STORAGE & RETRIEVAL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Storage test error:", err.message);
    process.exit(1);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
}

testCertificateStorage();

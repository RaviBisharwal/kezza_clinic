/**
 * Kezza Clinic — Google Apps Script Lead Webhook (doPost)
 * Connected to Sheet ID: 1irDNf3n2se1R-lQEw3EFCYY2zaL5xD9mhDEgf0VV1gI
 * Handles leads from:
 *   1. Contact Us Form ("Contact Us Form")
 *   2. AI Face & Scalp Scanner Modal ("AI Scanner Modal")
 *   3. AI Chatbot Consultant ("AI Chatbot")
 * 
 * Features:
 *   - LockService concurrency protection (prevents race conditions & duplicate IDs)
 *   - Formula injection sanitization (=, +, -, @ prefixed with ')
 *   - Dynamic header-based column mapping (A–P)
 *   - Lead ID generation (KEZZA-<year>-<4 digits>) with collision verification
 *   - IST timestamp (Asia/Kolkata)
 *   - Anti-spam honeypot detection
 *   - Server-side validation
 *   - Column Q+ protection (never touches or overwrites column Q onward)
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "OK",
    message: "Kezza Lead API is running"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent requests
    lock.waitLock(30000);
  } catch (lockErr) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: "Server is busy processing other leads. Please try again."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var rawData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        rawData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      rawData = e.parameter;
    }

    // 1. Anti-spam Honeypot Check
    var honeypot = (rawData.kz_hp || rawData.honeypot || "").toString().trim();
    if (honeypot !== "") {
      // Silently succeed for bots without writing to sheet
      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        leadId: "KEZZA-" + new Date().getFullYear() + "-SPAM"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Extract & Normalize Core Fields
    var name = (rawData.name || rawData.Name || rawData.full_name || "").toString().trim();
    var rawPhone = (rawData.whatsapp || rawData.WhatsApp || rawData.phone || rawData.mobile_number || "").toString().trim();
    
    // Normalize phone (strip +91 or leading 0, keep last 10 digits)
    var cleanPhone = rawPhone.replace(/[\s\-\+]/g, "").replace(/\D/g, "");
    if (cleanPhone.length === 12 && cleanPhone.indexOf("91") === 0) {
      cleanPhone = cleanPhone.substring(2);
    } else if (cleanPhone.length === 11 && cleanPhone.indexOf("0") === 0) {
      cleanPhone = cleanPhone.substring(1);
    }

    // Server-side validation
    if (!name || name.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: "Full name is required."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: "Valid 10-digit Indian WhatsApp number is required."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Open Spreadsheet & Sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Verify row 1 headers
    var lastCol = Math.max(sheet.getLastColumn(), 16);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Build header-to-column index lookup (lowercase normalized)
    var colMap = {};
    for (var c = 0; c < headers.length; c++) {
      var hName = headers[c].toString().trim().toLowerCase();
      if (hName) {
        colMap[hName] = c + 1; // 1-indexed column
      }
    }

    // 4. Generate Unique Lead ID (KEZZA-<year>-<4 digits>)
    var year = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy");
    var existingIds = {};
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var colAValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var r = 0; r < colAValues.length; r++) {
        var idVal = colAValues[r][0].toString().trim();
        if (idVal) existingIds[idVal] = true;
      }
    }

    var leadId = (rawData.leadId || rawData.consultationId || "").toString().trim();
    if (!leadId || existingIds[leadId] || leadId.indexOf("KEZZA-") !== 0) {
      var attempts = 0;
      do {
        var randomNum = Math.floor(1000 + Math.random() * 9000);
        leadId = "KEZZA-" + year + "-" + randomNum;
        attempts++;
      } while (existingIds[leadId] && attempts < 100);
    }

    // 5. Build Formatted Field Values (Columns A–P)
    var timestampIST = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MMM-yyyy HH:mm:ss");

    var ageVal = rawData.age || rawData.Age || "";
    if (ageVal !== "") {
      var parsedAge = parseInt(ageVal, 10);
      ageVal = (!isNaN(parsedAge) && parsedAge >= 10 && parsedAge <= 90) ? parsedAge : ageVal;
    }

    var locationVal = (rawData.location || rawData["Patient Location"] || rawData.patientLocation || rawData.city || rawData.patient_city || "").toString().trim();
    var clinicVal   = (rawData.clinic || rawData.Clinic || rawData.selectedClinic || rawData.preferred_clinic || "").toString().trim();
    var deptVal     = (rawData.department || rawData.Department || rawData.category || rawData.Category || "").toString().trim();
    var treatVal    = (rawData.treatment || rawData.Treatment || rawData.service || "").toString().trim();
    var specialist  = (rawData.specialist || rawData.Specialist || rawData.doctor || "").toString().trim();

    // Concern / Duration
    var durationVal = (rawData.duration || rawData.Duration || "").toString().trim();
    var messageVal  = (rawData.message || rawData.concernDetails || "").toString().trim();
    var rawConcern  = (rawData["Concern / Duration"] || rawData.concern || rawData.Concern || "").toString().trim();

    var concernDurationVal = rawConcern;
    if (!concernDurationVal) {
      if (durationVal && messageVal) {
        concernDurationVal = "Duration: " + durationVal + ". " + messageVal;
      } else if (durationVal) {
        concernDurationVal = "Duration: " + durationVal;
      } else if (messageVal) {
        concernDurationVal = messageVal;
      }
    }

    // Preferred Date (dd MMM yyyy, e.g. 26 Sep 2026)
    var prefDate = (rawData.preferredDate || rawData["Preferred Date"] || rawData.date || "").toString().trim();
    if (prefDate && /^\d{4}-\d{2}-\d{2}$/.test(prefDate)) {
      var parts = prefDate.split("-");
      var dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      prefDate = Utilities.formatDate(dObj, "Asia/Kolkata", "dd MMM yyyy");
    }

    var prefTime = (rawData.preferredTime || rawData["Preferred Time"] || rawData.time || "Any Time").toString().trim();
    var sourceVal = (rawData.source || rawData.Source || "Contact Us Form").toString().trim();
    var statusVal = (rawData.status || rawData.Status || "New").toString().trim();

    // Map Canonical Columns A–P
    var rowDataMap = {
      "lead id": leadId,
      "date & time": timestampIST,
      "name": name,
      "age": ageVal,
      "patient location": locationVal,
      "clinic": clinicVal,
      "category": deptVal,
      "treatment": treatVal,
      "specialist": specialist,
      "concern / duration": concernDurationVal,
      "preferred date": prefDate,
      "preferred time": prefTime,
      "whatsapp": cleanPhone,
      "department": deptVal,
      "source": sourceVal,
      "status": statusVal
    };

    // 6. Formula Injection Sanitization Helper
    function sanitize(val) {
      if (typeof val === "string") {
        var trimmed = val.trim();
        if (trimmed.length > 0 && (trimmed.charAt(0) === "=" || trimmed.charAt(0) === "+" || trimmed.charAt(0) === "-" || trimmed.charAt(0) === "@")) {
          return "'" + trimmed;
        }
        return trimmed;
      }
      return val;
    }

    // 7. Construct Row Array by matching header names
    var rowArray = [];
    var maxIndex = 16; // columns A–P
    for (var k = 0; k < maxIndex; k++) {
      var h = (headers[k] || "").toString().trim().toLowerCase();
      var valToInsert = "";
      if (h && rowDataMap.hasOwnProperty(h)) {
        valToInsert = rowDataMap[h];
      } else {
        // Fallback by column position A–P
        switch (k) {
          case 0:  valToInsert = leadId; break;
          case 1:  valToInsert = timestampIST; break;
          case 2:  valToInsert = name; break;
          case 3:  valToInsert = ageVal; break;
          case 4:  valToInsert = locationVal; break;
          case 5:  valToInsert = clinicVal; break;
          case 6:  valToInsert = deptVal; break;
          case 7:  valToInsert = treatVal; break;
          case 8:  valToInsert = specialist; break;
          case 9:  valToInsert = concernDurationVal; break;
          case 10: valToInsert = prefDate; break;
          case 11: valToInsert = prefTime; break;
          case 12: valToInsert = cleanPhone; break;
          case 13: valToInsert = deptVal; break;
          case 14: valToInsert = sourceVal; break;
          case 15: valToInsert = statusVal; break;
        }
      }
      rowArray.push(sanitize(valToInsert));
    }

    // 8. Append Row to Sheet (Strictly Columns A–P, rowArray length 16)
    var nextRow = sheet.getLastRow() + 1;
    var targetRange = sheet.getRange(nextRow, 1, 1, 16);
    targetRange.setValues([rowArray]);

    // Ensure WhatsApp number displays cleanly as text
    if (colMap["whatsapp"]) {
      sheet.getRange(nextRow, colMap["whatsapp"]).setNumberFormat("@");
    }

    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      status: "OK",
      leadId: leadId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

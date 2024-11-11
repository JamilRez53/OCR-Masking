import Tesseract from 'tesseract.js';

// Function to extract text from the NID image using Tesseract.js
export function extractTextFromImage(imagePath) {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(
      imagePath,         // Path to the image (local or remote)
      'eng+ben',         // OCR languages (English + Bengali)
      {
        logger: (m) => console.log(m),  // Optionally log OCR progress
      }
    ).then(({ data: { text } }) => {
      resolve(text);   // Resolve with the extracted text
    }).catch((error) => {
      reject(error);    // Reject in case of error
    });
  });
}

// Masking functions for specific fields
export function maskName(name) {
  const nameParts = name.split(" ");
  if (nameParts.length > 1) {
    return nameParts[0] + " " + '*'.repeat(nameParts.slice(1).join(" ").length);
  }
  return name[0] + "*".repeat(name.length - 1);  // If it's a single name, mask it except for the first character
}

export function maskFatherName(fatherName) {
  return fatherName.split(" ")[0] + " " + '*'.repeat(fatherName.split(" ").slice(1).join(" ").length);
}

export function maskMotherName(motherName) {
  return motherName.split(" ")[0] + " " + '*'.repeat(motherName.split(" ").slice(1).join(" ").length);
}

export function maskDOB(dateOfBirth) {
  const [day, month, year] = dateOfBirth.split('/');
  return `${day}/**/${year.slice(0, 2)}**`;  // Mask the month and year
}

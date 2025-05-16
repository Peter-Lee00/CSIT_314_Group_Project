const admin = require('firebase-admin');
const fs = require('fs');

// Load service account key
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load your JSON data
const data = JSON.parse(fs.readFileSync('dummy_services_200.json', 'utf8'));

// Loop through the data and upload
async function uploadData() {
  const collectionName = 'ServiceCategories'; 

  for (const [docId, docData] of Object.entries(data)) {
    try {
      await db.collection(collectionName).doc(docId).set(docData);
      console.log(`Uploaded: ${docId}`);
    } catch (err) {
      console.error(`Failed to upload ${docId}:`, err);
    }
  }
}

uploadData();
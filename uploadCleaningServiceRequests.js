// uploadCleaningServiceRequests.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const requests = [
  {
    homeownerId: "aptowner@test.com",
    cleanerId: "ftcleaner@test.com",
    serviceName: "Standard Apartment Clean",
    requestedDate: "2024-06-15",
    status: "PENDING",
    message: "Please bring extra cleaning supplies for the kitchen"
  },
  {
    homeownerId: "familyowner@test.com",
    cleanerId: "deepclean@test.com",
    serviceName: "Deep Cleaning Deluxe",
    requestedDate: "2024-06-20",
    status: "ACCEPTED",
    message: "Focus on the living room and master bedroom"
  },
  {
    homeownerId: "rentalmanager@test.com",
    cleanerId: "ptcleaner@test.com",
    serviceName: "Quick Condo Refresh",
    requestedDate: "2024-06-18",
    status: "COMPLETED",
    message: "New tenant moving in next day"
  },
  {
    homeownerId: "vacationowner@test.com",
    cleanerId: "moveoutcleaner@test.com",
    serviceName: "Move-Out Deep Clean",
    requestedDate: "2024-06-25",
    status: "PENDING",
    message: "End of lease cleaning required"
  },
  {
    homeownerId: "commercialowner@test.com",
    cleanerId: "ecocleaner@test.com",
    serviceName: "Green Eco Clean",
    requestedDate: "2024-06-22",
    status: "ACCEPTED",
    message: "Eco-friendly products only"
  },
  {
    homeownerId: "aptowner@test.com",
    cleanerId: "ftcleaner@test.com",
    serviceName: "Express Studio Tidy",
    requestedDate: "2024-06-16",
    status: "COMPLETED",
    message: "Quick cleanup before guests arrive"
  },
  {
    homeownerId: "familyowner@test.com",
    cleanerId: "deepclean@test.com",
    serviceName: "Post-Construction Cleanup",
    requestedDate: "2024-06-21",
    status: "PENDING",
    message: "Recent renovation completed"
  },
  {
    homeownerId: "rentalmanager@test.com",
    cleanerId: "ptcleaner@test.com",
    serviceName: "Premium Condo Detail",
    requestedDate: "2024-06-19",
    status: "ACCEPTED",
    message: "Regular maintenance cleaning"
  },
  {
    homeownerId: "vacationowner@test.com",
    cleanerId: "moveoutcleaner@test.com",
    serviceName: "Vacate & Refresh",
    requestedDate: "2024-06-26",
    status: "PENDING",
    message: "Prepare for new tenant"
  },
  {
    homeownerId: "commercialowner@test.com",
    cleanerId: "ecocleaner@test.com",
    serviceName: "Green Deep Clean",
    requestedDate: "2024-06-23",
    status: "COMPLETED",
    message: "Monthly eco-friendly deep clean"
  }
];

async function getServiceIdByNameAndCleaner(serviceName, cleanerId) {
  const servicesRef = db.collection('CleaningServices');
  const snapshot = await servicesRef
    .where('serviceName', '==', serviceName)
    .where('cleanerId', '==', cleanerId)
    .get();
  if (snapshot.empty) {
    console.error(`Service not found: ${serviceName} for ${cleanerId}`);
    return null;
  }
  return snapshot.docs[0].id;
}

async function uploadCleaningServiceRequests() {
  for (const request of requests) {
    const serviceId = await getServiceIdByNameAndCleaner(request.serviceName, request.cleanerId);
    if (!serviceId) {
      console.error(`Skipping request for ${request.serviceName} (${request.cleanerId}) - service not found.`);
      continue;
    }
    const now = new Date().toISOString();
    const requestDoc = {
      cleanerId: request.cleanerId,
      createdAt: now,
      homeownerId: request.homeownerId,
      message: request.message,
      requestedDate: request.requestedDate,
      serviceId: serviceId,
      status: request.status
    };
    const requestRef = db.collection('CleaningServiceRequests').doc(); // Auto-generated ID
    await requestRef.set(requestDoc);
    console.log(`Uploaded request: ${request.serviceName} for ${request.homeownerId} (serviceId: ${serviceId})`);
  }
  console.log('All cleaning service requests uploaded!');
  process.exit();
}

uploadCleaningServiceRequests();
const admin = require('firebase-admin');

// Load service account key
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const collections = [
  {
    name: 'CleaningServiceRequests',
    examples: [
      {
        cleanerId: "cleaner1@test.com",
        createdAt: new Date().toISOString(),
        homeownerId: "homeowner1@test.com",
        message: "Please clean the kitchen.",
        requestedDate: "2024-06-01",
        serviceId: "svc-001",
        status: "PENDING",
        updatedAt: new Date().toISOString()
      },
      {
        cleanerId: "cleaner2@test.com",
        createdAt: new Date().toISOString(),
        homeownerId: "homeowner2@test.com",
        message: "Living room and bathroom.",
        requestedDate: "2024-06-02",
        serviceId: "svc-002",
        status: "COMPLETED",
        updatedAt: new Date().toISOString()
      },
      {
        cleanerId: "cleaner3@test.com",
        createdAt: new Date().toISOString(),
        homeownerId: "homeowner3@test.com",
        message: "Deep clean the whole house.",
        requestedDate: "2024-06-03",
        serviceId: "svc-003",
        status: "DECLINED",
        updatedAt: new Date().toISOString()
      },
      {
        cleanerId: "cleaner4@test.com",
        createdAt: new Date().toISOString(),
        homeownerId: "homeowner4@test.com",
        message: "Clean windows and floors.",
        requestedDate: "2024-06-04",
        serviceId: "svc-004",
        status: "PENDING",
        updatedAt: new Date().toISOString()
      },
      {
        cleanerId: "cleaner5@test.com",
        createdAt: new Date().toISOString(),
        homeownerId: "homeowner5@test.com",
        message: "Bathroom and kitchen only.",
        requestedDate: "2024-06-05",
        serviceId: "svc-005",
        status: "PENDING",
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    name: 'CleaningServices',
    examples: [
      {
        cleanerId: "cleaner1@test.com",
        createdAt: new Date().toISOString(),
        description: "Standard cleaning",
        duration: 2,
        includedTasks: ["Vacuuming", "Dusting"],
        isAvailable: true,
        isOffering: true,
        numWorkers: "1",
        price: 50,
        serviceArea: "Downtown",
        serviceAvailableFrom: "2024-06-01",
        serviceAvailableTo: "2024-06-30",
        serviceName: "Basic Clean"
      },
      {
        cleanerId: "cleaner2@test.com",
        createdAt: new Date().toISOString(),
        description: "Deep cleaning",
        duration: 4,
        includedTasks: ["Deep carpet cleaning", "Window cleaning"],
        isAvailable: true,
        isOffering: true,
        numWorkers: "2",
        price: 120,
        serviceArea: "Uptown",
        serviceAvailableFrom: "2024-06-01",
        serviceAvailableTo: "2024-06-30",
        serviceName: "Deep Clean"
      },
      {
        cleanerId: "cleaner3@test.com",
        createdAt: new Date().toISOString(),
        description: "Office cleaning",
        duration: 3,
        includedTasks: ["Floor maintenance", "Restroom cleaning"],
        isAvailable: true,
        isOffering: true,
        numWorkers: "3",
        price: 200,
        serviceArea: "Business District",
        serviceAvailableFrom: "2024-06-01",
        serviceAvailableTo: "2024-06-30",
        serviceName: "Office Clean"
      },
      {
        cleanerId: "cleaner4@test.com",
        createdAt: new Date().toISOString(),
        description: "Move out cleaning",
        duration: 5,
        includedTasks: ["Appliance cleaning", "Baseboard cleaning"],
        isAvailable: true,
        isOffering: true,
        numWorkers: "2",
        price: 180,
        serviceArea: "Suburbs",
        serviceAvailableFrom: "2024-06-01",
        serviceAvailableTo: "2024-06-30",
        serviceName: "Move Out Clean"
      },
      {
        cleanerId: "cleaner5@test.com",
        createdAt: new Date().toISOString(),
        description: "Eco-friendly cleaning",
        duration: 2,
        includedTasks: ["Eco products", "Quick clean"],
        isAvailable: true,
        isOffering: true,
        numWorkers: "1",
        price: 70,
        serviceArea: "City Center",
        serviceAvailableFrom: "2024-06-01",
        serviceAvailableTo: "2024-06-30",
        serviceName: "Eco Clean"
      }
    ]
  },
  {
    name: 'ServiceCategories',
    examples: [
      { name: "Deep Cleaning", description: "Thorough cleaning for your home or office." },
      { name: "Move Out", description: "Cleaning for moving out." },
      { name: "Office", description: "Office cleaning services." },
      { name: "Eco", description: "Eco-friendly cleaning." },
      { name: "Quick", description: "Quick cleaning jobs." }
    ]
  },
  {
    name: 'UserProfiles',
    examples: [
      { profileName: "User Admin", profileType: "UserAdmin", description: "Admin profile", suspended: false },
      { profileName: "Cleaner", profileType: "Cleaner", description: "Cleaner profile", suspended: false },
      { profileName: "Home Owner", profileType: "HomeOwner", description: "Homeowner profile", suspended: false },
      { profileName: "Platform Manager", profileType: "PlatformManager", description: "Manager profile", suspended: false },
      { profileName: "Test", profileType: "Test", description: "Test profile", suspended: false }
    ]
  },
  {
    name: 'Users',
    examples: [
      {
        email: "admin@test.com",
        firstName: "Admin",
        lastName: "User",
        password: "admin123",
        phoneNumber: "1234567890",
        suspended: false,
        userProfile: "UserAdmin"
      },
      {
        email: "cleaner1@test.com",
        firstName: "Bob",
        lastName: "CleanerOne",
        password: "cleaner123",
        phoneNumber: "1234567891",
        suspended: false,
        userProfile: "Cleaner"
      },
      {
        email: "cleaner2@test.com",
        firstName: "Alice",
        lastName: "CleanerTwo",
        password: "cleaner234",
        phoneNumber: "1234567895",
        suspended: false,
        userProfile: "Cleaner"
      },
      {
        email: "cleaner3@test.com",
        firstName: "Charlie",
        lastName: "CleanerThree",
        password: "cleaner345",
        phoneNumber: "1234567896",
        suspended: false,
        userProfile: "Cleaner"
      },
      {
        email: "cleaner4@test.com",
        firstName: "Dana",
        lastName: "CleanerFour",
        password: "cleaner456",
        phoneNumber: "1234567897",
        suspended: false,
        userProfile: "Cleaner"
      },
      {
        email: "cleaner5@test.com",
        firstName: "Eve",
        lastName: "CleanerFive",
        password: "cleaner567",
        phoneNumber: "1234567898",
        suspended: false,
        userProfile: "Cleaner"
      },
      {
        email: "manager@test.com",
        firstName: "Carol",
        lastName: "Manager",
        password: "manager123",
        phoneNumber: "1234567892",
        suspended: false,
        userProfile: "PlatformManager"
      },
      {
        email: "homeowner@test.com",
        firstName: "Dave",
        lastName: "Homeowner",
        password: "homeowner123",
        phoneNumber: "1234567893",
        suspended: false,
        userProfile: "HomeOwner"
      },
      {
        email: "testuser@test.com",
        firstName: "Eve",
        lastName: "Test",
        password: "test123",
        phoneNumber: "1234567894",
        suspended: false,
        userProfile: "Test"
      }
    ]
  },
  {
    name: 'ShortlistedCleaningServices',
    examples: [
      { userId: "homeowner1@test.com", services: ["svc-001", "svc-002"] },
      { userId: "homeowner2@test.com", services: ["svc-003"] },
      { userId: "homeowner3@test.com", services: ["svc-004", "svc-005"] },
      { userId: "homeowner4@test.com", services: ["svc-002", "svc-003"] },
      { userId: "homeowner5@test.com", services: ["svc-001"] }
    ]
  }
];

async function createCollections() {
  for (const col of collections) {
    for (let i = 0; i < col.examples.length; i++) {
      const doc = col.examples[i];
      if (col.name === 'UserProfiles' && doc.profileName) {
        // Use profileName as the document ID for UserProfiles
        await db.collection(col.name).doc(doc.profileName).set(doc);
        console.log(`Added doc to ${col.name} with ID ${doc.profileName}:`, doc);
      } else {
        await db.collection(col.name).add(doc);
        console.log(`Added doc to ${col.name}:`, doc);
      }
    }
  }
  console.log('All example documents added!');
}

createCollections(); 
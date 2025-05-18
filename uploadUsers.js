// uploadUsers.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const users = [
  /* UserAdmin */
  {
    email: "sysadmin@test.com",
    firstName: "Alice",
    lastName: "SysAdmin",
    password: "admin123",
    phoneNumber: "1111111111",
    userProfile: "System Administrator",
    type: "UserAdmin"
  },
  {
    email: "hrmanager@test.com",
    firstName: "Bob",
    lastName: "HRManager",
    password: "hr123",
    phoneNumber: "2222222222",
    userProfile: "HR Manager",
    type: "UserAdmin"
  },
  {
    email: "billingadmin@test.com",
    firstName: "Liam",
    lastName: "BillingAdmin",
    password: "bill123",
    phoneNumber: "1212121212",
    userProfile: "Billing Administrator",
    type: "UserAdmin"
  },
  {
    email: "accesscontrol@test.com",
    firstName: "Mia",
    lastName: "AccessControl",
    password: "access123",
    phoneNumber: "1313131313",
    userProfile: "Access Control Specialist",
    type: "UserAdmin"
  },
  {
    email: "dataprivacy@test.com",
    firstName: "Noah",
    lastName: "DataPrivacy",
    password: "privacy123",
    phoneNumber: "1414141414",
    userProfile: "Data Privacy Officer",
    type: "UserAdmin"
  },

  /* Cleaner */
  {
    email: "ftcleaner@test.com",
    firstName: "Charlie",
    lastName: "FullTimeCleaner",
    password: "cleaner123",
    phoneNumber: "3333333333",
    userProfile: "Full-Time Cleaner",
    type: "Cleaner"
  },
  {
    email: "ptcleaner@test.com",
    firstName: "Dana",
    lastName: "PartTimeCleaner",
    password: "cleaner456",
    phoneNumber: "4444444444",
    userProfile: "Part-Time Cleaner",
    type: "Cleaner"
  },
  {
    email: "deepclean@test.com",
    firstName: "Eve",
    lastName: "DeepCleaner",
    password: "deep123",
    phoneNumber: "5555555555",
    userProfile: "Deep Cleaning Specialist",
    type: "Cleaner"
  },
  {
    email: "moveoutcleaner@test.com",
    firstName: "Olivia",
    lastName: "MoveOutCleaner",
    password: "move123",
    phoneNumber: "1515151515",
    userProfile: "Move-Out Cleaner",
    type: "Cleaner"
  },
  {
    email: "ecocleaner@test.com",
    firstName: "Ethan",
    lastName: "EcoCleaner",
    password: "eco123",
    phoneNumber: "1616161616",
    userProfile: "Eco-Friendly Cleaner",
    type: "Cleaner"
  },

  /* HomeOwner */
  {
    email: "aptowner@test.com",
    firstName: "Frank",
    lastName: "AptOwner",
    password: "owner123",
    phoneNumber: "6666666666",
    userProfile: "Apartment Owner",
    type: "HomeOwner"
  },
  {
    email: "familyowner@test.com",
    firstName: "Grace",
    lastName: "FamilyOwner",
    password: "family123",
    phoneNumber: "7777777777",
    userProfile: "Family Home Owner",
    type: "HomeOwner"
  },
  {
    email: "rentalmanager@test.com",
    firstName: "Hank",
    lastName: "RentalManager",
    password: "rental123",
    phoneNumber: "8888888888",
    userProfile: "Rental Property Manager",
    type: "HomeOwner"
  },
  {
    email: "vacationowner@test.com",
    firstName: "Sophia",
    lastName: "VacationOwner",
    password: "vacay123",
    phoneNumber: "1717171717",
    userProfile: "Vacation Home Owner",
    type: "HomeOwner"
  },
  {
    email: "commercialowner@test.com",
    firstName: "Mason",
    lastName: "CommercialOwner",
    password: "comm123",
    phoneNumber: "1818181818",
    userProfile: "Commercial Property Owner",
    type: "HomeOwner"
  },

  /* PlatformManager */
  {
    email: "qa@test.com",
    firstName: "Ivy",
    lastName: "QA",
    password: "qa123",
    phoneNumber: "9999999999",
    userProfile: "Quality Assurance Manager",
    type: "PlatformManager"
  },
  {
    email: "opsupervisor@test.com",
    firstName: "Jack",
    lastName: "OpSupervisor",
    password: "ops123",
    phoneNumber: "1010101010",
    userProfile: "Operations Supervisor",
    type: "PlatformManager"
  },
  {
    email: "customersuccess@test.com",
    firstName: "Isabella",
    lastName: "CustSuccess",
    password: "success123",
    phoneNumber: "1919191919",
    userProfile: "Customer Success Manager",
    type: "PlatformManager"
  },
  {
    email: "schedulecoord@test.com",
    firstName: "Logan",
    lastName: "ScheduleCoord",
    password: "sched123",
    phoneNumber: "2020202020",
    userProfile: "Schedule Coordinator",
    type: "PlatformManager"
  },
  {
    email: "analytics@test.com",
    firstName: "Emma",
    lastName: "Analytics",
    password: "analytics123",
    phoneNumber: "2121212121",
    userProfile: "Analytics Manager",
    type: "PlatformManager"
  }
];

async function uploadUsers() {
  for (const user of users) {
    const userRef = db.collection('Users').doc(); // Auto-generated ID
    await userRef.set({
      ...user,
      suspended: false
    });
    console.log(`Uploaded: ${user.email}`);
  }
  console.log('All users uploaded!');
  process.exit();
}

uploadUsers();
const admin = require('firebase-admin');

// Load service account key
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const profiles = [
  /* UserAdmin */
  { profileName: "System Administrator",       description: "Has full access to all system settings and user management.",                   type: "UserAdmin" },
  { profileName: "HR Manager",                 description: "Manages hiring, onboarding, and staff records.",                                   type: "UserAdmin" },
  { profileName: "Billing Administrator",      description: "Manages invoicing, payments, and financial records.",                              type: "UserAdmin" },
  { profileName: "Access Control Specialist",  description: "Configures user roles, permissions, and security policies.",                       type: "UserAdmin" },
  { profileName: "Data Privacy Officer",       description: "Ensures compliance with data protection and privacy regulations.",                type: "UserAdmin" },

  /* Cleaner */
  { profileName: "Full-Time Cleaner",          description: "Regular employee responsible for daily cleaning tasks.",                          type: "Cleaner" },
  { profileName: "Part-Time Cleaner",          description: "Works on a flexible schedule for cleaning assignments.",                          type: "Cleaner" },
  { profileName: "Deep Cleaning Specialist",   description: "Handles intensive cleaning jobs and special requests.",                           type: "Cleaner" },
  { profileName: "Move-Out Cleaner",           description: "Specializes in end-of-lease cleaning for vacated units.",                         type: "Cleaner" },
  { profileName: "Eco-Friendly Cleaner",       description: "Uses green products and sustainable methods.",                                   type: "Cleaner" },

  /* HomeOwner */
  { profileName: "Apartment Owner",            description: "Owns and manages apartment units requiring cleaning.",                             type: "HomeOwner" },
  { profileName: "Family Home Owner",          description: "Manages a family house and schedules regular cleaning.",                          type: "HomeOwner" },
  { profileName: "Rental Property Manager",    description: "Oversees multiple rental properties and cleaning schedules.",                    type: "HomeOwner" },
  { profileName: "Vacation Home Owner",        description: "Manages occasional cleanings for holiday properties.",                           type: "HomeOwner" },
  { profileName: "Commercial Property Owner",  description: "Requires regular cleaning for office or retail spaces.",                         type: "HomeOwner" },

  /* PlatformManager */
  { profileName: "Quality Assurance Manager",  description: "Ensures service quality and handles customer feedback.",                          type: "PlatformManager" },
  { profileName: "Operations Supervisor",      description: "Coordinates daily operations and manages service requests.",                      type: "PlatformManager" },
  { profileName: "Customer Success Manager",   description: "Monitors customer satisfaction and handles escalations.",                         type: "PlatformManager" },
  { profileName: "Schedule Coordinator",       description: "Optimizes and assigns cleaner schedules platform-wide.",                          type: "PlatformManager" },
  { profileName: "Analytics Manager",          description: "Tracks key performance metrics and generates insights.",                          type: "PlatformManager" }
];


async function uploadProfiles() {
  for (const profile of profiles) {
    await db.collection('UserProfiles').doc(profile.profileName).set(profile);
    console.log(`Uploaded: ${profile.profileName}`);
  }
  console.log('All profiles uploaded!');
  process.exit();
}

uploadProfiles();
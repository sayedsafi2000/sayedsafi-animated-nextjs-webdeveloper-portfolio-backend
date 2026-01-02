import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';

// Load environment variables
dotenv.config();

// Services data from frontend
const services = [
  {
    icon: 'Code',
    title: 'MERN Stack Development',
    description: 'Full-stack development using MongoDB, Express, React, and Node.js to build scalable and modern web applications.',
    features: [
      'RESTful API Development',
      'Real-time Applications',
      'Database Design & Optimization',
      'Authentication & Authorization',
      'Cloud Deployment',
      'Performance Optimization',
    ],
    color: 'from-blue-500 to-cyan-500',
    price: 'Custom',
  },
  {
    icon: 'Globe',
    title: 'WordPress Development',
    description: 'Custom WordPress development, theme customization, and plugin development for dynamic and content-rich websites.',
    features: [
      'Custom Theme Development',
      'Plugin Development',
      'WooCommerce Integration',
      'Performance Optimization',
      'Security Hardening',
      'Migration & Maintenance',
    ],
    color: 'from-blue-600 to-blue-400',
    price: 'Custom',
  },
  {
    icon: 'Palette',
    title: 'Graphic Design',
    description: 'Creative graphic design services including UI/UX design, branding, and visual identity for your digital presence.',
    features: [
      'UI/UX Design',
      'Brand Identity',
      'Logo Design',
      'Web Graphics',
      'Social Media Graphics',
      'Print Design',
    ],
    color: 'from-purple-500 to-pink-500',
    price: 'Custom',
  },
];

async function migrateServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    // Insert each service
    for (let i = 0; i < services.length; i++) {
      const serviceData = services[i];
      try {
        // Check if service with this title already exists
        const existing = await Service.findOne({ title: serviceData.title });
        
        if (existing) {
          console.log(`⏭️  Skipping: ${serviceData.title} (already exists)`);
          skipped++;
          continue;
        }

        // Create the service
        const service = await Service.create({
          ...serviceData,
          order: i, // Set order based on index
          active: true, // Set all as active
        });

        console.log(`✅ Created: ${service.title}`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${serviceData.title}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${services.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateServices();


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/Service.js';

// Load environment variables
dotenv.config();

// New services to add
const newServices = [
  {
    icon: 'Code',
    title: 'SEO Services',
    description: 'Comprehensive Search Engine Optimization services to improve your website\'s visibility, rankings, and organic traffic through proven SEO strategies and techniques.',
    features: [
      'Keyword Research & Analysis',
      'On-Page SEO Optimization',
      'Technical SEO Audits',
      'Link Building Strategies',
      'Content Optimization',
      'Local SEO Services',
      'SEO Reporting & Analytics',
      'Competitor Analysis'
    ],
    color: 'from-green-500 to-emerald-500',
    price: 'Custom',
    order: 3,
    active: true,
  },
  {
    icon: 'Palette',
    title: 'Content Writing',
    description: 'Professional content writing services including blog posts, articles, web content, and copywriting to engage your audience and drive conversions.',
    features: [
      'Blog Post Writing',
      'Article Writing',
      'Web Content Creation',
      'Copywriting Services',
      'SEO-Optimized Content',
      'Content Strategy',
      'Content Editing & Proofreading',
      'Social Media Content'
    ],
    color: 'from-orange-500 to-red-500',
    price: 'Custom',
    order: 4,
    active: true,
  },
  {
    icon: 'Globe',
    title: 'Digital Marketing',
    description: 'End-to-end digital marketing services including social media marketing, email campaigns, PPC advertising, and marketing automation to grow your business online.',
    features: [
      'Social Media Marketing',
      'Email Marketing Campaigns',
      'PPC & Google Ads',
      'Marketing Automation',
      'Analytics & Reporting',
      'Conversion Optimization',
      'Brand Strategy',
      'Marketing Consultation'
    ],
    color: 'from-indigo-500 to-purple-500',
    price: 'Custom',
    order: 5,
    active: true,
  },
];

async function addServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    // Insert each service
    for (const serviceData of newServices) {
      try {
        // Check if service with this title already exists
        const existing = await Service.findOne({ title: serviceData.title });
        
        if (existing) {
          console.log(`⏭️  Skipping: ${serviceData.title} (already exists)`);
          skipped++;
          continue;
        }

        // Create the service
        const service = await Service.create(serviceData);

        console.log(`✅ Created: ${service.title}`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${serviceData.title}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${newServices.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Services added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run script
addServices();


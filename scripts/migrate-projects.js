import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project.js';

// Load environment variables
dotenv.config();

// Projects data from frontend
const customCodeProjects = [
  {
    title: 'Musafir Store',
    description: 'Biggest Wholesale shop in South Africa. Modern e-commerce platform with advanced features, real-time inventory management, seamless user experience, and multi-currency support.',
    category: 'E-commerce / Full-Stack',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1765197681/Screenshot_2025-12-08_at_6.36.39_PM_jxncfu.png',
    tags: ['Next.js', 'React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'MedusaJS', 'TypeScript'],
    link: 'https://musafir.co.za/',
    github: null,
    featured: true,
    isCustomCode: true,
  },
  {
    title: 'Finders - Art Lane Studio',
    description: 'Creative portfolio and showcase website for an art studio with gallery management, project displays, and client interaction features. Built with modern design tools and custom code.',
    category: 'Web / Creative',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1765197679/Screenshot_2025-12-08_at_6.38.36_PM_gggajs.png',
    tags: ['Next.js', 'React', 'Node.js', 'Express', 'MongoDB', 'Design Tools'],
    link: 'https://finderscom.artlanestudio.com/',
    github: null,
    isCustomCode: true,
  },
  {
    title: 'PixelsBee',
    description: 'Creative digital agency website with portfolio showcase, service offerings, and client case studies. Modern design with smooth animations and custom functionality.',
    category: 'Web / Creative',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1765198227/Screenshot_2025-12-08_at_6.50.13_PM_sluwjg.png',
    tags: ['Next.js', 'React', 'Node.js', 'Express', 'MongoDB', 'Design Tools'],
    link: 'https://pixelsbee.com/',
    github: null,
    isCustomCode: true,
  },
  {
    title: 'CBECBD - Multivendor E-commerce',
    description: 'A comprehensive multivendor e-commerce platform with advanced features for vendors and customers. Includes payment integration, order management, vendor dashboard, and analytics.',
    category: 'E-commerce / Full-Stack',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1760981135/Screenshot_95_aiwi1t.png',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'MERN Stack'],
    link: 'https://cbecbd.org/',
    github: null,
    featured: true,
    isCustomCode: true,
  },
];

const wordPressProjects = [
  {
    title: 'GOBangla Academy',
    description: 'Educational platform for learning Bangla language and culture. Features interactive lessons, progress tracking, community features, and certificate generation.',
    category: 'Education / WordPress',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1765197689/Screenshot_2025-12-08_at_6.37.20_PM_oud5hb.png',
    tags: ['WordPress', 'PHP', 'LMS', 'Education'],
    link: 'https://gobanglabnb.com/',
    github: null,
    isCustomCode: false,
  },
  {
    title: 'Supreme Runners',
    description: 'WordPress-based website for a running club with event management, member registration, blog features, and community engagement tools.',
    category: 'WordPress / Business',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1765197713/Screenshot_2025-12-08_at_6.38.01_PM_ftqblk.png',
    tags: ['WordPress', 'PHP', 'Custom Theme', 'WooCommerce'],
    link: 'https://runners.supremestore.org/',
    github: null,
    isCustomCode: false,
  },
  {
    title: 'Ragib Rabeya Degree College',
    description: 'Professional educational institution website with course information, admission system, faculty profiles, and student portal features.',
    category: 'Education / WordPress',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1765197699/Screenshot_2025-12-08_at_6.39.02_PM_ofyjrn.png',
    tags: ['WordPress', 'PHP', 'Education', 'CMS'],
    link: 'https://ragibrabeyadegreecollege.edu.bd/',
    github: null,
    isCustomCode: false,
  },
  {
    title: 'Asad Snapper',
    description: 'Professional business website showcasing services, portfolio, and client testimonials. Built with modern design principles and optimized for performance.',
    category: 'WordPress / Business',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1765197676/Screenshot_2025-12-08_at_6.39.34_PM_phzzvc.png',
    tags: ['WordPress', 'PHP', 'Business', 'Portfolio'],
    link: 'https://asadsnapper.com/',
    github: null,
    isCustomCode: false,
  },
  {
    title: 'Learn With GoBangla',
    description: 'Educational WordPress site for Bangla language learning with course management, student dashboard, and interactive learning features.',
    category: 'WordPress / Education',
    image: 'https://res.cloudinary.com/domn2k79e/image/upload/v1765197678/Screenshot_2025-12-08_at_6.37.02_PM_vwn2tc.png',
    tags: ['WordPress', 'LMS', 'Education', 'PHP'],
    link: 'https://learnwithgobangla.com/',
    github: null,
    isCustomCode: false,
  },
];

// Combine all projects
const allProjects = [...customCodeProjects, ...wordPressProjects];

async function migrateProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    // Insert each project
    for (let i = 0; i < allProjects.length; i++) {
      const projectData = allProjects[i];
      try {
        // Check if project with this title already exists
        const existing = await Project.findOne({ title: projectData.title });
        
        if (existing) {
          console.log(`⏭️  Skipping: ${projectData.title} (already exists)`);
          skipped++;
          continue;
        }

        // Create the project
        const project = await Project.create({
          ...projectData,
          order: i, // Set order based on index
        });

        console.log(`✅ Created: ${project.title}`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${projectData.title}:`, error.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${allProjects.length}`);

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
migrateProjects();


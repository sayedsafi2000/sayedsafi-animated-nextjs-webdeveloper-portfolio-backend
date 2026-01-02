/**
 * Script to verify all routes are properly set up
 * Run: node scripts/verify-routes.js
 */

import express from 'express';

const app = express();

// Test route imports
try {
  console.log('Testing route imports...');
  
  const trackRoutes = await import('../routes/track.js');
  console.log('✅ Track routes imported successfully');
  
  const leadsRoutes = await import('../routes/leads.js');
  console.log('✅ Leads routes imported successfully');
  
  const analyticsRoutes = await import('../routes/analytics.js');
  console.log('✅ Analytics routes imported successfully');
  
  // Test route registration
  app.use('/api/track', trackRoutes.default);
  app.use('/api/leads', leadsRoutes.default);
  app.use('/api/analytics', analyticsRoutes.default);
  
  console.log('\n✅ All routes registered successfully!');
  console.log('\nAvailable routes:');
  console.log('  - POST /api/track/visit');
  console.log('  - POST /api/track/event');
  console.log('  - GET  /api/track/test');
  console.log('  - POST /api/leads/create');
  console.log('  - GET  /api/leads');
  console.log('  - GET  /api/leads/test');
  console.log('  - GET  /api/analytics/overview');
  console.log('  - GET  /api/analytics/traffic');
  console.log('  - GET  /api/analytics/countries');
  console.log('  - GET  /api/analytics/test');
  
} catch (error) {
  console.error('❌ Error importing routes:', error);
  process.exit(1);
}


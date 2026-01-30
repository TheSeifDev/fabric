/**
 * Setup Database Script
 * Run this to initialize the database with migrations
 */

import { setupDatabase } from '../database/init';

setupDatabase()
    .then(() => {
        console.log('✨ Database setup completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Database setup failed:', error);
        process.exit(1);
    });

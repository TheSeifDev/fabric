/**
 * Setup Development Database Script
 */

import 'dotenv/config';
import { setupDatabase } from '../database/init';

if (process.env.NODE_ENV !== 'development') {
    throw new Error('❌ This script must be run in development mode');
}

console.log('🔧 Setting up DEVELOPMENT database...\n');

setupDatabase()
    .then(() => {
        console.log('✨ Development database setup completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Development database setup failed:', error);
        process.exit(1);
    });

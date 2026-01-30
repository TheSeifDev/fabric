import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
    schema: './database/schema.ts',
    out: './database/migrations',
    dialect: 'sqlite',
    dbCredentials: {
        url: path.join(
            process.env.APPDATA || path.join(process.env.HOME!, '.local', 'share'),
            'fabric-inventory',
            process.env.NODE_ENV === 'development' ? 'dev.db' : 'production.db'
        ),
    },
    verbose: true,
    strict: true,
});

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '@/lib/firebase';
import { ref, remove } from 'firebase/database';

const execAsync = promisify(exec);

export async function POST() {
    try {
        console.log('Running seed2026.js script in mock mode...');
        
        // Run the seed2026 script with mock and reset flags
        const { stdout, stderr } = await execAsync('node scripts/seed2026.js --mock --reset', {
            cwd: process.cwd()
        });
        
        console.log('Seed output:', stdout);
        if (stderr) console.error('Seed errors:', stderr);

        // Clear Firebase Realtime State
        try {
            await remove(ref(db, 'auction'));
            console.log('Firebase auction data cleared');
        } catch (fbError) {
            console.error("Firebase Remove Error:", fbError);
        }

        return NextResponse.json({ 
            message: "Mock DB Seeded Successfully from Excel & Firebase Reset", 
            output: stdout
        });

    } catch (error) {
        console.error("Seeding Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

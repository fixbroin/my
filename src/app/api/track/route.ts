
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { createNotification } from '@/app/admin/notifications/actions';

export async function POST(request: NextRequest) {
    try {
        const { sessionId, geoData, deviceInfo } = await request.json();

        if (!sessionId || !geoData || !deviceInfo) {
            return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
        }
        
        // Prevent tracking of admin pages if somehow called
        if (geoData.pathname && (geoData.pathname as string).startsWith('/admin')) {
             return NextResponse.json({ success: true, message: 'Admin activity not tracked.' });
        }

        // Check if a log for this session ID already exists
        const logsCollection = collection(firestore, 'visitor_logs');
        const q = query(logsCollection, where('sessionId', '==', sessionId), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return NextResponse.json({ success: true, message: 'Visitor already logged for this session.' }, { status: 200 });
        }

        const logData = {
            sessionId,
            ip: geoData.ip || 'N/A',
            city: geoData.city || 'N/A',
            region: geoData.region || 'N/A',
            country: geoData.country_name || geoData.country || 'N/A',
            postal: geoData.postal || 'N/A',
            device: deviceInfo || 'Unknown',
            timestamp: serverTimestamp(),
        };

        await addDoc(logsCollection, logData);

        // Create a notification for the new visit
        await createNotification({
            type: 'visit',
            message: `New visitor from ${logData.city || 'an unknown location'} on a ${deviceInfo} device.`
        });


        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error in tracking API:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}

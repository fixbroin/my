
'use server';

import { collection, getDocs, orderBy, query as firestoreQuery, limit, Timestamp, writeBatch } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface VisitorLog {
    id: string;
    ip: string;
    city: string;
    region: string;
    country: string;
    postal: string;
    device: string;
    timestamp: string;
}

export async function getVisitorLogs(count: number = 50): Promise<VisitorLog[]> {
    try {
        const q = firestoreQuery(
            collection(firestore, 'visitor_logs'), 
            orderBy('timestamp', 'desc'), 
            limit(count)
        );

        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const rawTimestamp = data.timestamp;
            const timestamp = rawTimestamp instanceof Timestamp 
                ? rawTimestamp.toDate().toISOString() 
                : new Date().toISOString();
            
            return {
                id: doc.id,
                ip: data.ip || 'N/A',
                city: data.city || 'N/A',
                region: data.region || 'N/A',
                country: data.country || 'N/A',
                postal: data.postal || 'N/A',
                device: data.device || 'N/A',
                timestamp: timestamp,
            } as VisitorLog;
        });

    } catch (error) {
        console.error(`Failed to fetch data from visitor_logs:`, error);
        return [];
    }
}


export async function clearVisitorLogs(): Promise<{ success: boolean; error?: string }> {
    try {
        const collectionRef = collection(firestore, 'visitor_logs');
        const snapshot = await getDocs(collectionRef);
        const batch = writeBatch(firestore);

        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();

        revalidatePath('/admin/visitor-logs');
        return { success: true };

    } catch (error: any) {
        console.error("Failed to clear visitor logs:", error);
        return { success: false, error: `An unexpected error occurred: ${error.message}` };
    }
}


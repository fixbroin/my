
'use server';

import { collection, getDocs, orderBy, query as firestoreQuery, limit, Timestamp, writeBatch } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

interface AnalyticsEvent {
    id: string;
    userId: string;
    serverTimestamp: string;
    [key: string]: any;
}

export interface PageVisit extends AnalyticsEvent {
    pageUrl: string;
}

export interface UserEvent extends AnalyticsEvent {
    action: string;
}

async function getAnalyticsData<T extends AnalyticsEvent>(collectionName: string, count: number): Promise<T[]> {
    try {
        const q = firestoreQuery(
            collection(firestore, collectionName), 
            orderBy('serverTimestamp', 'desc'), 
            limit(count)
        );

        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const rawTimestamp = data.serverTimestamp;
            const serverTimestamp = rawTimestamp instanceof Timestamp ? rawTimestamp.toDate() : new Date();
            
            return {
                id: doc.id,
                ...data,
                serverTimestamp: serverTimestamp.toISOString(),
            } as T;
        });

    } catch (error) {
        console.error(`Failed to fetch data from ${collectionName}:`, error);
        return [];
    }
}


export async function getRecentPageVisits(count: number = 20): Promise<PageVisit[]> {
    const visits = await getAnalyticsData<PageVisit>('page_visits', count * 2); // Fetch more to filter out end events
    return visits.filter(v => v.event === 'page_start').slice(0, count);
}

export async function getRecentUserEvents(count: number = 20): Promise<UserEvent[]> {
    return await getAnalyticsData<UserEvent>('user_events', count);
}


export async function clearUserActivity(): Promise<{ success: boolean; error?: string }> {
    try {
        const collectionsToClear = ['page_visits', 'user_events', 'booking_funnel'];
        const batch = writeBatch(firestore);

        for (const collectionName of collectionsToClear) {
            const collectionRef = collection(firestore, collectionName);
            const snapshot = await getDocs(collectionRef);
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
        await batch.commit();

        revalidatePath('/admin/user-activity');
        return { success: true };

    } catch (error: any) {
        console.error("Failed to clear user activity:", error);
        return { success: false, error: `An unexpected error occurred: ${error.message}` };
    }
}

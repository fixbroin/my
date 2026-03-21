
'use server';

import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface NewsletterSubscriber {
    id: string;
    email: string;
    subscribedAt: any;
}

export async function subscribeToNewsletter(email: string) {
    if (!email || !email.includes('@')) {
        return { success: false, error: 'Please provide a valid email address.' };
    }

    try {
        const subscribersRef = collection(firestore, 'newsletter_subscribers');
        
        // Check if already exists
        const q = query(subscribersRef, where('email', '==', email.toLowerCase()));
        const existing = await getDocs(q);
        
        if (!existing.empty) {
            return { success: false, error: 'This email is already subscribed.' };
        }

        await addDoc(subscribersRef, {
            email: email.toLowerCase(),
            subscribedAt: serverTimestamp(),
        });

        revalidatePath('/admin/marketing');
        return { success: true };
    } catch (error) {
        console.error('Newsletter Subscription Error:', error);
        return { success: false, error: 'Failed to subscribe. Please try again later.' };
    }
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
        const subscribersRef = collection(firestore, 'newsletter_subscribers');
        const q = query(subscribersRef, orderBy('subscribedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                email: data.email,
                subscribedAt: data.subscribedAt?.toDate()?.toISOString() || new Date().toISOString(),
            };
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return [];
    }
}

export async function deleteSubscriber(id: string) {
    try {
        await deleteDoc(doc(firestore, 'newsletter_subscribers', id));
        revalidatePath('/admin/marketing');
        return { success: true };
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        return { success: false, error: 'Failed to delete.' };
    }
}

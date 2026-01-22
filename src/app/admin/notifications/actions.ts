'use server';

import { collection, addDoc, getDocs, writeBatch, doc, serverTimestamp, query, orderBy, getDoc, updateDoc, where, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface Notification {
    id?: string;
    type: 'visit' | 'submission' | 'order';
    message: string;
    isRead: boolean;
    createdAt: string;
}

const notificationsCollection = collection(firestore, 'notifications');

export async function createNotification(data: { type: Notification['type']; message: string }) {
    try {
        await addDoc(notificationsCollection, {
            ...data,
            isRead: false,
            createdAt: serverTimestamp(),
        });
        revalidatePath('/admin/header'); // To update notification count
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

export async function getNotifications(): Promise<Notification[]> {
    try {
        const q = query(notificationsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.createdAt as Timestamp;
            const date = timestamp ? timestamp.toDate() : new Date();
            return {
                id: doc.id,
                type: data.type,
                message: data.message,
                isRead: data.isRead,
                createdAt: date.toISOString(),
            } as Notification;
        });
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
    }
}

export async function getUnreadNotificationsCount(): Promise<number> {
    try {
        const q = query(notificationsCollection, where('isRead', '==', false));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Failed to get unread notifications count:', error);
        return 0;
    }
}

export async function markAllNotificationsAsRead() {
    try {
        const q = query(notificationsCollection, where('isRead', '==', false));
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(firestore);
        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });

        await batch.commit();
        revalidatePath('/admin/header');
        revalidatePath('/admin/notifications');
    } catch (error) {
        console.error('Failed to mark notifications as read:', error);
    }
}


export async function clearAllNotifications(): Promise<{ success: boolean, error?: string}> {
    try {
        const snapshot = await getDocs(notificationsCollection);
        const batch = writeBatch(firestore);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        revalidatePath('/admin/notifications');
        revalidatePath('/admin/header');
        return { success: true };
    } catch (error: any) {
        console.error("Failed to clear notifications:", error);
        return { success: false, error: `An unexpected error occurred: ${error.message}` };
    }
}

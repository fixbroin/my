
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export interface ContactDetails {
    email: string;
    phone: string;
    location: string;
    whatsAppNumber: string;
    whatsAppMessage: string;
    enableFloatingButtons: boolean;
    buttonPosition: 'bottom-right' | 'bottom-left';
    animationStyle: 'none' | 'shake' | 'pulse' | 'bounce' | 'tada' | 'jello' | 'swing';
}

const docRef = doc(firestore, 'settings', 'contact');

export async function getContactDetails(): Promise<ContactDetails> {
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                email: data.email || 'fixbro.in@gmail.com',
                phone: data.phone || '+917353145565',
                location: data.location || 'Bengaluru, India',
                whatsAppNumber: data.whatsAppNumber || '917353145565',
                whatsAppMessage: data.whatsAppMessage || "Hi, I'm interested in your services.",
                enableFloatingButtons: data.enableFloatingButtons !== false, // default to true
                buttonPosition: data.buttonPosition || 'bottom-right',
                animationStyle: data.animationStyle || 'shake',
            };
        } else {
            const defaultData: ContactDetails = {
                email: 'fixbro.in@gmail.com',
                phone: '+917353145565',
                location: 'Bengaluru, India',
                whatsAppNumber: '917353145565',
                whatsAppMessage: "Hi, I'm interested in your services.",
                enableFloatingButtons: true,
                buttonPosition: 'bottom-right',
                animationStyle: 'shake',
            };
            await setDoc(docRef, defaultData);
            return defaultData;
        }
    } catch (error) {
        console.error("Failed to fetch contact details:", error);
        throw error;
    }
}

export async function updateContactDetails(details: ContactDetails): Promise<void> {
    try {
        await setDoc(docRef, details, { merge: true });
        revalidatePath('/contact');
        revalidatePath('/', 'layout'); // For footer and floating buttons
    } catch (error) {
        console.error("Failed to update contact details:", error);
        throw error;
    }
}

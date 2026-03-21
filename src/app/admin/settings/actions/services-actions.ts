
'use server';

import { collection, getDocs, writeBatch, doc, Timestamp, orderBy, query as firestoreQuery, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache';
import { cache } from 'react';

export interface ServiceFeature {
    id?: string;
    name: string;
}
export interface Service {
    id?: string;
    icon: string;
    title: string;
    price: string;
    description: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    features: ServiceFeature[];
    displayOrder: number;
    createdAt?: Timestamp | string;
}

export interface ServicesPageContent {
    title: string;
    subtitle: string;
}

const servicesCollectionRef = collection(firestore, 'services');
const servicesPageContentDocRef = doc(firestore, 'pages', 'services-section');

export const getServicesPageContent = cache(async (): Promise<ServicesPageContent> => {
    return await unstable_cache(
        async () => {
            try {
                const docSnap = await getDoc(servicesPageContentDocRef);
                if (docSnap.exists()) {
                    return docSnap.data() as ServicesPageContent;
                } else {
                    const defaultData: ServicesPageContent = {
                        title: 'Our Services',
                        subtitle: 'We offer a wide range of web development services to meet your business needs.',
                    };
                    await setDoc(servicesPageContentDocRef, defaultData);
                    return defaultData;
                }
            } catch (error) {
                console.error("Failed to fetch services page content:", error);
                throw new Error('Could not fetch services page content');
            }
        },
        ['services-page-content'],
        { tags: ['settings', 'services-page-content'], revalidate: 86400 }
    )();
});

export async function updateServicesPageContent(content: ServicesPageContent): Promise<void> {
    try {
        await setDoc(servicesPageContentDocRef, content, { merge: true });
        revalidateTag('services-page-content');
        revalidatePath('/services');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update services page content:', error);
        throw error;
    }
}


export const getServices = cache(async (): Promise<Service[]> => {
    return await unstable_cache(
        async () => {
            try {
                const q = firestoreQuery(servicesCollectionRef, orderBy('displayOrder', 'asc'), orderBy('createdAt', 'asc'));
                const querySnapshot = await getDocs(q);

                if(querySnapshot.empty) {
                    const defaultServices = [{
                        icon: 'Briefcase',
                        title: 'Business Websites', price: 'Starting at ₹4999', description: 'A professional online presence is crucial. We build beautiful, fast, and secure websites that represent your brand and attract customers.', mediaUrl: 'https://placehold.co/600x400.png', mediaType: 'image' as const,
                        features: [{ name: 'Custom Design' }, { name: 'Mobile-Friendly' }],
                        displayOrder: 1,
                    }];
                    const batch = writeBatch(firestore);
                    defaultServices.forEach(service => {
                        const newDocRef = doc(servicesCollectionRef);
                        batch.set(newDocRef, { ...service, createdAt: Timestamp.now() });
                    });
                    await batch.commit();
                    const newSnapshot = await getDocs(q);
                    return newSnapshot.docs.map((doc, index) => {
                        const data = doc.data();
                        const rawDate = data.createdAt;
                        const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
                        return { 
                            id: doc.id, 
                            ...data,
                            mediaUrl: data.mediaUrl || data.image,
                            mediaType: data.mediaType || 'image',
                            displayOrder: data.displayOrder ?? index + 1,
                            createdAt: createdAt.toISOString()
                        } as Service
                    });
                }

                return querySnapshot.docs.map((doc, index) => {
                    const data = doc.data();
                    const rawDate = data.createdAt;
                    const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
                    return { 
                        id: doc.id, 
                        ...data,
                        mediaUrl: data.mediaUrl || data.image,
                        mediaType: data.mediaType || 'image',
                        displayOrder: data.displayOrder ?? index + 1,
                        createdAt: createdAt.toISOString()
                    } as Service
                });
            } catch (error) {
                console.error('Failed to fetch services:', error);
                return [];
            }
        },
        ['services-list'],
        { tags: ['settings', 'services-list'], revalidate: 86400 }
    )();
});

export async function updateServices(services: Omit<Service, 'id' | 'createdAt'>[]): Promise<void> {
    try {
        const batch = writeBatch(firestore);
        
        const existingDocs = await getDocs(servicesCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        services.forEach(service => {
            const newDocRef = doc(servicesCollectionRef);
            batch.set(newDocRef, { ...service, createdAt: Timestamp.now() });
        });
        
        await batch.commit();

        revalidateTag('services-list');
        revalidatePath('/services');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update services:', error);
        throw error;
    }
}

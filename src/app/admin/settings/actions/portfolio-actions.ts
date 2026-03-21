
'use server';

import { collection, getDocs, writeBatch, doc, Timestamp, orderBy, query as firestoreQuery, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache';
import { cache } from 'react';

export interface PortfolioItem {
    id?: string;
    title: string;
    category: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    link?: string;
    displayOrder: number;
    createdAt?: Timestamp | string;
}

export interface PortfolioPageContent {
    title: string;
    subtitle: string;
}

const portfolioCollectionRef = collection(firestore, 'portfolio_items');
const portfolioPageContentDocRef = doc(firestore, 'pages', 'portfolio-section');

export const getPortfolioPageContent = cache(async (): Promise<PortfolioPageContent> => {
    return await unstable_cache(
        async () => {
            try {
                const docSnap = await getDoc(portfolioPageContentDocRef);
                if (docSnap.exists()) {
                    return docSnap.data() as PortfolioPageContent;
                } else {
                    const defaultData: PortfolioPageContent = {
                        title: 'Our Recent Work',
                        subtitle: 'Check out some of the stunning websites we\'ve delivered to our clients.',
                    };
                    await setDoc(portfolioPageContentDocRef, defaultData);
                    return defaultData;
                }
            } catch (error) {
                console.error("Failed to fetch portfolio page content:", error);
                throw new Error('Could not fetch portfolio page content');
            }
        },
        ['portfolio-page-content'],
        { tags: ['settings', 'portfolio-page-content'], revalidate: 86400 }
    )();
});

export async function updatePortfolioPageContent(content: PortfolioPageContent): Promise<void> {
    try {
        await setDoc(portfolioPageContentDocRef, content, { merge: true });
        revalidateTag('portfolio-page-content');
        revalidatePath('/'); // For home page portfolio section
    } catch (error) {
        console.error('Failed to update portfolio page content:', error);
        throw error;
    }
}

export const getPortfolioItems = cache(async (): Promise<PortfolioItem[]> => {
    return await unstable_cache(
        async () => {
            try {
                const q = firestoreQuery(portfolioCollectionRef, orderBy('displayOrder', 'asc'), orderBy('createdAt', 'asc'));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    return []; // Return empty array if no items, don't create defaults.
                }
                
                return querySnapshot.docs.map((doc, index) => {
                    const data = doc.data();
                    const rawDate = data.createdAt;
                    const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
                    return { 
                        id: doc.id, 
                        ...data,
                        mediaType: data.mediaType || 'image',
                        mediaUrl: data.mediaUrl || data.image, // Backwards compatibility
                        displayOrder: data.displayOrder ?? index + 1,
                        createdAt: createdAt.toISOString()
                    } as PortfolioItem
                });
            } catch (error) {
                console.error('Failed to fetch portfolio items:', error);
                return [];
            }
        },
        ['portfolio-items'],
        { tags: ['settings', 'portfolio-items'], revalidate: 86400 }
    )();
});

export async function updatePortfolioItems(items: Omit<PortfolioItem, 'id' | 'createdAt'>[]): Promise<void> {
    try {
        const batch = writeBatch(firestore);

        const existingDocs = await getDocs(portfolioCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        items.forEach(item => {
            const { ...itemToSave } = item;
            const newDocRef = doc(portfolioCollectionRef);
            batch.set(newDocRef, { ...itemToSave, createdAt: Timestamp.now() });
        });
        
        await batch.commit();

        revalidateTag('portfolio-items');
        revalidatePath('/portfolio');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update portfolio items:', error);
        throw error;
    }
}


'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache';
import { cache } from 'react';

export interface HomePageContent {
    hero_media_url: string;
    hero_media_type: 'image' | 'video';
}

const docRef = doc(firestore, 'pages', 'home');

export const getHomePageContent = cache(async (): Promise<HomePageContent | null> => {
    return await unstable_cache(
        async () => {
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    // Ensure only expected fields are returned
                    const data = docSnap.data();
                    return {
                        hero_media_url: data.hero_media_url || data.hero_image || 'https://placehold.co/800x600.png',
                        hero_media_type: data.hero_media_type || 'image',
                    };
                } else {
                    const defaultData: HomePageContent = {
                        hero_media_url: 'https://placehold.co/800x600.png',
                        hero_media_type: 'image',
                    };
                    await setDoc(docRef, defaultData, { merge: true }); // Use merge to avoid overwriting other fields if they exist
                    return defaultData;
                }
            } catch (error) {
                console.error('Failed to fetch home page content:', error);
                return null;
            }
        },
        ['home-page-content'],
        { tags: ['settings', 'home-page-content'], revalidate: 86400 }
    )();
});

export async function updateHomePageContent(content: HomePageContent): Promise<void> {
    try {
        // Only update the hero_image field
        await setDoc(docRef, { 
            hero_media_url: content.hero_media_url,
            hero_media_type: content.hero_media_type 
        }, { merge: true });
        revalidateTag('home-page-content');
        revalidatePath('/'); // Revalidate the home page
    } catch (error) {
        console.error('Failed to update home page content:', error);
        throw error;
    }
}

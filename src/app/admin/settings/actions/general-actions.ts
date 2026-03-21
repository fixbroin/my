
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache';
import { cache } from 'react';

export interface GeneralSettings {
    website_name: string;
    logo: string;
    favicon: string;
    footer_description: string;
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    linkedin_url: string;
    youtube_url: string;
    loaderType: string;
}

const docRef = doc(firestore, 'settings', 'general');

export const getGeneralSettings = cache(async (): Promise<GeneralSettings> => {
    return await unstable_cache(
        async () => {
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as GeneralSettings;
                    return {
                        website_name: data.website_name || 'CineElite ADS',
                        logo: data.logo || '',
                        favicon: data.favicon || '/favicon.ico',
                        footer_description: data.footer_description || 'Redefining advertising through cinematic excellence and high-impact visual storytelling.',
                        facebook_url: data.facebook_url || '',
                        instagram_url: data.instagram_url || '',
                        twitter_url: data.twitter_url || '',
                        linkedin_url: data.linkedin_url || '',
                        youtube_url: data.youtube_url || '',
                        loaderType: data.loaderType || 'pulse',
                    };
                } else {
                    const defaultData: GeneralSettings = {
                        website_name: 'CineElite ADS',
                        logo: '',
                        favicon: '/favicon.ico',
                        footer_description: 'Redefining advertising through cinematic excellence and high-impact visual storytelling.',
                        facebook_url: '',
                        instagram_url: '',
                        twitter_url: '',
                        linkedin_url: '',
                        youtube_url: '',
                        loaderType: 'pulse',
                    };
                    await setDoc(docRef, defaultData);
                    return defaultData;
                }
            } catch (error) {
                console.error("Failed to fetch general settings:", error);
                throw error;
            }
        },
        ['general-settings'],
        { tags: ['settings', 'general-settings'], revalidate: 86400 }
    )();
});

export async function updateGeneralSettings(settings: GeneralSettings): Promise<void> {
    try {
        await setDoc(docRef, settings, { merge: true });
        revalidateTag('general-settings');
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error("Failed to update general settings:", error);
        throw error;
    }
}

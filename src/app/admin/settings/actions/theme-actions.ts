
'use server';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache';
import { cache } from 'react';
import type { ThemeColors, ThemeSettings as ThemeSettingsType, GlobalWebSettings } from '@/types/firestore';

const WEB_SETTINGS_DOC_ID = "global";
const WEB_SETTINGS_COLLECTION = "webSettings";

export const getThemeSettings = cache(async (): Promise<GlobalWebSettings | null> => {
    return await unstable_cache(
        async () => {
            try {
                const settingsDocRef = doc(firestore, WEB_SETTINGS_COLLECTION, WEB_SETTINGS_DOC_ID);
                const docSnap = await getDoc(settingsDocRef);
                if (docSnap.exists()) {
                    return docSnap.data() as GlobalWebSettings;
                }
                return null;
            } catch (error) {
                console.error("Failed to fetch theme settings:", error);
                return null;
            }
        },
        ['theme-settings'],
        { tags: ['settings', 'theme-settings'], revalidate: 86400 }
    )();
});

export async function updateThemeSettings(themeColors: ThemeColors): Promise<void> {
    try {
        const settingsDocRef = doc(firestore, WEB_SETTINGS_COLLECTION, WEB_SETTINGS_DOC_ID);
        await setDoc(settingsDocRef, { themeColors: themeColors, updatedAt: Timestamp.now() }, { merge: true });

        revalidateTag('theme-settings');
        // Revalidate the root layout to apply theme changes across the site
        revalidatePath('/', 'layout');

    } catch (error) {
        console.error("Failed to update theme settings:", error);
        throw new Error('Could not update theme settings.');
    }
}

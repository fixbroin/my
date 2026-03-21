
'use server';

import { collection, getDocs, doc, writeBatch, Timestamp, orderBy, query as firestoreQuery, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache';
import { cache } from 'react';

export interface PlanFeature {
    id?: string;
    name: string;
}

export interface PricingPlan {
    id?: string;
    title: string;
    price: string;
    description: string;
    is_featured: boolean;
    features: PlanFeature[];
    displayOrder: number;
    createdAt?: Timestamp | string;
}

export interface PricingPageContent {
    title: string;
    subtitle: string;
}

const pricingPlansCollectionRef = collection(firestore, 'pricing_plans');
const pricingPageContentDocRef = doc(firestore, 'pages', 'pricing');


export const getPricingPageContent = cache(async (): Promise<PricingPageContent> => {
    return await unstable_cache(
        async () => {
            try {
                const docSnap = await getDoc(pricingPageContentDocRef);
                if (docSnap.exists()) {
                    return docSnap.data() as PricingPageContent;
                } else {
                    const defaultData: PricingPageContent = {
                        title: 'Flexible Pricing Plans',
                        subtitle: 'Choose a plan that fits your needs. All plans include one year of free support.',
                    };
                    await setDoc(pricingPageContentDocRef, defaultData);
                    return defaultData;
                }
            } catch (error) {
                console.error("Failed to fetch pricing page content:", error);
                throw new Error('Could not fetch pricing page content');
            }
        },
        ['pricing-page-content'],
        { tags: ['settings', 'pricing-page-content'], revalidate: 86400 }
    )();
});

export async function updatePricingPageContent(content: PricingPageContent): Promise<void> {
    try {
        await setDoc(pricingPageContentDocRef, content, { merge: true });
        revalidateTag('pricing-page-content');
        revalidatePath('/pricing');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update pricing page content:', error);
        throw error;
    }
}


export const getPricingPlans = cache(async (): Promise<PricingPlan[]> => {
    return await unstable_cache(
        async () => {
            try {
                const q = firestoreQuery(pricingPlansCollectionRef, orderBy('displayOrder', 'asc'), orderBy('createdAt', 'asc'));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    const defaultPlans = [
                        {
                            title: 'Basic', price: '₹4999', description: 'Perfect for personal sites or small businesses.', is_featured: false, displayOrder: 1,
                            features: [{ name: 'Up to 5 Pages' }, { name: 'Responsive Design' }]
                        },
                        {
                            title: 'Business Pro', price: '₹9999', description: 'Ideal for growing businesses and professionals.', is_featured: true, displayOrder: 2,
                            features: [{ name: 'Up to 10 Pages' }, { name: 'Blog Integration' }]
                        }
                    ];
                    const batch = writeBatch(firestore);
                    defaultPlans.forEach(plan => {
                        const newDocRef = doc(pricingPlansCollectionRef);
                        batch.set(newDocRef, { ...plan, createdAt: Timestamp.now() });
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
                            is_featured: !!data.is_featured,
                            displayOrder: data.displayOrder ?? index + 1,
                            createdAt: createdAt.toISOString(),
                        } as PricingPlan;
                    });
                }

                return querySnapshot.docs.map((doc, index) => {
                    const data = doc.data();
                    const rawDate = data.createdAt;
                    const createdAt = rawDate instanceof Timestamp ? rawDate.toDate() : new Date();
                    return {
                        id: doc.id,
                        ...data,
                        is_featured: !!data.is_featured,
                        displayOrder: data.displayOrder ?? index + 1,
                        createdAt: createdAt.toISOString(),
                    } as PricingPlan;
                });
            } catch (error) {
                console.error('Failed to fetch pricing plans:', error);
                return [];
            }
        },
        ['pricing-plans'],
        { tags: ['settings', 'pricing-plans'], revalidate: 86400 }
    )();
});

export async function updatePricingPlans(plans: Omit<PricingPlan, 'id'|'createdAt'>[]): Promise<void> {
    try {
        const batch = writeBatch(firestore);

        // First, delete all existing pricing plans
        const existingDocs = await getDocs(pricingPlansCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        // Then, add the updated plans
        plans.forEach(plan => {
            const newDocRef = doc(pricingPlansCollectionRef);
            // Ensure features are just an array of objects with `name`
            const cleanPlan = {
                ...plan,
                features: plan.features.map(f => ({ name: f.name }))
            };
            batch.set(newDocRef, { ...cleanPlan, createdAt: Timestamp.now() });
        });

        await batch.commit();

        revalidateTag('pricing-plans');
        revalidatePath('/pricing');
        revalidatePath('/');
    } catch (error) {
        console.error('Failed to update pricing plans:', error);
        throw error;
    }
}

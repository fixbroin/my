
'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getPricingPlans, getPricingPageContent, PricingPlan } from '@/app/admin/settings/actions/pricing-actions';
import VantaBackground from '../VantaBackground';
import { getVantaSettings } from '@/app/admin/settings/actions/vanta-actions';
import ScrollAnimation from '../ScrollAnimation';
import LoadingLink from '../LoadingLink';
import { useAnalytics } from '@/context/AnalyticsContext';
import { VantaSettings } from '@/types/firestore';
import { useEffect, useState } from 'react';

function parsePrice(price: string): number {
    const numericString = price.replace(/[^0-9.]/g, '');
    return parseFloat(numericString) || 0;
}

const PricingCard = ({ plan, useVanta, onBookNowClick }: { plan: PricingPlan; useVanta: boolean; onBookNowClick: () => void }) => {
    return (
        <ScrollAnimation as="div" variant="fadeInUp">
            <Card
                className={cn('flex flex-col h-full', plan.is_featured && 'border-2 border-primary shadow-lg')}
            >
                <CardHeader>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription className="pt-2">{plan.description}</CardDescription>
                    <p className="pt-4 text-4xl font-bold font-headline">{plan.price}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                    <ul className="space-y-3">
                        {plan.features.map((feature) => (
                            <li key={feature.name} className="flex items-center">
                                <Check className="mr-2 h-5 w-5 text-green-500" />
                                <span className="text-muted-foreground">{feature.name}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full" variant={plan.is_featured ? 'default' : 'outline'} onClick={onBookNowClick}>
                        <LoadingLink href={plan.title.toLowerCase().includes('custom') ? '/contact' : `/checkout?plan=${encodeURIComponent(plan.title)}&price=${parsePrice(plan.price)}`}>
                            {plan.title.toLowerCase().includes('custom') ? 'Get Quote' : 'Pay Now'}
                        </LoadingLink>
                    </Button>
                </CardFooter>
            </Card>
        </ScrollAnimation>
    );
};

interface PageContent {
    title: string;
    subtitle: string;
}

export default function PricingSection() {
    const { trackEvent } = useAnalytics();
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [vantaSettings, setVantaSettings] = useState<VantaSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [plans, content, vanta] = await Promise.all([
                    getPricingPlans(),
                    getPricingPageContent(),
                    getVantaSettings()
                ]);
                setPricingPlans(plans);
                setPageContent(content);
                setVantaSettings(vanta);
            } catch (error) {
                console.error("Failed to fetch pricing data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleBookNowClick = (plan: PricingPlan) => {
        trackEvent('user_action', {
            action: 'book_now_click',
            planTitle: plan.title,
            planPrice: plan.price
        });
    };

    if (isLoading || !pageContent) {
        return (
            <section id="pricing" className="relative">
                <div className="container">
                    {/* You can add skeleton loaders here if you want */}
                </div>
            </section>
        );
    }
    
    const sectionVantaConfig = vantaSettings?.sections?.pricing;
    const useVanta = vantaSettings?.globalEnable && sectionVantaConfig?.enabled;
    
    return (
        <section id="pricing" className="relative">
            {useVanta && <VantaBackground sectionConfig={sectionVantaConfig} />}
            <div className="container">
                <ScrollAnimation variant="fadeInUp" className="text-center">
                    <h2 className="text-3xl font-bold md:text-4xl" style={useVanta ? { color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' } : {}}>{pageContent.title}</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" style={useVanta ? { color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' } : {}}>
                        {pageContent.subtitle}
                    </p>
                </ScrollAnimation>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {pricingPlans.map((plan, index) => (
                         <PricingCard
                            key={plan.id || index}
                            plan={plan}
                            useVanta={useVanta}
                            onBookNowClick={() => handleBookNowClick(plan)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

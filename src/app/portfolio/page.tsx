
import { getPortfolioItems } from '../admin/settings/actions/portfolio-actions';
import { getSeoData } from '../admin/seo-geo-settings/actions';
import ScrollAnimation from '@/components/ScrollAnimation';
import PortfolioMedia from '@/components/PortfolioMedia';
import { Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function PortfolioPage() {
  const portfolioItems = await getPortfolioItems();
  const seoData = await getSeoData('portfolio');

  const PortfolioCard = ({ item }: { item: typeof portfolioItems[0] }) => (
    <div className="group relative flex flex-col h-full bg-white dark:bg-[#0f1117] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 transition-all duration-500 hover:shadow-2xl">
        <div className="relative h-[320px] w-full overflow-hidden">
          <PortfolioMedia item={item} />
          
          <div className="absolute top-6 left-6">
            <span className="bg-white/90 dark:bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white border border-white/20">
                {item.category}
            </span>
          </div>
        </div>
        
        <div className="p-8 flex flex-col flex-grow">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            {item.title}
          </h3>
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0f1117] bg-slate-100 dark:bg-white/5" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0f1117] bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    <Plus className="h-3 w-3" />
                </div>
             </div>
          </div>
        </div>
    </div>
  );

  return (
    <main className="overflow-hidden">
      {/* Header */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-slate-50 dark:bg-black/20 text-center">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        <div className="container relative z-10">
            <ScrollAnimation variant="fadeInUp">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    <Sparkles className="h-3 w-3" />
                    <span>Visual Showcase</span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-none">
                    {seoData.h1_title}
                </h1>
                <p className="mx-auto max-w-2xl text-lg md:text-xl font-medium text-slate-600 dark:text-white leading-relaxed">
                    {seoData.paragraph}
                </p>
            </ScrollAnimation>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24 lg:py-32">
        <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-16">
            {portfolioItems.map((item, index) => (
                <ScrollAnimation key={item.id || index} variant='fadeInUp' delay={index * 0.1}>
                    <PortfolioCard item={item} />
                </ScrollAnimation>
            ))}
            </div>
        </div>
      </section>
    </main>
  );
}

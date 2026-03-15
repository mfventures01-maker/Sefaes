import React from 'react';
import { Check } from 'lucide-react';

const tiers = [
    {
        name: 'Starter',
        id: 'tier-starter',
        href: '/register',
        priceMonthly: '₦0',
        description: 'Perfect for single teachers aiming to trial the AI marking system.',
        features: ['50 Graded Scripts / Month', 'Standard OCR Extraction', 'Basic Analytics', 'Email Support'],
        mostPopular: false,
    },
    {
        name: 'School',
        id: 'tier-school',
        href: '/register',
        priceMonthly: '₦40,000',
        description: 'Designed for standard secondary schools conducting terminal exams.',
        features: [
            '10,000 Graded Scripts / Month',
            'Advanced Vision OCR Engine',
            'Full Broad-Sheet Export',
            'Teacher Account Management',
            'Priority Email Support',
            'Custom WAEC Check Rules'
        ],
        mostPopular: true,
    },
    {
        name: 'Enterprise',
        id: 'tier-enterprise',
        href: '/contact',
        priceMonthly: 'Custom',
        description: 'For Universities and massive educational conglomerates requiring scale.',
        features: [
            'Unlimited Script Volume',
            'Dedicated LLM Grading Engine',
            'SSO Integration',
            'On-premise Database Options',
            '24/7 Phone Support',
            'Custom White-labeling'
        ],
        mostPopular: false,
    },
];

const Pricing: React.FC = () => {
    return (
        <div className="bg-slate-50 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Pricing plans for schools of all sizes
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600">
                    Scale your institutional grading seamlessly.
                </p>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`rounded-3xl p-8 ring-1 ring-slate-200 xl:p-10 transition-all shadow-sm ${tier.mostPopular ? 'bg-indigo-600 ring-indigo-600 text-white shadow-xl scale-105 z-10' : 'bg-white text-slate-900'
                                }`}
                        >
                            <div className="flex items-center justify-between gap-x-4">
                                <h3 id={tier.id} className={`text-lg font-semibold leading-8 ${tier.mostPopular ? 'text-white' : 'text-slate-900'}`}>
                                    {tier.name}
                                </h3>
                                {tier.mostPopular ? (
                                    <p className="rounded-full bg-indigo-500 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                                        Most popular
                                    </p>
                                ) : null}
                            </div>
                            <p className={`mt-4 text-sm leading-6 ${tier.mostPopular ? 'text-indigo-100' : 'text-slate-600'}`}>{tier.description}</p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className={`text-4xl font-bold tracking-tight ${tier.mostPopular ? 'text-white' : 'text-slate-900'}`}>
                                    {tier.priceMonthly}
                                </span>
                                {tier.priceMonthly !== 'Custom' && <span className={`text-sm font-semibold leading-6 ${tier.mostPopular ? 'text-indigo-100' : 'text-slate-600'}`}>/month</span>}
                            </p>
                            <a
                                href={tier.href}
                                aria-describedby={tier.id}
                                className={`mt-6 block rounded-full px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all shadow-md ${tier.mostPopular
                                        ? 'bg-white text-indigo-600 hover:bg-slate-50'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                    }`}
                            >
                                Buy plan
                            </a>
                            <ul className={`mt-8 space-y-3 text-sm leading-6 ${tier.mostPopular ? 'text-indigo-50' : 'text-slate-600'}`}>
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3 text-left">
                                        <Check
                                            className={`h-6 w-5 flex-none ${tier.mostPopular ? 'text-indigo-200' : 'text-indigo-600'}`}
                                            aria-hidden="true"
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;

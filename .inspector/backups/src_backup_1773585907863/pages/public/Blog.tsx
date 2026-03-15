import React from 'react';
import { Link } from 'react-router-dom';

const posts = [
    {
        title: 'AI grading in Nigeria: Opportunities and Challenges',
        href: '#',
        description: 'Explore the penetration of large language models across secondary schools in Lagos and Abuja. How AI is fundamentally reshaping WAEC preparations.',
        date: 'Apr 12, 2026',
        author: 'Tobi Awolowo',
        category: 'EdTech'
    },
    {
        title: 'How to reduce exam marking workload by 80%',
        href: '#',
        description: 'Learn strategies to digitize the marking process using intelligent batch scanners and OCR pipelines that mimic human understanding without emotional fatigue.',
        date: 'Mar 28, 2026',
        author: 'Dr. Stella Nnadi',
        category: 'Teacher Workflow'
    },
    {
        title: 'CBT vs AI Essay Grading: Which is better?',
        href: '#',
        description: 'While Computer Based Testing (CBT) scales well, it limits testing to multiple choice. See how the SEFAES Vision AI enables scalable written theory testing.',
        date: 'Feb 15, 2026',
        author: 'SEFAES Engineering',
        category: 'Product Updates'
    },
];

const Blog: React.FC = () => {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">From the SEFAES Blog</h2>
                    <p className="mt-2 text-lg leading-8 text-slate-600">
                        Insights on education technology, AI integration, and teacher workload reduction across Africa.
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {posts.map((post, idx) => (
                        <article key={idx} className="flex flex-col items-start justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-x-4 text-xs">
                                <time dateTime={post.date} className="text-slate-500">
                                    {post.date}
                                </time>
                                <span className="relative z-10 rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-600 hover:bg-indigo-100">
                                    {post.category}
                                </span>
                            </div>
                            <div className="group relative">
                                <h3 className="mt-3 text-lg font-semibold leading-6 text-slate-900 group-hover:text-slate-600">
                                    <a href={post.href}>
                                        <span className="absolute inset-0" />
                                        {post.title}
                                    </a>
                                </h3>
                                <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{post.description}</p>
                            </div>
                            <div className="relative mt-8 flex items-center gap-x-4">
                                <div className="text-sm leading-6 border-t border-slate-200 pt-4 w-full">
                                    <p className="font-semibold text-slate-900">
                                        <span className="absolute inset-0" />
                                        Written by {post.author}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;

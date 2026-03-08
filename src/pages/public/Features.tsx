import React from 'react';
import { Bot, FileScan, CheckSquare, BarChart3, CloudUpload, ShieldCheck } from 'lucide-react';

const Features: React.FC = () => {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600 tracking-widest uppercase">Platform Capabilities</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-pretty">
                        Everything you need for an automated assessment cycle
                    </p>
                    <p className="mt-6 text-lg leading-8 text-slate-600 max-w-xl mx-auto">
                        From handwritten script ingestion to comprehensive analytics dashboards, SEFAES handles the heavy lifting so your teachers can focus on teaching.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                                    <FileScan className="h-6 w-6" aria-hidden="true" />
                                </div>
                                Optical Character Recognition
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Deploy advanced OCR technology that reads and transcribes handwritten student essays, tests, and homework seamlessly, preserving context and layout.</p>
                            </dd>
                        </div>

                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                                    <Bot className="h-6 w-6" aria-hidden="true" />
                                </div>
                                Deep AI Grading Engine
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Evaluate subjective answers using advanced large language models configured strictly for objective analysis, avoiding human emotional bias and mood swings.</p>
                            </dd>
                        </div>

                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                                    <CheckSquare className="h-6 w-6" aria-hidden="true" />
                                </div>
                                WAEC/NECO Marking Schemes
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Create rigid or flexible marking rubrics mimicking regional examination standards. Set exact points for keywords, structures, and factual accuracy.</p>
                            </dd>
                        </div>

                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                                    <CloudUpload className="h-6 w-6" aria-hidden="true" />
                                </div>
                                Mass Script Ingestion
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Just drop folder payloads of scanned images straight from your scanner into the UI. The queue automatically routes them to the correct students.</p>
                            </dd>
                        </div>

                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                                    <BarChart3 className="h-6 w-6" aria-hidden="true" />
                                </div>
                                Automated Broad-Sheets
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Instantly generate class performance metrics, passing rates, and student-by-student analytical comparisons exportable natively to CSV formats.</p>
                            </dd>
                        </div>

                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                                    <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                                </div>
                                Enterprise Grade Security
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                                <p className="flex-auto">Backed by robust infrastructure and row-level database security. Ensure exam answers, student privacy, and AI results remain strictly localized to your school.</p>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default Features;

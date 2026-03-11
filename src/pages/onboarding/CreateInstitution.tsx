import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { institutionService } from '../../services/institutionService';
import { useInstitutionStore } from '../../store/useInstitutionStore';
import { Building, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const CreateInstitution: React.FC = () => {
    const navigate = useNavigate();
    const { setInstitutionId, setInstitutionType } = useInstitutionStore();

    const [schoolName, setSchoolName] = useState('');
    const [state, setState] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hardcoded per requirements for Secondary Onboarding segment
    const institutionType = 'secondary_school';
    const country = 'Nigeria';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!schoolName.trim()) return setError('School Name is required');
        if (!state.trim()) return setError('State is required');

        setIsSubmitting(true);

        try {
            // Orchestrate deterministic insertion & linking pipeline 
            const institution = await institutionService.createInstitutionAndAttachProfile({
                name: schoolName.trim(),
                type: institutionType,
                country: country,
                state: state.trim()
            });

            // Store institution references in client
            setInstitutionId(institution.id);
            setInstitutionType(institutionType);

            // Redirect Dashboard (Loading relies on populated institution_id)
            navigate(`/portal/${institutionType}/dashboard`);
        } catch (err: any) {
            console.error("Institution Creation Pipeline Error:", err);
            setError(err?.message || "Failed to create institution. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-6 transform -rotate-3 transition-transform">
                    <Building className="w-8 h-8" />
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-900">
                    Create Your School
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Setup your institution to enter the workspace.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-2xl shadow-slate-200/50 sm:rounded-3xl border border-slate-100 px-10">
                    {error && (
                        <div className="mb-4 flex items-start bg-red-50 p-3 rounded-lg border border-red-200 text-red-700 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700">School Name</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    required
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    placeholder="e.g. Demo Secondary School"
                                    className="block w-full rounded-xl border-slate-300 py-3 px-4 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700">Institution Type</label>
                            <div className="mt-2 flex items-center text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                                <CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                                <span className="font-medium text-slate-900">Secondary School</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700">Country</label>
                            <div className="mt-2 flex items-center text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                                <MapPin className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                                <span className="font-medium text-slate-900">Nigeria</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700">State</label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    required
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="e.g. Lagos"
                                    className="block w-full rounded-xl border-slate-300 py-3 px-4 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full justify-center items-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Institution'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateInstitution;

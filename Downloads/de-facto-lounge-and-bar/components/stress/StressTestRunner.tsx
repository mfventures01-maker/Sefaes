
import React, { useState, useEffect } from 'react';
import { StressTestScenario, TestResult, TestStatus } from './types';
import { ALL_SCENARIOS, runScenario } from './testRunner';
import { mockDb } from '../../services/mockDatabase';
import { Payment } from '../../types';

const StressTestRunner: React.FC = () => {
    const [results, setResults] = useState<Record<string, TestResult>>({});
    const [running, setRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);

    useEffect(() => {
        // Initial load for dashboard snapshot
        loadSnapshot();
    }, []);

    const loadSnapshot = async () => {
        const p = await mockDb.getPayments();
        setPayments(p);
    };

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 200));
    };


    // Improved runTest and runAll
    const executeTest = async (scenario: StressTestScenario): Promise<TestResult> => {
        setRunning(true);
        const resultTemplate: TestResult = { id: scenario.id, name: scenario.name, status: "RUNNING", logs: [] };
        setResults(prev => ({ ...prev, [scenario.id]: resultTemplate }));

        let finalStatus: TestStatus = "PASS";
        let errorMsg;

        try {
            await runScenario(scenario, (msg) => {
                addLog(`[${scenario.id}] ${msg}`);
            });
        } catch (e: any) {
            finalStatus = "FAIL";
            errorMsg = e.message;
            addLog(`Error in ${scenario.id}: ${e.message}`);
        } finally {
            setRunning(false);
            loadSnapshot();
        }

        const finalResult: TestResult = {
            ...resultTemplate,
            status: finalStatus,
            error: errorMsg
        };

        setResults(prev => ({ ...prev, [scenario.id]: finalResult }));
        return finalResult;
    };

    const runAllTests = async () => {
        const reportData: any = {
            timestamp: new Date().toISOString(),
            results: []
        };

        for (const scenario of ALL_SCENARIOS) {
            const res = await executeTest(scenario);
            reportData.results.push(res);
            await new Promise(r => setTimeout(r, 500));
        }

        const allPass = reportData.results.every((r: any) => r.status === 'PASS');
        reportData.success = allPass;

        console.log("SHIP REPORT --------------------------------");
        console.log(JSON.stringify(reportData, null, 2));
        localStorage.setItem("STRESS_TEST_LAST_REPORT", JSON.stringify(reportData));
        addLog(`REPORT GENERATED. Success: ${allPass}`);
    };

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-8">
            <h1 className="text-3xl font-bold mb-4 border-b border-green-800 pb-2">DEFACTO STRESS TEST HARNESS</h1>

            <div className="grid grid-cols-2 gap-8">
                {/* CONTROL PANEL */}
                <div>
                    <div className="mb-6 flex gap-4">
                        <button
                            onClick={runAllTests}
                            disabled={running}
                            className="px-6 py-3 bg-green-900 hover:bg-green-800 text-white font-bold rounded disabled:opacity-50"
                        >
                            {running ? 'RUNNING...' : 'RUN ALL TESTS'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {ALL_SCENARIOS.map(s => {
                            const result = results[s.id];
                            return (
                                <div key={s.id} className="border border-green-800 p-4 rounded bg-green-900/10 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{s.id}: {s.name}</h3>
                                        <p className="text-xs opacity-70">{s.description}</p>
                                        {result?.error && <p className="text-red-500 text-xs mt-1">{result.error}</p>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {result?.status === 'PASS' && <span className="text-green-500 font-bold">PASS</span>}
                                        {result?.status === 'FAIL' && <span className="text-red-500 font-bold">FAIL</span>}
                                        {result?.status === 'RUNNING' && <span className="text-yellow-500 animate-pulse">RUNNING</span>}

                                        <button
                                            onClick={() => executeTest(s)}
                                            disabled={running}
                                            className="px-3 py-1 border border-green-700 hover:bg-green-900 text-xs rounded"
                                        >
                                            RUN
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* LOGS & DASHBOARD */}
                <div className="flex flex-col gap-6">
                    <div className="border border-green-800 p-4 rounded bg-black h-64 overflow-y-auto font-mono text-xs">
                        <h4 className="text-green-600 mb-2 sticky top-0 bg-black border-b border-green-900">LIVE LOGS</h4>
                        {logs.map((L, i) => (
                            <div key={i} className="mb-1">{L}</div>
                        ))}
                    </div>

                    <div className="border border-green-800 p-4 rounded">
                        <h4 className="font-bold mb-4">DASHBOARD SNAPSHOT</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-2 bg-green-900/20 rounded">
                                <div className="opacity-50">Total Payments</div>
                                <div className="text-xl">{payments.length}</div>
                            </div>
                            <div className="p-2 bg-green-900/20 rounded">
                                <div className="opacity-50">Verified Volume</div>
                                <div className="text-xl">
                                    ₦{payments.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="p-2 bg-green-900/20 rounded">
                                <div className="opacity-50">Pending</div>
                                <div className="text-xl">{payments.filter(p => p.status === 'pending').length}</div>
                            </div>
                        </div>
                    </div>

                    <ShipChecklist />
                </div>
            </div>
        </div>
    );
};

const ShipChecklist: React.FC = () => {
    return (
        <div className="border border-green-800 p-4 rounded bg-green-900/5">
            <h4 className="font-bold mb-2">SHIP READINESS CHECKLIST</h4>
            <ul className="text-xs space-y-2">
                <li className="flex items-center gap-2">
                    <input type="checkbox" disabled checked={import.meta.env.DEV} />
                    <span>Dev Environment (Correct)</span>
                </li>
                <li className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Build Output: `dist` folder exists</span>
                </li>
                <li className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Netlify `_redirects` or `netlify.toml` present</span>
                </li>
            </ul>
            <div className="mt-4 p-2 bg-yellow-900/20 text-yellow-500 text-xs">
                To ship: `npm run build` -&gt; Netlify deploy.
            </div>
        </div>
    );
};

export default StressTestRunner;

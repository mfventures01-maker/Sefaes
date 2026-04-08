import React, { useState, useMemo, useEffect } from 'react';
import { mockTransactions, getTodayTransactions, getPaymentMethodBreakdown, Transaction } from '../data/mockTransactions';
import { auditStore, AuditEvent, AuditEventType, getCurrentActorRole } from '../services/auditService';
import { mockDb } from '../services/mockDatabase';
import { paymentIntentStore } from '../services/paymentIntentService';
import { Order } from '../types';

type UserRole = 'CEO' | 'Manager' | 'Staff';

// Extended Transaction type for the dashboard
interface DashboardTransaction extends Transaction {
    paymentIntentId?: string;
    orderStatus?: string;
    paymentStatus?: string;
    ref?: string;
}

const Dashboard: React.FC = () => {
    // Debug role switcher (controlled by env flag)
    const debugRoleSwitch = import.meta.env.VITE_DEBUG_ROLE_SWITCH === 'true';
    const [currentRole, setCurrentRole] = useState<UserRole>('Staff');
    const [currentStaffId] = useState('staff_1'); // Mock logged-in staff

    // Live Data State
    const [liveOrders, setLiveOrders] = useState<Order[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Audit events state (for CEO)
    const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
    const [auditFilter, setAuditFilter] = useState<AuditEventType | 'all'>('all');

    // Initialize Role based on Service
    useEffect(() => {
        const role = getCurrentActorRole();
        // Map service role to Dashboard role (simulated)
        if (role === 'ceo') setCurrentRole('CEO');
        else if (role === 'manager') setCurrentRole('Manager');
        else setCurrentRole('Staff');
    }, []);

    // Poll for Live Data
    useEffect(() => {
        const fetchData = async () => {
            const orders = await mockDb.getOrders();
            setLiveOrders(orders);

            if (currentRole === 'CEO') {
                const events = auditStore.getEvents();
                setAuditEvents(events);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000); // 3s poll
        return () => clearInterval(interval);
    }, [currentRole, refreshTrigger]);

    // Merge Mock Transactions with Live Orders
    const transactions: DashboardTransaction[] = useMemo(() => {
        // Convert Live Orders to Transactions
        const liveTransactions: DashboardTransaction[] = liveOrders.map(order => {
            const intent = paymentIntentStore.getIntentByOrderId(order.id);
            return {
                id: order.id,
                tableId: order.tableId,
                totalAmount: order.totalAmount,
                paymentMethod: (intent?.method as any) || 'PENDING',
                timestamp: new Date(order.createdAt).toISOString(),
                itemCount: order.items.length,
                staffId: 'staff_current',
                status: intent?.status === 'verified' ? 'paid' : 'pending',
                paymentIntentId: intent?.paymentIntentId,
                orderStatus: order.status,
                paymentStatus: intent?.status || 'unpaid',
                ref: intent?.verificationCode
            };
        });

        // Combine (Live first)
        return [...liveTransactions, ...mockTransactions];
    }, [liveOrders, refreshTrigger]);

    // KPIs Calculation
    const kpis = useMemo(() => {
        const todayTxns = getTodayTransactions(transactions);

        const totalRevenue = todayTxns.reduce((sum, txn) => sum + (txn.status === 'paid' ? txn.totalAmount : 0), 0);
        const activeOrders = liveOrders.filter(o => o.status !== 'closed' && o.status !== 'voided').length;
        // Verify count: Transactions that are claimed but NOT verified yet
        const pendingVerify = transactions.filter(t => t.paymentStatus === 'claimed').length;

        return {
            revenue: totalRevenue,
            activeOrders,
            pendingVerify,
            paymentBreakdown: getPaymentMethodBreakdown(transactions)
        };
    }, [transactions, liveOrders]);

    // Handlers
    const handleVerify = (paymentIntentId: string) => {
        if (currentRole !== 'Manager' && currentRole !== 'CEO') return;
        paymentIntentStore.verifyIntent(paymentIntentId, currentRole === 'CEO' ? 'ceo' : 'manager');
        auditStore.addEvent({
            event_type: 'payment_verified',
            actor_role: currentRole === 'CEO' ? 'ceo' : 'manager',
            ref: { paymentIntentId },
            metadata: { method: 'dashboard_action' }
        });
        setRefreshTrigger(prev => prev + 1);
    };

    const handleClaim = (paymentIntentId: string) => {
        // Dashboard claim not fully implemented in this MVP (usually done in modal)
        // But we can simulate a force-claim if needed.
        console.log("Claim logic via dashboard to be implemented");
    };

    return (
        <div className="bg-defacto-green min-h-screen text-defacto-cream font-sans selection:bg-defacto-gold selection:text-defacto-green">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-defacto-gold tracking-tight">
                            {currentRole === 'Staff' ? 'Waiter Dashboard' : currentRole === 'Manager' ? 'Manager Station' : 'Executive View'}
                        </h1>
                        <p className="text-defacto-cream/60 text-sm font-bold uppercase tracking-widest mt-1">
                            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5">
                        <div className="px-3 py-1 bg-white/5 rounded-lg">
                            <span className="text-xs text-defacto-cream/40 uppercase font-bold block">Role</span>
                            <span className="text-sm font-bold text-defacto-gold">{currentRole}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div className="px-3 py-1">
                            <span className="text-xs text-defacto-cream/40 uppercase font-bold block">Staff ID</span>
                            <span className="text-sm font-bold text-white/80">{currentStaffId}</span>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard
                        title="Today's Revenue"
                        value={`₦${kpis.revenue.toLocaleString()}`}
                        icon="💰"
                        color="gold"
                    />
                    <KPICard
                        title="Active Orders"
                        value={kpis.activeOrders.toString()}
                        icon="🔔"
                        color="green"
                    />
                    <KPICard
                        title="Pending Verify"
                        value={kpis.pendingVerify.toString()}
                        icon="⚠️"
                        color={kpis.pendingVerify > 0 ? "blue" : "purple"}
                    />
                    <KPICard
                        title="Avg. Ticket"
                        value={`₦${transactions.length > 0 ? Math.round(kpis.revenue / transactions.length).toLocaleString() : 0}`}
                        icon="📊"
                        color="purple"
                    />
                </div>

                {/* Main Grid: Transactions + Side Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transactions Table (2/3 width on desktop) */}
                    <div className="lg:col-span-2">
                        <TransactionsTable
                            transactions={transactions}
                            title={currentRole === 'Staff' ? 'My Transactions' : 'Recent Transactions'}
                            userRole={currentRole}
                            onVerify={handleVerify}
                        />
                    </div>

                    {/* Side Panel (1/3 width on desktop) */}
                    <div className="space-y-6">
                        {/* Payment Methods Breakdown */}
                        <PaymentMethodsCard breakdown={kpis.paymentBreakdown} />

                        {/* Audit Panel (CEO only) */}
                        {currentRole === 'CEO' && (
                            <AuditPanel
                                events={auditEvents}
                                filter={auditFilter}
                                onFilterChange={setAuditFilter}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// KPI Card Component
interface KPICardProps {
    title: string;
    value: string;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'gold';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'from-blue-600/20 to-cyan-600/20 border-blue-500/30',
        green: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30',
        purple: 'from-purple-600/20 to-pink-600/20 border-purple-500/30',
        gold: 'from-yellow-600/20 to-orange-600/20 border-yellow-500/30'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border rounded-2xl p-5`}>
            <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-xs text-defacto-cream/60 uppercase tracking-wider mb-2">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-defacto-cream">{value}</p>
        </div>
    );
};

// Transactions Table Component
interface TransactionsTableProps {
    transactions: DashboardTransaction[];
    title: string;
    userRole: UserRole;
    onVerify: (intentId: string) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, title, userRole, onVerify }) => {
    return (
        <div className="bg-white/5 backdrop-blur-sm border border-defacto-cream/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-defacto-cream/10">
                <h2 className="text-lg font-bold text-defacto-cream">{title}</h2>
                <p className="text-xs text-defacto-cream/60 mt-1">{transactions.length} transactions</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-defacto-cream/70 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-defacto-cream/70 uppercase tracking-wider">Table</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-defacto-cream/70 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-defacto-cream/70 uppercase tracking-wider">Method</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-defacto-cream/70 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-defacto-cream/70 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-defacto-cream/5">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-defacto-cream/50">
                                    No transactions found
                                </td>
                            </tr>
                        ) : (
                            transactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-sm text-defacto-cream font-mono">
                                        {txn.id}
                                        {txn.ref && <span className="block text-[9px] opacity-50">{txn.ref}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-defacto-cream font-bold">{txn.tableId}</td>
                                    <td className="px-4 py-3 text-sm text-defacto-gold font-bold">₦{txn.totalAmount.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${txn.paymentMethod === 'POS' ? 'bg-blue-500/20 text-blue-300' :
                                            txn.paymentMethod === 'TRANSFER' ? 'bg-purple-500/20 text-purple-300' :
                                                'bg-green-500/20 text-green-300'
                                            }`}>
                                            {txn.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${txn.paymentStatus === 'verified' ? 'bg-green-600/30 text-green-200 border border-green-500/30' :
                                                txn.paymentStatus === 'claimed' ? 'bg-amber-600/30 text-amber-200 border border-amber-500/30 animate-pulse' :
                                                    'bg-white/5 text-white/30'
                                            }`}>
                                            {txn.paymentStatus || txn.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {(txn.paymentStatus === 'claimed') && (userRole === 'Manager' || userRole === 'CEO') && txn.paymentIntentId && (
                                            <button
                                                onClick={() => onVerify(txn.paymentIntentId!)}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase rounded shadow-lg transition-colors"
                                            >
                                                Verify
                                            </button>
                                        )}
                                        {txn.paymentStatus === 'verified' && (
                                            <span className="text-xs text-green-400 font-mono">✓ Done</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Payment Methods Card
interface PaymentMethodsCardProps {
    breakdown: { POS: number; TRANSFER: number; CASH: number };
}

const PaymentMethodsCard: React.FC<PaymentMethodsCardProps> = ({ breakdown }) => {
    return (
        <div className="bg-white/5 backdrop-blur-sm border border-defacto-cream/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-defacto-cream mb-4">Payment Methods</h2>
            <div className="space-y-4">
                <MethodBar label="POS Terminal" value={breakdown.POS} total={Object.values(breakdown).reduce((a, b) => a + b, 0)} color="blue" />
                <MethodBar label="Bank Transfer" value={breakdown.TRANSFER} total={Object.values(breakdown).reduce((a, b) => a + b, 0)} color="purple" />
                <MethodBar label="Cash" value={breakdown.CASH} total={Object.values(breakdown).reduce((a, b) => a + b, 0)} color="green" />
            </div>
        </div>
    );
};

// Helper for Method Bar
const MethodBar: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const colorClasses = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-green-500'
    };

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-defacto-cream/80">{label}</span>
                <span className="font-bold text-defacto-gold">₦{value.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

// Audit Panel (CEO Only)
interface AuditPanelProps {
    events: AuditEvent[];
    filter: AuditEventType | 'all';
    onFilterChange: (filter: AuditEventType | 'all') => void;
}

const AuditPanel: React.FC<AuditPanelProps> = ({ events, filter, onFilterChange }) => {
    const filteredEvents = filter === 'all'
        ? events
        : events.filter(e => e.event_type === filter);

    return (
        <div className="bg-defacto-black/40 backdrop-blur-md border border-defacto-gold/20 rounded-2xl overflow-hidden h-96 flex flex-col">
            <div className="p-4 border-b border-defacto-gold/10 flex justify-between items-center bg-black/20">
                <h2 className="text-sm font-black text-defacto-gold uppercase tracking-widest">Audit Trail</h2>
                <select
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value as AuditEventType | 'all')}
                    className="bg-black/40 text-xs text-defacto-cream border border-defacto-gold/20 rounded px-2 py-1 outline-none"
                >
                    <option value="all">All Events</option>
                    <option value="order_created">Orders</option>
                    <option value="payment_method_selected">Payments</option>
                    <option value="payment_intent_created">Payment Intents</option>
                    <option value="payment_claimed">Claims</option>
                    <option value="payment_verified">Verifications</option>
                    <option value="checkout_completed">Checkout</option>
                </select>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                {filteredEvents.length === 0 ? (
                    <div className="text-center text-white/20 py-8">No matching events</div>
                ) : (
                    filteredEvents.map(event => (
                        <div key={event.id} className="border-l-2 border-defacto-gold/30 pl-3 py-1 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex justify-between opacity-50 mb-0.5">
                                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                <span className={`uppercase font-bold ${event.actor_role === 'ceo' ? 'text-red-400' : 'text-blue-300'}`}>
                                    {event.actor_role}
                                </span>
                            </div>
                            <div className="text-defacto-cream font-bold">{event.event_type.replace(/_/g, ' ')}</div>
                            <div className="text-white/40 truncate">
                                {event.metadata?.paymentStatus && `Status: ${event.metadata.paymentStatus} `}
                                {event.metadata?.totalAmount && `Amt: ${event.metadata.totalAmount} `}
                                {event.ref.orderId && `Ord: ${event.ref.orderId.split('-')[1]}`}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;

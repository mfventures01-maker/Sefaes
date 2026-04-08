import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDatabase';
import { Order, OrderStatus, Table } from '../../types';
import PaymentModal from '../payment/PaymentModal';
import { paymentIntentStore } from '../../services/paymentIntentService';
import { getCurrentActorRole } from '../../services/auditService';

const ServicePipeline: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Active' | 'Closed'>('Active');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Force re-render for store updates

    // Poll for updates (Simulation of Realtime)
    useEffect(() => {
        const fetchData = async () => {
            const [o, t] = await Promise.all([
                mockDb.getOrders(),
                mockDb.getTables()
            ]);
            setOrders(o);
            setTables(t);
            setLoading(false);
            setRefreshTrigger(prev => prev + 1); // Sync payment intents
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        await mockDb.updateOrderStatus(orderId, newStatus, 'staff');
    };

    const handlePaymentSubmit = async (method: any, amount: number, reference?: string, senderName?: string) => {
        if (!selectedOrderId) return;
        // Legacy update for compatibility, but true source of truth is paymentIntentStore
        await mockDb.addPayment(selectedOrderId, method, amount, reference, undefined, 'staff', senderName);

        // Force refresh to update UI state immediately
        setRefreshTrigger(prev => prev + 1);
        setSelectedOrderId(null);
    };

    const getTableZone = (tableId: string) => {
        return tables.find(t => t.id === tableId)?.zone || 'Unknown';
    };

    const getTableName = (tableId: string) => {
        return tables.find(t => t.id === tableId)?.name || tableId;
    };

    // Helper to get payment status from strict store
    const getPaymentState = (orderId: string) => {
        const intent = paymentIntentStore.getIntentByOrderId(orderId);
        return intent ? intent.status : 'unpaid';
    };

    const isPaymentVerified = (orderId: string) => {
        return getPaymentState(orderId) === 'verified';
    };

    const filteredOrders = orders
        .filter(o => activeTab === 'Active' ? o.status !== 'closed' && o.status !== 'voided' : o.status === 'closed' || o.status === 'voided')
        .sort((a, b) => b.createdAt - a.createdAt);

    if (loading) return <div className="p-8 text-white/50">Loading pipeline...</div>;

    return (
        <div className="bg-[#051f11] min-h-screen p-4 pb-24 text-white font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-[#c4a45a]">Service Pipeline</h1>
                    <p className="text-xs opacity-50 uppercase tracking-widest">Real-time Operations</p>
                </div>
                <div className="flex bg-black/30 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('Active')}
                        className={`px-4 py-2 rounded-md text-xs font-bold uppercase ${activeTab === 'Active' ? 'bg-[#c4a45a] text-[#051f11]' : 'text-white/50'}`}
                    >
                        Active ({orders.filter(o => o.status !== 'closed' && o.status !== 'voided').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('Closed')}
                        className={`px-4 py-2 rounded-md text-xs font-bold uppercase ${activeTab === 'Closed' ? 'bg-[#c4a45a] text-[#051f11]' : 'text-white/50'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Kanban / List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrders.length === 0 && (
                    <div className="col-span-full text-center p-12 opacity-30 border border-dashed border-white/10 rounded-xl">
                        No orders in this view
                    </div>
                )}

                {filteredOrders.map(order => {
                    const paymentStatus = getPaymentState(order.id);
                    const isVerified = paymentStatus === 'verified';
                    const isClaimed = paymentStatus === 'claimed';
                    const role = getCurrentActorRole();

                    return (
                        <div key={order.id} className="bg-[#0a3d21]/50 border border-white/5 rounded-2xl p-5 relative group hover:border-[#c4a45a]/30 transition-all">
                            {/* Header: Table & Time */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-[#fdfae5]">{getTableName(order.tableId)}</span>
                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getTableZone(order.tableId) === 'VIP' ? 'border-[#c4a45a] text-[#c4a45a]' : 'border-white/20 text-white/50'}`}>
                                            {getTableZone(order.tableId)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-white/40 font-mono">#{order.id.split('-')[1]} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === 'created' ? 'bg-blue-500/20 text-blue-200' :
                                    order.status === 'ready' ? 'bg-green-500/20 text-green-200' :
                                        order.status === 'served' ? 'bg-purple-500/20 text-purple-200' :
                                            'bg-white/10 text-white/50'
                                    }`}>
                                    {order.status}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-2 mb-4 bg-black/20 p-3 rounded-lg">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-white/80"><span className="text-[#c4a45a] font-bold">{item.quantity}x</span> {item.name}</span>
                                        <span className="opacity-40 text-xs text-right w-6 uppercase">{item.department.substring(0, 3)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Status Bar - STRICT CHECK */}
                            <div className="flex justify-between items-center mb-4 text-xs font-bold uppercase tracking-wider">
                                <span className="text-white/40">Total: <span className="text-white">₦{order.totalAmount.toLocaleString()}</span></span>
                                <span className={`${isVerified ? 'text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-1 rounded' :
                                    isClaimed ? 'text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-1 rounded' : 'text-red-400'
                                    }`}>
                                    {isVerified ? 'VERIFIED' :
                                        isClaimed ? 'PENDING VERIFICATION' : 'UNPAID'}
                                </span>
                            </div>

                            {/* Actions */}
                            {activeTab === 'Active' && (
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Service Flow Buttons - GATED */}
                                    {order.status === 'created' && (
                                        <button onClick={() => handleStatusUpdate(order.id, 'preparing')} className="bg-[#c4a45a]/20 hover:bg-[#c4a45a] hover:text-[#051f11] text-[#c4a45a] py-2 rounded-lg text-xs font-bold uppercase transition-colors">
                                            Accept
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button onClick={() => handleStatusUpdate(order.id, 'ready')} className="bg-[#c4a45a]/20 hover:bg-[#c4a45a] hover:text-[#051f11] text-[#c4a45a] py-2 rounded-lg text-xs font-bold uppercase transition-colors">
                                            Mark Ready
                                        </button>
                                    )}
                                    {order.status === 'ready' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'served')}
                                            disabled={!isVerified}
                                            className={`py-2 rounded-lg text-xs font-bold uppercase transition-all border ${isVerified
                                                    ? 'bg-purple-900/40 hover:bg-purple-600/40 text-purple-200 border-purple-500/20'
                                                    : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                                                }`}
                                        >
                                            {!isVerified ? 'Verif Req.' : 'Mark Served'}
                                        </button>
                                    )}
                                    {order.status === 'served' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'closed')}
                                            disabled={!isVerified}
                                            className={`py-2 rounded-lg text-xs font-bold uppercase transition-all border ${isVerified
                                                    ? 'bg-white/10 hover:bg-white/20 text-white/60 border-white/10'
                                                    : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                                                }`}
                                        >
                                            Close Table
                                        </button>
                                    )}

                                    {/* Payment Button */}
                                    {!isVerified && (
                                        <button
                                            onClick={() => setSelectedOrderId(order.id)}
                                            className={`col-span-1 py-2 rounded-lg text-xs font-bold uppercase border transition-colors ${isClaimed
                                                    ? (role === 'manager' || role === 'ceo' ? 'bg-amber-600 text-white border-amber-500 animate-pulse' : 'bg-amber-900/40 text-amber-200 border-amber-500/20')
                                                    : 'bg-green-900/40 hover:bg-green-600/40 text-green-200 border-green-500/20'
                                                }`}
                                        >
                                            {isClaimed
                                                ? (role === 'manager' || role === 'ceo' ? 'VERIFY NOW' : 'Processing...')
                                                : 'Record Pay'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Modals */}
            {selectedOrderId && (
                <PaymentModal
                    orderId={selectedOrderId}
                    totalAmount={orders.find(o => o.id === selectedOrderId)?.totalAmount || 0}
                    tableId={orders.find(o => o.id === selectedOrderId)?.tableId}
                    onClose={() => setSelectedOrderId(null)}
                    onSubmit={handlePaymentSubmit}
                />
            )}
        </div>
    );
};

export default ServicePipeline;

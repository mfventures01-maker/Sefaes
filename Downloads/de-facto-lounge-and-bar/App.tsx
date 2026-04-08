import React, { useState, useEffect } from 'react';
import Homepage from './components/home/Homepage';
import Dashboard from './components/Dashboard';
import TableLanding from './components/ordering/TableLanding';
import EliteDashboard from './components/dashboard/EliteDashboard';
import Portal from './components/portal/Portal';
import ServicePipeline from './components/dashboard/ServicePipeline';
import { mockDb } from './services/mockDatabase';
import { OrderItem } from './types';
import StressTestRunner from './components/stress/StressTestRunner';
import { auditStore, getCurrentActorRole } from './services/auditService';

import MenuPage from './components/menu/MenuPage';
import CartPage from './components/cart/CartPage';
import PaymentSuccess from './components/confirmation/PaymentSuccess';

// Simple client-side router
type Route = 'home' | 'dashboard' | 'qr-order' | 'qr-menu' | 'qr-cart' | 'qr-success' | 'portal' | 'stress' | 'ship';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [tableId, setTableId] = useState<string>('');

  // Global State for Orders
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');

  const [cart, setCart] = useState<any[]>([]);
  const [orderContext, setOrderContext] = useState<any>(null);


  // Client-side routing based on URL path
  useEffect(() => {
    const determineRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      // QR route: /q/:tableId
      if (path.startsWith('/q/')) {
        const parts = path.split('/');
        if (parts.length >= 3) {
          const extractedTableId = parts[2];
          setTableId(extractedTableId);

          const subRoute = parts[3] || 'menu';
          if (subRoute === 'menu') setCurrentRoute('qr-menu');
          else if (subRoute === 'cart') setCurrentRoute('qr-cart');
          else if (subRoute === 'payment-success') setCurrentRoute('qr-success');
          else setCurrentRoute('qr-order'); // fallback
          return;
        }
      }

      // Dashboard route: /dashboard
      if (path === '/dashboard') {
        setCurrentRoute('dashboard');
        return;
      }

      // Portal Routes (Unified)
      if (path === '/portal' || path === '/staff' || path === '/ceo') {
        setCurrentRoute('portal');
        return;
      }

      // Hash-based routes for dashboards (Legacy/Demo aliases)
      if (hash === '#staff' || hash === '#ceo') {
        setCurrentRoute('portal');
        return;
      }

      // STRESS TEST ROUTES (Protected)
      const isTestMode = import.meta.env.DEV || window.location.search.includes('testMode=1');

      if (path === '/__stress' && isTestMode) {
        setCurrentRoute('stress');
        return;
      }
      if (path === '/__ship' && isTestMode) {
        setCurrentRoute('ship');
        return;
      }

      // Default: Homepage
      setCurrentRoute('home');
    };


    determineRoute();

    // Listen for navigation changes
    const handlePopState = () => determineRoute();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Multi-route cart persistence
  useEffect(() => {
    if (tableId) {
      try {
        const saved = localStorage.getItem(`defacto_cart_${tableId}`);
        if (saved) setCart(JSON.parse(saved));
      } catch (e) { }
    }
  }, [tableId]);

  useEffect(() => {
    if (tableId && cart) {
      localStorage.setItem(`defacto_cart_${tableId}`, JSON.stringify(cart));
    }
  }, [cart, tableId]);

  const navigateToCart = () => {
    window.history.pushState({}, '', `/q/${tableId}/cart`);
    setCurrentRoute('qr-cart');
  };

  const navigateToMenu = () => {
    window.history.pushState({}, '', `/q/${tableId}/menu`);
    setCurrentRoute('qr-menu');
  };

  const navigateToSuccess = (orderId: string, name: string, phone: string, method: string) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderContext({ orderId, name, phone, method, items: [...cart], total });
    localStorage.removeItem(`defacto_cart_${tableId}`); // Clear cart
    setCart([]);
    window.history.pushState({}, '', `/q/${tableId}/payment-success`);
    setCurrentRoute('qr-success');
  };

  const handlePlaceOrder = async (items: OrderItem[], existingOrderId?: string) => {
    try {
      let orderId = existingOrderId;

      if (!orderId) {
        const order = await mockDb.createOrder(tableId, items, 'qr_guest');
        orderId = order.id;

        // Fire audit event: order_created (only if new)
        auditStore.addEvent({
          event_type: 'order_created',
          actor_role: getCurrentActorRole(),
          ref: {
            orderId: order.id,
            tableId: tableId
          },
          metadata: {
            itemCount: items.length,
            totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          }
        });
      }

      setLastOrderId(orderId);
      setShowOrderSuccess(true);
      setTimeout(() => setShowOrderSuccess(false), 5000);
    } catch (err) {
      console.error('Order failed', err);
      alert('Failed to place order. Please try again.');
    }
  };

  // Render based on current route
  return (
    <div className="min-h-screen font-sans">
      {/* HOMEPAGE */}
      {currentRoute === 'home' && <Homepage />}

      {/* DASHBOARD */}
      {currentRoute === 'dashboard' && <Dashboard />}

      {/* QR ORDERING FLOW - NEW MULTI-ROUTE SPA */}
      {currentRoute === 'qr-menu' && (
        <MenuPage tableId={tableId} cart={cart} setCart={setCart} navigateToCart={navigateToCart} />
      )}

      {currentRoute === 'qr-cart' && (
        <CartPage tableId={tableId} cart={cart} setCart={setCart} navigateToMenu={navigateToMenu} navigateToSuccess={navigateToSuccess} />
      )}

      {currentRoute === 'qr-success' && (
        <PaymentSuccess tableId={tableId} orderContext={orderContext} navigateToMenu={navigateToMenu} />
      )}

      {/* QR ORDERING FLOW - LEGACY */}
      {currentRoute === 'qr-order' && (
        <div className="min-h-screen bg-[#051f11] text-white">
          <TableLanding
            tableId={tableId}
            onPlaceOrder={handlePlaceOrder}
          />

          {/* Success Overlay */}
          {showOrderSuccess && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#c4a45a] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_#c4a45a]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="#051f11" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-4xl font-black text-[#fdfae5] mb-4 tracking-tighter">Order Sent</h2>
                <p className="text-[#c4a45a] font-bold uppercase tracking-widest mb-8">Order ID: {lastOrderId}</p>
                <p className="text-white/60 max-w-xs mx-auto">Your items are being prepared. A waiter will bring your bill shortly.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UNIFIED PORTAL (Staff + CEO) */}
      {currentRoute === 'portal' && <Portal />}

      {/* STRESS TEST RUNNER */}
      {currentRoute === 'stress' && <StressTestRunner />}

      {/* SHIP READINESS (Reuse Stress Runner or simple page) */}
      {currentRoute === 'ship' && (
        <div className="min-h-screen bg-[#051f11] text-[#fdfae5] p-8 font-mono">
          <h1 className="text-2xl font-bold mb-4">SHIP READINESS REPORT</h1>
          <div className="bg-black/50 p-4 rounded border border-[#c4a45a]/30">
            <h2 className="text-[#c4a45a] mb-2">Build Configuration</h2>
            <p>Build Command: <span className="bg-white/10 px-2 py-0.5 rounded">npm run build</span></p>
            <p>Publish Directory: <span className="bg-white/10 px-2 py-0.5 rounded">dist</span></p>
          </div>
          <div className="mt-8">
            <h2 className="text-[#c4a45a] mb-2">Environment Check</h2>
            <p>Mode: {import.meta.env.MODE}</p>
            <p>Test Mode Active: {import.meta.env.DEV ? 'YES (DEV)' : 'NO'}</p>
          </div>
          <a href="/__stress?testMode=1" className="block mt-8 text-blue-400 underline">Go to Stress Test Runner</a>
        </div>
      )}

      {/* Demo Navigation (for testing, can be removed in production) */}
      <div className="fixed bottom-4 right-4 z-[100] flex gap-2 bg-black/80 p-2 rounded-full border border-white/10 backdrop-blur-md">
        <button
          onClick={() => {
            window.history.pushState({}, '', '/');
            setCurrentRoute('home');
          }}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentRoute === 'home' ? 'bg-[#c4a45a] text-[#051f11]' : 'text-white/50 hover:text-white'
            }`}
        >
          Home
        </button>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/q/T1/menu');
            setTableId('T1');
            setCurrentRoute('qr-menu');
          }}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentRoute.startsWith('qr-') ? 'bg-[#c4a45a] text-[#051f11]' : 'text-white/50 hover:text-white'
            }`}
        >
          QR (T1)
        </button>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/dashboard');
            setCurrentRoute('dashboard');
          }}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentRoute === 'dashboard' ? 'bg-[#c4a45a] text-[#051f11]' : 'text-white/50 hover:text-white'
            }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => {
            window.location.hash = '#staff';
            setCurrentRoute('portal');
          }}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentRoute === 'portal' ? 'bg-[#c4a45a] text-[#051f11]' : 'text-white/50 hover:text-white'
            }`}
        >
          Staff
        </button>
        <button
          onClick={() => {
            window.location.hash = '#ceo';
            setCurrentRoute('portal');
          }}
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentRoute === 'portal' ? 'bg-[#c4a45a] text-[#051f11]' : 'text-white/50 hover:text-white'
            }`}
        >
          CEO
        </button>
      </div>
    </div>
  );
};

export default App;

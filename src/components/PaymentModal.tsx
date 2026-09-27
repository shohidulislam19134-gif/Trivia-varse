import React, { useState } from 'react';
import { PremiumTier, PaymentMethodType, UserSubscription } from '../types';
import { PREMIUM_TIERS } from '../data/hosts';
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  QrCode,
  Smartphone,
  Wallet,
  Building,
  Sparkles,
  X,
  Lock,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpgradeSuccess: (subscription: UserSubscription) => void;
  preselectedTierId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpgradeSuccess,
  preselectedTierId = 'pass_vip',
}) => {
  const [selectedTier, setSelectedTier] = useState<PremiumTier>(
    PREMIUM_TIERS.find((t) => t.id === preselectedTierId) || PREMIUM_TIERS[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('paytm');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Form inputs
  const [paytmNumber, setPaytmNumber] = useState('9876543210');
  const [upiId, setUpiId] = useState('contestant@paytm');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('786');
  const [cardName, setCardName] = useState('Trivia Champion');

  // Transaction State
  const [step, setStep] = useState<'select' | 'checkout' | 'processing' | 'success'>('select');
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTier = (tier: PremiumTier) => {
    setSelectedTier(tier);
    setStep('checkout');
  };

  const handleInitiatePayment = async () => {
    setStep('processing');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: selectedTier.id,
          method: paymentMethod,
          customerName: cardName || 'Trivia Player',
        }),
      });

      if (!res.ok) throw new Error('Could not initialize Paytm order gateway');
      const data = await res.json();
      setOrderData(data);

      // Simulate payment network verification delay (1.5s)
      setTimeout(async () => {
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              tierId: selectedTier.id,
              method: paymentMethod,
              paymentDetails: {
                vpa: upiId,
                mobile: paytmNumber,
                method: paymentMethod,
              },
            }),
          });

          if (!verifyRes.ok) throw new Error('Verification failed');
          const verifyData = await verifyRes.json();

          const updatedSubscription: UserSubscription = {
            isPremium: true,
            tierId: selectedTier.id,
            tierName: selectedTier.name,
            activatedAt: new Date().toISOString(),
            orderId: verifyData.orderId,
            paymentMethod,
            txnId: verifyData.txnId,
            unlimitedLifelines: true,
            vipHostsUnlocked: true,
            ultraQuestionsUnlocked: true,
          };

          // Save to local storage for persistence across reloads
          localStorage.setItem('triviaverse_subscription', JSON.stringify(updatedSubscription));
          onUpgradeSuccess(updatedSubscription);
          setStep('success');

          // Celebrate with gold confetti
          try {
            confetti({
              particleCount: 150,
              spread: 90,
              origin: { y: 0.5 },
              colors: ['#00baf2', '#002970', '#f59e0b', '#10b981'],
            });
          } catch (e) {}
        } catch (vErr: any) {
          setErrorMessage(vErr.message || 'Payment verification failed');
          setStep('checkout');
        }
      }, 1600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment initiation failed');
      setStep('checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Paytm Branded Styling */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-sky-950/50 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#002970] border border-[#00baf2]/40 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#00baf2]/20">
              <span className="text-[#00baf2] tracking-tighter">P</span>
              <span className="text-white text-xs font-bold ml-0.5">pay</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 font-['Cabinet_Grotesk']">
                  Paytm Secure Checkout
                </h3>
                <span className="text-[10px] font-bold bg-[#00baf2]/20 text-[#00baf2] border border-[#00baf2]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Merchant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unlock VIP Hosts, Unlimited Lifelines & 15-Question Championship Tournaments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* STEP 1: SELECT TIER */}
          {step === 'select' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-base">Select Your Pass</h4>
                  <p className="text-xs text-slate-400">Choose the pass that best fits your competitive trivia journey</p>
                </div>
                {/* Currency Switcher */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      currency === 'INR' ? 'bg-[#00baf2] text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      currency === 'USD' ? 'bg-[#00baf2] text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PREMIUM_TIERS.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  const price = currency === 'INR' ? `₹${tier.priceINR}` : `$${tier.priceUSD}`;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-[#00baf2] ring-2 ring-[#00baf2]/40 shadow-xl shadow-[#00baf2]/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {tier.badge && (
                        <span
                          className={`absolute -top-2.5 right-4 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-sm ${
                            tier.popular
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-indigo-600 text-white border-indigo-400'
                          }`}
                        >
                          {tier.badge}
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-amber-400" />
                          <h5 className="font-bold text-white text-base font-['Cabinet_Grotesk']">
                            {tier.name}
                          </h5>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white font-mono">{price}</span>
                          <span className="text-xs text-slate-400">/ one-time access</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{tier.description}</p>

                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          {tier.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectTier(tier)}
                        className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00baf2] to-sky-500 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Continue to Paytm Checkout</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CHECKOUT & PAYMENT METHOD SELECTION */}
          {step === 'checkout' && (
            <div className="space-y-6">
              {/* Back to tier select */}
              <button
                onClick={() => setStep('select')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                ← Change Selected Plan ({selectedTier.name})
              </button>

              {/* Order Summary Pill */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-sm">{selectedTier.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">Includes VIP Hosts & Unlimited Lifelines</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#00baf2] font-mono">
                    {currency === 'INR' ? `₹${selectedTier.priceINR}` : `$${selectedTier.priceUSD}`}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Total Due (All Taxes Incl.)</span>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select Payment Method (Powered by Paytm)
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setPaymentMethod('paytm')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'paytm'
                        ? 'bg-[#002970]/50 border-[#00baf2] text-[#00baf2] ring-2 ring-[#00baf2]/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-[#00baf2]" />
                    <span className="text-xs font-bold">Paytm Wallet</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'upi'
                        ? 'bg-[#002970]/50 border-[#00baf2] text-[#00baf2] ring-2 ring-[#00baf2]/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">Paytm UPI / QR</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-[#002970]/50 border-[#00baf2] text-[#00baf2] ring-2 ring-[#00baf2]/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold">Debit / Credit Card</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'netbanking'
                        ? 'bg-[#002970]/50 border-[#00baf2] text-[#00baf2] ring-2 ring-[#00baf2]/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-bold">Net Banking</span>
                  </button>
                </div>

                {/* Method Specific Form */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  {paymentMethod === 'paytm' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Registered Paytm Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <span className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-sm font-mono">
                          +91
                        </span>
                        <input
                          type="text"
                          value={paytmNumber}
                          onChange={(e) => setPaytmNumber(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#00baf2] outline-none"
                          placeholder="Enter 10-digit mobile number"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        A secure Paytm one-time authorization token will be generated for instant approval.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Paytm UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-[#00baf2] outline-none"
                        placeholder="yourname@paytm or yourname@okhdfcbank"
                      />
                      <p className="text-[11px] text-slate-400">
                        Accepts Paytm UPI, Google Pay, PhonePe, and BHIM QR.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                          placeholder="4532 •••• •••• 8821"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">CVV / Security Code</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 block">
                        Select Bank via Paytm NetBanking Portal
                      </label>
                      <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                        <option>Punjab National Bank</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Pay Now Button */}
              <button
                onClick={handleInitiatePayment}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00baf2] via-sky-500 to-[#002970] hover:from-sky-400 hover:to-sky-600 text-white font-black text-sm shadow-xl shadow-[#00baf2]/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Lock className="w-4 h-4" />
                <span>
                  Pay {currency === 'INR' ? `₹${selectedTier.priceINR}` : `$${selectedTier.priceUSD}`} via Paytm Gateway
                </span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span>PCI-DSS Level 1 Compliant</span>
                <span>•</span>
                <span>Instant VIP Activation</span>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING SIMULATION */}
          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#00baf2]/20 border-t-[#00baf2] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-[#00baf2]">
                  Paytm
                </div>
              </div>
              <h4 className="font-bold text-white text-base">Contacting Paytm Payment Network...</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Authenticating transaction token with Paytm PG. Please do not refresh this window.
              </p>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-black text-white text-xl font-['Cabinet_Grotesk']">
                  Payment Successful!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Transaction completed via Paytm Gateway. Your VIP perks are now active!
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="w-full max-w-sm p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Order ID:</span>
                  <span className="text-white">{orderData?.orderId || 'PAYTM_ORD_LIVE'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Plan Activated:</span>
                  <span className="text-emerald-400 font-bold">{selectedTier.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Amount Paid:</span>
                  <span className="text-white">
                    {currency === 'INR' ? `₹${selectedTier.priceINR}` : `$${selectedTier.priceUSD}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">TXN_SUCCESS (Code 01)</span>
                </div>
              </div>

              <div className="pt-2 w-full">
                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-[#00baf2] hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg transition-all"
                >
                  Return to Game & Play with VIP Hosts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

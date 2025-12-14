import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle2, Lock, Loader2, ArrowLeft, ShieldCheck, Wifi, Zap, Calendar, Infinity } from 'lucide-react';

interface PaymentGatewayProps {
  onComplete: () => void;
  onCancel: () => void;
}

// AzamPay supports these providers
type MobileProvider = 'Mpesa' | 'Tigo' | 'Airtel' | 'AzamPesa';
type PaymentMethod = 'mobile' | 'card';
type Currency = 'TZS' | 'USD';
type PlanType = 'monthly' | 'annual' | 'lifetime';

const PRICING = {
  TZS: {
    monthly: 20000,
    annual: 150000,
    lifetime: 1100000
  },
  USD: {
    monthly: 10,
    annual: 60, // $5/mo * 12
    lifetime: 440
  }
};

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ onComplete, onCancel }) => {
  const [currency, setCurrency] = useState<Currency>('TZS');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [method, setMethod] = useState<PaymentMethod>('mobile');
  const [provider, setProvider] = useState<MobileProvider>('Mpesa');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'awaiting_pin' | 'success' | 'error'>('idle');

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const prices = PRICING[currency];

  // Calculate savings for Annual plan
  const annualSavingValue = (prices.monthly * 12) - prices.annual;
  const annualSavingPercent = Math.round((annualSavingValue / (prices.monthly * 12)) * 100);

  const formatPrice = (amount: number) => {
    return currency === 'TZS' 
      ? `TZS ${amount.toLocaleString()}` 
      : `$${amount.toLocaleString()}`;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus('idle');

    // ---------------------------------------------------------
    // REAL WORLD INTEGRATION NOTE:
    // ---------------------------------------------------------
    // Payload would now include:
    // { 
    //   amount: prices[selectedPlan], 
    //   currency: currency, 
    //   plan: selectedPlan,
    //   mobile: phoneNumber, 
    //   provider: provider 
    // }
    // ---------------------------------------------------------

    setTimeout(() => {
      setPaymentStatus('awaiting_pin');
      setTimeout(() => {
        setPaymentStatus('success');
        setIsProcessing(false);
        setTimeout(() => {
          onComplete();
        }, 2500);
      }, 4000); 
    }, 1500); 
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-green-500/30 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(34,197,94,0.2)]">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h2>
          <p className="text-zinc-400 mb-6">You are now subscribed to the {selectedPlan} plan.<br/>Redirecting to calibration tools...</p>
          <Loader2 className="w-6 h-6 text-green-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
      {/* Left: Product & Pricing Selection */}
      <div className="lg:w-1/2 p-6 lg:p-12 bg-zinc-900 border-r border-white/5 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onCancel} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          {/* Currency Toggle */}
          <div className="flex bg-black rounded-lg p-1 border border-zinc-800">
            <button 
              onClick={() => setCurrency('TZS')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'TZS' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              TZS
            </button>
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              USD
            </button>
          </div>
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-black text-white mb-2">Select Your Plan</h1>
        <p className="text-zinc-400 mb-8">Choose the license that fits your workflow.</p>

        {/* Plan Cards */}
        <div className="space-y-4 mb-8 flex-1">
          {/* Monthly */}
          <button 
            onClick={() => setSelectedPlan('monthly')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
              selectedPlan === 'monthly' 
                ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-900/20' 
                : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${selectedPlan === 'monthly' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <span className={`font-bold ${selectedPlan === 'monthly' ? 'text-white' : 'text-zinc-300'}`}>Monthly</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">{formatPrice(prices.monthly)}</span>
                <span className="text-xs text-zinc-500 block">/mo</span>
              </div>
            </div>
          </button>

          {/* Annual */}
          <button 
            onClick={() => setSelectedPlan('annual')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
              selectedPlan === 'annual' 
                ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-900/20' 
                : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="absolute -top-3 right-4 bg-green-500 text-black text-[10px] font-black uppercase px-2 py-1 rounded-full">
              Most Popular
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${selectedPlan === 'annual' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span className={`font-bold ${selectedPlan === 'annual' ? 'text-white' : 'text-zinc-300'}`}>Annually</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">{formatPrice(prices.annual)}</span>
                <span className="text-xs text-zinc-500 block">/yr</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-white/10">
               <span className="text-xs text-green-400 font-medium">
                 Save {formatPrice(annualSavingValue)} ({annualSavingPercent}%)
               </span>
               <span className="text-xs text-zinc-500">
                 vs paying monthly
               </span>
            </div>
          </button>

          {/* Lifetime */}
          <button 
            onClick={() => setSelectedPlan('lifetime')}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all relative ${
              selectedPlan === 'lifetime' 
                ? 'bg-purple-600/10 border-purple-500 shadow-lg shadow-purple-900/20' 
                : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${selectedPlan === 'lifetime' ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Infinity className="w-4 h-4" />
                </div>
                <span className={`font-bold ${selectedPlan === 'lifetime' ? 'text-white' : 'text-zinc-300'}`}>Lifetime</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">{formatPrice(prices.lifetime)}</span>
                <span className="text-xs text-zinc-500 block">one-time</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Pay once, own it forever. Includes all future updates.
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure {currency === 'TZS' ? 'AzamPay' : 'Global'} Integration. SSL Encryption.</span>
        </div>
      </div>

      {/* Right: Payment Form */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>
          
          {/* Method Selection */}
          <div className="flex p-1 bg-zinc-900 rounded-xl mb-8 border border-zinc-800">
            <button
              onClick={() => setMethod('mobile')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                method === 'mobile' 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Mobile Money
            </button>
            <button
              onClick={() => setMethod('card')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                method === 'card' 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Card
            </button>
          </div>

          {method === 'mobile' ? (
             <form onSubmit={handlePay} className="space-y-6">
                
                {/* Network Selector */}
                <div className="grid grid-cols-2 gap-3">
                  {(['AzamPesa', 'Mpesa', 'Tigo', 'Airtel'] as MobileProvider[]).map((p) => {
                    let activeClass = '';
                    if (p === 'Mpesa') activeClass = 'bg-red-500/10 border-red-500 text-red-500';
                    if (p === 'Tigo') activeClass = 'bg-blue-500/10 border-blue-500 text-blue-500';
                    if (p === 'Airtel') activeClass = 'bg-red-600/10 border-red-600 text-red-600';
                    if (p === 'AzamPesa') activeClass = 'bg-blue-400/10 border-blue-400 text-blue-400';

                    const isSelected = provider === p;

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProvider(p)}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                          isSelected 
                            ? activeClass 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        <span className="font-bold text-sm">{p}</span>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">
                    {provider} Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-zinc-400 font-mono">
                      {currency === 'TZS' ? '+255' : '+'}
                    </span>
                    <input 
                      type="tel" 
                      placeholder={currency === 'TZS' ? "700 000 000" : "Mobile Number"}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      disabled={paymentStatus === 'awaiting_pin'}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-16 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono disabled:opacity-50"
                    />
                  </div>
                </div>

                {paymentStatus === 'awaiting_pin' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3 animate-pulse">
                    <Wifi className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-yellow-500 font-bold text-sm">Check your phone</h4>
                      <p className="text-yellow-200/60 text-xs mt-1">
                        We sent a prompt to {phoneNumber}. Please enter your PIN to confirm the transaction.
                      </p>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isProcessing || paymentStatus === 'awaiting_pin'}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    isProcessing || paymentStatus === 'awaiting_pin'
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isProcessing ? (
                    <>Processing <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : paymentStatus === 'awaiting_pin' ? (
                     <>Waiting for PIN...</>
                  ) : (
                    <>Pay {formatPrice(prices[selectedPlan])} <Lock className="w-4 h-4" /></>
                  )}
                </button>
             </form>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Card Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
                  />
                  <CreditCard className="absolute right-4 top-3.5 w-5 h-5 text-zinc-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Expiry</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">CVC</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
                  />
                </div>
              </div>
              <button 
                  type="submit" 
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mt-8 transition-all ${
                    isProcessing 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isProcessing ? (
                    <>Processing <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Pay {formatPrice(prices[selectedPlan])} <Lock className="w-4 h-4" /></>
                  )}
                </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
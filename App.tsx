import React, { useState, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShieldCheck, Upload, AlertCircle, CheckCircle2, ExternalLink, Clock, DollarSign, ChevronRight, Package, FileText, Menu, X } from 'lucide-react';
import { Button } from './components/Button';
import { StepIndicator } from './components/StepIndicator';
import { MOCK_PRODUCTS, MOCK_CAMPAIGNS } from './constants';
import { Product, UserCampaign, SubmissionStatus } from './types';
import { verifyScreenshot, fileToGenerativePart } from './services/geminiService';

// --- Utility Functions ---

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- Components defined internally to keep file count low while maintaining structure ---

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary-600 p-1.5 rounded-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">ShopKaro</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-primary-600 transition-colors">Browse Products</Link>
          <Link to="/my-claims" className="hover:text-primary-600 transition-colors">My Claims & Wallet</Link>
          <a href="#" className="hover:text-primary-600 transition-colors">How it Works</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">Welcome back</p>
            <p className="text-sm font-semibold text-slate-800">Tester User</p>
          </div>
          <div className="h-9 w-9 bg-slate-200 rounded-full overflow-hidden border border-slate-300 shrink-0">
            <img src="https://picsum.photos/100/100?random=user" alt="User" className="h-full w-full object-cover" />
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 -mr-2 text-slate-500 hover:text-slate-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col p-4 gap-4 text-base font-medium text-slate-700">
             <div className="flex items-center justify-between pb-4 border-b border-slate-100">
               <span>Signed in as <strong>Tester User</strong></span>
             </div>
            <Link to="/" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
              <LayoutDashboard size={20} /> Browse Products
            </Link>
            <Link to="/my-claims" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
              <FileText size={20} /> My Claims & Wallet
            </Link>
            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
              <CheckCircle2 size={20} /> How it Works
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
    <div className="relative h-48 bg-slate-100">
      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm text-slate-700">
        {product.platform}
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <div className="text-xs font-semibold text-primary-600 mb-1">{product.category}</div>
      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{product.name}</h3>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-500">Price</p>
          <p className="font-medium text-slate-900">{formatCurrency(product.price)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Rebate</p>
          <p className="font-bold text-green-600">{formatCurrency(product.rebate)}</p>
        </div>
      </div>
      <Link to={`/product/${product.id}`} className="mt-4 block">
        <Button className="w-full">View Offer</Button>
      </Link>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Available Products</h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">Claim a product, leave a review, and get up to 100% cashback.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

// --- Complex Campaign View with AI Verification ---

const CampaignView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  
  // Use mock data if available for this product, otherwise default state
  const [campaign, setCampaign] = useState<UserCampaign>(() => {
    const existing = MOCK_CAMPAIGNS.find(c => c.productId === id);
    if (existing) return existing;
    
    return {
      id: `camp_${id}_new`,
      productId: id || '',
      userId: 'user_1',
      status: SubmissionStatus.AVAILABLE,
      updatedAt: new Date()
    };
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const handleClaim = () => {
    setCampaign(prev => ({ ...prev, status: SubmissionStatus.CLAIMED, payoutAmount: product.rebate, payoutStatus: 'PENDING' }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'ORDER' | 'REVIEW') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Convert to Base64 for preview and API
      const base64 = await fileToGenerativePart(file);
      
      // 2. AI Verification
      const verification = await verifyScreenshot(base64, type, product.name, product.platform);

      if (verification.valid) {
        setSuccessMsg(`Verified! ${verification.detectedText ? `Detected: ${verification.detectedText}` : ''}`);
        
        // Update State based on type
        if (type === 'ORDER') {
          setCampaign(prev => ({
            ...prev,
            status: SubmissionStatus.ORDER_VERIFIED, // Skipping 'SUBMITTED' for smoother UX in demo
            orderScreenshot: base64,
            orderVerified: true
          }));
        } else {
          setCampaign(prev => ({
            ...prev,
            status: SubmissionStatus.COMPLETED,
            reviewScreenshot: base64,
            reviewVerified: true,
            payoutStatus: 'PROCESSING'
          }));
        }
      } else {
        setErrorMsg(`Verification Failed: ${verification.reason}`);
      }
    } catch (err) {
      setErrorMsg("An error occurred while processing the image.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 text-sm mb-4 flex items-center gap-1">
        &larr; Back
      </button>

      {/* Product Header */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 md:gap-8 mb-6 md:mb-8">
        <div className="w-full md:w-1/3 aspect-square bg-slate-100 rounded-xl overflow-hidden shrink-0">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold uppercase tracking-wide">
              {product.platform}
            </span>
            {/* Direct Link in Header */}
            <a href={product.purchaseUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
               View Product <ExternalLink size={10} />
            </a>
            <span className="text-xs md:text-sm text-slate-500 ml-auto">ID: #{product.id}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{product.name}</h1>
          <p className="text-sm md:text-base text-slate-600 mb-6">{product.description}</p>
          
          <div className="flex flex-row flex-wrap items-center gap-4 md:gap-8 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100 justify-between md:justify-start">
            <div>
              <p className="text-xs md:text-sm text-slate-500">You Pay</p>
              <p className="text-lg md:text-xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-300"></div>
            <div>
              <p className="text-xs md:text-sm text-slate-500">Rebate</p>
              <p className="text-lg md:text-xl font-bold text-green-600">{formatCurrency(product.rebate)}</p>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-300"></div>
             <div>
              <p className="text-xs md:text-sm text-slate-500">Net Cost</p>
              <p className="text-lg md:text-xl font-bold text-primary-600">{formatCurrency(product.price - product.rebate)}</p>
            </div>
          </div>

          {campaign.status === SubmissionStatus.AVAILABLE && (
            <Button size="lg" onClick={handleClaim} className="w-full md:w-auto">
              Claim Offer Now
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Area */}
      {campaign.status !== SubmissionStatus.AVAILABLE && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-bold text-slate-900 mb-2">Submission Status</h2>
            <div className="overflow-x-auto pb-2">
               <StepIndicator status={campaign.status} />
            </div>
          </div>

          <div className="p-4 md:p-8 bg-slate-50/50">
            {/* Step 2: Upload Order */}
            {campaign.status === SubmissionStatus.CLAIMED && (
              <div className="max-w-xl mx-auto text-center">
                
                {/* Direct Purchase Button */}
                <div className="mb-8">
                  <h3 className="text-base md:text-lg font-semibold mb-3">Step 1: Purchase Product</h3>
                  <a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer" className="block w-full sm:inline-block">
                    <Button size="lg" className="w-full sm:w-auto gap-2 shadow-sm transform transition-all hover:-translate-y-0.5">
                      <ShoppingBag size={18} />
                      Buy on {product.platform}
                      <ExternalLink size={16} className="opacity-70" />
                    </Button>
                  </a>
                  <p className="text-xs text-slate-500 mt-2">Opens in a new tab</p>
                </div>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-xs md:text-sm flex items-start gap-3 text-left">
                  <AlertCircle className="shrink-0 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-bold">Instructions:</p>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>Click the button above to visit the product page on <strong>{product.platform}</strong>.</li>
                      <li>Purchase the product exactly as described.</li>
                      <li>Take a screenshot of your "Order Confirmed" page showing the Order ID and Price.</li>
                    </ul>
                  </div>
                </div>
                
                <h3 className="text-base md:text-lg font-semibold mb-3">Step 2: Upload Proof</h3>
                <label className="block p-6 md:p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer bg-white group">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ORDER')} disabled={isProcessing} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Upload className="text-slate-400 group-hover:text-primary-600" />
                    </div>
                    <div className="text-slate-600 font-medium text-sm md:text-base">Click to upload Order Screenshot</div>
                    <div className="text-xs text-slate-400">Supports JPG, PNG (Max 5MB)</div>
                  </div>
                </label>
              </div>
            )}

            {/* Step 3: Wait for delivery / Upload Review */}
            {(campaign.status === SubmissionStatus.ORDER_VERIFIED || campaign.status === SubmissionStatus.REVIEW_SUBMITTED) && (
              <div className="max-w-xl mx-auto text-center">
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">Order Verified!</h3>
                  <p className="text-sm md:text-base text-slate-500">Wait for your product to arrive, then leave a review.</p>
                </div>

                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 text-xs md:text-sm flex items-start gap-3 text-left">
                  <AlertCircle className="shrink-0 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-bold">Review Instructions:</p>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>Use the product for at least 2 days.</li>
                      <li>Post an honest review on {product.platform}.</li>
                      <li>Take a screenshot of the <strong>published</strong> review.</li>
                    </ul>
                  </div>
                </div>

                 <label className="block p-6 md:p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer bg-white group">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'REVIEW')} disabled={isProcessing} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Upload className="text-slate-400 group-hover:text-primary-600" />
                    </div>
                    <div className="text-slate-600 font-medium text-sm md:text-base">Click to upload Review Screenshot</div>
                  </div>
                </label>
              </div>
            )}

            {/* Step 4: Complete */}
            {campaign.status === SubmissionStatus.COMPLETED && (
              <div className="text-center py-8">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200">
                  <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">All Done!</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm md:text-base">
                  Your review has been verified by our AI system. Your rebate of <strong className="text-green-600">{formatCurrency(product.rebate)}</strong> is {campaign.payoutStatus === 'PAID' ? 'paid' : 'processing'}.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                  <Button variant="outline" onClick={() => navigate('/')}>Find More Products</Button>
                  <Button onClick={() => navigate('/my-claims')}>Check Wallet</Button>
                </div>
              </div>
            )}

            {/* Feedback Messages */}
            {isProcessing && (
              <div className="mt-6 flex items-center justify-center text-primary-600 gap-2 animate-pulse font-medium text-sm md:text-base">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-150"></div>
                AI is analyzing your screenshot...
              </div>
            )}
            
            {errorMsg && (
              <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 text-sm text-center">
                {errorMsg}
              </div>
            )}
            
            {successMsg && !isProcessing && (
              <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-lg border border-green-100 text-sm text-center">
                {successMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MyClaims = () => {
  // Combine campaign data with product data
  const myClaims = useMemo(() => {
    return MOCK_CAMPAIGNS.map(campaign => {
      const product = MOCK_PRODUCTS.find(p => p.id === campaign.productId);
      return { ...campaign, product };
    }).filter(item => item.product); // Filter out any detached campaigns
  }, []);

  const totalEarned = myClaims
    .filter(c => c.payoutStatus === 'PAID')
    .reduce((sum, c) => sum + (c.payoutAmount || 0), 0);
  
  const pendingPayout = myClaims
    .filter(c => c.payoutStatus === 'PROCESSING' || c.payoutStatus === 'PENDING')
    .reduce((sum, c) => sum + (c.payoutAmount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Claims & Wallet</h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Track your orders, reviews, and rebate payments.</p>
        </div>
        
        {/* Wallet Summary Cards */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:flex">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 min-w-[140px]">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-xl md:text-2xl font-bold text-slate-700">{formatCurrency(pendingPayout)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100 min-w-[140px]">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Paid Out</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">{formatCurrency(totalEarned)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        {myClaims.map((item) => {
          if (!item.product) return null;

          // Determine status visuals
          let statusColor = "bg-slate-100 text-slate-600";
          let statusText = "Unknown";
          let actionButton = null;

          switch(item.status) {
            case SubmissionStatus.CLAIMED:
            case SubmissionStatus.ORDER_SUBMITTED:
              statusColor = "bg-blue-50 text-blue-700 border border-blue-100";
              statusText = "Order Proof Needed";
              actionButton = (
                <Link to={`/product/${item.product.id}`} className="w-full md:w-auto">
                  <Button size="sm" className="whitespace-nowrap w-full md:w-auto">Upload Order</Button>
                </Link>
              );
              break;
            case SubmissionStatus.ORDER_VERIFIED:
              statusColor = "bg-yellow-50 text-yellow-700 border border-yellow-100";
              statusText = "Review Needed";
              actionButton = (
                <Link to={`/product/${item.product.id}`} className="w-full md:w-auto">
                  <Button size="sm" variant="secondary" className="whitespace-nowrap w-full md:w-auto">Upload Review</Button>
                </Link>
              );
              break;
            case SubmissionStatus.COMPLETED:
              if (item.payoutStatus === 'PAID') {
                statusColor = "bg-green-50 text-green-700 border border-green-100";
                statusText = "Paid";
              } else {
                statusColor = "bg-purple-50 text-purple-700 border border-purple-100";
                statusText = "Payment Processing";
              }
              break;
          }

          return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
              {/* Product Image */}
              <div className="w-full md:w-48 aspect-video md:aspect-square bg-slate-100 shrink-0 relative">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                  {item.product.platform}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 line-clamp-1">{item.product.name}</h3>
                    <div className="text-right shrink-0 ml-4">
                      <div className="font-bold text-slate-900">{formatCurrency(item.payoutAmount || 0)}</div>
                      <div className="text-xs text-slate-400">Rebate</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusColor}`}>
                       {item.status === SubmissionStatus.COMPLETED && item.payoutStatus === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                       {statusText}
                     </span>
                     {item.payoutDate && (
                       <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                         Paid on {item.payoutDate}
                       </span>
                     )}
                  </div>
                  
                  {/* Progress Visualization */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                     <div 
                      className={`h-2 rounded-full transition-all duration-500 ${item.status === SubmissionStatus.COMPLETED ? 'bg-green-500' : 'bg-primary-500'}`} 
                      style={{ 
                        width: 
                          item.status === SubmissionStatus.AVAILABLE ? '0%' :
                          item.status === SubmissionStatus.CLAIMED ? '33%' :
                          item.status === SubmissionStatus.ORDER_VERIFIED ? '66%' : '100%' 
                      }}
                     ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                    <span>Order</span>
                    <span>Review</span>
                    <span>Pay</span>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                   <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      Last updated: {item.updatedAt.toLocaleDateString()}
                   </div>
                   <div className="flex gap-3 w-full md:w-auto">
                     {actionButton}
                     {item.status === SubmissionStatus.COMPLETED && (
                        <Button size="sm" variant="outline" disabled className="w-full md:w-auto">
                          Receipt
                        </Button>
                     )}
                   </div>
                </div>
              </div>
            </div>
          );
        })}

        {myClaims.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
               <Package size={24} />
             </div>
             <h3 className="text-slate-900 font-medium">No claims yet</h3>
             <p className="text-slate-500 text-sm mt-1 mb-4">Start by browsing products to claim offers.</p>
             <Link to="/">
               <Button>Browse Products</Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/product/:id" element={<CampaignView />} />
            <Route path="/my-claims" element={<MyClaims />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
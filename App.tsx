import React, { useState, useEffect } from 'react';
import { FormData, DesignResult, LoadingState, User } from './types';
import { generateDesignImage, generateFurnitureList } from './services/geminiService';
import RenovationForm from './components/RenovationForm';
import ResultsView from './components/ResultsView';
import ArAssistant from './components/ArAssistant';
import BackgroundMusic from './components/BackgroundMusic';
import AuthPage from './components/AuthPage';
import { LayoutTemplate, AlertTriangle, PenTool, Camera, Sparkles, LogOut, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'design' | 'ar'>('design');

  // Design Mode State
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<DesignResult>({ imageUrl: null, furnitureData: null });
  const [error, setError] = useState<string | null>(null);

  // AR Mode State
  const [arHasResult, setArHasResult] = useState(false);

  // UI State
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check for persisted user session (Simulation)
  useEffect(() => {
    const savedUser = localStorage.getItem('smartDecoUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('smartDecoUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smartDecoUser');
    // Reset App State
    setResult({ imageUrl: null, furnitureData: null });
    setLoadingState(LoadingState.IDLE);
    setActiveTab('design');
    setArHasResult(false);
  };

  const handleFormSubmit = async (data: FormData) => {
    setLoadingState(LoadingState.GENERATING_IMAGE);
    setError(null);
    setResult({ imageUrl: null, furnitureData: null });
    window.scrollTo({ top: 100, behavior: 'smooth' });

    try {
      setLoadingState(LoadingState.GENERATING_IMAGE);
      const imageUrl = await generateDesignImage(data);
      setResult(prev => ({ ...prev, imageUrl }));

      setLoadingState(LoadingState.GENERATING_LIST);
      const furnitureData = await generateFurnitureList(data);
      setResult(prev => ({ ...prev, furnitureData }));
      setLoadingState(LoadingState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message?.includes("API_KEY") 
        ? "配置错误: 缺少 API Key。请在部署设置中配置环境变量。" 
        : "抱歉，生成方案时遇到了一些问题。请稍后重试。";
      setError(errorMessage);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const resetDesign = () => {
    setLoadingState(LoadingState.IDLE);
    setResult({ imageUrl: null, furnitureData: null });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Music Logic
  const shouldPlayMusic = (user !== null) && (
    (activeTab === 'design' && (!!result.imageUrl || !!result.furnitureData)) || 
    (activeTab === 'ar' && arHasResult)
  );

  // --- Render Auth Page if not logged in ---
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // --- Render Main App if logged in ---
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-700 animate-fade-in">
      
      <BackgroundMusic shouldPlay={shouldPlayMusic} />

      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled || loadingState !== LoadingState.IDLE ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className={`p-2 rounded-lg transition-colors ${scrolled || loadingState !== LoadingState.IDLE ? 'bg-indigo-600' : 'bg-white/20 backdrop-blur-sm'}`}>
              <LayoutTemplate className={`w-5 h-5 ${scrolled || loadingState !== LoadingState.IDLE ? 'text-white' : 'text-white'}`} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled || loadingState !== LoadingState.IDLE ? 'text-slate-800' : 'text-white'}`}>
              SmartDeco<span className="text-indigo-500">.AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
             <div className="hidden md:flex items-center gap-8">
                <button 
                    onClick={() => setActiveTab('design')}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${scrolled || loadingState !== LoadingState.IDLE ? 'text-slate-600' : 'text-white/90'} ${activeTab === 'design' ? 'text-indigo-500 font-bold' : 'hover:text-indigo-400'}`}
                >
                    <PenTool className="w-4 h-4" /> 智能设计
                </button>
                <button 
                    onClick={() => setActiveTab('ar')}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${scrolled || loadingState !== LoadingState.IDLE ? 'text-slate-600' : 'text-white/90'} ${activeTab === 'ar' ? 'text-indigo-500 font-bold' : 'hover:text-indigo-400'}`}
                >
                    <Camera className="w-4 h-4" /> AR 实景
                </button>
             </div>

             {/* User Profile Dropdown */}
             <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                    scrolled || loadingState !== LoadingState.IDLE 
                      ? 'bg-slate-100 hover:bg-slate-200' 
                      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white'
                  }`}
                >
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full border border-white/50" />
                  <span className="text-sm font-bold max-w-[80px] truncate">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden animate-fade-in origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> 个人资料
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> 退出登录
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>
      </nav>

      {/* Backdrop for closing menu */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
      )}

      <main className="flex-grow">
        
        {/* HERO SECTION */}
        {loadingState === LoadingState.IDLE && (
          <section className="relative min-h-[100vh] flex items-center pt-24 pb-20 lg:pt-0 lg:pb-0">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 transition-all duration-700 ease-in-out">
              <img 
                src={activeTab === 'design' 
                  ? "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80"
                  : "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80"
                }
                alt="Interior Background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Text */}
              <div className="text-white space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-indigo-200">
                  <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                  {activeTab === 'design' ? 'AI 户型分析引擎' : '计算机视觉 AR 引擎'}
                </div>
                
                {activeTab === 'design' ? (
                  <>
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                      预见您的 <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">梦想家园</span>
                    </h1>
                    <p className="text-lg text-slate-200 max-w-lg leading-relaxed font-light">
                      Hi, {user.name}。输入户型数据，一键生成全屋设计方案与高性价比家具清单。
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                      实景重塑 <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">所见即所得</span>
                    </h1>
                    <p className="text-lg text-slate-200 max-w-lg leading-relaxed font-light">
                      上传房间照片，AI 即刻为您进行虚拟装修，体验不同风格的居住可能。
                    </p>
                  </>
                )}

                {/* Mobile Tab Switcher */}
                <div className="flex md:hidden bg-white/10 backdrop-blur-md rounded-xl p-1 w-full max-w-sm border border-white/10">
                  <button 
                    onClick={() => setActiveTab('design')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'design' ? 'bg-white text-indigo-900 shadow-lg' : 'text-slate-300'}`}
                  >
                    智能设计
                  </button>
                  <button 
                    onClick={() => setActiveTab('ar')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'ar' ? 'bg-white text-violet-900 shadow-lg' : 'text-slate-300'}`}
                  >
                    AR 实景
                  </button>
                </div>
              </div>

              {/* Interaction Area */}
              <div className="animate-fade-in-up delay-100 flex justify-center lg:justify-end">
                {activeTab === 'design' ? (
                  <RenovationForm onSubmit={handleFormSubmit} isSubmitting={false} />
                ) : (
                  <ArAssistant onResultChange={setArHasResult} />
                )}
              </div>
            </div>
          </section>
        )}

        {/* LOADING & RESULTS VIEW (Design Mode) */}
        {activeTab === 'design' && (loadingState !== LoadingState.IDLE || result.furnitureData) && (
          <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
             <div className="container mx-auto px-6">
                
                {error && (
                  <div className="max-w-2xl mx-auto mb-8 p-6 bg-red-50 text-red-700 rounded-xl shadow-sm border border-red-200 flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                       <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-lg mb-1">出错了</h4>
                       <p className="text-sm opacity-90">{error}</p>
                       <button onClick={resetDesign} className="text-sm font-semibold underline mt-3 hover:text-red-900">返回重试</button>
                    </div>
                  </div>
                )}

                {(loadingState === LoadingState.GENERATING_IMAGE || loadingState === LoadingState.GENERATING_LIST) && !result.imageUrl && !error && (
                  <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">正在构想设计方案...</h2>
                    <p className="text-slate-500">AI 设计师正在分析您的户型数据</p>
                  </div>
                )}

                {loadingState === LoadingState.GENERATING_LIST && result.imageUrl && !error && (
                   <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <h3 className="text-xl font-bold text-slate-800">正在生成详细清单...</h3>
                      <p className="text-slate-500">包含材质与尺寸建议</p>
                   </div>
                )}

                {(result.imageUrl || result.furnitureData) && !error && (
                  <ResultsView result={result} loadingState={loadingState} reset={resetDesign} />
                )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { FormData, DesignResult, LoadingState } from './types';
import { generateDesignImage, generateFurnitureList } from './services/geminiService';
import RenovationForm from './components/RenovationForm';
import ArAssistant from './components/ArAssistant';
import ResultsView from './components/ResultsView';
import BackgroundMusic from './components/BackgroundMusic';
import { LayoutTemplate, CheckCircle2, Zap, DollarSign, Instagram, Twitter, Facebook, Camera, PenTool, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<DesignResult>({ imageUrl: null, furnitureData: null });
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'ar'>('design');
  const [arHasResult, setArHasResult] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFormSubmit = async (data: FormData) => {
    setLoadingState(LoadingState.GENERATING_IMAGE);
    setError(null);
    setResult({ imageUrl: null, furnitureData: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });

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

  const reset = () => {
    setLoadingState(LoadingState.IDLE);
    setResult({ imageUrl: null, furnitureData: null });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine when to play music:
  // 1. In Design mode: when results (image or furniture list) are showing.
  // 2. In AR mode: when AR result is showing.
  const shouldPlayMusic = (activeTab === 'design' && (!!result.imageUrl || !!result.furnitureData)) || 
                          (activeTab === 'ar' && arHasResult);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-700">
      
      <BackgroundMusic shouldPlay={shouldPlayMusic} />

      {/* Website Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled || loadingState !== LoadingState.IDLE ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className={`p-2 rounded-lg transition-colors ${scrolled || loadingState !== LoadingState.IDLE ? 'bg-indigo-600' : 'bg-white/20 backdrop-blur-sm'}`}>
              <LayoutTemplate className={`w-5 h-5 ${scrolled || loadingState !== LoadingState.IDLE ? 'text-white' : 'text-white'}`} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled || loadingState !== LoadingState.IDLE ? 'text-slate-800' : 'text-white'}`}>
              SmartDeco<span className="text-indigo-500">.AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('design')}
              className={`text-sm font-medium hover:text-indigo-500 transition-colors ${scrolled || loadingState !== LoadingState.IDLE ? 'text-slate-600' : 'text-white/90'} ${activeTab === 'design' ? 'underline decoration-2 underline-offset-4 decoration-indigo-500' : ''}`}
            >
              智能设计
            </button>
            <button 
              onClick={() => setActiveTab('ar')}
              className={`text-sm font-medium hover:text-indigo-500 transition-colors ${scrolled || loadingState !== LoadingState.IDLE ? 'text-slate-600' : 'text-white/90'} ${activeTab === 'ar' ? 'underline decoration-2 underline-offset-4 decoration-indigo-500' : ''}`}
            >
              AR 实景改造
            </button>
            <a href="#" className={`text-sm font-medium hover:text-indigo-500 transition-colors ${scrolled || loadingState !== LoadingState.IDLE ? 'text-slate-600' : 'text-white/90'}`}>关于我们</a>
            <button className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              scrolled || loadingState !== LoadingState.IDLE 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg' 
                : 'bg-white text-indigo-900 hover:bg-indigo-50'
            }`}>
              立即体验
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* HERO SECTION (Visible when IDLE) */}
        {loadingState === LoadingState.IDLE && (
          <>
            <section className="relative min-h-[100vh] flex items-center pt-24 pb-20 lg:pt-0 lg:pb-0">
              {/* Background Image */}
              <div className="absolute inset-0 z-0 transition-opacity duration-700">
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
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    AI 驱动的室内设计革命
                  </div>
                  
                  {activeTab === 'design' ? (
                    <>
                      <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                        预见您的 <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">梦想家园</span>
                      </h1>
                      <p className="text-lg md:text-xl text-slate-200 max-w-lg leading-relaxed font-light">
                        输入户型与需求，AI 即可为您生成专业级装修效果图与最省钱的采购清单。
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
                        一键翻新 <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">实景重塑</span>
                      </h1>
                      <p className="text-lg md:text-xl text-slate-200 max-w-lg leading-relaxed font-light">
                        拍摄房间照片，选择您喜欢的风格，AI 立即为您在原场景上进行虚拟装修，所见即所得。
                      </p>
                    </>
                  )}

                  {/* Mode Switcher Buttons */}
                  <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1 w-fit border border-white/10">
                    <button 
                      onClick={() => setActiveTab('design')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'design' ? 'bg-white text-indigo-900 shadow-lg' : 'text-slate-300 hover:text-white'}`}
                    >
                      <PenTool className="w-4 h-4" /> 户型设计
                    </button>
                    <button 
                      onClick={() => setActiveTab('ar')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'ar' ? 'bg-white text-violet-900 shadow-lg' : 'text-slate-300 hover:text-white'}`}
                    >
                      <Camera className="w-4 h-4" /> AR 改造
                    </button>
                  </div>
                </div>

                {/* Interaction Card */}
                <div className="animate-fade-in-up delay-100 flex justify-center lg:justify-end">
                  {activeTab === 'design' ? (
                    <RenovationForm onSubmit={handleFormSubmit} isSubmitting={false} />
                  ) : (
                    <ArAssistant onResultChange={setArHasResult} />
                  )}
                </div>
              </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-24 bg-white">
              <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">全能 AI 装修管家</h2>
                  <p className="text-slate-600">从灵感构思到实景模拟，我们为您提供全流程的智能辅助。</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                  {[
                    {
                      icon: <PenTool className="w-8 h-8 text-indigo-600" />,
                      title: "0 门槛设计",
                      desc: "无需任何专业知识，只需输入简单的户型和偏好，即可获得大师级设计方案。"
                    },
                    {
                      icon: <Camera className="w-8 h-8 text-violet-600" />,
                      title: "AR 实景增强",
                      desc: "利用计算机视觉技术，直接在您的照片上生成装修效果，真实感 100%。"
                    },
                    {
                      icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
                      title: "智能比价预算",
                      desc: "AI 自动为您筛选最具性价比的家具组合，让每一分预算都花在刀刃上。"
                    }
                  ].map((feature, idx) => (
                    <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow duration-300 group">
                      <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* LOADING & RESULTS VIEW (Only for Design Mode) */}
        {(loadingState !== LoadingState.IDLE || result.furnitureData) && (
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
                       <button onClick={reset} className="text-sm font-semibold underline mt-3 hover:text-red-900">返回重试</button>
                    </div>
                  </div>
                )}

                {(loadingState === LoadingState.GENERATING_IMAGE || loadingState === LoadingState.GENERATING_LIST) && !result.imageUrl && !error && (
                  <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutTemplate className="w-8 h-8 text-indigo-600/50" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-2">正在构想您的空间...</h2>
                    <p className="text-slate-500">AI 正在分析户型数据并绘制设计图</p>
                  </div>
                )}

                {loadingState === LoadingState.GENERATING_LIST && result.imageUrl && !error && (
                   <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <h3 className="text-xl font-bold text-slate-800">正在计算最优家具预算...</h3>
                      <p className="text-slate-500">已为您生成效果图，正在比价中</p>
                   </div>
                )}

                {(result.imageUrl || result.furnitureData) && !error && (
                  <ResultsView result={result} loadingState={loadingState} reset={reset} />
                )}
             </div>
          </div>
        )}

      </main>

      {/* Website Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <LayoutTemplate className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SmartDeco.AI</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                致力于用人工智能技术改善每一个人的居住体验。让装修变得简单、透明、充满乐趣。
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">功能介绍</a></li>
                <li><a href="#" className="hover:text-white transition-colors">设计案例</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API 接入</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">公司</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系方式</a></li>
                <li><a href="#" className="hover:text-white transition-colors">加入我们</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">关注我们</h4>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 transition-colors"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-indigo-600 transition-colors"><Instagram className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
             <p>&copy; {new Date().getFullYear()} SmartDeco AI. All rights reserved.</p>
             <div className="flex gap-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-white">隐私政策</a>
               <a href="#" className="hover:text-white">服务条款</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { User } from '../types';
import { LayoutTemplate, ArrowRight, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      setIsLoading(false);
      
      // Simple Mock Validation
      if (!email.includes('@') || password.length < 6) {
        setError("请输入有效的邮箱地址，密码至少6位。");
        return;
      }

      // Mock User Data
      const mockUser: User = {
        id: Date.now().toString(),
        name: isLoginMode ? '设计师用户' : name || '新用户',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      };

      onLogin(mockUser);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000" 
          alt="Interior Design" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2 text-white">
             <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                <LayoutTemplate className="w-6 h-6" />
             </div>
             <span className="text-2xl font-bold tracking-tight">SmartDeco<span className="text-indigo-400">.AI</span></span>
          </div>

          <div className="space-y-6">
             <h1 className="text-5xl font-bold text-white leading-tight">
               设计未来的<br/>居住空间
             </h1>
             <p className="text-lg text-slate-300 max-w-md">
               结合生成式 AI 与 AR 技术，为您提供从灵感到落地的全流程装修解决方案。
             </p>
             
             <div className="flex gap-4 pt-4">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  ))}
                </div>
                <div className="text-white">
                   <p className="font-bold">10,000+</p>
                   <p className="text-xs text-slate-400">位设计师正在使用</p>
                </div>
             </div>
          </div>

          <div className="text-slate-500 text-sm">
            © 2024 SmartDeco AI. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white animate-fade-in-up">
        <div className="w-full max-w-md space-y-8">
           <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-slate-900">
                {isLoginMode ? '欢迎回来' : '创建账号'}
              </h2>
              <p className="mt-2 text-slate-500">
                {isLoginMode ? '请输入您的账号以继续使用 AR 设计功能' : '免费注册，开始您的智能装修之旅'}
              </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              {!isLoginMode && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
                   <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        required={!isLoginMode}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="您的称呼"
                      />
                   </div>
                </div>
              )}

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">电子邮箱</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      placeholder="name@example.com"
                    />
                 </div>
              </div>

              <div>
                 <div className="flex justify-between mb-1">
                   <label className="block text-sm font-medium text-slate-700">密码</label>
                   {isLoginMode && <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">忘记密码?</a>}
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                   {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> 
                    {isLoginMode ? '登录中...' : '注册中...'}
                  </>
                ) : (
                  <>
                    {isLoginMode ? '立即登录' : '创建账户'} 
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
           </form>

           <div className="text-center">
              <p className="text-slate-500 text-sm">
                {isLoginMode ? "还没有账号？" : "已有账号？"}
                <button 
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="ml-2 font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  {isLoginMode ? "立即注册" : "直接登录"}
                </button>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
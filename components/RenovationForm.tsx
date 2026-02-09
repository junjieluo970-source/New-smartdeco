import React, { useState } from 'react';
import { FormData } from '../types';
import { Home, Ruler, Compass, Palette, ArrowRight } from 'lucide-react';

interface RenovationFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

const RenovationForm: React.FC<RenovationFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<FormData>({
    layout: '两室一厅',
    area: 90,
    orientation: '南',
    style: '现代简约',
    budget: '经济型'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'area' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 w-full max-w-md mx-auto">
      <div className="mb-6">
         <h2 className="text-2xl font-bold text-slate-800">开始设计</h2>
         <p className="text-slate-500 text-sm mt-1">填写房屋信息，立即获取AI设计方案</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Layout */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            户型结构
          </label>
          <div className="relative">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="layout"
              value={formData.layout}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
            >
              <option value="一室一厅">一室一厅 (1 Bedroom)</option>
              <option value="两室一厅">两室一厅 (2 Bedrooms)</option>
              <option value="三室两厅">三室两厅 (3 Bedrooms)</option>
              <option value="单身公寓">单身公寓 (Studio)</option>
              <option value="Loft复式">Loft 复式</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {/* Area */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                面积 (㎡)
              </label>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  min={10}
                  max={500}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Orientation */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                朝向
              </label>
              <div className="relative">
                <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="orientation"
                  value={formData.orientation}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
                >
                  <option value="南">朝南</option>
                  <option value="北">朝北</option>
                  <option value="东">朝东</option>
                  <option value="西">朝西</option>
                  <option value="南北">南北</option>
                </select>
              </div>
            </div>
        </div>

        {/* Style */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
             装修风格
          </label>
          <div className="relative">
            <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="style"
              value={formData.style}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
            >
              <option value="现代简约">现代简约 (Modern)</option>
              <option value="北欧风格">北欧风格 (Nordic)</option>
              <option value="日式原木">日式原木 (Japanese)</option>
              <option value="轻奢风格">轻奢风格 (Luxury)</option>
              <option value="工业风">工业风 (Industrial)</option>
              <option value="新中式">新中式 (Chinese)</option>
              <option value="法式复古">法式复古 (French)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 hover:shadow-indigo-500/40 active:translate-y-0 ${
                isSubmitting 
                  ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  免费生成方案 <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
               点击即代表您同意 <a href="#" className="underline">服务条款</a> 和 <a href="#" className="underline">隐私政策</a>
            </p>
        </div>
      </form>
    </div>
  );
};

export default RenovationForm;
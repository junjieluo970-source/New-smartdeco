import React from 'react';
import { DesignResult, LoadingState } from '../types';
import { Download, ShoppingBag, Lightbulb, TrendingDown, Image as ImageIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsViewProps {
  result: DesignResult;
  loadingState: LoadingState;
  reset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, loadingState, reset }) => {
  const { imageUrl, furnitureData } = result;

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'smart-deco-design.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!imageUrl && !furnitureData && loadingState === LoadingState.IDLE) {
    return null;
  }

  // Chart Data Preparation
  const chartData = furnitureData?.items.map(item => ({
    name: item.name.length > 6 ? item.name.substring(0, 6) + '..' : item.name,
    price: item.estimatedPrice
  })) || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">您的定制装修方案</h2>
        <button 
          onClick={reset}
          className="text-slate-500 hover:text-indigo-600 font-medium underline decoration-2 underline-offset-4 transition-colors"
        >
          重新设计
        </button>
      </div>

      {/* 1. Visual Section */}
      <section className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <ImageIcon className="w-5 h-5 text-indigo-500" />
            AI 效果图预览
          </h3>
          {imageUrl && (
            <button 
              onClick={downloadImage}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
            >
              <Download className="w-4 h-4" />
              下载图片
            </button>
          )}
        </div>
        <div className="relative aspect-video w-full bg-slate-200">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Generated Interior Design" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
               {loadingState === LoadingState.GENERATING_IMAGE ? (
                 <div className="flex flex-col items-center animate-pulse">
                   <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                   <p>正在绘制您的梦想家园...</p>
                 </div>
               ) : (
                 <p>图片加载失败或未生成</p>
               )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Furniture List Section */}
      {furnitureData && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Column */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-800">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    高性价比家具清单
                  </h3>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">预估总价</p>
                    <p className="text-2xl font-black text-emerald-600">
                      {furnitureData.currency} {furnitureData.totalEstimatedCost.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {furnitureData.items.map((item, index) => (
                    <div key={index} className="p-6 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded-md mb-2">
                            {item.category}
                          </span>
                          <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {item.name}
                          </h4>
                        </div>
                        <span className="text-lg font-bold text-emerald-600 whitespace-nowrap">
                           ¥ {item.estimatedPrice}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                        <TrendingDown className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800 font-medium">
                          <span className="font-bold">省钱攻略：</span> {item.buyingTip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Stats & Advice Column */}
          <div className="space-y-6">
            {/* Advice Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl shadow-lg p-6">
              <h4 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-300" />
                设计师建议
              </h4>
              <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
                {furnitureData.designAdvice}
              </p>
            </div>

            {/* Cost Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">预算分布</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" />
                    <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-slate-100 rounded-xl p-4 text-xs text-slate-500 text-center">
              免责声明：以上价格仅为AI根据市场行情预估的参考价，实际购买价格请以当地商场或电商平台为准。
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ResultsView;

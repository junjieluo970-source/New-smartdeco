import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Wand2, ArrowRight, RefreshCw, Palette, Layers, Plus, ChevronRight, Image as ImageIcon, ScanEye, MousePointerClick } from 'lucide-react';
import { ArResult, FocusArea, ColorRecommendation, DetectedObject } from '../types';
import { generateRenovatedImage, analyzeRoomStyle } from '../services/geminiService';
import ImageComparisonSlider from './ImageComparisonSlider';

interface ArAssistantProps {
  onResultChange?: (hasResult: boolean) => void;
}

const ArAssistant: React.FC<ArAssistantProps> = ({ onResultChange }) => {
  // Input State
  const [image, setImage] = useState<string | null>(null);
  const [style, setStyle] = useState<string>('现代简约');
  const [focusArea, setFocusArea] = useState<FocusArea>('Overall Room');
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Results State
  const [results, setResults] = useState<ArResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived State
  const activeResult = results.find(r => r.id === selectedResultId) || null;

  // Notify parent component when result state changes
  useEffect(() => {
    if (onResultChange) {
      onResultChange(results.length > 0);
    }
  }, [results, onResultChange]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setResults([]); // Clear previous session results
        setSelectedResultId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;

    setIsProcessing(true);
    try {
      // Run generation and analysis in parallel
      const [generatedImage, analysis] = await Promise.all([
        generateRenovatedImage(image, style, focusArea),
        analyzeRoomStyle(image, style, focusArea)
      ]);

      const newResult: ArResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        style,
        focusArea,
        originalImage: image,
        generatedImage,
        analysis
      };

      setResults(prev => [newResult, ...prev]);
      setSelectedResultId(newResult.id);
    } catch (error) {
      console.error(error);
      alert("生成失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setResults([]);
    setSelectedResultId(null);
  };

  // Render Control Panel (Inputs)
  const renderControls = (compact = false) => (
    <div className={`space-y-4 ${compact ? 'grid grid-cols-1 gap-4' : ''}`}>
      {!compact && (
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 mb-6 group">
          <img src={image!} alt="Original" className="w-full h-full object-cover" />
          <button 
            onClick={resetAll}
            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            title="重新上传"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
           <Palette className="w-4 h-4" /> 目标风格
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
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

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
           <Layers className="w-4 h-4" /> 改造区域
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['Overall Room', 'Walls & Floor', 'Furniture', 'Soft Decor'].map((area) => (
             <button
                key={area}
                onClick={() => setFocusArea(area as FocusArea)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  focusArea === area 
                    ? 'bg-indigo-100 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
             >
                {area === 'Overall Room' ? '整体' : 
                 area === 'Walls & Floor' ? '墙地' :
                 area === 'Furniture' ? '家具' : '软装'}
             </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isProcessing}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:translate-y-0 ${
          isProcessing 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-indigo-500/30'
        }`}
      >
        {isProcessing ? (
           <>
            <Wand2 className="animate-spin w-5 h-5" /> 
            {results.length > 0 ? '生成新方案...' : '正在分析与重绘...'}
           </>
        ) : (
           <>
            {results.length > 0 ? <Plus className="w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
            {results.length > 0 ? '生成新版本' : '开始 AR 改造'} 
            {results.length === 0 && <ArrowRight className="w-5 h-5" />}
           </>
        )}
      </button>
    </div>
  );

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-7xl mx-auto overflow-hidden min-h-[600px] flex flex-col">
      
      {/* 1. INITIAL UPLOAD STATE */}
      {!image ? (
        <div className="p-8 md:p-20 flex flex-col items-center justify-center h-full text-center animate-fade-in">
          <div className="mb-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Camera className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">AR 实景空间构造</h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto text-lg">
               拍摄或上传房间照片，AI 将自动识别空间元素，为您生成多种风格的装修方案并提供即时改造建议。
            </p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xl h-64 border-3 border-dashed border-indigo-200 rounded-3xl bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group duration-300"
          >
            <div className="p-4 bg-white rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="font-bold text-slate-700 text-lg group-hover:text-indigo-700">点击上传或拖拽图片</p>
            <p className="text-sm text-slate-400 mt-1">支持 JPG, PNG 格式</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
      ) : (
        /* 2. MAIN INTERFACE (Controls + Result) */
        <div className="flex flex-col lg:flex-row h-full min-h-[600px]">
           
           {/* Sidebar Controls */}
           <div className="w-full lg:w-80 p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 flex flex-col overflow-y-auto max-h-[40vh] lg:max-h-full shrink-0">
              {renderControls()}
              
              {/* Gallery List (History) */}
              {results.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">生成历史</h4>
                  <div className="space-y-3">
                     {results.map((res, idx) => (
                       <div 
                         key={res.id}
                         onClick={() => setSelectedResultId(res.id)}
                         className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group ${
                           selectedResultId === res.id 
                             ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500/20' 
                             : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                         }`}
                       >
                         <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                            <img src={res.generatedImage || ''} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-grow min-w-0">
                           <p className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">{res.style}</p>
                           <p className="text-xs text-slate-500 truncate">{res.focusArea === 'Overall Room' ? '整体改造' : res.focusArea}</p>
                         </div>
                         {selectedResultId === res.id && <ChevronRight className="w-4 h-4 text-indigo-500" />}
                       </div>
                     ))}
                  </div>
                </div>
              )}
           </div>

           {/* Main View Area */}
           <div className="flex-grow flex flex-col bg-white overflow-y-auto relative">
              {results.length === 0 ? (
                 <div className="flex-grow flex flex-col items-center justify-center p-12 text-center opacity-50 select-none">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <ImageIcon className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-xl font-medium text-slate-500">
                      已就绪<br/>
                      请点击“开始 AR 改造”以启动视觉引擎
                    </p>
                 </div>
              ) : activeResult ? (
                 <div className="flex flex-col h-full animate-fade-in">
                    
                    {/* Interactive Comparison Slider */}
                    <div className="relative h-[400px] md:h-[550px] w-full bg-slate-900 overflow-hidden flex-shrink-0">
                       {activeResult.generatedImage ? (
                         <ImageComparisonSlider 
                            beforeImage={activeResult.originalImage}
                            afterImage={activeResult.generatedImage}
                            beforeLabel="原始"
                            afterLabel={`改造后 (${activeResult.style})`}
                         />
                       ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-slate-800">
                             生成图片失败
                          </div>
                       )}
                    </div>

                    {/* Analysis & Detection Panel */}
                    <div className="flex-grow p-8 bg-slate-50">
                      <div className="grid lg:grid-cols-2 gap-8">
                         
                         {/* Element Recognition Radar */}
                         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                               <ScanEye className="w-5 h-5 text-indigo-500" />
                               AR 空间元素识别
                            </h3>
                            <div className="space-y-3">
                              {activeResult.analysis?.detectedObjects.map((obj, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors">
                                   <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                      {idx + 1}
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2 mb-1">
                                         <span className="font-bold text-slate-800">{obj.name}</span>
                                         <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-500">
                                            置信度 {Math.round(obj.confidence * 100)}%
                                         </span>
                                      </div>
                                      <p className="text-xs text-slate-500 mb-1">当前: {obj.currentStyle}</p>
                                      <p className="text-sm text-indigo-700 font-medium flex items-center gap-1">
                                        <MousePointerClick className="w-3 h-3" /> 建议: {obj.suggestion}
                                      </p>
                                   </div>
                                </div>
                              ))}
                              {(!activeResult.analysis?.detectedObjects || activeResult.analysis.detectedObjects.length === 0) && (
                                <p className="text-slate-400 text-sm italic">未能识别出具体家具元素。</p>
                              )}
                            </div>
                         </div>

                         {/* Suggestions & Colors */}
                         <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                  <Wand2 className="w-5 h-5 text-violet-500" />
                                  改造施工建议
                               </h3>
                               <ul className="space-y-3">
                                  {activeResult.analysis?.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex gap-3 text-slate-600 text-sm">
                                       <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0"></span>
                                       {suggestion}
                                    </li>
                                  ))}
                               </ul>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                  <Palette className="w-5 h-5 text-pink-500" />
                                  色彩搭配
                               </h3>
                               <div className="grid grid-cols-2 gap-3">
                                  {activeResult.analysis?.colorPalette.map((colorItem, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:bg-slate-50">
                                       <div 
                                          className="w-8 h-8 rounded-full border border-black/10 shadow-inner" 
                                          style={{ backgroundColor: colorItem.hex }}
                                       ></div>
                                       <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-700 truncate">{colorItem.name}</p>
                                          <p className="text-[10px] text-slate-400 truncate">{colorItem.usage}</p>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                 </div>
              ) : null}
           </div>
        </div>
      )}
    </div>
  );
};

export default ArAssistant;
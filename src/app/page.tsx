'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookOpen, History, Download, RefreshCw, Sparkles, ChevronDown, PenTool, Send } from 'lucide-react';

interface Poem {
  id: string;
  type: string;
  theme: string;
  content: string;
  createdAt: Date;
}

const POEM_TYPES = [
  { value: 'tang', label: '唐诗', description: '五言、七言绝句和律诗', color: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40' },
  { value: 'song', label: '宋词', description: '词牌名格式，婉约豪放', color: 'from-slate-100 to-gray-200 dark:from-slate-900/40 dark:to-slate-800/40' },
  { value: 'chu', label: '楚辞', description: '浪漫主义，骚体格式', color: 'from-rose-100 to-pink-100 dark:from-rose-950/40 dark:to-pink-950/40' },
  { value: 'han', label: '汉赋', description: '铺陈排比，辞藻华丽', color: 'from-red-50 to-orange-100 dark:from-red-950/40 dark:to-orange-950/40' },
  { value: 'modern', label: '现代诗', description: '自由诗体，现代韵律', color: 'from-neutral-100 to-stone-100 dark:from-neutral-900/40 dark:to-stone-900/40' },
  { value: 'sonnet', label: '十四行诗', description: 'English Sonnet, ABAB CDCD EFEF GG', color: 'from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40' },
  { value: 'haiku', label: '俳句', description: '5-7-5音节，日本短诗', color: 'from-lime-50 to-yellow-50 dark:from-lime-950/40 dark:to-yellow-950/40' }
];

export default function Home() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [generatedPoem, setGeneratedPoem] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [poemHistory, setPoemHistory] = useState<Poem[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [animationKey, setAnimationKey] = useState<number>(0);

  // 加载历史记录
  useEffect(() => {
    loadPoemHistory();
  }, []);

  const loadPoemHistory = async () => {
    try {
      const response = await fetch('/api/poems');
      if (response.ok) {
        const data = await response.json();
        const poems = data.poems.slice(0, 10).map((poem: any) => ({
          ...poem,
          createdAt: new Date(poem.createdAt)
        }));
        setPoemHistory(poems);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  };

  const generatePoem = async () => {
    if (!selectedType || !theme.trim()) {
      return;
    }

    setIsGenerating(true);
    setGeneratedPoem(''); // 清空当前内容
    setAnimationKey(prev => prev + 1); // 重置动画

    try {
      const response = await fetch('/api/generate-poem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          theme: theme.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      const data = await response.json();
      
      // 模拟打字机效果或稍作延迟增强仪式感
      setGeneratedPoem(data.poem);
      
      // 保存到数据库
      try {
        await savePoemToDatabase(selectedType, theme.trim(), data.poem);
        await loadPoemHistory();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (saveError) {
        console.error('保存诗歌失败:', saveError);
      }
      
    } catch (error) {
      console.error('Error generating poem:', error);
      setGeneratedPoem('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const savePoemToDatabase = async (type: string, theme: string, content: string) => {
    const response = await fetch('/api/poems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: POEM_TYPES.find(t => t.value === type)?.label || type,
        theme,
        content
      }),
    });

    if (!response.ok) {
      throw new Error('保存失败');
    }
  };

  const formatPoemDisplay = (content: string, type: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    
    // 基础样式类
    const baseClass = "text-lg leading-relaxed text-gray-800 dark:text-gray-200 transition-all duration-700 ease-out";
    const serifClass = "font-serif font-medium tracking-wide";
    
    if (type === 'tang' || type === 'song') {
      return (
        <div className="space-y-4 py-2">
          {lines.map((line, index) => (
            <div key={index} className={`${baseClass} ${serifClass} text-xl sm:text-2xl`}>
              {line.trim()}
            </div>
          ))}
        </div>
      );
    }
    
    if (type === 'sonnet' || type === 'haiku') {
      return lines.map((line, index) => (
        <div key={index} className={`${baseClass} italic text-gray-700 dark:text-gray-300 font-light`}>
          {line.trim()}
        </div>
      ));
    }

    if (type === 'chu') {
      return lines.map((line, index) => (
        <div key={index} className={`${baseClass} italic font-serif text-lg tracking-widest text-center`}>
          {line.trim()}
        </div>
      ));
    }
    
    // 汉赋与现代诗
    return (
      <div className="space-y-2 py-1">
        {lines.map((line, index) => (
          <div key={index} className={baseClass}>
            {line.trim() || <div className="h-4" />}
          </div>
        ))}
      </div>
    );
  };

  const getPoemCardStyle = (type: string) => {
    const typeConfig = POEM_TYPES.find(t => t.value === type);
    return typeConfig?.color || 'from-amber-50 to-orange-50';
  };

  const downloadPoem = () => {
    if (!generatedPoem) return;
    const blob = new Blob([generatedPoem], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poem_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden font-sans selection:bg-orange-200 dark:selection:bg-orange-900">
      {/* 动态背景层 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-orange-50/50 via-white to-amber-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-[100px] animate-pulse duration-[10s]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-200/30 dark:bg-rose-900/20 rounded-full blur-[100px] animate-pulse duration-[12s] delay-1000" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[80px] animate-pulse duration-[15s] delay-2000" />
      </div>


      {/* 主内容区域 */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-start pt-6 sm:pt-10 pb-32 px-4 sm:px-6 w-full max-w-5xl mx-auto">
        
        {/* 欢迎/空状态 */}
        {!generatedPoem && !isGenerating && (
          <div className="flex flex-col items-center justify-center w-full min-h-[50vh] text-center space-y-8 animate-fade-in-up">
            <div className="relative group cursor-default">
              <div className="absolute -inset-1 bg-linear-to-r from-orange-400 to-rose-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700">
                <Sparkles className="w-10 h-10 sm:w-14 sm:h-14 text-orange-500 dark:text-orange-400" />
              </div>
            </div>
            
            <div className="space-y-3 max-w-md">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                赋予文字以灵魂
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                从唐诗宋词到十四行诗，输入您的主题，让 AI 为您谱写独一无二的篇章。
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {POEM_TYPES.slice(0, 4).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className="px-4 py-2 text-sm rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-md transition-all duration-300"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 生成结果展示 */}
        {(generatedPoem || isGenerating) && (
          <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
            <div 
              key={animationKey} // Key change triggers animation
              className={`
                relative rounded-3xl p-1 transition-all duration-500 
                ${isGenerating ? 'scale-[0.98] opacity-90' : 'scale-100 opacity-100'}
              `}
            >
              {/* 诗词卡片背景 */}
              <div className={`
                absolute inset-0 rounded-3xl bg-linear-to-br opacity-80 blur-xl
                ${getPoemCardStyle(selectedType)} transition-colors duration-700
              `}></div>

              <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-[22px] border border-white/50 dark:border-gray-700/50 shadow-2xl shadow-gray-200/50 dark:shadow-black/30 overflow-hidden">
                
                {/* 卡片头部 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 dark:border-gray-800/50 bg-white/30 dark:bg-gray-900/30">
                  <div className="flex items-center gap-2">
                    {isGenerating ? (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <Sparkles className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    )}
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {isGenerating ? '正在挥毫泼墨...' : '佳作已成'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" onClick={() => setGeneratedPoem('')}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" onClick={downloadPoem}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 卡片内容区 */}
                <div className="px-6 py-8 sm:px-10 sm:py-12 min-h-[200px] flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center space-y-4 animate-pulse">
                       <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                       <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                       <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                    </div>
                  ) : (
                    <div className="w-full text-center sm:text-left">
                      <div className="mb-6 flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 rounded-md bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                          {POEM_TYPES.find(t => t.value === selectedType)?.label}
                        </span>
                        <span className="px-2 py-1 rounded-md bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400">
                          {theme}
                        </span>
                      </div>
                      {formatPoemDisplay(generatedPoem, selectedType)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="border-t border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl pb-safe">
          <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
              
              {/* 类型选择器 */}
              <div className="w-full sm:w-48">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-orange-500/50">
                    <SelectValue placeholder="选择体裁..." />
                  </SelectTrigger>
                  <SelectContent>
                    {POEM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-linear-to-r ${type.color.split(' ').slice(0, 4).join(' ')}`}></div>
                          <div>
                            <div className="font-medium text-sm">{type.label}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 主题输入框 */}
              <div className="flex-1 w-full relative group">
                <Textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="描述你想要的主题或意境（如：江南烟雨、离愁别绪）..."
                  className="min-h-12 max-h-[120px] py-3 px-4 pr-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isGenerating && selectedType && theme.trim()) {
                        generatePoem();
                      }
                    }
                  }}
                />
                {/* 输入框内的图标装饰 */}
                <div className="absolute right-3 top-3 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none">
                   <PenTool className="w-5 h-5" />
                </div>
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={generatePoem}
                disabled={!selectedType || !theme.trim() || isGenerating}
                className="h-12 px-6 rounded-xl bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 w-full sm:w-auto"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>创作</span>
                    <Send className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </div>

            {/* 历史记录折叠区 */}
            {poemHistory.length > 0 && (
              <div id="history-section" className="mt-4 pt-4 border-t border-gray-200/60 dark:border-gray-800">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none select-none text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      <span>历史灵感 ({poemHistory.length})</span>
                    </div>
                    <ChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform duration-200" />
                  </summary>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in max-h-60 overflow-y-auto custom-scrollbar">
                    {poemHistory.map((poem) => (
                      <div
                        key={poem.id}
                        className="p-3 rounded-lg bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 cursor-pointer transition-all group/item"
                        onClick={() => {
                          setGeneratedPoem(poem.content);
                          setSelectedType(POEM_TYPES.find(t => t.label === poem.type)?.value || poem.type);
                          setTheme(poem.theme);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors">
                              {poem.theme}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{poem.type}</div>
                          </div>
                          <div className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                            {new Date(poem.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 全局 Toast 提示 */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-500 ${showSuccess ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
        <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 text-gray-800 dark:text-green-100 px-4 py-3 rounded-xl shadow-xl shadow-green-900/10 flex items-center gap-3">
          <div className="p-1 bg-green-100 dark:bg-green-900 rounded-full">
            <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-sm font-medium">诗歌已保存</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        /* 自定义滚动条 */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
        }
      `}</style>
    </div>
  );
}
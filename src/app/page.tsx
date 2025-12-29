'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookOpen, History, Download, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';

interface Poem {
  id: string;
  type: string;
  theme: string;
  content: string;
  createdAt: Date;
}

const POEM_TYPES = [
  { value: 'tang', label: '唐诗', description: '五言、七言绝句和律诗' },
  { value: 'song', label: '宋词', description: '词牌名格式，婉约豪放' },
  { value: 'chu', label: '楚辞', description: '浪漫主义，骚体格式' },
  { value: 'han', label: '汉赋', description: '铺陈排比，辞藻华丽' },
  { value: 'modern', label: '现代诗', description: '自由诗体，现代韵律' },
  { value: 'sonnet', label: '十四行诗', description: 'English Sonnet, ABAB CDCD EFEF GG' },
  { value: 'haiku', label: '俳句', description: '5-7-5音节，日本短诗' }
];

export default function Home() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [generatedPoem, setGeneratedPoem] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [poemHistory, setPoemHistory] = useState<Poem[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

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
      setGeneratedPoem(data.poem);
      
      // 保存到数据库
      try {
        await savePoemToDatabase(selectedType, theme.trim(), data.poem);
        // 刷新历史记录（从数据库重新加载，保证数据唯一）
        await loadPoemHistory();
        // 显示成功提示
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (saveError) {
        console.error('保存诗歌失败:', saveError);
      }
      
      // 移除了手动添加本地记录的逻辑，避免重复
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
    
    if (type === 'sonnet' || type === 'haiku') {
      return lines.map((line, index) => (
        <div key={index} className="text-lg italic text-gray-800 dark:text-gray-200 leading-relaxed">
          {line.trim()}
        </div>
      ));
    }
    
    if (type === 'tang' || type === 'song') {
      return (
        <div className="space-y-4">
          {lines.map((line, index) => (
            <div key={index} className="text-xl leading-loose text-gray-800 dark:text-gray-200 font-serif">
              {line.trim()}
            </div>
          ))}
        </div>
      );
    }
    
    if (type === 'chu') {
      return lines.map((line, index) => (
        <div key={index} className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 italic">
          {line.trim()}
        </div>
      ));
    }
    
    if (type === 'han') {
      return (
        <div className="prose prose-lg max-w-none">
          {lines.map((line, index) => (
            <div key={index} className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
              {line.trim()}
            </div>
          ))}
        </div>
      );
    }
    
    // 现代诗
    return lines.map((line, index) => (
      <div key={index} className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
        {line.trim() || <br />}
      </div>
    ));
  };

  const getPoemDisplayStyle = (type: string) => {
    switch (type) {
      case 'tang':
        return 'bg-gradient-to-r from-amber-900/10 via-yellow-900/10 to-amber-800/10 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-amber-900/30 border border-amber-800/30 dark:border-amber-600/40';
      case 'song':
        return 'bg-gradient-to-r from-slate-900/10 via-gray-900/10 to-zinc-900/10 dark:from-slate-950/30 dark:via-gray-950/30 dark:to-zinc-950/30 border border-slate-700/30 dark:border-slate-600/40';
      case 'chu':
        return 'bg-gradient-to-r from-rose-900/10 via-pink-900/10 to-amber-900/10 dark:from-rose-950/30 dark:via-pink-950/30 dark:to-amber-950/30 border border-rose-800/30 dark:border-rose-600/40';
      case 'han':
        return 'bg-gradient-to-r from-red-900/10 via-orange-900/10 to-yellow-900/10 dark:from-red-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border border-red-800/30 dark:border-red-600/40';
      case 'modern':
        return 'bg-gradient-to-r from-neutral-900/10 via-stone-900/10 to-zinc-900/10 dark:from-neutral-950/30 dark:via-stone-950/30 dark:to-zinc-950/30 border border-neutral-700/30 dark:border-neutral-600/40';
      case 'sonnet':
        return 'bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-amber-900/10 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-amber-950/30 border border-emerald-800/30 dark:border-emerald-600/40';
      case 'haiku':
        return 'bg-gradient-to-r from-lime-900/10 via-amber-900/10 to-yellow-900/10 dark:from-lime-950/30 dark:via-amber-950/30 dark:to-yellow-950/30 border border-lime-800/30 dark:border-lime-600/40';
      default:
        return 'bg-gradient-to-r from-amber-900/10 to-orange-900/10 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-800/30 dark:border-amber-600/40';
    }
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce sm:animate-none sm:top-4 sm:right-4 sm:left-auto sm:translate-x-0">
          <div className="bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">诗歌生成成功！</span>
          </div>
        </div>
      )}


      {/* 主内容区 - 类似聊天界面 */}
      <div className="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">
        {/* 聊天消息区域 */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {generatedPoem ? (
              /* AI回复消息 */
              <div className="flex gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                    AI 助手
                  </div>
                  <div className={`p-3 sm:p-6 rounded-2xl rounded-tl-none shadow-sm ${getPoemDisplayStyle(selectedType)}`}>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 pb-2 border-b border-gray-200 dark:border-gray-600/30">
                      <span className="inline-flex items-center gap-1">
                        <span>类型：</span>
                        <span className="font-medium">{POEM_TYPES.find(t => t.value === selectedType)?.label}</span>
                      </span>
                      <span className="mx-2">•</span>
                      <span>主题：{theme}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      {formatPoemDisplay(generatedPoem, selectedType)}
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-4 pt-3 border-t border-gray-200 dark:border-gray-600/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setGeneratedPoem('')}
                        className="text-xs sm:text-sm"
                      >
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        清空
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={downloadPoem}
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        下载
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 欢迎消息 */
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 mb-4 sm:mb-6 shadow-lg">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  欢迎使用诗歌生成器
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  支持唐诗、宋词、楚辞、汉赋、现代诗、十四行诗、俳句等多种体裁
                </p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {POEM_TYPES.slice(0, 4).map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部输入区域 - 固定在底部 */}
        <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="space-y-3 sm:space-y-4">
              {/* 诗歌类型选择 */}
              <div className="flex flex-wrap gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="flex-1 min-w-[120px] sm:min-w-[200px]">
                    <SelectValue placeholder="选择诗歌类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {POEM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500 hidden sm:block">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 主题输入和发送按钮 */}
              <div className="flex gap-2">
                <Textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="请输入诗歌主题，如：春天、思乡、爱情等..."
                  className="min-h-[60px] sm:min-h-[80px] resize-none flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isGenerating && selectedType && theme.trim()) {
                        generatePoem();
                      }
                    }
                  }}
                />
                <Button
                  onClick={generatePoem}
                  disabled={!selectedType || !theme.trim() || isGenerating}
                  className="self-end h-[60px] sm:h-[80px] px-4 sm:px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </Button>
              </div>
            </div>

            {/* 历史记录 - 可折叠 */}
            {poemHistory.length > 0 && (
              <div id="history-section" className="mt-3 sm:mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <History className="w-4 h-4" />
                      最近创作
                    </div>
                    <ChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {poemHistory.map((poem) => (
                      <div
                        key={poem.id}
                        className="p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => {
                          setGeneratedPoem(poem.content);
                          setSelectedType(POEM_TYPES.find(t => t.label === poem.type)?.value || poem.type);
                          setTheme(poem.theme);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">{poem.type}</div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">{poem.theme}</div>
                          </div>
                          <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {new Date(poem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    </div>
  );
}
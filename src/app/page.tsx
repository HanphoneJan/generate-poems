'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookOpen, History, Download, RefreshCw, Sparkles } from 'lucide-react';

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
        // 刷新历史记录
        await loadPoemHistory();
        // 显示成功提示
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (saveError) {
        console.error('保存诗歌失败:', saveError);
      }
      
      // 添加到本地历史记录
      const newPoem: Poem = {
        id: Date.now().toString(),
        type: POEM_TYPES.find(t => t.value === selectedType)?.label || selectedType,
        theme: theme.trim(),
        content: data.poem,
        createdAt: new Date()
      };
      setPoemHistory(prev => [newPoem, ...prev.slice(0, 9)]); // 保留最近10首
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
        return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700';
      case 'song':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700';
      case 'chu':
        return 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700';
      case 'han':
        return 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700';
      case 'modern':
        return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-gray-200 dark:border-gray-600';
      case 'sonnet':
        return 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-700';
      case 'haiku':
        return 'bg-gradient-to-r from-green-50 to-lime-50 dark:from-green-900/20 dark:to-lime-900/20 border-green-200 dark:border-green-700';
      default:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600';
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
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <header className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              诗歌生成器
            </h1>
            <BookOpen className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            支持唐诗、宋词、楚辞、汉赋、现代诗、十四行诗、俳句等多种体裁
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 成功提示 */}
          {showSuccess && (
            <div className="fixed top-4 right-4 z-50 animate-pulse">
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>诗歌生成成功！</span>
              </div>
            </div>
          )}

          {/* 左侧控制面板 */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  创作设置
                </CardTitle>
                <CardDescription>
                  选择诗歌类型并输入主题
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    诗歌类型
                  </label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择诗歌类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {POEM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    主题或关键词
                  </label>
                  <Textarea
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="请输入诗歌主题，如：春天、思乡、爱情等..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  onClick={generatePoem}
                  disabled={!selectedType || !theme.trim() || isGenerating}
                  className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      生成诗歌
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 历史记录 */}
            {poemHistory.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    最近创作
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {poemHistory.map((poem) => (
                      <div 
                        key={poem.id}
                        className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setGeneratedPoem(poem.content);
                          setSelectedType(poem.type);
                          setTheme(poem.theme);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm">{poem.type}</div>
                            <div className="text-xs text-gray-500">{poem.theme}</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(poem.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧诗歌展示区 */}
          <div className="lg:col-span-2">
            <Card className="min-h-[600px]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>生成结果</CardTitle>
                  {generatedPoem && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setGeneratedPoem('')}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        清空
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={downloadPoem}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedPoem ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>类型：{POEM_TYPES.find(t => t.value === selectedType)?.label}</span>
                      <span>•</span>
                      <span>主题：{theme}</span>
                    </div>
                    <div className={`p-8 rounded-lg border transition-all duration-300 ${getPoemDisplayStyle(selectedType)}`}>
                      <div className="space-y-4 text-center">
                        {formatPoemDisplay(generatedPoem, selectedType)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <BookOpen className="w-16 h-16 mb-4" />
                    <p className="text-lg">选择诗歌类型并输入主题</p>
                    <p className="text-sm">点击生成按钮开始创作</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
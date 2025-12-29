import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const POEM_PROMPTS = {
  tang: (theme: string) => `请创作一首关于"${theme}"的唐诗。
要求：
- 五言或七言绝句或律诗
- 格律工整，意境深远
- 体现唐诗的韵律美和意境美
- 用词典雅，对仗工整

示例：
春晓
春眠不觉晓，处处闻啼鸟。
夜来风雨声，花落知多少。

静夜思
床前明月光，疑是地上霜。
举头望明月，低头思故乡。

请以JSON格式返回结果，格式如下：
{
  "poem": "这里放诗歌内容"
}`,
  
  song: (theme: string) => `请创作一首关于"${theme}"的宋词。
要求：
- 使用词牌格式（如念奴娇、水调歌头、蝶恋花等）
- 体现宋词的婉约或豪放风格
- 句式长短错落，音律和谐
- 意境优美，情感真挚

示例：
蝶恋花·春景
花褪残红青杏小。燕子飞时，绿水人家绕。枝上柳绵吹又少，天涯何处无芳草。
墙里秋千墙外道。墙外行人，墙里佳人笑。笑渐不闻声渐悄，多情却被无情恼。

水调歌头·明月几时有
明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。
转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。

请以JSON格式返回结果，格式如下：
{
  "poem": "这里放词作内容"
}`,
  
  chu: (theme: string) => `请创作一首关于"${theme}"的楚辞风格诗歌。
要求：
- 使用骚体格式，带有"兮"字
- 充满浪漫主义色彩
- 想象丰富，辞藻华丽
- 体现楚辞的神秘和飘逸

示例：
离骚（节选）
帝高阳之苗裔兮，朕皇考曰伯庸。
摄提贞于孟陬兮，惟庚寅吾以降。
皇览揆余初度兮，肇锡余以嘉名：
名余曰正则兮，字余曰灵均。

请以JSON格式返回结果，格式如下：
{
  "poem": "这里放诗歌内容"
}`,
  
  han: (theme: string) => `请创作一首关于"${theme}"的汉赋。
要求：
- 铺陈排比，辞藻华丽
- 句式整齐，多用对偶
- 描绘细致，气势恢宏
- 体现汉赋的宏大叙事

示例：
两都赋（节选）
于是乃背崇山，面清洛，凭藉流，侧驰郭。东都主人喟然而叹曰："痛乎风俗之移人也！"

请以JSON格式返回结果，格式如下：
{
  "poem": "这里放赋作内容"
}`,
  
  modern: (theme: string) => `请创作一首关于"${theme}"的现代诗。
要求：
- 自由诗体，不拘格律
- 语言现代，意象新颖
- 情感真挚，富有哲理
- 体现现代诗的个性表达

示例：
雨巷
撑着油纸伞，独自
彷徨在悠长、悠长
又寂寥的雨巷，
我希望逢着
一个丁香一样地
结着愁怨的姑娘。

请以JSON格式返回结果，格式如下：
{
  "poem": "这里放诗歌内容"
}`,
  
  sonnet: (theme: string) => `Please write an English sonnet about "${theme}".
Requirements:
- Follow Shakespearean sonnet structure (ABAB CDCD EFEF GG rhyme scheme)
- 14 lines in iambic pentameter
- Traditional sonnet themes and language
- Elegant and poetic expression

Example:
Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date:
Sometime too hot the eye of heaven shines,
And often is his gold complexion dimm'd;
And every fair from fair sometime declines,
By chance or nature's changing course untrimm'd;
But thy eternal summer shall not fade
Nor lose possession of that fair thou owest;
Nor shall Death brag thou wander'st in his shade,
When in eternal lines to time thou growest:
So long as men can breathe or eyes can see,
So long lives this and this gives life to thee.

Please return the result in JSON format as follows:
{
  "poem": "sonnet content here"
}`,
  
  haiku: (theme: string) => `Please write a haiku about "${theme}".
Requirements:
- Traditional 5-7-5 syllable structure
- Three lines only
- Focus on nature and fleeting moments
- Simple yet profound imagery

Example:
An old silent pond...
A frog jumps into the pond,
splash! Silence again.

Please return the result in JSON format as follows:
{
  "poem": "haiku content here"
}`
};

export async function POST(request: NextRequest) {
  try {
    const { type, theme } = await request.json();

    if (!type || !theme) {
      return NextResponse.json(
        { error: '诗歌类型和主题不能为空' },
        { status: 400 }
      );
    }

    const promptGenerator = POEM_PROMPTS[type as keyof typeof POEM_PROMPTS];
    if (!promptGenerator) {
      return NextResponse.json(
        { error: '不支持的诗歌类型' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();
    
    const completion = await zai.chat.completions.create({
      model: 'glm-4.5-flash',
      messages: [
        {
          role: 'system',
          content: '你是一位精通古今中外各种诗歌体裁的诗人，能够创作出高质量的诗歌作品。请严格按照要求的JSON格式返回结果，不要添加任何解释或额外内容。'
        },
        {
          role: 'user',
          content: promptGenerator(theme)
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });
    
    // 修改：优先使用content，如果为空则使用reasoning_content
    const message = completion.choices[0]?.message;
    let response = message?.content || message?.reasoning_content || '';
    
    if (!response) {
      throw new Error('AI生成失败');
    }

    // 尝试解析JSON响应
    let poem = '';
    try {
      // 尝试直接解析整个响应为JSON
      const jsonResponse = JSON.parse(response);
      poem = jsonResponse.poem || '';
    } catch (e) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          poem = jsonResponse.poem || '';
        } catch (e2) {
          console.error('Failed to parse JSON from response:', response);
          throw new Error('AI返回格式不正确');
        }
      } else {
        console.error('No JSON found in response:', response);
        throw new Error('AI返回格式不正确');
      }
    }

    if (!poem) {
      throw new Error('AI生成的诗歌内容为空');
    }

    // 清理诗歌内容
    poem = poem.trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ poem });

  } catch (error) {
    console.error('Poem generation error:', error);
    return NextResponse.json(
      { error: '诗歌生成失败，请重试' },
      { status: 500 }
    );
  }
}
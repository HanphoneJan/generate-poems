import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const poems = await db.poem.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // 限制返回最近50首诗
    });

    return NextResponse.json({ poems });
  } catch (error) {
    console.error('Error fetching poems:', error);
    return NextResponse.json(
      { error: '获取诗歌历史失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, theme, content } = await request.json();

    if (!type || !theme || !content) {
      return NextResponse.json(
        { error: '诗歌信息不完整' },
        { status: 400 }
      );
    }

    const poem = await db.poem.create({
      data: {
        type,
        theme,
        content
      }
    });

    return NextResponse.json({ poem });
  } catch (error) {
    console.error('Error saving poem:', error);
    return NextResponse.json(
      { error: '保存诗歌失败' },
      { status: 500 }
    );
  }
}
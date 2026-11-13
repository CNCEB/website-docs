import { createDiscussion } from '@/lib/feedback';
import { pageFeedback } from '@/lib/feedback-schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = pageFeedback.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: 'invalid feedback' }, { status: 400 });
  }

  try {
    await createDiscussion(body.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('feedback error:', error);
    return NextResponse.json({ error: 'feedback failed' }, { status: 500 });
  }
}

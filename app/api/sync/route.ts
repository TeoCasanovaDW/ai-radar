import { NextResponse } from 'next/server';
import { runSync } from '@/lib/sync/run';

export async function POST(request: Request) {
  const secret = process.env.SYNC_SECRET;
  if (!secret) {
    return NextResponse.json({ status: 'failed', error: 'SYNC_SECRET is not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || token !== secret) {
    return NextResponse.json({ status: 'failed', error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSync();
    return NextResponse.json({ status: 'success', ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: 'failed', error: message }, { status: 500 });
  }
}

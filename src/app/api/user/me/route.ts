import { getCurrentUser } from '@/actions/user';
import { NextResponse } from 'next/server';

export async function GET() {
    const result = await getCurrentUser();
    return NextResponse.json(result);
}

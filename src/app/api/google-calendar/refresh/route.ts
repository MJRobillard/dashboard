import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '../../../lib/googleCalendarServer';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    // Refresh the access token
    const tokens = await refreshAccessToken(refreshToken);
    
    if (!tokens.access_token) {
      return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      tokens
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh access token' }, 
      { status: 500 }
    );
  }
} 
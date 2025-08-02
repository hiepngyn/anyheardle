import { NextRequest, NextResponse } from 'next/server';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function GET() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return NextResponse.json({ access_token: cachedToken });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();

  if (data.access_token) {
    cachedToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000;

    return NextResponse.json({ access_token: cachedToken });
  } else {
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

interface SpotifyArtist {
  id: string;
  name: string;
}

export async function GET(req: NextRequest){
    const artistName = req.nextUrl.searchParams.get('name');
    const artistLimit = req.nextUrl.searchParams.get('quantity');
    if(!artistName) return NextResponse.json({error: "Missing artist name"})
    if(!artistLimit) return NextResponse.json({error: "Missing artist limit"})


    const tokenRes = await fetch(`${req.nextUrl.origin}/api/spotify-token`);
    const { access_token } = await tokenRes.json()

    const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=${encodeURIComponent(artistLimit)}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
    );
    const data = await searchRes.json();

    if (!data.artists.items.length) {
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    const artists = data.artists.items.map((artist: SpotifyArtist) => ({
      id: artist.id,
      name: artist.name
    }));
    return NextResponse.json({ artists });
}
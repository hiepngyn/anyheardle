import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string;
  album: {
    name: string;
  };
  artists: Array<{
    id: string;
    name: string;
  }>;
}

export async function GET(req: NextRequest) {
    try {
        const artistId = req.nextUrl.searchParams.get('id');
        const artistName = req.nextUrl.searchParams.get('name');
        
        if (!artistId || !artistName) {
            return NextResponse.json({ error: "Missing artist ID or name" }, { status: 400 });
        }

        const tokenRes = await fetch(`${req.nextUrl.origin}/api/spotify-token`);
        if (!tokenRes.ok) {
            return NextResponse.json({ error: 'Failed to get Spotify token' }, { status: 500 });
        }
        
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            return NextResponse.json({ error: 'No access token received' }, { status: 500 });
        }

        const searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=artist:"${encodeURIComponent(artistName)}"&type=track&limit=50&market=US`,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            }
        );
        
        if (!searchRes.ok) {
            return NextResponse.json({ error: 'Spotify API error' }, { status: searchRes.status });
        }
        
        const searchData = await searchRes.json();

        if (!searchData.tracks || searchData.tracks.items.length === 0) {
            return NextResponse.json({ error: 'No tracks found for this artist' }, { status: 404 });
        }

        const artistTracks = searchData.tracks.items.filter((track: SpotifyTrack) => 
            track.artists.some((artist) => artist.id === artistId)
        );

        if (artistTracks.length === 0) {
            return NextResponse.json({ error: 'No tracks found for this artist' }, { status: 404 });
        }

        const songs = artistTracks.map((track: SpotifyTrack) => ({
            id: track.id,
            name: track.name,
            preview_url: track.preview_url,
            album: track.album.name,
            artists: track.artists.map((artist) => artist.name).join(', ')
        }));

        return NextResponse.json({ songs });
        
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 
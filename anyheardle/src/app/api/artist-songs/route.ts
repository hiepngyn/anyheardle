import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const artistId = req.nextUrl.searchParams.get('id');
        const artistName = req.nextUrl.searchParams.get('name');
        
        if (!artistId || !artistName) {
            return NextResponse.json({ error: "Missing artist ID or name" }, { status: 400 });
        }

        // Get Spotify token
        const tokenRes = await fetch(`${req.nextUrl.origin}/api/spotify-token`);
        if (!tokenRes.ok) {
            console.error('Failed to get Spotify token:', tokenRes.status);
            return NextResponse.json({ error: 'Failed to get Spotify token' }, { status: 500 });
        }
        
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            console.error('No access token in response');
            return NextResponse.json({ error: 'No access token received' }, { status: 500 });
        }

        // Search for tracks
        const searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=artist:"${encodeURIComponent(artistName)}"&type=track&limit=50&market=US`,
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                },
            }
        );
        
        if (!searchRes.ok) {
            console.error('Spotify API error:', searchRes.status, searchRes.statusText);
            return NextResponse.json({ error: 'Spotify API error' }, { status: searchRes.status });
        }
        
        const searchData = await searchRes.json();

        if (!searchData.tracks || searchData.tracks.items.length === 0) {
            return NextResponse.json({ error: 'No tracks found for this artist' }, { status: 404 });
        }

        // Filter tracks where this artist is the main artist
        const artistTracks = searchData.tracks.items.filter((track: any) => 
            track.artists.some((artist: any) => artist.id === artistId)
        );

        if (artistTracks.length === 0) {
            return NextResponse.json({ error: 'No tracks found for this artist' }, { status: 404 });
        }

        const songs = artistTracks.map((track: any) => ({
            id: track.id,
            name: track.name,
            preview_url: track.preview_url,
            album: track.album.name,
            artists: track.artists.map((artist: any) => artist.name).join(', ')
        }));

        return NextResponse.json({ songs });
        
    } catch (error) {
        console.error('Error in artist-songs route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 
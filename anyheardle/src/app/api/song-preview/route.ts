import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const songName = req.nextUrl.searchParams.get('song');
        const artistName = req.nextUrl.searchParams.get('artist');
        
        if (!songName || !artistName) {
            return NextResponse.json({ error: "Missing song or artist name" }, { status: 400 });
        }

        const cleanSongName = songName.split(' - ')[0].split(' (')[0];
        const searchQuery = `${cleanSongName} ${artistName} audio`;
        
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        
        try {
            const response = await fetch(searchUrl);
            const html = await response.text();
            
            const videoIdMatch = html.match(/"videoId":"([^"]+)"/);
            
            if (videoIdMatch && videoIdMatch[1]) {
                const videoId = videoIdMatch[1];
                
                return NextResponse.json({
                    videoId: videoId,
                    title: `${cleanSongName} by ${artistName}`,
                    duration: '0:30',
                    url: `https://www.youtube.com/watch?v=${videoId}`
                });
            } else {
                return NextResponse.json({ error: 'No preview found' }, { status: 404 });
            }
        } catch (fetchError) {
            return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 
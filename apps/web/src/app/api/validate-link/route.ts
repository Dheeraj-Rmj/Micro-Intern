import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, type, expectedName } = body;

    if (!url) {
      return NextResponse.json({ isValid: false, reason: 'No URL provided' });
    }

    // GITHUB VALIDATION
    if (type === 'github') {
      try {
        const usernameMatch = url.match(/github\.com\/([^\/]+)/);
        if (!usernameMatch) {
          return NextResponse.json({ isValid: false, reason: 'Invalid GitHub URL format' });
        }
        const username = usernameMatch[1];
        
        const ghResponse = await fetch(`https://api.github.com/users/${username}`, {
          headers: { 'User-Agent': 'MicroIntern-Validator' }
        });

        if (ghResponse.status === 404) {
          return NextResponse.json({ isValid: false, reason: 'GitHub user not found' });
        }
        if (!ghResponse.ok) {
          // Rate limit or other error, assume valid to be safe
          return NextResponse.json({ isValid: true });
        }

        const data = await ghResponse.json();
        
        // Optional name matching
        if (expectedName && data.name) {
          const expectedLower = expectedName.toLowerCase();
          const actualLower = data.name.toLowerCase();
          const nameParts = expectedLower.split(' ');
          
          // If at least one part of the expected name matches the actual name
          const hasMatch = nameParts.some((part: string) => part.length > 2 && actualLower.includes(part));
          if (!hasMatch) {
            return NextResponse.json({ 
              isValid: false, 
              reason: `Identity mismatch: GitHub name "${data.name}" does not match "${expectedName}"` 
            });
          }
        }
        
        return NextResponse.json({ isValid: true });
      } catch (e) {
        return NextResponse.json({ isValid: false, reason: 'GitHub API error' });
      }
    }

    // LINKEDIN OR PORTFOLIO VALIDATION
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        // Timeout after 5 seconds to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      // 404 Not Found specifically means it's fake.
      // Other status codes (like 999 for LinkedIn anti-bot) we have to assume are valid to prevent false negatives.
      if (response.status === 404) {
        return NextResponse.json({ isValid: false, reason: 'Page Not Found (404)' });
      }

      return NextResponse.json({ isValid: true });
    } catch (e: any) {
      if (e.name === 'TimeoutError') {
         return NextResponse.json({ isValid: true, reason: 'Timeout, assumed valid' });
      }
      return NextResponse.json({ isValid: false, reason: 'Fetch failed or network error' });
    }

  } catch (error) {
    return NextResponse.json({ isValid: false, reason: 'Invalid request format' }, { status: 400 });
  }
}

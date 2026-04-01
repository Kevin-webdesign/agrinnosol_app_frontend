export const revalidate = 0; // Disable caching for real-time updates

const BACKEND_URL = 'http://localhost:5000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    // Forward all query parameters to backend
    const backendUrl = new URL('/api/events', BACKEND_URL);
    
    for (const [key, value] of searchParams.entries()) {
      backendUrl.searchParams.append(key, value);
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform backend response format (data -> events)
    return Response.json({
      events: data.data || [],
      count: data.count || 0,
      success: data.success || true,
    });
  } catch (error) {
    console.error('Error fetching from backend:', error);
    return Response.json(
      {
        error: 'Failed to fetch events from backend',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

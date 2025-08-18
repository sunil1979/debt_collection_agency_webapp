import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const getSettingsCollection = async () => {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');
  return db.collection('app_settings');
};

async function handler(req: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    const collection = await getSettingsCollection();
    const settings = await collection.findOne({});
    if (!settings || !settings.apiUrl) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
    }

    const destinationUrl = `${settings.apiUrl}/${params.slug.join('/')}`;
    
    const apiResponse = await fetch(destinationUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.body,
    });

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'An error occurred in the proxy.' }, { status: 500 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };

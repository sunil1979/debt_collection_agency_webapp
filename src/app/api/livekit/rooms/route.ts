import { RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { decrypt } from '@/lib/crypto';

const getSettingsCollection = async () => {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');
  return db.collection('app_settings');
};

export async function GET() {
  try {
    const collection = await getSettingsCollection();
    const settings = await collection.findOne({});
    console.log('Retrieved LiveKit settings from DB:', settings);

    if (!settings || typeof settings.livekit_host !== 'string' || !settings.livekit_api_key || !settings.livekit_api_secret) {
      return NextResponse.json({ error: 'LiveKit server configuration is missing or invalid' }, { status: 500 });
    }

    const livekit_api_secret = decrypt(settings.livekit_api_secret);

    const roomService = new RoomServiceClient(settings.livekit_host.replace('ws:', 'http:'), settings.livekit_api_key, livekit_api_secret);
    const rooms = await roomService.listRooms();
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}
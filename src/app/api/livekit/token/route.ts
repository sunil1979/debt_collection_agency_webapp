import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { decrypt } from '@/lib/crypto';

const getSettingsCollection = async () => {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');
  return db.collection('app_settings');
};

export async function POST(req: NextRequest) {
  try {
    const { roomName, identity } = await req.json();

    if (!roomName || !identity) {
      return NextResponse.json({ error: 'Missing roomName or identity' }, { status: 400 });
    }

    const collection = await getSettingsCollection();
    const settings = await collection.findOne({});

    if (!settings || !settings.livekit_api_key || !settings.livekit_api_secret) {
      return NextResponse.json({ error: 'LiveKit server configuration is missing or invalid' }, { status: 500 });
    }

    const livekit_api_secret = decrypt(settings.livekit_api_secret);

    const at = new AccessToken(settings.livekit_api_key, livekit_api_secret, {
      identity: identity,
    });

    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Failed to create token:', error);
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
  }
}
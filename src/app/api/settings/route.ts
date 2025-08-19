import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { encrypt, decrypt } from '@/lib/crypto';

const getSettingsCollection = async () => {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');
  return db.collection('app_settings');
};

export async function GET() {
  try {
    const collection = await getSettingsCollection();
    const settings = await collection.findOne({});
    if (settings) {
      // Don't send the encrypted secret to the client
      if (settings.livekit_api_secret) {
        settings.livekit_api_secret = '********';
      }
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const settingsData = await req.json();
    const collection = await getSettingsCollection();

    // If the secret is the placeholder, don't update it.
    // If a new secret is provided, encrypt and save it.
    if (settingsData.livekit_api_secret && settingsData.livekit_api_secret !== '********') {
      settingsData.livekit_api_secret = encrypt(settingsData.livekit_api_secret);
    } else if (settingsData.livekit_api_secret === '********') {
      delete settingsData.livekit_api_secret;
    } else {
      // Handle the case where the secret might be intentionally cleared.
      // If you want to allow clearing the secret, you would set it to an empty string or handle as needed.
      // For now, we'll just delete it to avoid saving an empty value.
      delete settingsData.livekit_api_secret;
    }

    await collection.updateOne({}, { $set: settingsData }, { upsert: true });

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

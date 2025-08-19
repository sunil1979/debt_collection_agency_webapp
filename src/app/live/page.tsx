'use client';

import { useEffect, useState } from 'react';
import { Room } from 'livekit-client';
import RoomCard from './RoomCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface LiveKitRoom {
  sid: string;
  name: string;
  numParticipants: number;
}

interface AppSettings {
  livekit_host?: string;
}

export default function LivePage() {
  const [rooms, setRooms] = useState<LiveKitRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSettings(settingsData);
        }

        const roomsResponse = await fetch('/api/livekit/rooms');
        const roomsData = await roomsResponse.json();
        if (roomsResponse.ok) {
          if (Array.isArray(roomsData.rooms)) {
            setRooms(roomsData.rooms);
          }
        } else {
          setError(roomsData.error || 'Failed to fetch rooms.');
        }
      } catch (error) {
        setError('An error occurred while fetching data.');
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();

    const interval = setInterval(async () => {
      try {
        const roomsResponse = await fetch('/api/livekit/rooms');
        const roomsData = await roomsResponse.json();
        if (roomsResponse.ok) {
          if (Array.isArray(roomsData.rooms)) {
            setRooms(roomsData.rooms);
          }
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = async (roomName: string, listenOnly: boolean) => {
    if (activeRoom) {
      await activeRoom.disconnect();
      setActiveRoom(null);
      setIsListening(false);
      if (isListening && listenOnly && activeRoom.name === roomName) return;
    }

    if (!settings.livekit_host) {
      setError('LiveKit host not configured. Please set it in the settings page.');
      return;
    }

    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, identity: `user-${Math.random().toString(36).substring(7)}` }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to get join token.');
        return;
      }
      const token = data.token;

      const room = new Room({
        audioCaptureDefaults: {
          deviceId: 'default',
        },
        publishDefaults: {
          videoCodec: 'vp8',
        },
      });

      // Mute the microphone if listenOnly is true
      if (listenOnly) {
        room.localParticipant.setMicrophoneEnabled(false);
      }

      await room.connect(settings.livekit_host, token);
      setActiveRoom(room);
      setIsListening(listenOnly);
      setError(null);

    } catch (error) {
      setError('An error occurred while joining the room.');
      console.error('Error joining room:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Live Rooms</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomCard
              key={room.sid}
              room={room}
              onListen={() => handleJoinRoom(room.name, true)}
              onTakeover={() => handleJoinRoom(room.name, false)}
              isListening={isListening && activeRoom?.name === room.name}
            />
          ))
        ) : (
          <p>No active rooms found.</p>
        )}
      </div>
    </div>
  );
}
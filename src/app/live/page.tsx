'use client';

import { useEffect, useState } from 'react';
import { Room } from 'livekit-client';
import RoomCard from './RoomCard';

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

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await fetch('/api/livekit/rooms');
        const data = await response.json();
        if (response.ok) {
          if (Array.isArray(data.rooms)) {
            setRooms(data.rooms);
          }
        } else {
          setError(data.error || 'Failed to fetch rooms.');
        }
      } catch (error) {
        setError('An error occurred while fetching rooms.');
        console.error('Error fetching rooms:', error);
      }
    }

    fetchRooms(); // Fetch rooms on initial render

    const interval = setInterval(fetchRooms, 5000); // Fetch rooms every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
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
        publishDefaults: {
          audio: !listenOnly,
          video: false,
        },
      });

      await room.connect(settings.livekit_host, token);
      setActiveRoom(room);
      setIsListening(listenOnly);
      setError(null);

    } catch (error) {
      setError('An error occurred while joining the room.');
      console.error('Error joining room:', error);
    }
  };

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

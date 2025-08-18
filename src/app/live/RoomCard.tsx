'use client';

interface LiveKitRoom {
  sid: string;
  name: string;
  numParticipants: number;
}

interface RoomCardProps {
  room: LiveKitRoom;
  onListen: () => void;
  onTakeover: () => void;
  isListening: boolean;
}

export default function RoomCard({ room, onListen, onTakeover, isListening }: RoomCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{room.name}</h2>
      <p className="text-gray-600 mb-4">{room.numParticipants} participant(s)</p>
      <div className="flex space-x-4">
        <button
          onClick={onListen}
          className={`px-4 py-2 rounded-md ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isListening ? 'Stop' : 'Listen'}
        </button>
        <button
          onClick={onTakeover}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Takeover
        </button>
      </div>
    </div>
  );
}

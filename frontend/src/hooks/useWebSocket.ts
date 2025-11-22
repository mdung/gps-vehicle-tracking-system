import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GpsLocation } from '../types/gpsLocation';

const WS_URL = 'http://localhost:8080/ws';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [latestLocation, setLatestLocation] = useState<GpsLocation | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Initialize STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log('WebSocket connected', frame);
        setIsConnected(true);
        
        // Subscribe to location updates
        if (clientRef.current) {
          clientRef.current.subscribe('/topic/locations', (message) => {
            try {
              const location: GpsLocation = JSON.parse(message.body);
              console.log('Received location update:', location);
              setLatestLocation(location);
            } catch (error) {
              console.error('Error parsing location update:', error);
            }
          });
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []);

  return { isConnected, latestLocation };
}


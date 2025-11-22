package com.gps.tracking.service;

import com.gps.tracking.dto.response.GpsLocationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast GPS location update to all connected clients
     */
    public void broadcastLocationUpdate(GpsLocationResponse location) {
        // Broadcast to all clients subscribed to /topic/locations
        messagingTemplate.convertAndSend("/topic/locations", location);
    }
}


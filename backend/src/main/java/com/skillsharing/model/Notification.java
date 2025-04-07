package com.skillsharing.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;  // recipient of the notification
    private String senderId; // user who triggered the notification (e.g., follower)
    private String senderUsername;
    private String senderProfilePicture;
    private String type;  // e.g., "FOLLOW", "COMMENT", "LIKE"
    private String message;
    private boolean read;
    @CreatedDate
    private LocalDateTime createdAt;
}

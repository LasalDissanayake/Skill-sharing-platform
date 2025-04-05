package com.skillsharing.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.HashSet;
import java.util.Set;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String email;
    private String password;
    private String role; // BEGINNER, PROFESSIONAL, MENTOR
    private Set<String> skills = new HashSet<>();
    private String profilePicture;
    private String bio;
    private Set<String> followers = new HashSet<>();
    private Set<String> following = new HashSet<>();
    private boolean enabled = true;
}

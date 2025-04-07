package com.skillsharing.controller;

import com.skillsharing.dto.UserProfileUpdateDTO;
import com.skillsharing.model.User;
import com.skillsharing.repository.UserRepository;
import com.skillsharing.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        logger.debug("Fetching profile for user: {}", email);
        
        return userRepository.findByEmail(email)
            .map(ResponseEntity::ok)
            .orElseGet(() -> {
                logger.error("User not found for email: {}", email);
                return ResponseEntity.notFound().build();
            });
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileUpdateDTO updateDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();
        
        logger.info("Processing profile update for user: {}", currentEmail);
        logger.info("Update data received: {}", updateDTO);
        
        return userRepository.findByEmail(currentEmail)
            .map(user -> {
                // Store original values for logging
                String originalEmail = user.getEmail();
                String originalBio = user.getBio();
                
                // Create response map
                Map<String, Object> response = new HashMap<>();
                boolean hasChanges = false;
                
                // Update bio and skills
                if (updateDTO.getBio() != null) {
                    user.setBio(updateDTO.getBio());
                    hasChanges = true;
                    logger.info("Bio updated from '{}' to '{}'", originalBio, updateDTO.getBio());
                }
                
                if (updateDTO.getSkills() != null) {
                    user.setSkills(updateDTO.getSkills());
                    hasChanges = true;
                    logger.info("Skills updated for user: {}", currentEmail);
                }
                
                // Email update
                if (updateDTO.getEmail() != null && !updateDTO.getEmail().isEmpty() && !updateDTO.getEmail().equals(originalEmail)) {
                    logger.info("Attempting to update email from '{}' to '{}'", originalEmail, updateDTO.getEmail());
                    
                    // Check if email is already in use
                    if (userRepository.existsByEmail(updateDTO.getEmail())) {
                        logger.warn("Email already in use: {}", updateDTO.getEmail());
                        response.put("error", "Email already in use");
                        return ResponseEntity.badRequest().body(response);
                    }
                    
                    // Update email
                    user.setEmail(updateDTO.getEmail());
                    hasChanges = true;
                    logger.info("Email updated from '{}' to '{}'", originalEmail, updateDTO.getEmail());
                }
                
                // Password update
                if (updateDTO.getNewPassword() != null && !updateDTO.getNewPassword().isEmpty()) {
                    if (updateDTO.getCurrentPassword() == null || updateDTO.getCurrentPassword().isEmpty()) {
                        logger.warn("Current password required but not provided");
                        response.put("error", "Current password is required to update password");
                        return ResponseEntity.badRequest().body(response);
                    }
                    
                    // Verify current password
                    if (!passwordEncoder.matches(updateDTO.getCurrentPassword(), user.getPassword())) {
                        logger.warn("Incorrect current password provided");
                        response.put("error", "Current password is incorrect");
                        return ResponseEntity.badRequest().body(response);
                    }
                    
                    // Update password
                    user.setPassword(passwordEncoder.encode(updateDTO.getNewPassword()));
                    hasChanges = true;
                    logger.info("Password updated for user: {}", currentEmail);
                }
                
                if (hasChanges) {
                    logger.info("Saving changes to database for user: {}", user.getEmail());
                    User savedUser = userRepository.save(user);
                    logger.info("User profile successfully updated in database");
                    
                    // Generate new token if email changed (since JWT contains the email)
                    if (!originalEmail.equals(savedUser.getEmail())) {
                        String newToken = jwtService.generateToken(
                            new org.springframework.security.core.userdetails.User(
                                savedUser.getEmail(),
                                savedUser.getPassword(),
                                java.util.Collections.emptyList()
                            )
                        );
                        response.put("user", savedUser);
                        response.put("token", newToken);
                        response.put("emailChanged", true);
                        return ResponseEntity.ok(response);
                    }
                    
                    return ResponseEntity.ok(savedUser);
                } else {
                    logger.info("No changes to save for user: {}", currentEmail);
                    return ResponseEntity.ok(user);
                }
            })
            .orElseGet(() -> {
                logger.error("User not found for email: {}", currentEmail);
                return ResponseEntity.notFound().build();
            });
    }
}

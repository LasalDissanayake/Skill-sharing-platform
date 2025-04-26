package com.skillsharing.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class FileUploadController {
    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Please upload a file"));
        }
        
        try {
            // For this example, we'll just generate a fake URL. In a real application,
            // you would save the file to a storage service like S3, Firebase, etc.
            String fileExtension = "";
            String originalFilename = file.getOriginalFilename();
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            String fakeUrl = "https://example.com/uploads/" + uniqueFilename;
            
            logger.info("File '{}' uploaded by user {}", originalFilename, email);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fakeUrl);
            response.put("filename", uniqueFilename);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error uploading file:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Could not upload the file: " + e.getMessage()));
        }
    }
} 
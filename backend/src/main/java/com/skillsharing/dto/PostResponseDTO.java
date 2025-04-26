package com.skillsharing.dto;

import com.skillsharing.model.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponseDTO {
    private String id;
    private String content;
    private String userId;
    private String username;
    private String profilePicture;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer likeCount;
    private Boolean likedByUser;
    private String mediaUrl;
    private String mediaType;
    private List<Post.Comment> comments;
    private Integer commentCount;
    
    // Code post fields
    private String code;
    private String codeLanguage;
    private String codeTitle;
    private Boolean isCodePost;
    
    // Shared post fields
    private String originalPostId;
    private String shareMessage;
    private PostResponseDTO originalPost;
}
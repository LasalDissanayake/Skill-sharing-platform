package com.skillsharing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostRequestDTO {
    private String content;
    private String mediaUrl;
    private String mediaType;
    
    // New fields for code posting
    private String code;
    private String codeLanguage;
    private String codeTitle;
    private Boolean isCodePost;
    
    // Fields for sharing a post
    private String originalPostId;
    private String shareMessage;
}

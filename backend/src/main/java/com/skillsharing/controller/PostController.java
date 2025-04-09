package com.skillsharing.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillsharing.dto.PostRequestDTO;
import com.skillsharing.model.Post;
import com.skillsharing.model.User;
import com.skillsharing.repository.PostRepository;
import com.skillsharing.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private static final Logger logger = LoggerFactory.getLogger(PostController.class);
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostRequestDTO request) {
        logger.info("Creating post with content: {}", request.getContent());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = Post.builder()
            .authorId(currentUser.getId())
            .authorUsername(currentUser.getUsername())
            .authorFirstName(currentUser.getFirstName())
            .authorLastName(currentUser.getLastName())
            .authorProfilePicture(currentUser.getProfilePicture())
            .content(request.getContent())
            .mediaUrl(request.getMediaUrl())
            .mediaType(request.getMediaType())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        Post savedPost = postRepository.save(post);
        logger.info("Post created: {}", savedPost.getId());
        
        return ResponseEntity.ok(savedPost);
    }
    
    @GetMapping
    public ResponseEntity<List<Post>> getFeedPosts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get posts from users that current user follows, plus their own posts
        Set<String> followingIds = new HashSet<>(currentUser.getFollowing());
        followingIds.add(currentUser.getId()); // Include own posts
        
        List<Post> posts = postRepository.findByAuthorIdIn(
            new ArrayList<>(followingIds),
            Sort.by(Sort.Direction.DESC, "createdAt")
        );
        
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getUserPosts(@PathVariable String userId) {
        logger.info("Fetching posts for user: {}", userId);
        List<Post> posts = postRepository.findByAuthorId(
            userId,
            Sort.by(Sort.Direction.DESC, "createdAt")
        );
        
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPost(@PathVariable String postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return ResponseEntity.ok(post);
    }
    
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Check if current user is the author of the post
        if (!post.getAuthorId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to delete this post");
        }
        
        postRepository.delete(post);
        logger.info("Post deleted: {}", postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Post deleted successfully");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Set<String> likes = post.getLikes();
        String userId = currentUser.getId();
        
        boolean liked = false;
        
        // Toggle like status
        if (likes.contains(userId)) {
            likes.remove(userId);
        } else {
            likes.add(userId);
            liked = true;
        }
        
        post.setLikes(likes);
        Post updatedPost = postRepository.save(post);
        
        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likes.size());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{postId}/comment")
    public ResponseEntity<Post> addComment(@PathVariable String postId, @RequestBody Map<String, String> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User currentUser = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Comment content cannot be empty");
        }
        
        Post.Comment comment = Post.Comment.builder()
            .id(UUID.randomUUID().toString())
            .userId(currentUser.getId())
            .username(currentUser.getUsername())
            .userProfilePicture(currentUser.getProfilePicture())
            .content(content)
            .createdAt(LocalDateTime.now())
            .build();
        
        List<Post.Comment> comments = post.getComments();
        comments.add(comment);
        post.setComments(comments);
        
        Post updatedPost = postRepository.save(post);
        logger.info("Comment added to post: {}", postId);
        
        return ResponseEntity.ok(updatedPost);
    }
}

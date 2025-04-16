package com.skillsharing.controller;

import com.skillsharing.model.LearningPlan;
import com.skillsharing.model.User;
import com.skillsharing.repository.LearningPlanRepository;
import com.skillsharing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

//import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/learning-plan")
@RequiredArgsConstructor
public class LearningPlanController {

    private final LearningPlanRepository learningPlanRepository;
    private final UserRepository userRepository;

    // Add a new learning plan
    @PostMapping
    public ResponseEntity<?> createLearningPlan(@RequestBody LearningPlan plan) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        plan.setUserId(currentUser.getId());
        // plan.setCreatedAt(LocalDate.now());

        LearningPlan savedPlan = learningPlanRepository.save(plan);
        return ResponseEntity.ok(savedPlan);
    }
// Get all learning plans (admin or for viewing/testing)
@GetMapping
public ResponseEntity<List<LearningPlan>> getAllLearningPlans() {
    List<LearningPlan> allPlans = learningPlanRepository.findAll();
    return ResponseEntity.ok(allPlans);
}

    // Get all plans for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningPlan>> getPlansForUser(@PathVariable String userId) {
        List<LearningPlan> plans = learningPlanRepository.findByUserId(userId);
        return ResponseEntity.ok(plans);
    }

    // Get a specific plan by ID
    @GetMapping("/{planId}")
    public ResponseEntity<?> getPlanById(@PathVariable String planId) {
        Optional<LearningPlan> optionalPlan = learningPlanRepository.findById(planId);
        return optionalPlan.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update a learning plan
    @PutMapping("/{planId}")
    public ResponseEntity<?> updateLearningPlan(@PathVariable String planId, @RequestBody LearningPlan updatedPlan) {
        Optional<LearningPlan> optionalPlan = learningPlanRepository.findById(planId);
        if (optionalPlan.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        LearningPlan existingPlan = optionalPlan.get();
        existingPlan.setTitle(updatedPlan.getTitle());
        existingPlan.setDescription(updatedPlan.getDescription());
        existingPlan.setWeeks(updatedPlan.getWeeks());

        LearningPlan savedPlan = learningPlanRepository.save(existingPlan);
        return ResponseEntity.ok(savedPlan);
    }

    // Delete a learning plan
    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deleteLearningPlan(@PathVariable String planId) {
        if (!learningPlanRepository.existsById(planId)) {
            return ResponseEntity.notFound().build();
        }

        learningPlanRepository.deleteById(planId);
        return ResponseEntity.ok(Map.of("message", "Learning plan deleted successfully"));
    }
}

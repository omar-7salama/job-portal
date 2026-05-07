package com.jobportal.applicationservice.controller;

import com.jobportal.applicationservice.dto.ApplicationResponse;
import com.jobportal.applicationservice.dto.CreateApplicationRequest;
import com.jobportal.applicationservice.dto.UpdateStatusRequest;
import com.jobportal.applicationservice.exception.BadRequestException;
import com.jobportal.applicationservice.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationResponse> applyForJob(@RequestBody CreateApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.applyForJob(request));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId));
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByApplicant(@PathVariable UUID applicantId) {
        return ResponseEntity.ok(applicationService.getApplicationsByApplicant(applicantId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable UUID id,
            @RequestBody UpdateStatusRequest request
    ) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> withdrawApplication(@PathVariable UUID id) {
        applicationService.withdrawApplication(id);
        return ResponseEntity.noContent().build();
    }
}

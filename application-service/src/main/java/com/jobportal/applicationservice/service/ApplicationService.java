package com.jobportal.applicationservice.service;

import com.jobportal.applicationservice.dto.ApplicationResponse;
import com.jobportal.applicationservice.dto.CreateApplicationRequest;
import com.jobportal.applicationservice.entity.Application;
import com.jobportal.applicationservice.entity.ApplicationStatus;
import com.jobportal.applicationservice.exception.BadRequestException;
import com.jobportal.applicationservice.exception.ResourceNotFoundException;
import com.jobportal.applicationservice.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final RestTemplate restTemplate;

    @Value("${user.service.url}")
    private String userServiceUrl;

    @Value("${job.service.url}")
    private String jobServiceUrl;

    @Transactional
    public ApplicationResponse applyForJob(CreateApplicationRequest request) {
        validateCreateRequest(request);
        validateUserExists(request.getApplicantId());
        validateJobIsOpen(request.getJobId());

        applicationRepository.findByJobIdAndApplicantId(request.getJobId(), request.getApplicantId())
                .ifPresent(application -> {
                    throw new BadRequestException("Applicant has already applied for this job");
                });

        Application application = Application.builder()
                .jobId(request.getJobId())
                .applicantId(request.getApplicantId())
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.PENDING)
                .build();

        return toResponse(applicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByJob(UUID jobId) {
        if (jobId == null) {
            throw new BadRequestException("jobId is required");
        }
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByApplicant(UUID applicantId) {
        if (applicantId == null) {
            throw new BadRequestException("applicantId is required");
        }
        return applicationRepository.findByApplicantId(applicantId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(UUID id, ApplicationStatus status) {
        if (id == null) {
            throw new BadRequestException("application id is required");
        }
        if (status == null) {
            throw new BadRequestException("status is required");
        }

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        application.setStatus(status);
        return toResponse(applicationRepository.save(application));
    }

    @Transactional
    public void withdrawApplication(UUID id) {
        if (id == null) {
            throw new BadRequestException("application id is required");
        }
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with id: " + id);
        }
        applicationRepository.deleteById(id);
    }

    private void validateCreateRequest(CreateApplicationRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required");
        }
        if (request.getJobId() == null) {
            throw new BadRequestException("jobId is required");
        }
        if (request.getApplicantId() == null) {
            throw new BadRequestException("applicantId is required");
        }
    }

    private void validateUserExists(UUID applicantId) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(userServiceUrl + "/api/users/{id}", Map.class, applicantId);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ResourceNotFoundException("User not found with id: " + applicantId);
            }
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("User not found with id: " + applicantId);
        }
    }

    private void validateJobIsOpen(UUID jobId) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(jobServiceUrl + "/api/jobs/{id}", Map.class, jobId);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new ResourceNotFoundException("Job not found with id: " + jobId);
            }

            String status = extractStatus(response.getBody());
            if (!"OPEN".equals(status)) {
                throw new BadRequestException("Job is not open for applications");
            }
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("Job not found with id: " + jobId);
        } catch (HttpClientErrorException ex) {
            if (ex.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new BadRequestException("Unable to validate job status");
            }
            throw ex;
        }
    }

    private String extractStatus(Map<?, ?> jobResponse) {
        Object status = jobResponse.get("status");
        if (status == null) {
            status = jobResponse.get("jobStatus");
        }
        if (status == null) {
            throw new BadRequestException("Job response does not include a status");
        }
        return status.toString().trim().toUpperCase(Locale.ROOT);
    }

    private ApplicationResponse toResponse(Application application) {
        return ApplicationResponse.builder()
                .id(application.getId())
                .jobId(application.getJobId())
                .applicantId(application.getApplicantId())
                .coverLetter(application.getCoverLetter())
                .status(application.getStatus())
                .appliedAt(application.getAppliedAt())
                .build();
    }
}

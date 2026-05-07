package com.jobportal.jobservice.service;

import com.jobportal.jobservice.dto.CreateJobRequest;
import com.jobportal.jobservice.dto.JobResponse;
import com.jobportal.jobservice.entity.Job;
import com.jobportal.jobservice.enums.JobStatus;
import com.jobportal.jobservice.exception.ResourceNotFoundException;
import com.jobportal.jobservice.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public JobResponse createJob(CreateJobRequest request) {
        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .companyName(request.getCompanyName())
                .location(request.getLocation())
                .salary(request.getSalary())
                .jobType(request.getJobType())
                .status(request.getStatus() == null ? JobStatus.OPEN : request.getStatus())
                .employerId(request.getEmployerId())
                .build();

        return toResponse(jobRepository.save(job));
    }

    public List<JobResponse> getAllOpenJobs() {
        return jobRepository.findByStatus(JobStatus.OPEN)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public JobResponse getJobById(UUID id) {
        return toResponse(findJobById(id));
    }

    public JobResponse updateJob(UUID id, CreateJobRequest request) {
        Job job = findJobById(id);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompanyName(request.getCompanyName());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setJobType(request.getJobType());
        job.setStatus(request.getStatus() == null ? job.getStatus() : request.getStatus());
        job.setEmployerId(request.getEmployerId());

        return toResponse(jobRepository.save(job));
    }

    public void deleteJob(UUID id) {
        Job job = findJobById(id);
        jobRepository.delete(job);
    }

    public List<JobResponse> getJobsByEmployer(UUID employerId) {
        return jobRepository.findByEmployerId(employerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Job findJobById(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
    }

    private JobResponse toResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .companyName(job.getCompanyName())
                .location(job.getLocation())
                .salary(job.getSalary())
                .jobType(job.getJobType())
                .status(job.getStatus())
                .employerId(job.getEmployerId())
                .createdAt(job.getCreatedAt())
                .build();
    }
}

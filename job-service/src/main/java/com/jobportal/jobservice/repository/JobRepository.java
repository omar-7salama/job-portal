package com.jobportal.jobservice.repository;

import com.jobportal.jobservice.entity.Job;
import com.jobportal.jobservice.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID> {

    List<Job> findByStatus(JobStatus status);

    List<Job> findByEmployerId(UUID employerId);
}

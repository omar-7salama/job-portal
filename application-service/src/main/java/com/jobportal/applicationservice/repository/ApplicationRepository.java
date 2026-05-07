package com.jobportal.applicationservice.repository;

import com.jobportal.applicationservice.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJobId(UUID jobId);

    List<Application> findByApplicantId(UUID applicantId);

    Optional<Application> findByJobIdAndApplicantId(UUID jobId, UUID applicantId);
}

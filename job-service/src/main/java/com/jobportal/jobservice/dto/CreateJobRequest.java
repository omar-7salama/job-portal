package com.jobportal.jobservice.dto;

import com.jobportal.jobservice.enums.JobStatus;
import com.jobportal.jobservice.enums.JobType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateJobRequest {

    private String title;
    private String description;
    private String companyName;
    private String location;
    private Double salary;
    private JobType jobType;
    private JobStatus status;
    private UUID employerId;
}

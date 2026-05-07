package com.jobportal.applicationservice.dto;

import com.jobportal.applicationservice.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusRequest {
    private ApplicationStatus status;
}

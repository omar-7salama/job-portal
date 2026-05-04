package com.jobportal.applicationservice;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class ApplicationServiceApplicationTests {

    @Test
    void mainClassCanBeLoaded() {
        assertDoesNotThrow(() -> Class.forName("com.jobportal.applicationservice.ApplicationServiceApplication"));
    }
}

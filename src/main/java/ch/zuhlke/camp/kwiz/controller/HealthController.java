package ch.zuhlke.camp.kwiz.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for health check and basic system information.
 */
@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Health check and system information endpoints")
public class HealthController {

    /**
     * Simple health check endpoint to verify the application is running.
     *
     * @return a response with status information
     */
    @Operation(
            summary = "Health check endpoint",
            description = "Returns the current status of the application",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Application is running properly")
            }
    )
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "KwiZ");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}
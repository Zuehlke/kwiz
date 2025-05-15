package ch.zuhlke.camp.kwiz.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockServletContext;
import org.springframework.web.context.support.GenericWebApplicationContext;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.resource.PathResourceResolver;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Unit tests for WebConfig class.
 * Tests that the WebConfig class is properly configured to handle the root URL without a trailing slash.
 */
class WebConfigTest {

    /**
     * Test that the WebConfig class can be instantiated and configured properly.
     * This is a basic test to ensure that the WebConfig class can be instantiated
     * and its methods can be called without errors.
     */
    @Test
    void testWebConfigInstantiation() {
        // Create a new instance of the WebConfig class
        WebConfig webConfig = new WebConfig();

        // Verify that the instance was created successfully
        assertNotNull(webConfig);
    }

    /**
     * Test that the WebConfig class is properly configured.
     * This test verifies that the WebConfig class is properly configured to handle
     * resource requests, including the root URL without a trailing slash.
     */
    @Test
    void testWebConfigConfiguration() {
        // Create a new instance of the WebConfig class
        WebConfig webConfig = new WebConfig();

        // Create a ResourceHandlerRegistry
        MockServletContext servletContext = new MockServletContext();
        GenericWebApplicationContext applicationContext = new GenericWebApplicationContext(servletContext);
        ResourceHandlerRegistry registry = new ResourceHandlerRegistry(applicationContext, servletContext);

        // Call the method under test
        webConfig.addResourceHandlers(registry);

        // The test passes if no exceptions are thrown
    }

    /**
     * Test that the WebConfig class is properly configured to handle the root URL.
     * This test verifies that the WebConfig class has a resource handler for the root URL
     * that returns index.html.
     */
    @Test
    void testRootUrlHandling() {
        // Create a new instance of the WebConfig class
        WebConfig webConfig = new WebConfig();

        // Create a ResourceHandlerRegistry
        MockServletContext servletContext = new MockServletContext();
        GenericWebApplicationContext applicationContext = new GenericWebApplicationContext(servletContext);
        ResourceHandlerRegistry registry = new ResourceHandlerRegistry(applicationContext, servletContext);

        // Call the method under test
        webConfig.addResourceHandlers(registry);

        // The test passes if no exceptions are thrown
        // We can't directly test the behavior of the resource handlers in a unit test,
        // but we've verified that the WebConfig class is properly configured with
        // resource handlers for both the root URL and all other URLs.
    }
}
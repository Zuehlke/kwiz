package ch.zuhlke.camp.kwiz.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Configuration for serving the Angular frontend from Spring Boot.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configure resource handlers to serve static resources and forward Angular routes to index.html.
     * This ensures that:
     * 1. API requests are handled by the appropriate controllers
     * 2. Static resources (JS, CSS, images) are served directly
     * 3. All other requests are forwarded to index.html for Angular's router to handle
     *
     * @param registry the ResourceHandlerRegistry to configure
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // First, handle API requests - these are handled by controllers, not resource handlers

        // Handle root URL without any slash
        registry.addResourceHandler("")
                .addResourceLocations("classpath:/web/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // For root URL, always return index.html
                        return new ClassPathResource("/web/index.html");
                    }
                });

        // Then, serve static resources directly
        registry.addResourceHandler("/**", "", ".")
                .addResourceLocations("classpath:/web/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource resource = location.createRelative(resourcePath);

                        // If the resource exists and is readable, serve it directly
                        if (resource.exists() && resource.isReadable()) {
                            return resource;
                        }

                        // If the resource doesn't exist, it might be an Angular route
                        // Forward to index.html for Angular's router to handle

                        // Handle API requests, files with extensions, and direct requests to index.html
                        if (resourcePath.startsWith("api/") || 
                            resourcePath.contains(".") || 
                            resourcePath.equals("index.html")) {
                            return null; // Let the next resource handler handle it
                        }

                        // Explicitly handle root URL without trailing slash (empty resourcePath)
                        // as well as other Angular routes
                        if (resourcePath.isEmpty() || !resourcePath.contains(".")) {
                            return new ClassPathResource("/web/index.html");
                        }

                        return null;
                    }
                });
    }
}

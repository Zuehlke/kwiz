package ch.zuhlke.camp.kwiz.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for OpenAPI/Swagger documentation.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Configures the OpenAPI documentation for the KwiZ application.
     *
     * @return the OpenAPI configuration
     */
    @Bean
    public OpenAPI kwizOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("KwiZ API")
                        .description("API documentation for the KwiZ pub quiz system")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("KwiZ Team")
                                .email("kwiz@zuhlke.com")));
    }
}
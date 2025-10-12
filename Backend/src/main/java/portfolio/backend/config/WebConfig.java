package portfolio.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import portfolio.backend.Interceptor.VisitorInformationInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private VisitorInformationInterceptor visitorInformationInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(visitorInformationInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/css/**", "/js/**", "/images/**", "/videos/**");
    }
}
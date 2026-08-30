package portfolio.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
// import portfolio.backend.Interceptor.VisitorInformationInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // 방문자 추적 인터셉터 - 비활성화 (쿠키 기반 추적 한계로 제거, 필요시 재활성화)
    // @Autowired
    // private VisitorInformationInterceptor visitorInformationInterceptor;

    // @Override
    // public void addInterceptors(InterceptorRegistry registry) {
    //     registry.addInterceptor(visitorInformationInterceptor)
    //             .addPathPatterns("/**")
    //             .excludePathPatterns("/css/**", "/js/**", "/images/**", "/videos/**");
    // }
}

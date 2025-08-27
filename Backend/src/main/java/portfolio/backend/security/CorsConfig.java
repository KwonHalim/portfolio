package portfolio.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(
                "https://harim.dev",
                "http://localhost:5500" //로컬 개발 허용
        ));
//        Options는 실제 데이터 요청하기 전 웹 서버가 지원하는 HTTP 요청 방식을 확인하는 데에 사용된다.
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
//        쿠키나 인증 헤더같은 인증 정보 사용 안함,
        cfg.setAllowCredentials(false);
//        사전 요청 캐시 기간, 이 기간동안은 Options에 대한 요청을 보내지 않고
//         PUT, DELETE 등을 요청한다.
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}

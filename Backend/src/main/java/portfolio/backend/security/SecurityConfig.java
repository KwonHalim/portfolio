package portfolio.backend.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                // REST API라서 CSRF 비활성화
                .csrf(csrfConfigurer -> csrfConfigurer.disable())
                // CORS: 특정 도메인만 허용
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // 존재하지 않는 경로 포함, 허용 목록 외는 모두 403으로 차단
                .authorizeHttpRequests(auth -> auth
                        // 정적 리소스(스프링이 인식하는 common locations: /static, /public, /resources, /META-INF/resources)
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
//                        정적 리소스 허용 경로
                        .requestMatchers(
                                "/images/**",
                                "/videos/**"
                        ).permitAll()
                        // 헬스체크/기본 페이지
                        .requestMatchers(HttpMethod.GET, "/", "/health", ":8080/favicon.ico").permitAll()
                        // API 공개 (프론트에서 호출)
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/error").permitAll()
//                        만약 /api/~~ 이지만 Controller에 없는 경로에 접근하면 Forbidden 경로로 안내된다.
//

                        // permitAll에 해당하지 않는 경로들에 대해서는 무조건 거절한다.
//                        denyAll은 기본적으로 403 Forbidden 을 반환한다.
                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
                            res.setContentType("application/json");
                            res.getWriter().write("{\"message\":\"접근이 허용되지 않은 경로입니다.\"}");
                        })
                );

        return http.build();
    }
}
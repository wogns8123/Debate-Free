package com.example.debate_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration; // 🟢 임포트 추가
import org.springframework.web.cors.CorsConfigurationSource; // 🟢 임포트 추가
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // 🟢 임포트 추가

import java.util.Arrays; // 🟢 임포트 추가

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 🟢 1. CORS 설정을 Security 필터 체인에 추가
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 보호 비활성화 (이전과 동일)
                .csrf(csrf -> csrf.disable())

                // 3. HTTP 요청에 대한 접근 권한 설정 (이전과 동일)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .anyRequest().authenticated()
                )

                // 4. 세션 관리 정책 설정 (이전과 동일)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    // CORS 설정을 위한 Bean을 별도로 등록
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // React 앱의 주소(Origin)를 허용
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));

        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));

        // 허용할 HTTP 헤더
        configuration.setAllowedHeaders(Arrays.asList("*")); // 모든 헤더 허용

        // 자격 증명(쿠키 등)을 허용할지 여부
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로("/**")에 대해 위에서 정의한 CORS 설정을 적용
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
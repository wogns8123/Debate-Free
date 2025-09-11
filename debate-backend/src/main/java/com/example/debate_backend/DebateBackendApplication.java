package com.example.debate_backend;

import com.example.debate_backend.service.DiscussionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DebateBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(DebateBackendApplication.class, args);
    }

    // 🟢 애플리케이션 시작 시 DiscussionService의 초기화 메서드 호출
    @Bean
    public CommandLineRunner commandLineRunner(DiscussionService discussionService) {
        return args -> {
            discussionService.initializeDefaultTopics();
        };
    }
}
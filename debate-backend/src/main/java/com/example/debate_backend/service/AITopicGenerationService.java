package com.example.debate_backend.service;

import com.example.debate_backend.dto.gemini.GeminiResponse; // 🟢 GeminiResponse DTO 임포트
import com.example.debate_backend.model.Topic;
import com.example.debate_backend.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException; // 🟢 RestClientException 임포트
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AITopicGenerationService {

    private final RestTemplate restTemplate;
    private final TopicRepository topicRepository;

    @Value("${ai.gemini.api-key}")
    private String apiKey;
    @Value("${ai.gemini.api-url}")
    private String apiUrl;

    public AITopicGenerationService(RestTemplate restTemplate, TopicRepository topicRepository) {
        this.restTemplate = restTemplate;
        this.topicRepository = topicRepository;
    }

    public Optional<String> generateTopicFromAI() {
        // AI에 보낼 프롬프트
        String prompt = "Generate a single, neutral, and thought-provoking debate topic suitable for a structured discussion between two sides (for and against). The topic should be a question. For example: 'Should all schools offer free lunch to students?'. Do not include any introductory or concluding phrases, just the question.";

        // Gemini API 요청 본문
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        try {
            // API 호출 및 GeminiResponse DTO로 응답 매핑
            GeminiResponse response = restTemplate.postForObject(apiUrl + "?key=" + apiKey, requestBody, GeminiResponse.class);

            // 응답에서 주제 텍스트 추출
            String topicTitle = parseTopicFromGeminiResponse(response);

            if (topicTitle != null && !topicTitle.isEmpty()) {
                // 주제가 '?'로 끝나지 않으면 추가
                if (!topicTitle.trim().endsWith("?")) {
                    topicTitle = topicTitle.trim() + "?";
                }

                // DB에 이미 존재하는 주제인지 확인
                Optional<Topic> existingTopic = topicRepository.findByTitle(topicTitle);
                if (existingTopic.isEmpty()) {
                    // 새로운 주제이면 DB에 저장
                    topicRepository.save(new Topic(topicTitle));
                    System.out.println("AI generated and saved new topic: " + topicTitle);
                    return Optional.of(topicTitle);
                } else {
                    System.out.println("AI generated a duplicate topic (already in DB): " + topicTitle);
                    return Optional.of(topicTitle); // 중복이라도 일단 반환
                }
            }

        } catch (RestClientException e) { // 🟢 RestClientException 처리 (네트워크, API 에러)
            System.err.println("Error calling Gemini API: " + e.getMessage());
        } catch (Exception e) { // 🟢 그 외 일반적인 예외 처리
            System.err.println("Error processing AI topic generation: " + e.getMessage());
        }
        return Optional.empty(); // 주제 생성 실패 시 빈 Optional 반환
    }

    // Gemini API 응답 DTO에서 주제 텍스트 추출
    private String parseTopicFromGeminiResponse(GeminiResponse apiResponse) {
        if (apiResponse != null && apiResponse.getCandidates() != null && !apiResponse.getCandidates().isEmpty()) {
            GeminiResponse.Candidate candidate = apiResponse.getCandidates().get(0);
            if (candidate.getContent() != null && candidate.getContent().getParts() != null && !candidate.getContent().getParts().isEmpty()) {
                // 첫 번째 후보의 첫 번째 파트에서 텍스트 추출
                return candidate.getContent().getParts().get(0).getText().trim();
            }
        }
        return null;
    }
}
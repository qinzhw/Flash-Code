package com.example.flashcode.config;

import dev.langchain4j.http.client.HttpClientBuilder;
import dev.langchain4j.http.client.jdk.JdkHttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 显式指定 LangChain4j 使用 JDK 原生 HttpClient
 */
@Configuration
public class LangChain4jHttpClientConfig {

    /**
     * 覆盖 starter 的 openAiChatModelHttpClientBuilder（阻塞式对话模型使用）
     */
    @Bean
    public HttpClientBuilder openAiChatModelHttpClientBuilder() {
        return JdkHttpClient.builder();
    }

    /**
     * 覆盖 starter 的 openAiStreamingChatModelHttpClientBuilder（流式对话模型使用）
     */
    @Bean
    public HttpClientBuilder openAiStreamingChatModelHttpClientBuilder() {
        return JdkHttpClient.builder();
    }
}

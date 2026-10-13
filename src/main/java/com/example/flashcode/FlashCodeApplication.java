package com.example.flashcode;

import dev.langchain4j.community.store.embedding.redis.spring.RedisEmbeddingStoreAutoConfiguration;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {RedisEmbeddingStoreAutoConfiguration.class})
@MapperScan("com.example.flashcode.mapper")
public class FlashCodeApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlashCodeApplication.class, args);
	}

}

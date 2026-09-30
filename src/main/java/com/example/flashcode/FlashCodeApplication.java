package com.example.flashcode;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.flashcode.mapper")
public class FlashCodeApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlashCodeApplication.class, args);
	}

}

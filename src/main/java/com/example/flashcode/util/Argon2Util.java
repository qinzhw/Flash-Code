package com.example.flashcode.util;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

public class Argon2Util {
    // Spring推荐默认参数 v5.8+
    private static final Argon2PasswordEncoder encoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();

    /**
     * 加密
     * @param rawPassword 明文密码
     * @return 加密串，形如 $argon2id$v=19$m=65536,t=3,p=4$xxxx$yyyy
     */
    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * 校验密码
     * @param rawPassword 用户输入明文
     * @param encodedPassword 数据库存储的argon2字符串
     * @return 是否匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}

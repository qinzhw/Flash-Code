package com.example.flashcode.service;

/**
 * 截图服务
 */
public interface ScreenshotService {

    /**
     * 通用的截图服务，可以得到访问地址
     *
     * @param webUrl 网页 URL
     * @return 截图 URL 或错误信息
     */
    String generateAndUploadScreenshot(String webUrl);
}

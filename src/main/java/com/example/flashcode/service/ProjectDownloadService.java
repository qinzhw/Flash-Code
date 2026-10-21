package com.example.flashcode.service;

import jakarta.servlet.http.HttpServletResponse;

public interface ProjectDownloadService {

    /**
     * 下载项目为压缩包
     *
     * @param projectPath 项目路径
     * @param downloadFilePath 下载文件路径
     * @param response 响应对象
     */
    void downloadProjectAsZip(String projectPath, String downloadFilePath, HttpServletResponse response);
}

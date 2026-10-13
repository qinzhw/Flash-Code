package com.example.flashcode.service;

import com.example.flashcode.model.dto.chathistory.ChatHistoryQueryRequest;
import com.example.flashcode.model.entity.User;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import com.example.flashcode.model.entity.ChatHistory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;

import java.time.LocalDateTime;

/**
 * 对话历史 服务层。
 *
 */
public interface ChatHistoryService extends IService<ChatHistory> {

    /**
     * 添加对话历史消息。
     *
     * @param appId 应用ID
     * @param message 消息内容
     * @param messageType 消息类型
     * @param userId 创建用户ID
     * @return
     */
    boolean addChatMessage(Long appId, String message, String messageType, Long userId);

    /**
     * 删除应用id下的对话历史消息。
     *
     * @param appId 应用ID
     * @return
     */
    boolean deleteByAppId(Long appId);

    /**
     * 分页查询应用下的下的对话历史消息。
     *
     * @param appId 应用ID
     * @param pageSize 分页大小
     * @param lastCreateTime 最后一次查询时间
     * @param lastCreateTime 最后一次查询用户
     * @param loginUser 当前登录用户
     * @return 分页结果
     */
    Page<ChatHistory> listAppChatHistoryByPage(Long appId, int pageSize,
                                               LocalDateTime lastCreateTime,
                                               User loginUser);

    /**
     * 加载应用下的对话历史消息到内存。
     *
     * @param appId 应用ID
     * @param chatMemory 对话记忆存储
     * @param maxCount 最大加载数量
     * @return
     */
    int loadChatHistoryToMemory(Long appId, MessageWindowChatMemory chatMemory, int maxCount);

    /**
     * 获取查询包装条件
     *
     * @param chatHistoryQueryRequest 查询请求
     * @return 查询包装类
     */
    QueryWrapper getQueryWrapper(ChatHistoryQueryRequest chatHistoryQueryRequest);
}

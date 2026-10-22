package com.example.flashcode.service;

import com.example.flashcode.model.dto.app.AppAddRequest;
import com.example.flashcode.model.dto.app.AppQueryRequest;
import com.example.flashcode.model.entity.User;
import com.example.flashcode.model.vo.AppVO;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import com.example.flashcode.model.entity.App;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * 应用 服务层。
 *
 */
public interface AppService extends IService<App> {

    /**
     * 通过对话生成应用代码
     *
     * @param appId 应用id
     * @param Message 用户消息
     * @param user 用户实体
     * @return 代码流
     */
    Flux<String> chatToGenCode(Long appId, String Message, User user);

    /**
     * 创建app应用
     *
     * @param appAddRequest 应用创建参数
     * @param loginUser 登录用户实体
     * @return 应用ID
     */
    Long createApp(AppAddRequest appAddRequest, User loginUser);

    /**
     * 应用部署
     *
     * @param appId 应用id
     * @param user 用户实体
     * @return 可访问的部署地址
     */
    String deployApp(Long appId, User user);

    /**
     * 异步生成应用截图并更新封面
     *
     * @param appId  应用ID
     * @param appUrl 应用访问URL
     */
    void generateAppScreenshotAsync(Long appId, String appUrl);

    /**
     * 获取应用VO封装类，用于前端展示
     *
     * @param app 应用实体
     * @return 应用VO封装类
     */
    AppVO getAppVO(App app);

    /**
     * 获取应用VO列表，用于前端展示
     *
     * @param appList 应用列表
     * @return 应用VO列表
     */
    List<AppVO> getAppVOList(List<App> appList);

    /**
     * 获取应用查询条件封装类
     *
     * @param appQueryRequest 查询参数
     * @return 查询条件封装类
     */
    QueryWrapper getQueryWrapper(AppQueryRequest appQueryRequest);
}

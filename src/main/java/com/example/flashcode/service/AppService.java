package com.example.flashcode.service;

import com.example.flashcode.model.dto.app.AppQueryRequest;
import com.example.flashcode.model.vo.AppVO;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.service.IService;
import com.example.flashcode.model.entity.App;

import java.util.List;

/**
 * 应用 服务层。
 *
 */
public interface AppService extends IService<App> {

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

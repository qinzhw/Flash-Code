package com.example.flashcode.model.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 用户编辑自己的信息请求参数
 * 仅允许更新昵称、头像、简介，不能改账号、密码、角色
 */
@Data
public class UserEditRequest implements Serializable {

    /**
     * 用户昵称
     */
    private String userName;

    /**
     * 用户头像
     */
    private String userAvatar;

    /**
     * 简介
     */
    private String userProfile;

    private static final long serialVersionUID = 1L;
}

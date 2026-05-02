package com.caglar.common.constant;

public final class RestApis {

    private RestApis() {}

    public static final String DEVELOPER = "/dev";

    public static final String VERSION_V1 = "/v1";

    public static final String ROOT_DEV_V1 = DEVELOPER + VERSION_V1;

    // service base paths
    public static final String AUTH     = ROOT_DEV_V1 + "/auth";
    public static final String USER     = ROOT_DEV_V1 + "/user-profile";
    public static final String ADDRESS  = ROOT_DEV_V1 + "/address";
    public static final String PRODUCT  = ROOT_DEV_V1 + "/product";
    public static final String BANNER   = ROOT_DEV_V1 + "/banner";
    public static final String BASKET   = ROOT_DEV_V1 + "/basket";
    public static final String ORDER    = ROOT_DEV_V1 + "/order";
    public static final String PAYMENT  = ROOT_DEV_V1 + "/payment";
    public static final String CONTACT  = ROOT_DEV_V1 + "/contact";
    public static final String ADMIN    = ROOT_DEV_V1 + "/admin";

    // shared sub-paths
    public static final String REGISTER     = "/register";
    public static final String LOGIN        = "/login";
    public static final String REFRESH      = "/refresh";
    public static final String LOGOUT       = "/logout";

    public static final String CREATE       = "/create";
    public static final String UPDATE       = "/update";
    public static final String DELETE       = "/delete";
    public static final String FIND_ALL     = "/find-all";
    public static final String FIND_BY_ID   = "/find-by-id";
    public static final String SEARCH       = "/search";
    public static final String ME           = "/me";

    public static final String CREATE_USER  = "/create-user";
}

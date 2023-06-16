import { UserRole } from "@prisma/client";

export enum AccessLevel {
  NONE,
  SELF,
  GROUP,
  ALL,
}

export enum Permission {
  USER_CREATE = "USER_CREATE",
  USER_READ = "USER_READ",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",

  GROUP_CREATE = "GROUP_CREATE",
  GROUP_READ = "GROUP_READ",
  GROUP_UPDATE = "GROUP_UPDATE",
  GROUP_DELETE = "GROUP_DELETE",

  POST_CREATE = "POST_CREATE",
  POST_READ = "POST_READ",
  POST_UPDATE = "POST_UPDATE",
  POST_DELETE = "POST_DELETE",
}
export type PermissionGroup = { [p in Permission]?: AccessLevel };
export type RolePermissions = { [p in UserRole]: PermissionGroup };

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: {
    [Permission.USER_CREATE]: AccessLevel.ALL,
    [Permission.USER_READ]: AccessLevel.ALL,
    [Permission.USER_UPDATE]: AccessLevel.ALL,
    [Permission.USER_DELETE]: AccessLevel.ALL,

    [Permission.GROUP_CREATE]: AccessLevel.ALL,
    [Permission.GROUP_READ]: AccessLevel.ALL,
    [Permission.GROUP_UPDATE]: AccessLevel.ALL,
    [Permission.GROUP_DELETE]: AccessLevel.ALL,

    [Permission.POST_CREATE]: AccessLevel.ALL,
    [Permission.POST_READ]: AccessLevel.ALL,
    [Permission.POST_UPDATE]: AccessLevel.ALL,
    [Permission.POST_DELETE]: AccessLevel.ALL,
  },
  [UserRole.OWNER]: {
    [Permission.USER_CREATE]: AccessLevel.GROUP,
    [Permission.USER_READ]: AccessLevel.GROUP,
    [Permission.USER_UPDATE]: AccessLevel.GROUP,
    [Permission.USER_DELETE]: AccessLevel.GROUP,

    [Permission.GROUP_READ]: AccessLevel.SELF,
    [Permission.GROUP_UPDATE]: AccessLevel.SELF,

    [Permission.POST_CREATE]: AccessLevel.GROUP,
    [Permission.POST_READ]: AccessLevel.GROUP,
    [Permission.POST_UPDATE]: AccessLevel.GROUP,
    [Permission.POST_DELETE]: AccessLevel.GROUP,
  },
  [UserRole.USER]: {
    [Permission.USER_READ]: AccessLevel.SELF,
    [Permission.USER_UPDATE]: AccessLevel.SELF,

    [Permission.GROUP_READ]: AccessLevel.SELF,

    [Permission.POST_CREATE]: AccessLevel.SELF,
    [Permission.POST_READ]: AccessLevel.SELF,
    [Permission.POST_UPDATE]: AccessLevel.SELF,
    [Permission.POST_DELETE]: AccessLevel.SELF,
  },
  [UserRole.GUEST]: {},
} satisfies RolePermissions;

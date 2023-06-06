import { UserRole } from "@prisma/client";

export const ROLE_META: {
  [p in UserRole]: {
    classes: {
      bg: `bg-daw-${string}`;
      outline: `outline-daw-${string}`;
      text: `text-daw-${string}`;
    };
  };
} = {
  [UserRole.ADMIN]: {
    classes: {
      bg: "bg-daw-purple-400",
      outline: "outline-daw-purple-400",
      text: "text-daw-purple-900",
    },
  },
  [UserRole.OWNER]: {
    classes: {
      bg: "bg-daw-blue-400",
      outline: "outline-daw-blue-400",
      text: "text-daw-blue-900",
    },
  },
  [UserRole.USER]: {
    classes: {
      bg: "bg-daw-green-400",
      outline: "outline-daw-green-400",
      text: "text-daw-green-900",
    },
  },
  [UserRole.GUEST]: {
    classes: {
      bg: "bg-daw-amber-400",
      outline: "outline-daw-amber-400",
      text: "text-daw-amber-900",
    },
  },
};

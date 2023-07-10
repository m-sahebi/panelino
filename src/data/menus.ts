import { LuChevronsRight } from "react-icons/lu";
import { type AntMenuItem } from "~/data/types/ant";
import { getAntMenuItem } from "~/utils/ant";

export const DASH_SIDEMENU_ITEMS: AntMenuItem[] = [
  getAntMenuItem("Overview", "/", LuChevronsRight),
  getAntMenuItem("Posts", "/posts", LuChevronsRight),
  getAntMenuItem("Users", "/users", LuChevronsRight),
  getAntMenuItem("Data View", "/dataview", LuChevronsRight),
  getAntMenuItem("Files", "/files", LuChevronsRight),
];

export const HOME_MAINMENU_ITEMS: AntMenuItem[] = [
  getAntMenuItem("Home", "/"),
  getAntMenuItem("Dashboard", "/dash"),
];

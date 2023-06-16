import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";
import { getAntMenuItem, type AntMenuItem } from "~/utils/ant";

export const DASH_SIDEMENU_ITEMS: AntMenuItem[] = [
  getAntMenuItem("Overview", "/", MailOutlined),
  getAntMenuItem("Posts", "/posts", AppstoreOutlined),
  getAntMenuItem("Users", "/users", SettingOutlined),
  getAntMenuItem("Data View", "/dataview", SettingOutlined),
  getAntMenuItem("Upload", "/upload", SettingOutlined),
];

export const HOME_MAINMENU_ITEMS: AntMenuItem[] = [
  getAntMenuItem("Home", "/"),
  getAntMenuItem("Dashboard", "/dash"),
];

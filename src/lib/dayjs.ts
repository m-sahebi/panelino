import djs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";

djs.extend(relativeTime);
djs.extend(customParseFormat);

export const dateTime = djs;

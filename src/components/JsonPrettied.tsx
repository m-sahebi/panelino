import { cn } from "~/utils/tailwind";

function jsonPrettify(object: object) {
  let json = JSON.stringify(object, null, 2);
  json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = "text-daw-amber-600"; /// number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-daw-blue-700"; /// key
          match = match.slice(1).slice(0, -2) + ":";
        } else {
          cls = "text-daw-green-700"; /// string
        }
      } else if (/true|false/.test(match)) {
        cls = "text-daw-fuchsia-600"; /// bool
      } else if (/null/.test(match)) {
        cls = "text-daw-gray-500"; /// null
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

type JsonPrettiedProps = { object: object | null | undefined; className?: string };
export default function JsonPrettied({ object, className = "" }: JsonPrettiedProps) {
  return (
    <pre
      className={cn("whitespace-pre-wrap", className)}
      dangerouslySetInnerHTML={{ __html: object ? jsonPrettify(object) : String(object) }}
    />
  );
}

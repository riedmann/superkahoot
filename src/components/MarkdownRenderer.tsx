import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// PlantUML encoding function
function encodePlantUML(text: string): string {
  // PlantUML uses a specific base64-like encoding
  const encode6bit = (b: number): string => {
    if (b < 10) return String.fromCharCode(48 + b);
    b -= 10;
    if (b < 26) return String.fromCharCode(65 + b);
    b -= 26;
    if (b < 26) return String.fromCharCode(97 + b);
    b -= 26;
    if (b === 0) return "-";
    if (b === 1) return "_";
    return "?";
  };

  const encode3bytes = (b1: number, b2: number, b3: number): string => {
    const c1 = b1 >> 2;
    const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
    const c4 = b3 & 0x3f;
    return (
      encode6bit(c1 & 0x3f) +
      encode6bit(c2 & 0x3f) +
      encode6bit(c3 & 0x3f) +
      encode6bit(c4 & 0x3f)
    );
  };

  const utf8 = unescape(encodeURIComponent(text));
  let result = "";
  for (let i = 0; i < utf8.length; i += 3) {
    if (i + 2 === utf8.length) {
      result += encode3bytes(utf8.charCodeAt(i), utf8.charCodeAt(i + 1), 0);
    } else if (i + 1 === utf8.length) {
      result += encode3bytes(utf8.charCodeAt(i), 0, 0);
    } else {
      result += encode3bytes(
        utf8.charCodeAt(i),
        utf8.charCodeAt(i + 1),
        utf8.charCodeAt(i + 2),
      );
    }
  }
  return result;
}

function PlantUMLDiagram({ code }: { code: string }) {
  const [error, setError] = useState(false);
  const encoded = encodePlantUML(code);
  const plantUMLServer =
    "https://plantuml.htldornbirn.org/17159320-b82a-47cf-88c3-31945bc627fe";
  const imageUrl = `${plantUMLServer}/svg/${encoded}`;

  if (error) {
    return (
      <div className="my-4 bg-gray-100 p-4 rounded overflow-x-auto">
        <div className="text-red-600 font-semibold mb-2">
          PlantUML rendering failed
        </div>
        <pre className="text-sm">{code}</pre>
      </div>
    );
  }

  return (
    <div className="my-4 flex flex-col items-center">
      <img
        src={imageUrl}
        alt="PlantUML Diagram"
        className="max-w-full h-auto border border-gray-300 rounded bg-white p-2"
        onError={() => setError(true)}
      />
    </div>
  );
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const codeContent = String(children).replace(/\n$/, "");

            // Handle PlantUML diagrams
            if (!inline && language === "plantuml") {
              return <PlantUMLDiagram code={codeContent} />;
            }

            // Handle regular code blocks with syntax highlighting
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {codeContent}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

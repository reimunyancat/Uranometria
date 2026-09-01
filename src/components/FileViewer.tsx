"use client";
import { useMemo } from "react";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github-dark.css";

export default function FileViewer({
  repo,
  path,
  content,
  onClose,
}: {
  repo: string;
  path: string;
  content: string;
  onClose: () => void;
}) {
  const html = useMemo(() => {
    try {
      return hljs.highlight(content, { language: path.split(".").pop() ?? "" })
        .value;
    } catch {
      return hljs.highlightAuto(content).value;
    }
  }, [content, path]);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "42%",
        height: "100%",
        background: "#0d0d0d",
        borderLeft: "1px solid #2a2a2a",
        display: "flex",
        flexDirection: "column",
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid #2a2a2a",
          color: "#e5e5e5",
          fontSize: 13,
        }}
      >
        <span>
          {repo} / {path}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "1px solid #2a2a2a",
            color: "#8b8b8b",
            padding: "2px 10px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 14,
          overflow: "auto",
          flex: 1,
          fontSize: 12.5,
          lineHeight: 1.55,
        }}
      >
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

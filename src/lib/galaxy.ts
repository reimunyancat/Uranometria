export type RepoInfo = {
  name: string;
  language: string | null;
  stars: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  description: string | null;
};

export type StarSystem = RepoInfo & {
  position: [number, number, number];
  color: string;
  size: number;
  constellation: string;
};

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Rust: "#dea584",
  Python: "#3572a5",
  Go: "#00add8",
  "C++": "#f34b7d",
  C: "#9b9b9b",
  GDScript: "#478cbf",
  Java: "#b07219",
  Kotlin: "#a97bff",
};

export function constellationOf(repo: RepoInfo): string {
  const lang = repo.language ?? "";
  const name = repo.name.toLowerCase();
  const desc = (repo.description ?? "").toLowerCase();
  if (lang === "GDScript" || /game|godot|unity/.test(name + desc))
    return "Games";
  if (["TypeScript", "JavaScript"].includes(lang)) return "Web";
  if (["Rust", "C", "C++", "Go"].includes(lang)) return "Systems";
  if (lang === "Python" && /ml|ai|model|data/.test(name + desc)) return "AI";
  if (lang === "Python") return "Tools";
  return "Misc";
}

export function layoutGalaxy(repos: RepoInfo[]): StarSystem[] {
  const visible = repos.filter((r) => !r.fork && !r.archived);
  const groups = new Map<string, RepoInfo[]>();
  for (const r of visible) {
    const key = constellationOf(r);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const result: StarSystem[] = [];
  const groupList = [...groups.entries()];
  groupList.forEach(([constellation, members], gi) => {
    const groupAngle = (gi / groupList.length) * Math.PI * 2;
    const groupDist = 40;
    const cx = Math.cos(groupAngle) * groupDist;
    const cz = Math.sin(groupAngle) * groupDist;
    members.forEach((repo, i) => {
      const t = i / Math.max(members.length, 1);
      const angle = t * Math.PI * 6 + gi;
      const radius = 4 + i * 2.5;
      result.push({
        ...repo,
        constellation,
        position: [
          cx + Math.cos(angle) * radius,
          Math.sin(i * 2.7) * 3,
          cz + Math.sin(angle) * radius,
        ],
        color: LANGUAGE_COLORS[repo.language ?? ""] ?? "#8b8b8b",
        size: 1 + Math.min(Math.log10(repo.stars + 1) * 0.8, 2),
      });
    });
  });
  return result;
}

export async function fetchGalaxy(): Promise<RepoInfo[]> {
  const res = await fetch("http://localhost:4000/api/galaxy");
  const data = await res.json();
  return data.repos;
}

export type TreeEntry = {
  path: string;
  type: "blob" | "tree";
  size?: number;
};

export type Orbital = {
  name: string;
  path: string;
  kind: "dir" | "file";
  size: number;
  angle: number;
  radius: number;
  y: number;
};

const EXT_COLORS: Record<string, string> = {
  ts: "#3178c6",
  tsx: "#3178c6",
  js: "#f1e05a",
  rs: "#dea584",
  py: "#3572a5",
  md: "#e5e5e5",
  json: "#a0a0a0",
  toml: "#a0a0a0",
};

export function extColor(path: string): string {
  const ext = path.split(".").pop() ?? "";
  return EXT_COLORS[ext] ?? "#6b6b6b";
}

export function layoutSystem(tree: TreeEntry[]): Orbital[] {
  const top = tree.filter((e) => !e.path.includes("/"));
  const dirs = top.filter((e) => e.type === "tree");
  const files = top.filter((e) => e.type === "blob");
  const result: Orbital[] = [];
  dirs.forEach((d, i) => {
    result.push({
      name: d.path,
      path: d.path,
      kind: "dir",
      size: 1.2,
      angle: (i / Math.max(dirs.length, 1)) * Math.PI * 2,
      radius: 10,
      y: 0,
    });
  });
  files.forEach((f, i) => {
    result.push({
      name: f.path.split("/").pop() ?? f.path,
      path: f.path,
      kind: "file",
      size: Math.max(0.3, Math.min(Math.log10((f.size ?? 1) + 1) * 0.35, 1)),
      angle: (i / Math.max(files.length, 1)) * Math.PI * 2 + 0.3,
      radius: 17,
      y: Math.sin(i * 1.7) * 1.5,
    });
  });
  return result;
}

export async function fetchTree(
  owner: string,
  repo: string,
): Promise<TreeEntry[]> {
  const res = await fetch(`http://localhost:4000/api/tree/${owner}/${repo}`);
  const data = await res.json();
  return (data.tree ?? []).map((e: Record<string, unknown>) => ({
    path: e.path,
    type: e.type,
    size: e.size,
  }));
}

export async function fetchFile(
  owner: string,
  repo: string,
  path: string,
): Promise<string> {
  const res = await fetch(
    `http://localhost:4000/api/file/${owner}/${repo}?path=${encodeURIComponent(path)}`,
  );
  return res.text();
}

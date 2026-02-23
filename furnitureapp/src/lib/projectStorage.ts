import { promises as fs } from "fs"
import path from "path"
import { Project } from "@/types/furniture"

const PROJECTS_FILE = path.join(process.cwd(), "data", "projects.json")
const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN
const KV_KEY = process.env.PROJECTS_KV_KEY || "furniture:projects"

async function ensureDataDirectory() {
  const dataDir = path.dirname(PROJECTS_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

function canUseKV() {
  return Boolean(KV_URL && KV_TOKEN)
}

async function readFromKV(): Promise<Project[]> {
  if (!canUseKV()) return []

  const response = await fetch(`${KV_URL}/get/${encodeURIComponent(KV_KEY)}`, {
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to read projects from KV")
  }

  const data = await response.json()
  if (!data.result) return []
  try {
    return JSON.parse(data.result)
  } catch (error) {
    console.error("Invalid projects payload in KV", error)
    return []
  }
}

async function writeToKV(projects: Project[]): Promise<void> {
  if (!canUseKV()) return

  const response = await fetch(`${KV_URL}/set/${encodeURIComponent(KV_KEY)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: JSON.stringify(projects) }),
  })

  if (!response.ok) {
    throw new Error("Failed to write projects to KV")
  }
}

async function readFromFile(): Promise<Project[]> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(PROJECTS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return []
    }
    throw error
  }
}

async function writeToFile(projects: Project[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8")
}

export async function readProjects(): Promise<Project[]> {
  if (canUseKV()) {
    try {
      return await readFromKV()
    } catch (error) {
      console.error("KV read failed, falling back to file storage", error)
    }
  }
  return readFromFile()
}

export async function writeProjects(projects: Project[]): Promise<void> {
  if (canUseKV()) {
    try {
      await writeToKV(projects)
      return
    } catch (error) {
      console.error("KV write failed, falling back to file storage", error)
    }
  }
  await writeToFile(projects)
}

import { NextRequest, NextResponse } from "next/server"
import { readProjects, writeProjects } from "@/lib/projectStorage"
import { Project } from "@/types/furniture"

export async function GET() {
  try {
    const projects = await readProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error reading projects:", error)
    return NextResponse.json(
      { error: "Failed to read projects" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const projects = await readProjects()

    const newProject: Project = {
      id: Date.now().toString(),
      name: body.name || "Без назви",
      orders: body.orders || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    projects.push(newProject)
    await writeProjects(projects)

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const projects = await readProjects()

    const index = projects.findIndex((p) => p.id === body.id)
    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    projects[index] = {
      ...projects[index],
      name: body.name,
      orders: body.orders,
      updatedAt: new Date().toISOString(),
    }

    await writeProjects(projects)
    return NextResponse.json(projects[index])
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const projects = await readProjects()
    const filteredProjects = projects.filter((p) => p.id !== id)

    if (filteredProjects.length === projects.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    await writeProjects(filteredProjects)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    )
  }
}

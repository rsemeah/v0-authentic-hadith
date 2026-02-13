import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface PathLesson {
  id: string
  slug: string
  title: string
  module_id: string
  module_title: string
  module_description: string | null
  order_index: number
  content_type: string
  collection_slug: string | null
  book_number: number | null
  hadith_count: number
  estimated_minutes: number | null
  progress: {
    state: "not_started" | "in_progress" | "completed"
    progress_percent: number
  }
}

export interface PathWithProgress {
  path: {
    id: string
    slug: string
    title: string
    subtitle: string | null
    description: string | null
    icon: string | null
    color: string | null
    bg_color: string | null
    border_color: string | null
    level: string | null
    is_premium: boolean
  }
  lessons: PathLesson[]
  progress: {
    status: string | null
    started_at: string | null
    completed_at: string | null
    last_lesson_id: string | null
    last_activity_at: string | null
    percent: number
    completedCount: number
    total: number
  } | null
}

export async function getPathWithProgress(pathSlug: string): Promise<PathWithProgress> {
  const supabase = await getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user

  const { data: path, error: pathErr } = await supabase
    .from("learning_paths")
    .select("id, slug, title, subtitle, description, icon, color, bg_color, border_color, level, is_premium")
    .eq("slug", pathSlug)
    .single()

  if (pathErr || !path) throw pathErr || new Error("Path not found")

  const { data: lessons, error: lessonsErr } = await supabase
    .from("learning_path_lessons")
    .select("id, slug, title, module_id, module_title, module_description, order_index, content_type, collection_slug, book_number, hadith_count, estimated_minutes")
    .eq("path_id", path.id)
    .order("order_index", { ascending: true })

  if (lessonsErr) throw lessonsErr

  if (!user) {
    return {
      path,
      lessons: (lessons ?? []).map((l) => ({
        ...l,
        progress: { state: "not_started" as const, progress_percent: 0 },
      })),
      progress: null,
    }
  }

  const { data: pathProgress } = await supabase
    .from("user_learning_path_progress")
    .select("status, started_at, completed_at, last_lesson_id, last_activity_at")
    .eq("path_id", path.id)
    .eq("user_id", user.id)
    .maybeSingle()

  const { data: lessonProgress } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, state, progress_percent, started_at, completed_at, updated_at")
    .eq("path_id", path.id)
    .eq("user_id", user.id)

  const progressByLesson = new Map(
    (lessonProgress ?? []).map((p) => [p.lesson_id, p])
  )

  const computed = (lessons ?? []).map((l) => ({
    ...l,
    progress: progressByLesson.get(l.id) ?? {
      state: "not_started" as const,
      progress_percent: 0,
    },
  }))

  const completedCount = computed.filter(
    (x) => x.progress.state === "completed"
  ).length
  const total = lessons?.length ?? 0
  const percent = total ? Math.round((completedCount / total) * 100) : 0

  return {
    path,
    lessons: computed,
    progress: {
      status: pathProgress?.status ?? null,
      started_at: pathProgress?.started_at ?? null,
      completed_at: pathProgress?.completed_at ?? null,
      last_lesson_id: pathProgress?.last_lesson_id ?? null,
      last_activity_at: pathProgress?.last_activity_at ?? null,
      percent,
      completedCount,
      total,
    },
  }
}

export async function getAllPathsWithProgress() {
  const supabase = await getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user

  const { data: paths } = await supabase
    .from("learning_paths")
    .select("id, slug, title, subtitle, description, icon, color, bg_color, border_color, level, is_premium, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })

  if (!paths || paths.length === 0) return []

  // Fetch all lessons grouped by path
  const pathIds = paths.map((p) => p.id)
  const { data: allLessons } = await supabase
    .from("learning_path_lessons")
    .select("id, path_id, slug, title, module_id, module_title, module_description, order_index, content_type, collection_slug, book_number, hadith_count, estimated_minutes")
    .in("path_id", pathIds)
    .order("order_index", { ascending: true })

  let userPathProgress: Map<string, any> = new Map()
  let userLessonProgress: Map<string, any> = new Map()

  if (user) {
    const { data: pathProg } = await supabase
      .from("user_learning_path_progress")
      .select("path_id, status, started_at, completed_at, last_lesson_id, last_activity_at")
      .eq("user_id", user.id)
      .in("path_id", pathIds)

    userPathProgress = new Map((pathProg ?? []).map((p) => [p.path_id, p]))

    const { data: lessonProg } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id, state, progress_percent")
      .eq("user_id", user.id)
      .in("path_id", pathIds)

    userLessonProgress = new Map(
      (lessonProg ?? []).map((p) => [p.lesson_id, p])
    )
  }

  return paths.map((path) => {
    const lessons = (allLessons ?? []).filter((l) => l.path_id === path.id)
    const pathProg = userPathProgress.get(path.id)

    const lessonsWithProgress = lessons.map((l) => ({
      ...l,
      progress: userLessonProgress.get(l.id) ?? {
        state: "not_started" as const,
        progress_percent: 0,
      },
    }))

    const completedCount = lessonsWithProgress.filter(
      (x) => x.progress.state === "completed"
    ).length
    const total = lessons.length
    const percent = total ? Math.round((completedCount / total) * 100) : 0

    return {
      path,
      lessons: lessonsWithProgress,
      progress: user
        ? {
            status: pathProg?.status ?? null,
            started_at: pathProg?.started_at ?? null,
            completed_at: pathProg?.completed_at ?? null,
            last_lesson_id: pathProg?.last_lesson_id ?? null,
            last_activity_at: pathProg?.last_activity_at ?? null,
            percent,
            completedCount,
            total,
          }
        : null,
    }
  })
}

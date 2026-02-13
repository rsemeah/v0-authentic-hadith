"use server"

import { markLessonComplete, markLessonInProgress, startLearningPath } from "@/lib/learningProgress"

export async function completeLessonAction(formData: FormData) {
  const pathId = String(formData.get("pathId"))
  const lessonId = String(formData.get("lessonId"))
  return markLessonComplete({ pathId, lessonId })
}

export async function startLessonAction(formData: FormData) {
  const pathId = String(formData.get("pathId"))
  const lessonId = String(formData.get("lessonId"))
  await startLearningPath({ pathId })
  return markLessonInProgress({ pathId, lessonId })
}

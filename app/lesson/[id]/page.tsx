"use client"

import { use, useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { getCourse, getCourses } from "@/lib/courses"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ArrowRight, Check, Play, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Course, Lesson } from "@/lib/types"

function LessonSidebar({
  course,
  currentLesson,
  completedLessons,
}: {
  course: Course
  currentLesson: Lesson
  completedLessons: string[]
}) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <Link href={`/course/${course.id}`} className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Back to Course
        </Link>
        <h2 className="mt-4 font-semibold text-foreground">{course.title}</h2>
        <div className="mt-2">
          <Progress value={(completedLessons.length / course.lessons.length) * 100} className="h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            {completedLessons.length} of {course.lessons.length} lessons completed
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {course.lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id)
            const isCurrent = lesson.id === currentLesson.id

            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}?courseId=${course.id}`}
                className={`flex items-center gap-3 rounded-lg p-3 text-sm transition-colors ${
                  isCurrent
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                        ? "bg-accent-foreground text-accent"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                </div>
                <div className="flex-1 truncate">
                  <p className={isCurrent ? "font-medium" : ""}>{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                </div>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

function LessonContent({ id }: { id: string }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId")
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [course, setCourse] = useState<Course | null>(null)
  const [courseLoading, setCourseLoading] = useState(true)

  // Load course from Firebase
  useEffect(() => {
    async function loadCourse() {
      if (courseId) {
        const courseData = await getCourse(courseId)
        setCourse(courseData)
      } else {
        // Find course by lesson ID
        const allCourses = await getCourses()
        const foundCourse = allCourses.find((c) => c.lessons.some((l) => l.id === id))
        setCourse(foundCourse || null)
      }
      setCourseLoading(false)
    }
    loadCourse()
  }, [courseId, id])

  const lesson = course?.lessons.find((l) => l.id === id)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user && course && !user.purchasedCourses.includes(course.id)) {
      router.push(`/course/${course.id}`)
    }
  }, [user, course, router])

  if (authLoading || courseLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Skeleton className="h-96 w-full max-w-4xl" />
        </main>
      </div>
    )
  }

  if (!user || !course || !lesson) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Lesson not found</h1>
            <p className="mt-2 text-muted-foreground">The lesson you are looking for does not exist.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null

  const markAsComplete = () => {
    if (!completedLessons.includes(lesson.id)) {
      setCompletedLessons([...completedLessons, lesson.id])
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-80 lg:block">
          <LessonSidebar course={course} currentLesson={lesson} completedLessons={completedLessons} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Mobile Sidebar Toggle */}
          <div className="border-b border-border p-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="mr-2 h-4 w-4" />
                  Course Content
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <LessonSidebar course={course} currentLesson={lesson} completedLessons={completedLessons} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Video Player */}
            <Card className="overflow-hidden">
              {lesson.videoUrl ? (
                <div className="relative aspect-video">
                  {lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be") ? (
                    <iframe
                      src={lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
                    />
                  ) : lesson.videoUrl.includes("vimeo.com") ? (
                    <iframe
                      src={lesson.videoUrl.replace("vimeo.com/", "player.vimeo.com/video/")}
                      className="absolute inset-0 h-full w-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
                    />
                  ) : (
                    <video
                      src={lesson.videoUrl}
                      controls
                      className="absolute inset-0 h-full w-full"
                    >
                      <track kind="captions" />
                    </video>
                  )}
                </div>
              ) : (
                <div className="relative aspect-video bg-foreground">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-background">
                    <Play className="h-16 w-16 opacity-80" />
                    <p className="mt-4 text-lg">{lesson.title}</p>
                    <p className="mt-2 text-sm opacity-70">{lesson.duration} minutes</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Lesson Info */}
            <div className="mt-8">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{lesson.title}</h1>
              <p className="mt-2 text-muted-foreground">{lesson.description}</p>

              <Card className="mt-6">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-foreground">Lesson Content</h2>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{lesson.content}</p>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <div>
                  {prevLesson ? (
                    <Button variant="outline" asChild>
                      <Link href={`/lesson/${prevLesson.id}?courseId=${course.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Link>
                    </Button>
                  ) : (
                    <div />
                  )}
                </div>
                <Button onClick={markAsComplete} variant={completedLessons.includes(lesson.id) ? "secondary" : "default"}>
                  {completedLessons.includes(lesson.id) ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>
                <div>
                  {nextLesson ? (
                    <Button asChild>
                      <Link href={`/lesson/${nextLesson.id}?courseId=${course.id}`}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/dashboard">
                        Finish Course
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function LessonWrapper({ id }: { id: string }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading lesson...</div>
      </div>
    }>
      <LessonContent id={id} />
    </Suspense>
  )
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <AuthProvider>
      <LessonWrapper id={resolvedParams.id} />
    </AuthProvider>
  )
}

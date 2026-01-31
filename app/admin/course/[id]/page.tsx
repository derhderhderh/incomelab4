"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { getCourse, updateCourse, addLessonToCourse, updateLesson, deleteLesson } from "@/lib/courses"
import type { Course, Lesson } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  Save,
  Clock,
  Video,
} from "lucide-react"

function CourseEditorContent({ id }: { id: string }) {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [courseLoading, setCourseLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null)
  const [lessonSubmitting, setLessonSubmitting] = useState(false)

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    price: "",
    category: "",
    isFeatured: false,
    features: "",
  })

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    duration: "",
  })

  // Load course
  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await getCourse(id)
        if (data) {
          setCourse(data)
          setCourseForm({
            title: data.title,
            description: data.description,
            longDescription: data.longDescription,
            price: data.price.toString(),
            category: data.category,
            isFeatured: data.isFeatured,
            features: data.features.join("\n"),
          })
        }
      } catch (error) {
        console.error("Failed to load course:", error)
      } finally {
        setCourseLoading(false)
      }
    }
    loadCourse()
  }, [id])

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/")
    }
  }, [authLoading, user, isAdmin, router])

  // Save course details
  const handleSaveCourse = async () => {
    if (!course) return
    setSaving(true)
    try {
      await updateCourse(course.id, {
        title: courseForm.title,
        description: courseForm.description,
        longDescription: courseForm.longDescription,
        price: Number.parseFloat(courseForm.price),
        category: courseForm.category,
        isFeatured: courseForm.isFeatured,
        features: courseForm.features.split("\n").filter((f) => f.trim()),
      })
      // Reload course
      const updated = await getCourse(id)
      if (updated) setCourse(updated)
    } catch (error) {
      console.error("Failed to save course:", error)
    } finally {
      setSaving(false)
    }
  }

  // Open lesson dialog for editing
  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl || "",
      duration: lesson.duration.toString(),
    })
    setLessonDialogOpen(true)
  }

  // Open lesson dialog for creating
  const openCreateLesson = () => {
    setEditingLesson(null)
    setLessonForm({
      title: "",
      description: "",
      content: "",
      videoUrl: "",
      duration: "",
    })
    setLessonDialogOpen(true)
  }

  // Save lesson (create or update)
  const handleSaveLesson = async () => {
    if (!course) return
    setLessonSubmitting(true)
    try {
      if (editingLesson) {
        // Update existing lesson
        await updateLesson(course.id, editingLesson.id, {
          title: lessonForm.title,
          description: lessonForm.description,
          content: lessonForm.content,
          videoUrl: lessonForm.videoUrl || undefined,
          duration: Number.parseInt(lessonForm.duration) || 0,
        })
      } else {
        // Create new lesson
        const newOrder = course.lessons.length + 1
        await addLessonToCourse(course.id, {
          title: lessonForm.title,
          description: lessonForm.description,
          content: lessonForm.content,
          videoUrl: lessonForm.videoUrl || undefined,
          duration: Number.parseInt(lessonForm.duration) || 0,
          order: newOrder,
        })
      }
      // Reload course
      const updated = await getCourse(id)
      if (updated) setCourse(updated)
      setLessonDialogOpen(false)
    } catch (error) {
      console.error("Failed to save lesson:", error)
    } finally {
      setLessonSubmitting(false)
    }
  }

  // Delete lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!course) return
    setDeletingLessonId(lessonId)
    try {
      await deleteLesson(course.id, lessonId)
      const updated = await getCourse(id)
      if (updated) setCourse(updated)
    } catch (error) {
      console.error("Failed to delete lesson:", error)
    } finally {
      setDeletingLessonId(null)
    }
  }

  if (authLoading || courseLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-8 h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Course not found</h1>
            <Button className="mt-4" asChild>
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const totalDuration = course.lessons.reduce((acc, l) => acc + l.duration, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-secondary/30 py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
                <p className="mt-1 text-muted-foreground">{course.title}</p>
              </div>
              <Button onClick={handleSaveCourse} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Course Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>Basic information about the course.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Short Description</Label>
                      <Textarea
                        id="description"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="longDescription">Full Description</Label>
                      <Textarea
                        id="longDescription"
                        value={courseForm.longDescription}
                        onChange={(e) => setCourseForm({ ...courseForm, longDescription: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={courseForm.category}
                          onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="featured"
                        checked={courseForm.isFeatured}
                        onCheckedChange={(checked) => setCourseForm({ ...courseForm, isFeatured: checked })}
                      />
                      <Label htmlFor="featured">Featured course</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Features</CardTitle>
                    <CardDescription>What students will learn. One feature per line.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={courseForm.features}
                      onChange={(e) => setCourseForm({ ...courseForm, features: e.target.value })}
                      rows={6}
                      placeholder="Build AI-powered applications&#10;Deploy to production&#10;Monetize your skills"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Course Stats Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lessons</span>
                      <Badge variant="secondary">{course.lessons.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Duration</span>
                      <Badge variant="secondary">{totalDuration} min</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {course.isFeatured ? (
                        <Badge>Featured</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href={`/course/${course.id}`}>Preview Course</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Lessons Section */}
            <Card className="mt-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Course Modules</CardTitle>
                  <CardDescription>Add and manage lessons for this course.</CardDescription>
                </div>
                <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateLesson}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
                      <DialogDescription>
                        {editingLesson
                          ? "Update the lesson details below."
                          : "Fill in the lesson details below."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="lessonTitle">Lesson Title</Label>
                        <Input
                          id="lessonTitle"
                          placeholder="Introduction to AI"
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lessonDescription">Short Description</Label>
                        <Textarea
                          id="lessonDescription"
                          placeholder="Brief description of what this lesson covers"
                          value={lessonForm.description}
                          onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lessonContent">Lesson Content</Label>
                        <Textarea
                          id="lessonContent"
                          placeholder="Full lesson content, notes, and materials..."
                          value={lessonForm.content}
                          onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                          rows={8}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="videoUrl">Video URL (optional)</Label>
                          <Input
                            id="videoUrl"
                            placeholder="https://youtube.com/..."
                            value={lessonForm.videoUrl}
                            onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <Input
                            id="duration"
                            type="number"
                            placeholder="30"
                            value={lessonForm.duration}
                            onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button
                        className="mt-4"
                        onClick={handleSaveLesson}
                        disabled={lessonSubmitting || !lessonForm.title || !lessonForm.description}
                      >
                        {lessonSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : editingLesson ? (
                          "Update Lesson"
                        ) : (
                          "Add Lesson"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {course.lessons.length === 0 ? (
                  <div className="py-12 text-center">
                    <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">No lessons yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      Add your first lesson to start building your course.
                    </p>
                    <Button className="mt-4" onClick={openCreateLesson}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {course.lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {lesson.duration} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditLesson(lesson)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  {deletingLessonId === lesson.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{lesson.title}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)

  return (
    <AuthProvider>
      <CourseEditorContent id={resolvedParams.id} />
    </AuthProvider>
  )
}

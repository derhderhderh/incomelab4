"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { getCourse } from "@/lib/courses"
import type { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, Clock, CheckCircle, Lock, Play, ArrowLeft, Loader2 } from "lucide-react"

function CourseDetailContent({ id }: { id: string }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [purchasing, setPurchasing] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)
  const [courseLoading, setCourseLoading] = useState(true)

  useEffect(() => {
    getCourse(id)
      .then(setCourse)
      .finally(() => setCourseLoading(false))
  }, [id])

  if (courseLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-6 h-10 w-2/3" />
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Course not found</h1>
            <p className="mt-2 text-muted-foreground">The course you are looking for does not exist.</p>
            <Button className="mt-4" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isPurchased = user?.purchasedCourses.includes(course.id)
  const totalDuration = course.lessons.reduce((acc, lesson) => acc + lesson.duration, 0)
  const hours = Math.floor(totalDuration / 60)
  const minutes = totalDuration % 60

  const handlePurchase = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setPurchasing(true)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          userId: user.uid,
          userEmail: user.email,
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Purchase error:", error)
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/courses"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Badge variant="secondary" className="mb-4">
                  {course.category}
                </Badge>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{course.title}</h1>
                <p className="mt-4 text-lg text-muted-foreground">{course.longDescription}</p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {hours > 0 ? `${hours}h ` : ""}
                      {minutes}m total
                    </span>
                  </div>
                </div>
              </div>

              {/* Purchase Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 shadow-lg">
                  <CardContent className="p-6">
                    {isPurchased ? (
                      <>
                        <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Purchased
                        </Badge>
                        <h3 className="text-xl font-semibold text-foreground">You own this course</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Continue learning where you left off.
                        </p>
                        <Button className="mt-6 w-full" asChild>
                          <Link href={`/lesson/${course.lessons[0]?.id}?courseId=${course.id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Learning
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-foreground">${course.price}</span>
                          <span className="text-muted-foreground"> one-time</span>
                        </div>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handlePurchase}
                          disabled={purchasing || authLoading}
                        >
                          {purchasing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Enroll Now"
                          )}
                        </Button>
                        <p className="mt-4 text-center text-xs text-muted-foreground">
                          Lifetime access. No subscription.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-foreground">Course Content</h2>
                <p className="mt-2 text-muted-foreground">
                  {course.lessons.length} lessons
                </p>

                <Accordion type="single" collapsible className="mt-6">
                  {course.lessons.map((lesson, index) => (
                    <AccordionItem key={lesson.id} value={lesson.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-4 text-left">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{lesson.title}</h3>
                            <p className="text-sm text-muted-foreground">{lesson.duration} min</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="ml-12 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                          {isPurchased ? (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/lesson/${lesson.id}?courseId=${course.id}`}>
                                <Play className="mr-2 h-3 w-3" />
                                Play
                              </Link>
                            </Button>
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>What you will learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {course.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <AuthProvider>
      <CourseDetailContent id={resolvedParams.id} />
    </AuthProvider>
  )
}

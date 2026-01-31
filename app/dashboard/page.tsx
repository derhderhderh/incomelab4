"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CourseCard } from "@/components/course-card"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { getCourses } from "@/lib/courses"
import type { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, CheckCircle, Clock, Trophy } from "lucide-react"

function DashboardContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  useEffect(() => {
    getCourses().then(setCourses)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-48" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const purchasedCourses = courses.filter((c) => user.purchasedCourses.includes(c.id))
  const totalLessons = purchasedCourses.reduce((acc, c) => acc + c.lessons.length, 0)
  const totalDuration = purchasedCourses.reduce(
    (acc, c) => acc + c.lessons.reduce((sum, l) => sum + l.duration, 0),
    0
  )
  const hours = Math.floor(totalDuration / 60)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-secondary/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back{user.displayName ? `, ${user.displayName}` : ""}!
            </h1>
            <p className="mt-2 text-muted-foreground">Continue learning and building your AI income.</p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {success && (
              <Alert className="mb-8 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">Purchase Successful!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your course has been added to your account. Start learning now!
                </AlertDescription>
              </Alert>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <BookOpen className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Courses</p>
                    <p className="text-2xl font-bold text-foreground">{purchasedCourses.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lessons</p>
                    <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold text-foreground">{hours}+</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-foreground">0%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Purchased Courses */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
              {purchasedCourses.length === 0 ? (
                <Card className="mt-6">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">No courses yet</h3>
                    <p className="mt-2 text-center text-muted-foreground">
                      Start your AI income journey by enrolling in a course.
                    </p>
                    <Button className="mt-6" asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {purchasedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} purchased />
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Courses - Only show if there are unpurchased courses */}
            {courses.length > 0 && purchasedCourses.length < courses.length && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses
                    .filter((c) => !user.purchasedCourses.includes(c.id))
                    .slice(0, 3)
                    .map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function DashboardWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardWrapper />
    </AuthProvider>
  )
}

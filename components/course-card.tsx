import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Course } from "@/lib/types"
import { BookOpen, Clock } from "lucide-react"

interface CourseCardProps {
  course: Course
  purchased?: boolean
}

export function CourseCard({ course, purchased }: CourseCardProps) {
  const totalDuration = course.lessons.reduce((acc, lesson) => acc + lesson.duration, 0)
  const hours = Math.floor(totalDuration / 60)
  const minutes = totalDuration % 60

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <div className="flex h-full items-center justify-center bg-secondary">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          {course.isFeatured && (
            <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground">Featured</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4">
        <Badge variant="secondary" className="mb-2 w-fit">
          {course.category}
        </Badge>
        <h3 className="line-clamp-2 text-lg font-semibold text-foreground group-hover:text-accent">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{course.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessons.length} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {hours > 0 ? `${hours}h ` : ""}
              {minutes}m
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border p-4">
        {purchased ? (
          <>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Purchased
            </Badge>
            <Button size="sm" asChild>
              <Link href={`/course/${course.id}`}>Continue</Link>
            </Button>
          </>
        ) : (
          <>
            <span className="text-lg font-bold text-foreground">${course.price}</span>
            <Button size="sm" asChild>
              <Link href={`/course/${course.id}`}>View Course</Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export interface User {
  uid: string
  email: string
  displayName: string | null
  role: "user" | "admin"
  purchasedCourses: string[]
  createdAt: Date
}

export interface Lesson {
  id: string
  title: string
  description: string
  videoUrl?: string
  content: string
  duration: number // in minutes
  order: number
}

export interface Course {
  id: string
  title: string
  description: string
  longDescription: string
  price: number
  image: string
  lessons: Lesson[]
  features: string[]
  category: string
  isFeatured: boolean
  createdAt: Date
}

export interface Purchase {
  id: string
  userId: string
  courseId: string
  stripeSessionId: string
  amount: number
  timestamp: Date
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  completedAt?: Date
}

export interface CourseProgress {
  courseId: string
  lessonProgress: LessonProgress[]
  lastAccessedAt: Date
}

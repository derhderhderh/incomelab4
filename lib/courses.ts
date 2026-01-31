import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Course, Lesson } from "./types"

const COURSES_COLLECTION = "courses"

// Get all courses from Firebase
export async function getCourses(): Promise<Course[]> {
  const coursesRef = collection(db, COURSES_COLLECTION)
  const q = query(coursesRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Course[]
}

// Get a single course by ID
export async function getCourse(id: string): Promise<Course | null> {
  const docRef = doc(db, COURSES_COLLECTION, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate() || new Date(),
  } as Course
}

// Get featured courses
export async function getFeaturedCourses(): Promise<Course[]> {
  const coursesRef = collection(db, COURSES_COLLECTION)
  const q = query(coursesRef, where("isFeatured", "==", true), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Course[]
}

// Create a new course
export async function createCourse(
  courseData: Omit<Course, "id" | "createdAt">
): Promise<string> {
  const coursesRef = collection(db, COURSES_COLLECTION)
  const docRef = await addDoc(coursesRef, {
    ...courseData,
    createdAt: new Date(),
  })
  return docRef.id
}

// Update an existing course
export async function updateCourse(
  id: string,
  courseData: Partial<Omit<Course, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, COURSES_COLLECTION, id)
  await updateDoc(docRef, courseData)
}

// Delete a course
export async function deleteCourse(id: string): Promise<void> {
  const docRef = doc(db, COURSES_COLLECTION, id)
  await deleteDoc(docRef)
}

// Add a lesson to a course
export async function addLessonToCourse(
  courseId: string,
  lesson: Omit<Lesson, "id">
): Promise<void> {
  const course = await getCourse(courseId)
  if (!course) throw new Error("Course not found")

  const newLesson: Lesson = {
    ...lesson,
    id: `lesson-${Date.now()}`,
  }

  await updateCourse(courseId, {
    lessons: [...course.lessons, newLesson],
  })
}

// Update a lesson in a course
export async function updateLesson(
  courseId: string,
  lessonId: string,
  lessonData: Partial<Omit<Lesson, "id">>
): Promise<void> {
  const course = await getCourse(courseId)
  if (!course) throw new Error("Course not found")

  const updatedLessons = course.lessons.map((lesson) =>
    lesson.id === lessonId ? { ...lesson, ...lessonData } : lesson
  )

  await updateCourse(courseId, { lessons: updatedLessons })
}

// Delete a lesson from a course
export async function deleteLesson(courseId: string, lessonId: string): Promise<void> {
  const course = await getCourse(courseId)
  if (!course) throw new Error("Course not found")

  const updatedLessons = course.lessons.filter((lesson) => lesson.id !== lessonId)
  await updateCourse(courseId, { lessons: updatedLessons })
}

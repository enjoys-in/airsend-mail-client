"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface Task {
    id: string
    name: string
    status: "in progress" | "completed"
  }
  
  export const demoTasks: Task[] = [
    { id: "1", name: "Initialize system", status: "in progress" },
    { id: "2", name: "Configure settings", status: "in progress" },
    { id: "3", name: "Connect to database", status: "in progress" },
    { id: "4", name: "Set up user accounts", status: "in progress" },
    { id: "5", name: "Verify installation", status: "in progress" },
  ]
  
 
  export function AccountSetup() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [isAutoCompleting, setIsAutoCompleting] = useState(false)

  useEffect(() => {
    fetchTasks(isDemoMode)
  }, [isDemoMode])

  useEffect(() => {
    if (tasks.length > 0 && isAutoCompleting) {
      const incompleteTasks = tasks.filter((task) => task.status === "in progress")

      if (incompleteTasks.length > 0) {
        const nextTaskId = incompleteTasks[0].id
        const delay = 1500 // 1.5 seconds between tasks

        const timer = setTimeout(() => {
          completeTask(nextTaskId)
        }, delay)

        return () => clearTimeout(timer)
      } else {
        // All tasks completed, stop auto-completion
        setIsAutoCompleting(false)
      }
    }
  }, [tasks, isAutoCompleting])

  // This function would be replaced with your actual stream implementation
  const fetchTasks = async (useDemo: boolean) => {
    setIsLoading(true)
    setError(null)

    if (useDemo) {
      // Artificial delay for demo mode
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTasks(demoTasks)
    } else {
      try {
        // This is where you would connect to your backend stream
        // For now, we'll simulate it with a timeout
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Example of how you might handle the stream data
        // In a real implementation, you would replace this with your stream handling code
        const mockStreamData: Task[] = [
          { id: "s1", name: "Connect to API", status: "in progress" },
          { id: "s2", name: "Fetch user data", status: "in progress" },
          { id: "s3", name: "Process information", status: "in progress" },
          { id: "s4", name: "Update database", status: "in progress" },
          { id: "s5", name: "Send notifications", status: "in progress" },
        ]

        setTasks(mockStreamData)
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        setError("Failed to fetch tasks. Please try again.")
        setTasks([])
      }
    }

    setIsLoading(false)
  }

  const toggleDemoMode = () => {
    const newDemoMode = !isDemoMode
    setIsDemoMode(newDemoMode)
  }

  const completeTask = async (taskId: string) => {
    setUpdatingTaskId(taskId)

    // Update the task status
    setTasks((prevTasks) =>
      prevTasks
        .map((task) => (task.id === taskId ? { ...task, status: "completed" as const } : task))
        .sort((a, b) => (a.status === b.status ? 0 : a.status === "completed" ? 1 : -1)),
    )

    // Simulate a small delay for the animation
    setTimeout(() => setUpdatingTaskId(null), 500)
  }

  const startAutoCompletion = () => {
    // Reset all tasks to in progress first
    setTasks((prevTasks) => prevTasks.map((task) => ({ ...task, status: "in progress" as const })))
    setIsAutoCompleting(true)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col relative">
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Account Setup in Progress...</h1>
          <motion.ul layout className="space-y-4 mb-8 w-full">
              <AnimatePresence initial={false}>
                {tasks.map((task) => (
                  <motion.li
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.3 }}
                    className={`py-3 cursor-pointer group ${task.status === "completed" ? "opacity-60" : ""}`}
                    onClick={() => completeTask(task.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-5 h-5 flex-shrink-0 relative"
                        animate={updatingTaskId === task.id ? { rotate: 360 } : { rotate: 0 }}
                        transition={
                          updatingTaskId === task.id
                            ? { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
                            : { duration: 0 }
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-full h-full"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke={task.status === "completed" ? "#5e6ad2" : "#4b5563"}
                            strokeWidth="2"
                            fill={task.status === "completed" ? "#5e6ad2" : "none"}
                            className={
                              updatingTaskId === task.id
                                ? "opacity-30"
                                : task.status === "completed"
                                  ? ""
                                  : "group-hover:stroke-white"
                            }
                          />
                          {updatingTaskId === task.id && (
                            <path
                              d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12"
                              stroke={task.status === "completed" ? "#5e6ad2" : "white"}
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          )}
                          {task.status === "completed" && updatingTaskId !== task.id && (
                            <path
                              d="M8 12L11 15L16 9"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                        </svg>
                      </motion.div>
                      <div className="flex-grow flex items-center justify-between overflow-hidden">
                        <span className="text-sm truncate text-gray-400 group-hover:text-white transition-colors duration-300 ease-in-out">
                          {task.name}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
        </div>
      </div>
      <div className="fixed bottom-4 left-4">
        <button
          onClick={startAutoCompletion}
          disabled={isAutoCompleting}
          className={`px-4 py-2 rounded-md text-sm transition-colors duration-300 ease-in-out ${
            isAutoCompleting
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isAutoCompleting ? "Setting up..." : "Auto Setup"}
        </button>
      </div>
      
    </div>
  )
}

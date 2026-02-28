"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Eraser, Save } from "lucide-react"

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void
}

export function SignatureCanvas({ onSave }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match its display size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Clear canvas and set styles based on theme
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = theme === "dark" ? "#1f2937" : "#f9fafb"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw signature line
    ctx.beginPath()
    ctx.moveTo(20, canvas.height - 20)
    ctx.lineTo(canvas.width - 20, canvas.height - 20)
    ctx.strokeStyle = theme === "dark" ? "#6b7280" : "#9ca3af"
    ctx.lineWidth = 1
    ctx.stroke()

    // Set drawing style
    ctx.strokeStyle = theme === "dark" ? "#ffffff" : "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [theme])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let clientX, clientY

    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let clientX, clientY

    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      e.preventDefault() // Prevent scrolling on touch devices
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = theme === "dark" ? "#1f2937" : "#f9fafb"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Redraw signature line
    ctx.beginPath()
    ctx.moveTo(20, canvas.height - 20)
    ctx.lineTo(canvas.width - 20, canvas.height - 20)
    ctx.strokeStyle = theme === "dark" ? "#6b7280" : "#9ca3af"
    ctx.lineWidth = 1
    ctx.stroke()

    // Reset drawing style
    ctx.strokeStyle = theme === "dark" ? "#ffffff" : "#000000"
    ctx.lineWidth = 2
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL("image/png")
    onSave(signatureData)
  }

  return (
    <div className="space-y-2">
     <div className="w-full border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-32 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <div className="flex justify-between">
        <Button variant="outline" size="sm" type="button" onClick={clearCanvas}>
          <Eraser className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button size="sm" type="button" onClick={saveSignature}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

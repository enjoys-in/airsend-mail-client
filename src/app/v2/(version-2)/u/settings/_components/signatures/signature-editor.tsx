"use client"

import { useEffect, useRef } from "react"
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link2, ImageIcon, Superscript, Subscript
} from "lucide-react"

interface SignatureEditorProps {
  value: string
  onChange: (value: string) => void
}

export function SignatureEditor({ value, onChange }: SignatureEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  // Track the last value we emitted to avoid resetting innerHTML on our own changes
  const lastEmittedRef = useRef(value)

  // Clear contentEditable DOM on unmount to prevent React "removeChild" errors
  useEffect(() => {
    const editor = editorRef.current
    return () => {
      if (editor) {
        while (editor.firstChild) editor.removeChild(editor.firstChild)
      }
    }
  }, [])

  // Only update innerHTML when value changes from an external source
  useEffect(() => {
    if (editorRef.current && value !== lastEmittedRef.current) {
      editorRef.current.innerHTML = value
      lastEmittedRef.current = value
    }
  }, [value])

  const formatText = (tag: string) => {
    const selection = document.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const content = range.extractContents()

    const el = document.createElement(tag)
    el.appendChild(content)
    range.insertNode(el)

    // Move the caret after the inserted element
    range.setStartAfter(el)
    range.setEndAfter(el)
    selection.removeAllRanges()
    selection.addRange(range)

    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      lastEmittedRef.current = html
      onChange(html)
    }
  }

  const applyLink = () => {
    const selection = document.getSelection()
    const range = selection?.getRangeAt(0)
    if (!range || range.collapsed) return

    const url = prompt("Enter URL/email/phone:")
    if (!url) return

    const anchor = document.createElement("a")
    if (url.includes("@")) {
      anchor.href = `mailto:${url}`
    } else if (/^\+?\d+$/.test(url)) {
      anchor.href = `tel:${url}`
    } else {
      anchor.href = url.startsWith("http") ? url : `https://${url}`
    }

    anchor.appendChild(range.extractContents())
    range.insertNode(anchor)

    selection?.removeAllRanges()
    selection?.addRange(range)
    updateContent()
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (!url) return

    const img = document.createElement("img")
    img.src = url
    img.alt = "Image"
    img.style.maxWidth = "100%"
    editorRef.current?.appendChild(img)
    updateContent()
  }

  const wrapWith = (tag: keyof HTMLElementTagNameMap) => () => formatText(tag)

  const insertList = (ordered: boolean) => {
    const tag = ordered ? "ol" : "ul"
    formatText(tag)
  }

  const justify = (align: "left" | "center" | "right") => {
    if (editorRef.current) {
      editorRef.current.style.textAlign = align
      updateContent()
    }
  }

  return (
    <div className="space-y-2">
      <div className="border border-gray-700 rounded-md overflow-hidden">
        <div
          ref={editorRef}
          contentEditable
          dir="ltr"
          onInput={updateContent}
          className="min-h-[100px] text-left p-2 font-mono text-sm bg-white text-black [&_a]:text-blue-600 [&_a]:underline"
        />

        <div className="bg-black border-t border-gray-700 p-1 flex items-center gap-1 overflow-x-auto">
          <button onClick={wrapWith("strong")} className="p-1 hover:bg-gray-800 rounded"  type="button" ><Bold className="h-4 w-4" /></button>
          <button onClick={wrapWith("em")} className="p-1 hover:bg-gray-800 rounded" type="button" ><Italic className="h-4 w-4" /></button>
          <button onClick={wrapWith("u")} className="p-1 hover:bg-gray-800 rounded" type="button" ><Underline className="h-4 w-4" /></button>
          <button onClick={wrapWith("s")} className="p-1 hover:bg-gray-800 rounded" type="button" ><Strikethrough className="h-4 w-4" /></button>
          <button onClick={wrapWith("sub")} className="p-1 hover:bg-gray-800 rounded" type="button" ><Subscript className="h-4 w-4" /></button>
          <button onClick={wrapWith("sup")} className="p-1 hover:bg-gray-800 rounded" type="button" ><Superscript className="h-4 w-4" /></button>

          <div className="h-4 border-r border-gray-700 mx-1"></div>

          <button onClick={() => insertList(false)} className="p-1 hover:bg-gray-800 rounded" type="button" ><List className="h-4 w-4" /></button>
          <button onClick={() => insertList(true)} className="p-1 hover:bg-gray-800 rounded" type="button" ><ListOrdered className="h-4 w-4" /></button>

          <div className="h-4 border-r border-gray-700 mx-1"></div>

          <button onClick={() => justify("left")} className="p-1 hover:bg-gray-800 rounded" type="button" ><AlignLeft className="h-4 w-4" /></button>
          <button onClick={() => justify("center")} className="p-1 hover:bg-gray-800 rounded" type="button" ><AlignCenter className="h-4 w-4" /></button>
          <button onClick={() => justify("right")} className="p-1 hover:bg-gray-800 rounded" type="button" ><AlignRight className="h-4 w-4" /></button>

          <div className="h-4 border-r border-gray-700 mx-1"></div>

          <button onClick={applyLink} className="p-1 hover:bg-gray-800 rounded" type="button" ><Link2 className="h-4 w-4" /></button>
          <button onClick={insertImage} className="p-1 hover:bg-gray-800 rounded" type="button" ><ImageIcon className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  )
}

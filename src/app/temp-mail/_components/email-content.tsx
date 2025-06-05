
interface EmailContentProps {
  content: string
}

export default function EmailContent({ content }: EmailContentProps) {
  return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
}


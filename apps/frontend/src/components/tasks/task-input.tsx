import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

interface TaskInputProps {
  onCreate: (title: string) => void
}

export function TaskInput({ onCreate }: TaskInputProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    const trimmed = title.trim()
    if (trimmed) {
      onCreate(trimmed)
      setTitle('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1"
        onKeyDown={handleKeyDown}
      />
      <Button onClick={handleSubmit}>Add</Button>
    </div>
  )
}

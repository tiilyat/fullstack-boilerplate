import { useCallback, useRef, useState } from 'react'
import type { VariantProps } from 'class-variance-authority'
import type { buttonVariants } from '#/components/ui/button'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: VariantProps<typeof buttonVariants>['variant']
}

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  confirmVariant: VariantProps<typeof buttonVariants>['variant']
  onConfirm: () => void
  onCancel: () => void
}

export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmDialogOptions>({
    title: '',
    message: '',
  })
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts)
    setOpen(true)

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setOpen(false)
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  const handleCancel = useCallback(() => {
    setOpen(false)
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resolveRef.current?.(false)
      resolveRef.current = null
    }
  }, [])

  const dialogProps: DialogProps = {
    open,
    onOpenChange: handleOpenChange,
    title: options.title,
    message: options.message,
    confirmLabel: options.confirmLabel ?? 'Confirm',
    cancelLabel: options.cancelLabel ?? 'Cancel',
    confirmVariant: options.confirmVariant ?? 'destructive',
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  }

  return { confirm, dialogProps }
}

export type { DialogProps }

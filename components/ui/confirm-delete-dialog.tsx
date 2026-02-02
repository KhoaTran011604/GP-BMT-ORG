'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Xác nhận xóa',
  description,
  confirmText = 'Xóa',
  cancelText = 'Không, giữ lại',
  loading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-8">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-center leading-relaxed text-gray-700">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-3 mt-6 sm:flex-col">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={loading}
            className="w-full h-14 text-lg font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg"
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </AlertDialogAction>
          <AlertDialogCancel
            disabled={loading}
            className="w-full h-14 text-lg font-medium border-2 border-gray-300 hover:bg-gray-100 rounded-lg"
          >
            {cancelText}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

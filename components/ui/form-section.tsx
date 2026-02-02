'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Form Section Components - Elderly-friendly UI
 * - Larger fonts for better readability
 * - Clear visual hierarchy with sections
 * - Generous spacing for touch targets
 * - High contrast colors
 */

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
}

function FormSection({
  title,
  description,
  icon,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <div
      data-slot="form-section"
      className={cn('space-y-4', className)}
      {...props}
    >
      <div className="border-b border-gray-300 pb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {icon && <span className="text-blue-600">{icon}</span>}
          {title}
        </h3>
        {description && (
          <p className="text-base text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function FormField({ children, className, ...props }: FormFieldProps) {
  return (
    <div
      data-slot="form-field"
      className={cn('space-y-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  children: React.ReactNode
}

function FormLabel({
  required,
  children,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label
      data-slot="form-label"
      className={cn('text-base font-semibold text-gray-800 block', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3
  children: React.ReactNode
}

function FormGrid({
  columns = 2,
  children,
  className,
  ...props
}: FormGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div
      data-slot="form-grid"
      className={cn('grid gap-5', gridCols[columns], className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function FormActions({ children, className, ...props }: FormActionsProps) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200 mt-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface FormHintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

function FormHint({ children, className, ...props }: FormHintProps) {
  return (
    <p
      data-slot="form-hint"
      className={cn('text-sm text-gray-500 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

interface FormInfoBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'success'
  children: React.ReactNode
}

function FormInfoBox({
  variant = 'info',
  children,
  className,
  ...props
}: FormInfoBoxProps) {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  }

  return (
    <div
      data-slot="form-info-box"
      className={cn(
        'text-base p-4 rounded-lg border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { FormSection, FormField, FormLabel, FormGrid, FormActions, FormHint, FormInfoBox }

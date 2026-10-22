// ============================================================
// HARVESTLINK - Shared UI Components
// ============================================================

import React, { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn, statusColor, statusLabel } from '../../lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle, X, Loader2 } from 'lucide-react';


// ============================================================
// Button
// ============================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-green-700 hover:bg-green-800 text-white shadow-sm focus-visible:ring-green-700 active:scale-[0.98]',
    secondary: 'bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 focus-visible:ring-green-500',
    ghost: 'hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-600',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

// ============================================================
// Input
// ============================================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Input({ label, error, hint, required, id, className, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors',
          'border-gray-300 bg-white text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Select
// ============================================================

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, hint, required, id, options, placeholder, className, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors bg-white',
          'border-gray-300 text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle size={12} />{error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Textarea
// ============================================================

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Textarea({ label, error, hint, required, id, className, ...props }: TextareaProps) {
  const taId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={taId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
        </label>
      )}
      <textarea
        id={taId}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm transition-colors resize-y min-h-[80px]',
          'border-gray-300 bg-white text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle size={12} />{error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Badge
// ============================================================

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'status';
  status?: string;
}

export function Badge({ children, className, variant = 'default', status }: BadgeProps) {
  const colorClass = variant === 'status' && status ? statusColor(status) : 'bg-gray-100 text-gray-700';
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      colorClass,
      className
    )}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="status" status={status}>
      {statusLabel(status)}
    </Badge>
  );
}

// ============================================================
// Card
// ============================================================

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm',
        hoverable && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4 border-b border-gray-100', className)}>{children}</div>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl', className)}>{children}</div>;
}

// ============================================================
// Alert / Toast
// ============================================================

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const alertStyles: Record<AlertType, { bg: string; icon: ReactNode; title: string }> = {
  success: {
    bg: 'bg-green-50 border-green-200 text-green-800',
    icon: <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />,
    title: 'Success',
  },
  error: {
    bg: 'bg-red-50 border-red-200 text-red-800',
    icon: <XCircle size={16} className="text-red-600 flex-shrink-0" />,
    title: 'Error',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />,
    title: 'Warning',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info size={16} className="text-blue-600 flex-shrink-0" />,
    title: 'Info',
  },
};

export function Alert({ type, title, message, onDismiss, className }: AlertProps) {
  const style = alertStyles[type];
  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border text-sm', style.bg, className)} role="alert">
      {style.icon}
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 hover:opacity-70" aria-label="Dismiss">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ============================================================
// Loading States
// ============================================================

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg',
      'bg-[length:200%_100%]',
      className
    )} />
  );
}

export function LoadingSpinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-green-600', className)}
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <LoadingSpinner size={36} className="mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

// ============================================================
// Empty State
// ============================================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6">
      {icon && (
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}

// ============================================================
// Modal / Dialog
// ============================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className={cn(
        'relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full mx-0 sm:mx-4',
        sizes[size],
        'max-h-[90vh] flex flex-col'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
        {footer && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Stat Card
// ============================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, icon, subtitle, trend, className }: StatCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs mt-1 font-medium', trend.positive ? 'text-green-600' : 'text-red-500')}>
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================
// Demo Mode Banner
// ============================================================

export function DemoModeBanner() {
  return (
    <div className="demo-banner px-4 py-2 text-center text-sm" role="note">
      <strong>🌾 Demo Mode</strong> — Running with seeded demonstration data. No real credentials or live data.{' '}
      <span className="opacity-75">Supabase integration pending configuration.</span>
    </div>
  );
}

// ============================================================
// Page Header
// ============================================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <nav className="text-xs text-gray-500 mb-2 flex items-center gap-1" aria-label="Breadcrumb">
          {breadcrumb.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              {item.href ? (
                <a href={item.href} className="hover:text-green-700">{item.label}</a>
              ) : (
                <span className="text-gray-700">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

// ============================================================
// Section
// ============================================================

export function Section({ title, subtitle, children, actions, className }: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h2 className="text-base font-semibold text-gray-800">{title}</h2>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// ============================================================
// Progress Bar
// ============================================================

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, label, color = 'bg-green-500', className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('space-y-1', className)}>
      {label && <p className="text-xs text-gray-600">{label}</p>}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ============================================================
// Avatar
// ============================================================

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  // Simple hash for bg color
  const colors = ['bg-green-600', 'bg-teal-600', 'bg-emerald-600', 'bg-cyan-600', 'bg-lime-600'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={cn('rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0', color, sizes[size], className)}>
      {initials}
    </div>
  );
}

// ============================================================
// Tab Navigation
// ============================================================

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-gray-200 overflow-x-auto', className)} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
            activeTab === tab.id
              ? 'border-green-600 text-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'ml-2 text-xs px-1.5 py-0.5 rounded-full',
              activeTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

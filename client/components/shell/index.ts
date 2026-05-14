/**
 * Shell — Barrel Export
 *
 * The AppShell is the authenticated layout wrapper for ALL dashboard pages.
 * Import from here, not from sub-files directly.
 *
 * Usage:
 *   import { AppShell, useAppShell } from '@/components/shell';
 */
export { AppShell }            from './AppShell';
export { AppShellInner }       from './AppShellInner';
export { AppShellProvider, useAppShell } from './AppShellContext';

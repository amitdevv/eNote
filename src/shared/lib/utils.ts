// Compatibility shim for shadcn-generated components that import
// `cn` from '@/lib/utils' (or whatever the utils alias points to).
// Our canonical implementation lives in ./cn.ts.
export { cn } from './cn';

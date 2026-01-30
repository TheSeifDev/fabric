# Keyboard Shortcuts

Quick reference for keyboard shortcuts in the Fabric Inventory Management System.

## Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Global search |
| `Ctrl/Cmd + /` | Show keyboard shortcuts |
| `Esc` | Close modal/dialog |
| `Ctrl/Cmd + S` | Save current form |

## Navigation

| Shortcut | Action |
|----------|--------|
| `G then D` | Go to Dashboard |
| `G then R` | Go to Rolls |
| `G then C` | Go to Catalogs |
| `G then S` | Go to Settings |
| `G then U` | Go to Users |

## Roll Management

| Shortcut | Action |
|----------|--------|
| `N` | New roll (when on rolls page) |
| `E` | Edit selected roll |
| `Delete` | Delete selected roll |
| `↑/↓` | Navigate roll list |
| `Enter` | Open roll details |
| `/` | Focus search |

## Catalog Management

| Shortcut | Action |
|----------|--------|
| `N` | New catalog (when on catalogs page) |
| `E` | Edit selected catalog |
| `↑/↓` | Navigate catalog list |
| `Enter` | Open catalog details |

## Form Editing

| Shortcut | Action |
|----------|--------|
| `Tab` | Next field |
| `Shift + Tab` | Previous field |
| `Ctrl/Cmd + Enter` | Submit form |
| `Esc` | Cancel/Close |

## List Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + A` | Select all |
| `Ctrl/Cmd + Click` | Multi-select |
| `Shift + Click` | Range select |

## Tips

- Most shortcuts work context-aware (only active on relevant pages)
- Shortcuts are disabled when typing in input fields
- Hold `Shift` to see available shortcuts on hover

## Implementation

To enable keyboard shortcuts in your components, use the `useKeyboardShortcut` hook:

```typescript
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

// In your component
useKeyboardShortcut('n', () => {
  openCreateDialog();
});

useKeyboardShortcut('ctrl+k', () => {
  openSearch();
});
```

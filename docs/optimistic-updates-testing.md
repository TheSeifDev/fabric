/**
 * Optimistic Updates Testing Documentation
 * How to test and verify optimistic update patterns
 */

# Optimistic Updates Testing Guide

## Overview

Optimistic updates make the UI feel instantly responsive by updating the interface immediately while the server request happens in the background. If the server rejects the change, the UI automatically rolls back to the previous state.

## Implementation Status

✅ **Roll Store** - Optimistic updates implemented for:
- `createRoll()` - Add new roll optimistically
- `updateRoll()` - Update roll with rollback on error
- `deleteRoll()` - Remove from UI, restore on error

✅ **Catalog Store** - Optimistic updates implemented for:
- `createCatalog()` - Add new catalog optimistically
- `updateCatalog()` - Update catalog with rollback
- `deleteCatalog()` - Remove from UI, restore on error

## How It Works

### 1. Update Pattern (from useRollStore)

```typescript
updateRoll: async (id: string, data: UpdateRollDTO) => {
  const rollIndex = get().rolls.findIndex(r => r.id === id);
  const originalRoll = get().rolls[rollIndex];
  
  // Step 1: Optimistic update (instant UI change)
  set(state => ({
    rolls: state.rolls.map(r => 
      r.id === id ? { ...r, ...data } : r
    ),
    loading: true,
  }));
  
  try {
    // Step 2: Send to server
    const updated = await rollService.update(id, data);
    
    // Step 3: Confirm with server response
    set(state => ({
      rolls: state.rolls.map(r => r.id === id ? updated : r),
      loading: false,
    }));
    
    return updated;
  } catch (error) {
    // Step 4: Rollback on error
    set(state => ({
      rolls: state.rolls.map(r => 
        r.id === id ? originalRoll : r
      ),
      error: error.message,
      loading: false,
    }));
    throw error;
  }
}
```

## Testing Scenarios

### Scenario 1: Successful Update (Happy Path)

**Test Steps:**
1. Open Roll Management page
2. Click to change a roll's status from "in_stock" to "reserved"
3. **Expected:**
   - UI updates immediately (optimistic)
   - Loading indicator appears
   - Server confirms change
   - Loading indicator disappears
   - Status remains "reserved"

**How to Test:**
```typescript
// In your component
const { updateRoll } = useRollStore();

// This should feel instant
await updateRoll(rollId, { status: 'reserved' });
```

### Scenario 2: Failed Update (Rollback)

**Test Steps:**
1. Attempt an invalid status transition (e.g., sold → in_stock)
2. **Expected:**
   - UI updates immediately to "in_stock" (optimistic)
   - Server rejects the change (business rule violation)
   - UI automatically rolls back to "sold"
   - Error message displays
   - User sees original "sold" status

**Simulating Errors:**
```typescript
// Temporarily modify service to throw error
await updateRoll(rollId, { status: 'in_stock' }); // Will rollback
```

### Scenario 3: Network Delay

**Test Steps:**
1. Throttle network to "Slow 3G" in DevTools
2. Update a roll's location
3. **Expected:**
   - Location updates immediately in UI
   - Loading indicator shows for longer
   - Eventually confirms with server
   - Location persists

### Scenario 4: Rapid Sequential Updates

**Test Steps:**
1. Quickly change status: in_stock → reserved → sold
2. **Expected:**
   - All changes appear instant
   - Only latest request sent to server
   - Final state matches last click

### Scenario 5: Delete with Rollback

**Test Steps:**
1. Delete a roll
2. Simulate server error (catalog has dependencies)
3. **Expected:**
   - Roll disappears immediately
   - Error occurs
   - Roll reappears in list
   - Error message shown

## Testing Tools

### 1. Network Throttling

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Slow 3G" from throttling dropdown
4. Perform updates - should still feel instant

### 2. Error Simulation

**Create a test utilities file:**
```typescript
// lib/test-utils.ts
export const simulateNetworkDelay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const simulateError = (probability: number = 0.5) => {
  if (Math.random() < probability) {
    throw new Error('Simulated server error');
  }
};
```

### 3. Console Logging

Add logging to stores to track optimistic flow:
```typescript
console.log('⚡ Optimistic update');
console.log('📡 Sending to server...');
console.log('✅ Server confirmed');
// or
console.log('❌ Server rejected, rolling back');
```

## Verification Checklist

- [ ] UI updates immediately on user action
- [ ] Loading indicator appears during server request
- [ ] Success: Changes persist after server confirmation
- [ ] Failure: Changes revert to original state
- [ ] Error message displays on failure
- [ ] Works with slow network (throttled)
- [ ] Handles rapid sequential updates
- [ ] No race conditions
- [ ] No stale data displayed

## Common Issues & Solutions

### Issue: Updates feel laggy
**Solution:** Ensure optimistic update happens before `await`

### Issue: Wrong data displayed after rollback
**Solution:** Verify you're storing `originalRoll` before update

### Issue: Multiple updates cause confusion
**Solution:** Disable action buttons while `loading === true`

### Issue: Rollback not happening
**Solution:** Check error handling - make sure `catch` block runs

## Performance Metrics

**Target Performance:**
- Optimistic update: < 16ms (instant)
- Server round-trip: 100-500ms (background)
- Rollback: < 16ms (instant)
- Total user-perceived delay: 0ms ✨

## Next Steps

After verifying optimistic updates:
1. ✅ Test all CRUD operations
2. ✅ Test with varied network conditions
3. ✅ Verify rollback scenarios
4. ⏭️ Move to Phase 3: UX improvements (loading states, toasts)

## Example Test Page

See `components/examples/OptimisticUpdateExample.tsx` for an interactive demo of:
- Status changes with instant feedback
- Location updates
- Error simulation
- Rollback visualization

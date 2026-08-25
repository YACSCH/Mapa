# Address Autocomplete — Design Spec

## Overview

Add address autocomplete/suggestions as the user types in the origin and destination inputs. Uses Nominatim search API with debouncing.

## Changes

### 1. New service function: `searchAddresses()` in `geocodingService.ts`

```typescript
export async function searchAddresses(
  query: string,
  signal?: AbortSignal
): Promise<GeocodedLocation[]>
```

- Calls Nominatim `/search?q=...&format=json&limit=5&addressdetails=1`
- Returns array of `GeocodedLocation` (up to 5 results)
- Same headers as `geocode()` (Accept-Language, User-Agent)

### 2. New component: `AddressInput.tsx` + `AddressInput.css`

Replaces the plain `<input>` for origin/destination in AddressForm.

Behavior:
- Debounce 300ms on keystroke before calling `searchAddresses()`
- Show dropdown list below input with suggestions
- Clicking a suggestion fills the input with `displayName` and closes dropdown
- Escape key or click outside closes dropdown
- Dropdown shows max 5 results
- Loading indicator while searching
- No suggestions shown if query < 3 characters

### 3. Modified: `AddressForm.tsx`

- Replace `<input>` elements with `<AddressInput>` component
- Pass `onSelect` callback to set the selected address value

### 4. No new dependencies

Pure React + Nominatim API. No autocomplete libraries.

## Scope

- Only modifies: `geocodingService.ts`, `AddressForm.tsx`, new files `AddressInput.tsx` + `AddressInput.css`
- No changes to fare calculation, map, routing, or other services

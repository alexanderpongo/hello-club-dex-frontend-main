# Earn Section Handover - Bonds Styling Update

This archive contains the latest UI/UX refinements for the Earn (Bonds) section of the HELLO DEX.

## Key Changes:
1. **Design Unification**: Bond cards now perfectly match the Pools and Referrals pages design language (dark background, subtle borders, no aggressive glows).
2. **Typography**: Switched to a unified Lato (labels/body) and Formula (values/headers) font system.
3. **Interactive Hover**: Implemented a premium "Inset Shadow" (inner glow) effect on card hover.
4. **Tooltips & UX**:
   - Tooltips now work on both hover and click/tap.
   - Updated "Bond Rewards" tooltip with specific program information.
   - Reduced Zap icon size and added "Synthetic Bonds" label.
5. **UI Components**:
   - All buttons standardized to `rounded-full`.
   - "CLAIM" button converted from text to a proper button style.
   - Increased TokenPair logo sizes in the position table.
6. **Build Stability**: Created the missing `hooks/useHaptic.ts` required for production builds.

## Included Files:
- `app/(home)/earn/bonds/page.tsx`: Page entry point.
- `components/ape-bonds/`: All core Bonds components.
- `hooks/useHaptic.ts`: New haptic feedback hook.
- `components/pools/pools-main/table/positions-table/TokenPair.tsx`: Updated shared component for token pairs.

## Instructions for implementation:
- Simply overwrite existing files or merge the changes if other work has been done in the interim.
- Ensure all Tailwind classes are preserved to maintain the exact look and feel of the current [Demo](https://hello-club-dex-demo.surge.sh/earn/bonds/).

**Comparison Target**

- Source visual truth:
  - `C:\Users\sysadmin\.codex\visualizations\2026\07\28\019fa766-8d54-7bb2-a147-b5e1ca846420\google-signin-proposal\mwiQa.png`
  - `C:\Users\sysadmin\.codex\visualizations\2026\07\28\019fa766-8d54-7bb2-a147-b5e1ca846420\google-signin-proposal\tQOf2.png`
- Rendered implementation:
  - `C:\Users\sysadmin\.codex\visualizations\2026\07\28\019fa766-8d54-7bb2-a147-b5e1ca846420\google-signin-proposal\implementation-auth-options-pass2.png`
  - `C:\Users\sysadmin\.codex\visualizations\2026\07\28\019fa766-8d54-7bb2-a147-b5e1ca846420\google-signin-proposal\implementation-auth-options-urdu.png`
- Combined comparison evidence:
  - `C:\Users\sysadmin\.codex\visualizations\2026\07\28\019fa766-8d54-7bb2-a147-b5e1ca846420\google-signin-proposal\comparison-auth-options-pass2.png`
  - `C:\Users\sysadmin\.codex\visualizations\2026\07\28\019fa766-8d54-7bb2-a147-b5e1ca846420\google-signin-proposal\comparison-auth-options-urdu.png`
- Viewport: 390 x 844 CSS pixels, device scale factor 1.
- Density normalization: Pen exports were 782 x 1690 pixels and were downsampled to 390 x 844 for equal-size comparison. Browser implementation captures were 390 x 844 pixels.
- State: unauthenticated sign-up options, English and Urdu app-language states.

**Findings**

- No actionable P0, P1, or P2 visual differences remain.
- The browser-rendered Google Identity Services control uses Google's required typeface and 40-pixel web button height, while the Pen target depicts the 54-pixel native control. This is an accepted provider/platform constraint; the Android component requests the approved 54-pixel layout height.
- The browser capture does not draw Android system status icons. The implementation uses safe-area insets on native, so this does not represent missing app content.

**Required Fidelity Surfaces**

- Fonts and typography: Warsh display, Arabic, and Urdu faces retain the approved hierarchy. Google-controlled button text intentionally follows Google branding.
- Spacing and layout rhythm: horizontal gutters, pill widths, email-button height, legal copy, and login prompt align with the approved composition. Web safe-area compensation was added after the first comparison.
- Colors and visual tokens: the screen now uses the approved parchment emphasis background, gold email CTA, navy/ink text, and white Google surface.
- Image quality and assets: the official Google Identity Services button supplies the Google mark; no recreated logo, CSS drawing, inline SVG, or placeholder asset is used. The email icon uses the existing Ionicons library.
- Copy and content: English and Urdu sign-up, legal, email, and login copy are synchronized. Google web copy is localized through the provider's supported locale option.
- Accessibility and behavior: both choices are real controls; Google loading disables repeat actions, provider failures remain on the same screen, and existing-email linking opens a password-confirmation dialog.

**Focused Region Comparison**

- The authentication choice block and legal/login copy were inspected at full 1:1 phone-screen size. A separate crop was unnecessary because all relevant text, icons, borders, and button surfaces were readable in the normalized combined images.

**Comparison History**

1. First comparison found two P2 differences: the implementation used the newer general screen background instead of the approved parchment background, and browser safe-area behavior shifted the content upward.
2. Fixes: `auth-options.tsx` now uses the parchment emphasis token and adds the web-only 24-pixel top inset while retaining native safe-area handling.
3. Post-fix evidence: `comparison-auth-options-pass2.png` shows the corrected background and vertical composition.
4. Urdu verification then found missing localized auth-options copy. The screen and official Google web button were localized, including RTL direction and mirrored navigation/icon placement.
5. Post-fix evidence: `comparison-auth-options-urdu.png` shows the localized Urdu state against the approved Urdu target.

**Implementation Checklist**

- [x] Match approved English sign-up composition.
- [x] Match approved Urdu/RTL composition.
- [x] Use the official Google-rendered logo and control.
- [x] Preserve email registration as an equal alternative.
- [x] Verify 390 x 844 responsive layout without clipping or hidden controls.
- [x] Check browser console; remaining warnings are pre-existing Expo route/deprecation warnings and not caused by this feature.

**Follow-up Polish**

- P3: Re-capture the Android build after real OAuth credentials are configured to compare the native Google control and Android status bar directly.

final result: passed

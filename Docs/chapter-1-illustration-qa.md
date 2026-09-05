# Chapter 1 illustration and assessment QA — 2026-09-05

Local staging only; no production deployment.

Generated with the built-in image generation tool (imagegen skill), not Pencil.

Assets: `warsh-backend/public/images/discover/tilka-far-tree-v1.png` and
`warsh-backend/public/images/discover/taa-marbuta-school-v1.png`.

Prompt specifications:
- Tilka: educational 3:2 parchment illustration; foreground hand points at one distant sage tree across a long path, navy sleeve, no labels or competing objects.
- Taa marbuta: educational 3:2 parchment diagram; large navy Naskh مَدْرَسَة, final ة and its two dots gold and circled; isolated ة below with an arrow to the ending. No extra labels.

Both outputs inspected for intended meaning and Arabic spelling. Lesson 4 uses backend-relative asset URLs; the player resolves them against its configured API origin for both prefetch and display.

Verification: 405 fixtures validate; app TypeScript passes. The isolated local API integration script verifies prerequisite locking, all 12 questions, incomplete-answer rejection, wrong-answer failure, 12/12 success, Chapter 1 completion and no duplicate XP on replay. Both PNG URLs return HTTP 200. QA-created accounts are retained locally; the existing learner account was not completed by these tests.

Emulator: Continue opens the dedicated test intro; Start renders question 1/12 with four answers. Full assessment submission tested through the API, not all twelve emulator taps.

Emulator discovery readback: Lesson 4 card 1 renders the distant-tree image and corrected Urdu meaning; card 2 renders the school sentence translation; card 3 renders the circled final-letter diagram. Existing card layout retained.

Local server recovery: duplicate Next dev instances on ports 3000/3001 shared a corrupt cache. Both were stopped; `.next` was moved to `.next-qa-recovery-20260905` (recoverable), then one backend started against Docker staging. Do not start another backend over the running instance.

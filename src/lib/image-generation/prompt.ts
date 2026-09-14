/**
 * The styling spec for turning an uploaded clothing photo into an idealized,
 * transparent-background catalog image. This is the single source of truth
 * for what "our house style" looks like — every call site (the upload flow,
 * the seed script, any future reprocessing tool) must build its prompt from
 * this file rather than hand-writing instructions inline, so the whole
 * closet stays visually consistent as items are added over time.
 *
 * If you want to change the look of generated images, edit this file — not
 * the call sites.
 *
 * This is framed as a minimal, targeted photo EDIT (not a re-creation/new
 * product photoshoot) — early attempts that asked the model to "recreate...
 * as a product photograph" produced results that drifted too far from the
 * source (wrong patterns, fabricated pockets/branding, a different pose).
 * Keeping the same framing/pose as the source photo and listing only a
 * small, explicit set of allowed changes keeps the output close to the
 * original garment.
 */
export const IDEALIZATION_PROMPT = `This is a targeted, minimal edit of the exact reference photo — not a redraw, re-creation, or new product photoshoot. Keep the same camera angle, framing, zoom level, and garment pose/position as the source photo; do not reshape the garment into a different pose (for example, do not convert a photo of a garment on a hanger into a worn/ghost-mannequin or flat-lay pose).

Make only these targeted changes:
- Remove the background completely, leaving it fully transparent — no floor, wall, backdrop, hanger, hook, clips, or shadow
- Fasten any buttons, zippers, laces, or belts that are open or undone
- Smooth out wrinkles, creases, and uneven fabric bunching, as if freshly pressed or steamed
- Remove stray price tags, stickers, or pins that aren't part of the garment

Do not change anything else. Preserve exactly, matching the reference photo: the garment's exact base color and secondary colors, pattern scale/density/placement, fabric character and texture, silhouette, collar shape, placket, sleeve length, hem shape, buttons, seams, stitching, trim, and any interior tags/labels.

Important prohibitions:
- do not redesign, restyle, or simplify the garment
- do not change the pattern or color tone
- do not add a pocket, pattern element, or any other design feature that isn't present in the reference photo
- do not invent legible branding, text, or labels — any interior tag/label must be rendered blank or illegibly blurred unless it is clearly, unambiguously readable in the reference photo
- do not add drop shadows
- do not add a human body or mannequin form`;

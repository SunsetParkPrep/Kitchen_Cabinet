# Higgsfield asset prompts — Blueprint-to-Reality

Generate each image at **16:10 or 16:9, 2k**, then save it with the exact filename shown into `assets/`.
The site picks up each file automatically and uses it in place of the built-in vector render.

## Stage 1 — Blueprint → `assets/stage-1-blueprint.jpg`
Model: Soul 2.0 or Nano Banana Pro (`/higgsfield-image-auto`)

> Holographic CAD blueprint of a luxury custom kitchen cabinet and entryway storage system, front elevation, glowing neon cyan and electric blue wireframe lines floating on a deep obsidian-navy background, fine technical grid, dimension lines with millimetre annotations, door-swing arcs, exploded hinge details, translucent hologram glow, volumetric light haze, ultra-sharp vector-like linework, futuristic architectural visualization, no people, no text artifacts

## Stage 2 — 3D CGI build → `assets/stage-2-cgi-build.jpg`
Style: `/02-3d-cgi`

> Photoreal 3D CGI render, Octane/Unreal Engine 5, semi-assembled luxury kitchen cabinet frame mid-construction in a dark studio, smoked dark oak panels and brushed titanium metal carcasses, some doors floating in mid-air sliding into position, glowing cyan and red laser measurement lines projecting across the frames with tiny emitter points, holographic measurement readouts, ray-traced reflections on a polished black concrete floor, volumetric haze, cinematic rim lighting, 35mm lens, shallow depth of field

## Stage 3 — Final reality → `assets/stage-3-reality.jpg`
Style: `/01-cinematic` lighting language

> Ultra-realistic architectural interior photograph of a finished futuristic luxury kitchen, handle-less dark oak cabinetry with integrated smart touch-to-open hardware, concealed warm-white and cyan ambient LED channels under wall cabinets and along the toe-kicks, honed white quartz waterfall island and backsplash with subtle grey veining, matte black fixtures, floor-to-ceiling pantry wall, evening blue-hour light through large windows, magazine-quality, Architectural Digest style, 24mm tilt-shift lens, perfect verticals, HDR, 8k detail

## Gallery "after" shots (optional)
`assets/gallery-meridian.jpg`, `assets/gallery-monolith.jpg`, `assets/gallery-nocturne.jpg`, `assets/gallery-matrix.jpg`.
Reuse the Stage 3 prompt and swap the subject for each one:
- **monolith**: modern entryway with tall dark oak wardrobes, a floating upholstered bench and a backlit coat wall
- **nocturne**: a long galley run with lift-up wall cabinets and a 6m quartz counter
- **matrix**: a 5-bay mudroom locker wall with charging cubbies and bench drawers

## Hero video (optional, `/seedance-auto-generate`)
Use the Stage 3 image as the source frame:
> Slow cinematic dolly-in across the kitchen as LED channels fade on one by one, cabinet door glides open on touch, subtle reflections on quartz, 5s, smooth Steadicam

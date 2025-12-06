# Checkpoint 18 - Blender Integration & Animation Planning

**Date**: December 6, 2025  
**Status**: Paused - Blender work in progress

---

## Session Summary

### Brand Admin Updates
- ✅ Pushed project to GitHub: https://github.com/mrp-xyz/sellercardgen
- ✅ Fixed API key security (config.js now gitignored)
- ✅ New remove.bg API key configured
- ✅ Created comprehensive README for engineering partners

### Blender 3D Work (In Progress)

**File**: Display stand model in Blender 5.0.0

**Completed:**
- ✅ Set up Apple-style white studio background
- ✅ Added Key_Light and Fill_Light (area lights)
- ✅ Increased render quality (128 samples)
- ✅ Applied glass_material# to screen
- ✅ Modified screen to dark LCD effect (black behind glass)
  - Base Color: (0.02, 0.02, 0.03)
  - Roughness: 0.05 (glossy)
  - IOR: 1.45
  - Alpha: 0.85

**Original Materials Found in File:**
- _s3_frontSlate_vpMat
- aluminumBrush_vpMat
- baseRubber_vpMat
- blackPlastic_vpMat
- brass_vpMat
- glass_material#
- graphiteSteel_vpMat
- hard_plastic_material#
- jetBlack_vpMat
- jewelBlk_vpMat
- mylar_grey_vpMat
- screwMetal_vpMat

### Animation Project Plan

**Goal**: Apple.com-style scroll-driven product animation

**Planned Workflow:**
1. Create 360° rotation animation in Blender
2. Render as PNG image sequence (120+ frames)
3. Build web page with GSAP ScrollTrigger
4. Tie frame playback to scroll position

**Dynamic Screen Content:**
- Render device with flat/green screen
- Composite customer images in browser via Canvas
- Enables personalization without re-rendering

### Blender MCP Integration (Not Yet Implemented)

**Options Explored:**
1. **File Watcher** - Write scripts to file, Blender auto-runs (easiest)
2. **Build MCP Server** - WebSocket server in Blender addon (~30 min)
3. **Command Line** - `blender --background --python script.py`

**Recommendation**: File watcher for quick iteration

---

## Projects Structure

```
MP projects/
├── Brand Admin/          # Seller card generator (deployed to GitHub)
├── Neighborhoods PW update/  # New project (empty scaffold)
└── [Blender File]        # Display stand model (location TBD)
```

---

## Next Steps (When Resuming)

1. [ ] Set up Blender file watcher OR MCP connection
2. [ ] Create 360° rotation animation script
3. [ ] Set up render settings for PNG sequence
4. [ ] Render frames
5. [ ] Build web page with scroll interaction
6. [ ] Implement dynamic screen content compositing

---

## Blender Scripts Used This Session

### 1. White Studio Background
```python
import bpy
world = bpy.context.scene.world
world.use_nodes = True
nodes = world.node_tree.nodes
nodes.clear()
bg_node = nodes.new('ShaderNodeBackground')
bg_node.inputs[0].default_value = (1, 1, 1, 1)
output_node = nodes.new('ShaderNodeOutputWorld')
world.node_tree.links.new(bg_node.outputs[0], output_node.inputs[0])
```

### 2. Studio Lighting
```python
import bpy
bpy.ops.object.light_add(type='AREA', location=(2, -2, 3))
key_light = bpy.context.active_object
key_light.data.energy = 500
key_light.data.size = 3

bpy.ops.object.light_add(type='AREA', location=(-2, 2, 2))
fill_light = bpy.context.active_object
fill_light.data.energy = 200
fill_light.data.size = 4
```

### 3. Dark LCD Screen Effect
```python
import bpy
mat = bpy.data.materials['glass_material#']
mat.use_nodes = True
for node in mat.node_tree.nodes:
    if node.type == 'BSDF_PRINCIPLED':
        node.inputs['Base Color'].default_value = (0.02, 0.02, 0.03, 1)
        node.inputs['Roughness'].default_value = 0.05
        node.inputs['IOR'].default_value = 1.45
        node.inputs['Alpha'].default_value = 0.85
mat.blend_method = 'BLEND'
```

---

## Resume Command

When ready to continue, say:
> "Let's pick up from Checkpoint 18 - Blender animation project"

---

*Pin placed - ready to resume anytime!* 📌


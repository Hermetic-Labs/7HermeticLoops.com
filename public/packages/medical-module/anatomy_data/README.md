# Z-Anatomy Data Package

## Contents
- **1,009 anatomical meshes** from Z-Anatomy
- 10 body systems: skeletal, muscular, cardiovascular, nervous, etc.
- 9 languages per mesh: de, en, es, fr, la, nl, pl, pt, zh

## Structure
```
anatomy_data/
├── convert.bat           # Windows converter
├── convert_to_glb.py     # Blender script
├── skeletal/
│   └── Femur/
│       ├── Femur.obj     # 3D mesh
│       ├── en.json       # English: name + description
│       ├── de.json       # German
│       └── ...
└── [other systems]/
```

## Convert to GLB

**Windows:** Double-click `convert.bat`

**Mac/Linux:**
```bash
blender --background --python convert_to_glb.py
```

**Requires:** Blender 3.4+ (has numpy built-in)

## Output
After conversion:
- `[name].glb` added to each mesh folder
- `manifest.json` in root - mesh registry with all metadata

## Integration
Import `manifest.json` into medical-module's `ModelLoader.ts`

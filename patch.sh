#!/bin/bash

echo "🔧 Applying patches to @yume-chan packages..."

# Patch decoder.js: YuvBuffer import
sed -i -e "s|\[YuvBuffer|\[{ default: YuvBuffer }|g" \
  ./node_modules/@yume-chan/scrcpy-decoder-tinyh264/esm/decoder.js

# Patch wrapper.js: worker path
sed -i -e "s|./worker.js|@yume-chan/scrcpy-decoder-tinyh264/esm/worker.js|g" \
  ./node_modules/@yume-chan/scrcpy-decoder-tinyh264/esm/wrapper.js

# Patch pcm-player: worker path
sed -i -e "s|./worker.js|@yume-chan/pcm-player/esm/worker.js|g" \
  ./node_modules/@yume-chan/pcm-player/esm/index.js

echo "✅ Patches applied successfully!"

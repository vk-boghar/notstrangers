#!/usr/bin/env bash
# Regenerate the simplified TopoJSON boundary files shipped with the site.
# Source: DataMeet "maps" repository (MIT licence) — https://github.com/datameet/maps
#   States/Admin2.shp                  -> src/geo/india-states.topo.json   (36 States/UTs, current)
#   Districts/Census_2011/2011_Dist.shp -> src/geo/tn-districts-2011.topo.json (Tamil Nadu, 32 districts)
# usage: scripts/build-geo.sh /path/to/datameet/maps
set -euo pipefail
DM="${1:?path to a checkout of github.com/datameet/maps}"
cd "$(dirname "$0")/.."
npx mapshaper "$DM/States/Admin2.shp" -simplify 0.4% keep-shapes -rename-fields name=ST_NM \
  -rename-layers states -o format=topojson quantization=1e5 src/geo/india-states.topo.json
npx mapshaper "$DM/Districts/Census_2011/2011_Dist.shp" -filter "ST_NM=='Tamil Nadu'" -simplify 3% keep-shapes \
  -filter-fields DISTRICT,censuscode -rename-fields name=DISTRICT \
  -rename-layers districts -o format=topojson quantization=1e5 src/geo/tn-districts-2011.topo.json

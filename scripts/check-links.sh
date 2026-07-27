#!/usr/bin/env bash
set -euo pipefail

clean_route_target() {
  local route="$1"
  if [ ! -f "_redirects" ]; then
    return
  fi

  awk -v route="$route" '$1 == route && $3 == "200" { print $2; exit }' _redirects
}

while IFS= read -r file; do
  while IFS= read -r ref; do
    case "$ref" in
      http*|mailto:*|tel:*|\#*|*\?*)
        continue
        ;;
    esac

    base_dir="$(dirname "$file")"
    clean_ref="${ref%%#*}"

    if [[ "$clean_ref" == /* ]]; then
      target_path=".$clean_ref"
    else
      target_path="$base_dir/$clean_ref"
    fi

    route_target="$(clean_route_target "$clean_ref")"
    if [ ! -e "$target_path" ] && [ -n "$route_target" ]; then
      target_path=".$route_target"
    fi

    if [ ! -e "$target_path" ]; then
      echo "$file -> missing $ref"
      exit 1
    fi
  done < <(rg -o '(href|src)="[^"]+"' "$file" | sed 's/^[^=]*="//;s/"$//')
done < <(find . -path './node_modules' -prune -o -name '*.html' -type f -print)

if [ -f "_redirects" ]; then
  while read -r source target status; do
    case "$source" in
      ""|\#*)
        continue
        ;;
    esac

    case "$target" in
      http*|/*)
        target_path=".${target}"
        ;;
      *)
        target_path="$target"
        ;;
    esac

    route_target="$(clean_route_target "$target")"
    if [ ! -e "$target_path" ] && [ -n "$route_target" ]; then
      target_path=".$route_target"
    fi

    if [ ! -e "$target_path" ]; then
      echo "_redirects -> missing $target"
      exit 1
    fi
  done < _redirects
fi

echo "Local links passed."

#!/usr/bin/env bash
set -euo pipefail

# ---- defaults (edit) ----
FONT_DEFAULT="${FONT_DEFAULT:-DejaVu-Sans}"
DST_DEFAULT="${DST_DEFAULT:-out}"
PAD_DEFAULT="${PAD_DEFAULT:-28}"
POS_DEFAULT="${POS_DEFAULT:-southeast}"
TEXT_GLASS_OPACITY="${TEXT_GLASS_OPACITY:-0.22}"
LOGO_OPACITY_DEFAULT="${LOGO_OPACITY_DEFAULT:-0.85}"
LOGO_SCALE_DEFAULT="${LOGO_SCALE_DEFAULT:-240}"
SAFE_TOP_DEFAULT="${SAFE_TOP_DEFAULT:-250}"
SAFE_BOTTOM_DEFAULT="${SAFE_BOTTOM_DEFAULT:-250}"

# originals + manifest
COPY_ORIG_DEFAULT="${COPY_ORIG_DEFAULT:-1}"        # 1=copy originals, 0=off
ORIG_DIR_DEFAULT="${ORIG_DIR_DEFAULT:-out/originals}"
MANIFEST_DEFAULT="${MANIFEST_DEFAULT:-out/manifest.csv}"
# -------------------------

die(){ echo "Error: $*" >&2; exit 1; }
have(){ command -v "$1" >/dev/null 2>&1; }

SOURCE_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd -- "$(dirname -- "$SOURCE_PATH")" && pwd)"

usage(){ cat <<'TXT'
sfs-tools.sh <command> [args]

Image:
  square [files...]                1080x1080 center-fit (auto-scan if none)
    --dst DIR --keep-exif --channel NAME --kind NAME --no-slug [--no-copy]
  story  [files...] [--guides]     1080x1920 center-fit + optional safe guides
    --dst/--keep-exif/--channel/--kind/--no-slug [--no-copy] --guides --safe-top PX --safe-bottom PX
  wm-text "Text" [opts]            Text watermark with 'glass' chip
    --dst DIR --pos GRAVITY --pad PX --font NAME/TTF --size PX --opacity F [--no-copy]
  wm-logo path/to/logo.png [opts]  Logo watermark
    --dst DIR --pos GRAVITY --pad PX --scale PX --logo-opacity F [--no-copy]
  wm-circuit [opts]                Circuit overlay + optional side panels (brand theme)
    --dst DIR --tint HEX           (default #00FFD1)
    --opacity F                    0..1 overlay alpha (default 0.18)
    --blend MODE                   screen|overlay|softlight (default screen)
    --blur PX                      blur the circuit pattern (default 0)
    --panels                       add translucent side panels
    --panel-width PCT              each panel width % of image width (default 12)
    --panel-opacity F              panel alpha (default 0.14)
    --no-copy                      skip originals/manifest logging

Git:
  git-cherry -p PR# | -b SRC [-B BASE] [-n NEW] [--prefix STR] [--milestone NAME]
    env LABELS="a,b" REVIEWERS="user1,user2" AUTO_MERGE=1
  git-cherry-continue
  git-cherry-abort
TXT
}

# ---------- helpers ----------
slugify(){ awk '{s=tolower($0); gsub(/[^a-z0-9]+/,"-",s); gsub(/(^-+|-+$)/,"",s); print s }'; }
ext_of(){ local f="$1"; echo "${f##*.}" | tr '[:upper:]' '[:lower:]'; }
next_seq(){
  local dir="$1" prefix="$2" n=0
  shopt -s nullglob
  for f in "$dir"/"$prefix"_*.{jpg,jpeg,png,webp,heic}; do
    local base="${f##*/}"
    local num="${base%.*}"; num="${num##*_}"
    [[ "$num" =~ ^[0-9]{3}$ ]] && (( num > n )) && n="$num"
  done
  printf "%03d" $((10#$n + 1))
}
out_name(){
  local dst="$1" src="$2" channel="$3" kind="$4" slug_on="$5"
  local ext; ext="$(ext_of "$src")"
  if [[ "$slug_on" == "0" ]]; then
    echo "${dst}/$(basename "$src")"
  else
    local date; date="$(date +%F)"
    local prefix="${date}_$(echo "${channel:-generic}" | slugify)_$(echo "${kind:-asset}" | slugify)"
    local seq; seq="$(next_seq "$dst" "$prefix")"
    echo "${dst}/${prefix}_${seq}.${ext}"
  fi
}
collect_inputs(){
  if [[ "$#" -gt 0 ]]; then
    printf '%s\0' "$@"
  else
    find . -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.heic' -o -iname '*.webp' \) \
      ! -path "./out/*" -print0
  fi
}

# originals + manifest helpers
ensure_manifest(){
  local mf="$1"
  if [[ ! -f "$mf" ]]; then
    mkdir -p "$(dirname "$mf")"
    echo "timestamp,op,src,out,width,height,exif_kept,channel,kind" > "$mf"
  fi
}
copy_unique(){
  local src="$1" dst_dir="$2"
  mkdir -p "$dst_dir"
  local base ext name cand
  base="$(basename "$src")"
  name="${base%.*}"; ext="${base##*.}"
  cand="${dst_dir}/${base}"
  local i=1
  while [[ -e "$cand" ]]; do
    cand="${dst_dir}/${name}_$i.${ext}"
    ((i++))
  done
  cp -p "$src" "$cand" || cp "$src" "$cand"
  echo "$cand"
}
log_manifest(){
  local mf="$1" op="$2" src="$3" out="$4" keep="$5" channel="$6" kind="$7"
  local dim
  dim="$(identify -format "%w,%h" "$out" 2>/dev/null || echo "0,0")"
  printf "%s,%s,%s,%s,%s,%s,%s,%s\n" \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$op" "$src" "$out" \
    "${dim%%,*}" "${dim##*,}" "$keep" "${channel:-}" "${kind:-}" >> "$mf"
}

# ---------------- Image: square ----------------
cmd_square(){
  have magick || die "Need ImageMagick 'magick'. Add pkgs.imagemagick (+ fonts) to replit.nix."
  local dst="${DST_DEFAULT}" keep=0 channel= kind="post" slug_on=1 copy="${COPY_ORIG_DEFAULT}" mf="${MANIFEST_DEFAULT}" orig="${ORIG_DIR_DEFAULT}"
  while [[ "$#" -gt 0 ]]; do case "$1" in
    --dst) dst="$2"; shift 2;;
    --keep-exif) keep=1; shift;;
    --channel) channel="$2"; shift 2;;
    --kind) kind="$2"; shift 2;;
    --no-slug) slug_on=0; shift;;
    --no-copy) copy=0; shift;;
    *) break;; esac; done
  mkdir -p "$dst"
  [[ "$copy" == "1" ]] && ensure_manifest "$mf"
  local -a opts=(-auto-orient -resize 1080x1080^ -gravity center -extent 1080x1080 -quality 90)
  (( keep==0 )) && opts=(-auto-orient -resize 1080x1080^ -gravity center -extent 1080x1080 -strip -quality 90)
  local -a files=(); while IFS= read -r -d '' f; do files+=("$f"); done < <(collect_inputs "$@")
  for f in "${files[@]}"; do
    local out; out="$(out_name "$dst" "$f" "$channel" "${kind:-sq}" "$slug_on")"
    magick "$f" "${opts[@]}" "$out"
    if [[ "$copy" == "1" ]]; then
      copy_unique "$f" "$orig" >/dev/null
      log_manifest "$mf" "square" "$f" "$out" "$keep" "$channel" "$kind"
    fi
  done
  echo "Done square -> $dst/ (${#files[@]} files)"
}

# ---------------- Image: story ----------------
cmd_story(){
  have magick || die "Need ImageMagick 'magick'."
  local dst="${DST_DEFAULT}" keep=0 channel= kind="story" slug_on=1 guides=0 safe_top="${SAFE_TOP_DEFAULT}" safe_bottom="${SAFE_BOTTOM_DEFAULT}" copy="${COPY_ORIG_DEFAULT}" mf="${MANIFEST_DEFAULT}" orig="${ORIG_DIR_DEFAULT}"
  while [[ "$#" -gt 0 ]]; do case "$1" in
    --dst) dst="$2"; shift 2;;
    --keep-exif) keep=1; shift;;
    --channel) channel="$2"; shift 2;;
    --kind) kind="$2"; shift 2;;
    --no-slug) slug_on=0; shift;;
    --guides) guides=1; shift;;
    --safe-top) safe_top="$2"; shift 2;;
    --safe-bottom) safe_bottom="$2"; shift 2;;
    --no-copy) copy=0; shift;;
    *) break;; esac; done
  mkdir -p "$dst"
  [[ "$copy" == "1" ]] && ensure_manifest "$mf"
  local -a base_opts=(-auto-orient -resize 1080x1920^ -gravity center -extent 1080x1920 -quality 90)
  (( keep==0 )) && base_opts=(-auto-orient -resize 1080x1920^ -gravity center -extent 1080x1920 -strip -quality 90)
  local -a files=(); while IFS= read -r -d '' f; do files+=("$f"); done < <(collect_inputs "$@")
  for f in "${files[@]}"; do
    local out; out="$(out_name "$dst" "$f" "$channel" "${kind:-story}" "$slug_on")"
    if (( guides==1 )); then
      local y1="$safe_top"; local y2=$((1920 - safe_bottom))
      magick "$f" "${base_opts[@]}" -fill none -stroke 'rgba(255,255,255,0.35)' -strokewidth 3 \
        -draw "rectangle 0,$y1 1079,$y2" "$out"
    else
      magick "$f" "${base_opts[@]}" "$out"
    fi
    if [[ "$copy" == "1" ]]; then
      copy_unique "$f" "$orig" >/dev/null
      log_manifest "$mf" "story" "$f" "$out" "$keep" "$channel" "$kind"
    fi
  done
  echo "Done story -> $dst/ (${#files[@]} files)"
}

# ---------------- Image: wm-text ----------------
cmd_wm_text(){
  have magick || die "Need ImageMagick."
  [[ "$#" -ge 1 ]] || die "wm-text needs text."
  local text="$1"; shift || true
  local dst="${DST_DEFAULT}" pos="${POS_DEFAULT}" pad="${PAD_DEFAULT}" font="${FONT_DEFAULT}" size=64 op="${TEXT_GLASS_OPACITY}" copy="${COPY_ORIG_DEFAULT}" mf="${MANIFEST_DEFAULT}"
  while [[ "$#" -gt 0 ]]; do case "$1" in
    --dst) dst="$2"; shift 2;;
    --pos) pos="$2"; shift 2;;
    --pad) pad="$2"; shift 2;;
    --font) font="$2"; shift 2;;
    --size) size="$2"; shift 2;;
    --opacity) op="$2"; shift 2;;
    --no-copy) copy=0; shift;;
    --) shift; break;;
    *) break;; esac; done
  mkdir -p "$dst"; [[ "$copy" == "1" ]] && ensure_manifest "$mf"
  shopt -s nullglob
  for f in out/*.{jpg,JPG,jpeg,PNG,png,webp,WEBP}; do
    local base outp; base="$(basename "$f")"; outp="$dst/$base"
    magick "$f" -gravity "$pos" -font "$font" -pointsize "$size" -fill white \
      -undercolor "rgba(255,255,255,${op})" -annotate +$pad+$pad "$text" \
      -quality 90 "$outp"
    [[ "$copy" == "1" ]] && log_manifest "$mf" "wm-text" "$f" "$outp" "n/a" "" ""
  done
  echo "Watermarked (text) -> $dst/"
}

# ---------------- Image: wm-logo ----------------
cmd_wm_logo(){
  have magick || die "Need ImageMagick."
  [[ "$#" -ge 1 ]] || die "wm-logo needs path/to/logo.(png|svg)"
  local logo="$1"; shift || true
  [[ -f "$logo" ]] || die "Logo not found: $logo"
  local dst="${DST_DEFAULT}" pos="${POS_DEFAULT}" pad="${PAD_DEFAULT}" scale="${LOGO_SCALE_DEFAULT}" lop="${LOGO_OPACITY_DEFAULT}" copy="${COPY_ORIG_DEFAULT}" mf="${MANIFEST_DEFAULT}"
  while [[ "$#" -gt 0 ]]; do case "$1" in
    --dst) dst="$2"; shift 2;;
    --pos) pos="$2"; shift 2;;
    --pad) pad="$2"; shift 2;;
    --scale) scale="$2"; shift 2;;
    --logo-opacity) lop="$2"; shift 2;;
    --no-copy) copy=0; shift;;
    --) shift; break;;
    *) break;; esac; done
  mkdir -p "$dst"; [[ "$copy" == "1" ]] && ensure_manifest "$mf"
  magick "$logo" -alpha on -resize "${scale}x" -channel a -evaluate multiply "$lop" +channel PNG32:/tmp/_wm_logo.png
  shopt -s nullglob
  for f in out/*.{jpg,JPG,jpeg,PNG,png,webp,WEBP}; do
    local base outp; base="$(basename "$f")"; outp="$dst/$base"
    magick "$f" /tmp/_wm_logo.png -gravity "$pos" -geometry +$pad+$pad -compose over -composite -quality 90 "$outp"
    [[ "$copy" == "1" ]] && log_manifest "$mf" "wm-logo" "$f" "$outp" "n/a" "" ""
  done
  echo "Watermarked (logo) -> $dst/"
}

# ---------------- Image: wm-circuit (NEW) ----------------
cmd_wm_circuit(){
  have magick || die "Need ImageMagick."
  local dst="${DST_DEFAULT}" tint="${CIRCUIT_TINT:-#00FFD1}" op="${CIRCUIT_OPACITY:-0.18}" \
        blend="${CIRCUIT_BLEND:-screen}" blur="${CIRCUIT_BLUR:-0}" \
        panels=0 panel_w_pct="${PANEL_WIDTH_PCT:-12}" panel_op="${PANEL_OPACITY:-0.14}" \
        tilesz="${CIRCUIT_TILE:-256}" stroke="${CIRCUIT_STROKE:-2}" copy="${COPY_ORIG_DEFAULT}" mf="${MANIFEST_DEFAULT}"
  while [[ "$#" -gt 0 ]]; do case "$1" in
    --dst) dst="$2"; shift 2;;
    --tint) tint="$2"; shift 2;;
    --opacity) op="$2"; shift 2;;
    --blend) blend="$2"; shift 2;;
    --blur) blur="$2"; shift 2;;
    --panels) panels=1; shift;;
    --panel-width) panel_w_pct="$2"; shift 2;;
    --panel-opacity) panel_op="$2"; shift 2;;
    --no-copy) copy=0; shift;;
    --) shift; break;;
    *) break;; esac; done
  mkdir -p "$dst"; [[ "$copy" == "1" ]] && ensure_manifest "$mf"

  # Build a small circuit-like tile (orthogonal lines + nodes), then tile it over the frame.
  local tile="/tmp/_circuit_tile.png"
  magick -size ${tilesz}x${tilesz} canvas:none \
    -stroke "$tint" -strokewidth "$stroke" -fill none \
    -draw "line 0,$((tilesz/2)) ${tilesz},$((tilesz/2))" \
    -draw "line $((tilesz/2)),0 $((tilesz/2)),${tilesz}" \
    -draw "circle $((tilesz/4)),$((tilesz/4)) $((tilesz/4)),$((tilesz/4+3))" \
    -draw "circle $((3*tilesz/4)),$((tilesz/4)) $((3*tilesz/4)),$((tilesz/4+3))" \
    -draw "circle $((tilesz/4)),$((3*tilesz/4)) $((tilesz/4)),$((3*tilesz/4+3))" \
    -draw "circle $((3*tilesz/4)),$((3*tilesz/4)) $((3*tilesz/4)),$((3*tilesz/4+3))" \
    "$tile"

  shopt -s nullglob
  for f in out/*.{jpg,JPG,jpeg,PNG,png,webp,WEBP}; do
    local base outp; base="$(basename "$f")"; outp="$dst/$base"
    # Dimensions for panels math
    local w h; read -r w h < <(identify -format "%w %h" "$f")
    local panel_px=$(( w * panel_w_pct / 100 ))

    # Compose: base + (tiled circuit with alpha & optional blur)
    if (( panels==1 )); then
      magick "$f" \
        \( -size ${w}x${h} tile:"$tile" -alpha set -channel a -evaluate multiply "$op" +channel $([[ "$blur" != "0" ]] && printf -- "-blur 0x%s" "$blur") \) -compose "$blend" -composite \
        -fill "rgba(255,255,255,${panel_op})" -draw "rectangle 0,0 ${panel_px},${h}" \
        -draw "rectangle $((w - panel_px)),0 ${w},${h}" \
        -quality 90 "$outp"
    else
      magick "$f" \
        \( -size ${w}x${h} tile:"$tile" -alpha set -channel a -evaluate multiply "$op" +channel $([[ "$blur" != "0" ]] && printf -- "-blur 0x%s" "$blur") \) -compose "$blend" -composite \
        -quality 90 "$outp"
    fi

    [[ "$copy" == "1" ]] && log_manifest "$mf" "wm-circuit" "$f" "$outp" "n/a" "" ""
  done
  echo "Watermarked (circuit) -> $dst/"
}

# ---------------- Git (signed cherry-pick + PR) ----------------
sfs_cherrypick_signed(){
  set -euo pipefail
  local PR="" SRC="" BASE="origin/main" NEW=""
  local LABELS="${LABELS:-}" REVIEWERS="${REVIEWERS:-}" AUTO_MERGE="${AUTO_MERGE:-0}"
  local PR_PREFIX="${PR_PREFIX:-}" MILESTONE="${MILESTONE:-}"

  while (( "$#" )); do
    case "$1" in
      -p) PR="$2"; shift 2;;
      -b) SRC="$2"; shift 2;;
      -B) BASE="$2"; shift 2;;
      -n) NEW="$2"; shift 2;;
      --prefix) PR_PREFIX="$2"; shift 2;;
      --milestone) MILESTONE="$2"; shift 2;;
      --) shift; break;;
      *) break;;
    esac
  done

  for t in git gh ssh-keygen; do have "$t" || { echo "✖ missing $t"; return 1; }; done

  git config --global gpg.format ssh
  git config --global gpg.ssh.program "$(command -v ssh-keygen)"
  git config --global commit.gpgsign true
  if ! git config --global user.signingkey >/dev/null; then
    [ -f "$HOME/.ssh/id_ed25519_signing" ] || ssh-keygen -t ed25519 -N "" \
      -C "git-signing $(hostname)-$(date -u +%Y%m%d)" -f "$HOME/.ssh/id_ed25519_signing"
    git config --global user.signingkey "$HOME/.ssh/id_ed25519_signing.pub"
  fi
  if ! git config --global gpg.ssh.allowedSignersFile >/dev/null; then
    mkdir -p "$HOME/.config/git"
    printf '%s %s\n' "$(git config --get user.email)" "$(cat "$(git config --global user.signingkey)")" \
      > "$HOME/.config/git/allowed_signers"
    git config --global gpg.ssh.allowedSignersFile "$HOME/.config/git/allowed_signers"
  fi

  local ROOT; ROOT="$(git rev-parse --show-toplevel)" || { echo "✖ not in a repo"; return 1; }
  cd "$ROOT"
  git fetch origin --prune

  if [ -n "$PR" ]; then
    local head base
    head="$(gh pr view "$PR" --json headRefName -q .headRefName)"
    base="$(gh pr view "$PR" --json baseRefName -q .baseRefName)"
    SRC="origin/${head}"; BASE="origin/${base}"
  fi
  [ -n "$SRC" ] || { echo "✖ need source: -p <PR#> or -b <branch>"; return 1; }

  git fetch origin "${SRC#origin/}" >/dev/null 2>&1 || true
  git fetch origin "${BASE#origin/}" >/dev/null 2>&1 || true

  local BASE_SHA RANGE_SHA
  BASE_SHA="$(git merge-base "$BASE" "$SRC")"
  RANGE_SHA="${BASE_SHA}..${SRC}"

  [ -n "$NEW" ] || NEW="$(basename "${SRC#origin/}")-signed"
  git switch -C "$NEW" "$BASE"

  local stashed=0
  if ! git diff --quiet || ! git diff --cached --quiet; then
    git stash push -u -m "wip-$(date -u +%Y%m%dT%H%M%SZ)" >/dev/null || true
    stashed=1
  fi

  git cherry-pick -x -S $RANGE_SHA || {
    echo "⚠️ Conflicts. Fix -> git add -A && git cherry-pick --continue ; or abort -> git cherry-pick --abort"
    return 2
  }

  git push -u origin "$NEW"

  local BASE_NAME HEAD_NAME TITLE prnum
  BASE_NAME="${BASE#origin/}"; HEAD_NAME="${SRC#origin/}"
  TITLE="${PR_PREFIX:+$PR_PREFIX }Cherry-pick ${HEAD_NAME} into ${BASE_NAME}"

  prnum="$(gh pr create --fill --base "$BASE_NAME" --head "$NEW" --title "$TITLE" --json number -q .number)"

  [ -n "${LABELS}" ]    && gh pr edit "$prnum" --add-label ${LABELS} || true
  [ -n "${REVIEWERS}" ] && gh pr edit "$prnum" --add-reviewer ${REVIEWERS} || true
  [ -n "${MILESTONE}" ] && gh pr edit "$prnum" --milestone "${MILESTONE}" || true

  if [ "${AUTO_MERGE}" = "1" ]; then
    gh repo edit "$(gh repo view --json nameWithOwner -q .nameWithOwner)" --enable-auto-merge true || true
    gh pr merge "$prnum" --auto --squash --delete-branch || true
  fi

  gh pr checks "$prnum" || true
  [ "$stashed" -eq 1 ] && git stash pop || true
  echo "✅ Opened PR #$prnum from $NEW (signed)."
}
sfs_cherry_continue(){ git add -A && git cherry-pick --continue; }
sfs_cherry_abort(){ git cherry-pick --abort; }

# ---------------- dispatch ----------------
case "${1:-help}" in
  square) shift; cmd_square "$@";;
  story) shift; cmd_story "$@";;
  wm-text) shift; cmd_wm_text "$@";;
  wm-logo) shift; cmd_wm_logo "$@";;
  wm-circuit) shift; cmd_wm_circuit "$@";;
  git-cherry) shift; sfs_cherrypick_signed "$@";;
  git-cherry-continue) shift; sfs_cherry_continue "$@";;
  git-cherry-abort) shift; sfs_cherry_abort "$@";;
  help|--help|-h|"") usage;;
  *) usage; exit 1;;
esac

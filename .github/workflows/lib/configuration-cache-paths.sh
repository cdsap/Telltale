#!/usr/bin/env bash
# Build the actions/cache path list for a configuration-cache entry.
# Reads INCLUDED_BUILDS_RAW from the environment so GitHub cannot splice
# untrusted text into this script before bash starts.
set -euo pipefail

workspace="${GITHUB_WORKSPACE:-$(pwd)}"
workspace="$(cd "$workspace" && pwd)"

# Relative workspace paths only. This is also the shell-metacharacter reject:
# quotes, dollars, backticks, and operators are outside the allowlist.
is_allowed_path() {
  [[ "$1" =~ ^[A-Za-z0-9._-]+(/[A-Za-z0-9._*-]+)*$ ]]
}

reject() {
  echo "Rejected included-build path: $1" >&2
  exit 1
}

paths=()
paths+=(".gradle/configuration-cache")
paths+=("${GRADLE_USER_HOME:-$HOME/.gradle}/init.d")

IFS=',' read -ra INCLUDED_BUILDS <<< "${INCLUDED_BUILDS_RAW:-}"
for included_build in "${INCLUDED_BUILDS[@]}"; do
  included_build="${included_build#"${included_build%%[![:space:]]*}"}"
  included_build="${included_build%"${included_build##*[![:space:]]}"}"
  if [ -z "$included_build" ]; then
    continue
  fi

  if [[ "$included_build" == /* || "$included_build" == *..* ]]; then
    reject "$included_build"
  fi
  if ! is_allowed_path "$included_build"; then
    reject "$included_build"
  fi

  if [[ "$included_build" == */\* ]]; then
    parent="${included_build%/*}"
    parent_abs="$workspace/$parent"
    case "$parent_abs" in
      "$workspace"|"$workspace"/*) ;;
      *)
        reject "$included_build"
        ;;
    esac
    if [ -d "$parent_abs" ]; then
      for child in "$parent_abs"/*; do
        if [ -d "$child" ]; then
          child_abs="$(cd "$child" && pwd)"
          case "$child_abs" in
            "$workspace"|"$workspace"/*) ;;
            *)
              reject "$included_build"
              ;;
          esac
          rel="${child_abs#"$workspace"/}"
          paths+=("$rel/build")
        fi
      done
    fi
  else
    paths+=("$included_build/build")
  fi
done

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  delim="CCPATHS_$(od -An -N8 -tx1 /dev/urandom | tr -d ' \n')"
  {
    echo "paths<<$delim"
    printf '%s\n' "${paths[@]}"
    echo "$delim"
  } >> "$GITHUB_OUTPUT"
else
  printf '%s\n' "${paths[@]}"
fi

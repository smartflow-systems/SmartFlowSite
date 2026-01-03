#!/usr/bin/env bash
set -e
if [[ "${REQUIRE_JWT_SECRET:-true}" == "true" ]]; then
  if [[ -z "${JWT_SECRET:-}" ]]; then
    echo "CRITICAL: JWT_SECRET missing"
    exit 1
  fi
fi

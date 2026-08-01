#!/usr/bin/env bash

set -euo pipefail

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

: "${VITE_SUPABASE_URL:?VITE_SUPABASE_URL is required}"
: "${VITE_SUPABASE_ANON_KEY:?VITE_SUPABASE_ANON_KEY is required}"

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

request_status() {
  local resource="$1"

  curl --silent --show-error \
    --output "$response_file" \
    --write-out '%{http_code}' \
    "$VITE_SUPABASE_URL/rest/v1/$resource" \
    --header "apikey: $VITE_SUPABASE_ANON_KEY" \
    --header "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
}

safe_status="$(request_status 'check_ins?select=id,user_id,mountain_id,checked_in_at,points&limit=1')"
legacy_coordinate_status="$(request_status 'check_ins?select=location&limit=1')"
verification_status="$(request_status 'check_in_verifications?select=location&limit=1')"

if [[ "$safe_status" != "200" ]]; then
  printf 'FAIL: public check-in summaries returned HTTP %s\n' "$safe_status" >&2
  exit 1
fi

if [[ "$legacy_coordinate_status" == "200" ]]; then
  printf 'FAIL: anonymous clients can still select check_ins.location\n' >&2
  exit 1
fi

if [[ "$verification_status" == "200" ]]; then
  printf 'FAIL: anonymous clients can select check_in_verifications.location\n' >&2
  exit 1
fi

printf 'PASS: public check-in summaries are available and precise coordinate queries are blocked.\n'

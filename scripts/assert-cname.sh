#!/usr/bin/env bash
#
# The custom domain lives in public/CNAME and must reach dist/. If it ever goes
# missing the site silently falls back to klecoz.github.io — the build succeeds,
# the deploy succeeds, and the only symptom is that arseniocolon.com stops
# resolving to it.
#
# Shared by deploy.yml (catches it before publishing) and pr.yml (catches it
# before merging). One copy so the two can't disagree about what "ok" means.

set -euo pipefail

test -f dist/CNAME || { echo "::error::dist/CNAME missing — custom domain would break"; exit 1; }
grep -qx 'arseniocolon.com' dist/CNAME || { echo "::error::dist/CNAME has unexpected contents"; exit 1; }
echo "CNAME ok: $(cat dist/CNAME)"

# @weer/stressor

This package contains all stress testing scripts for the Weer URL shortener. Each stressor targets a specific traffic pattern or feature area and can be run independently against any environment — local, staging, or production.

Stressors are plain Node.js ESM scripts that use [Autocannon](https://github.com/mcollina/autocannon) under the hood. Run them directly with `node src/<stressor>.mjs --url <target>` from this directory. See individual script files for their supported flags and usage examples.

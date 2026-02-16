# Ask Mode Extension

Copyright (c) 2026-present Marko Kocic

This program and the accompanying materials are made available under the
terms of the Eclipse Public License 2.0 which is available at:
https://www.eclipse.org/legal/epl-2.0/

SPDX-License-Identifier: EPL-2.0

Read-only mode for safe code analysis in pi.

## Features

- **`/ask` command** - Toggle ask mode on/off
- **Restricted toolset** - Only read-only tools available when enabled
- **Bash allowlist** - Only safe, read-only bash commands are allowed
- **Status indicator** - Shows "❓ ask" in footer when active

## Usage

```
/ask
```

Toggle ask mode. When enabled:
- Available tools: `read`, `bash`, `grep`, `find`, `ls`, `questionnaire`
- `edit` and `write` tools are disabled
- Bash commands are restricted to an allowlist (see below)

When disabled:
- Full access is restored with all your original tools

## Allowed Bash Commands

Ask mode restricts bash to these read-only commands:

- **File viewing**: `cat`, `head`, `tail`, `less`, `more`
- **Searching**: `grep`, `find`, `rg`, `fd`
- **Info commands**: `ls`, `pwd`, `file`, `stat`, `du`, `df`, `tree`
- **Text processing**: `wc`, `sort`, `uniq`, `diff`, `sed`, `awk`, `jq`
- **System info**: `env`, `printenv`, `uname`, `whoami`, `id`, `date`, `uptime`, `ps`, `top`, `htop`, `free`
- **Git** (read-only): `status`, `log`, `diff`, `show`, `branch`, `remote`, `config`
- **npm/yarn** (read-only): `list`, `ls`, `view`, `info`, `search`, `outdated`, `audit`
- **Version checks**: `node --version`, `python --version`
- **Network**: `curl`, `wget`

## Installation

The extension should be in your extensions directory:

```
~/.pi/agent/extensions/ask-mode/
```

If not present, copy the files there:
- `index.ts` - Main extension code
- `utils.ts` - Utility functions

## Requirements

pi will automatically load extensions from `~/.pi/agent/extensions/`.

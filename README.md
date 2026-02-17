# Ask Mode Extension

Read-only mode for safe code analysis in [pi coding agent](https://github.com/badlogic/pi-mono).

## Features

- **`/ask` command** - Toggle ask mode on/off
- **`/ask <question>` command** - Enable ask mode and ask a question in one step
- **Restricted toolset** - Only read-only tools available when enabled
- **Bash allowlist** - Only safe, read-only bash commands are allowed
- **Status indicator** - Shows "❓ ask" in footer when active

## Usage

### Toggle Ask Mode
```
/ask
```
Toggle ask mode on/off. When enabled:
- Available tools: `read`, `bash`, `grep`, `find`, `ls`
- `edit` and `write` tools are disabled
- Bash commands are restricted to an allowlist (see below)

### Ask a Question
```
/ask what does this file do?
```
Enable ask mode (if not already enabled) and immediately ask a question. The agent will answer using only read-only tools.

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

### Using pi install (recommended)

**From npm:**
```bash
pi install npm:pi-ask-mode
```

**From GitHub:**
```bash
pi install git:github.com/markokocic/pi-ask-mode
```

### Manual Installation

Copy the files to your extensions directory:

```
~/.pi/agent/extensions/ask-mode/
```

- `index.ts` - Main extension code
- `utils.ts` - Utility functions

pi will automatically load extensions from `~/.pi/agent/extensions/`.

## License

Copyright (c) 2026-present Marko Kocic

This program and the accompanying materials are made available under the
terms of the Eclipse Public License 2.0 which is available at:
https://www.eclipse.org/legal/epl-2.0/

SPDX-License-Identifier: EPL-2.0

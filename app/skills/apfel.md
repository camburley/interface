---
name: apfel-macos
description: Use Apple's built-in on-device LLM from the command line. No API keys, no cloud, no subscriptions. Every Apple Silicon Mac has a model inside it. Apfel lets you use it.
---

## Use Apple's Hidden On-Device LLM

Every Mac with Apple Silicon ships with a built-in AI model. Apple exposes it through Siri. Apfel wraps it in a CLI and an OpenAI-compatible server so you can actually use it.

All inference runs on-device. No network calls. No API keys. No cost.

## When to Use

Use this skill when:

- You want a local LLM with zero setup beyond one install
- You need a free, private AI that never phones home
- You want an OpenAI-compatible API running on localhost
- You need quick shell scripting with AI (pipe-friendly)
- You want MCP tool calling on a local model
- You already have a Mac and don't want to download a separate model

Skip this if:
- You don't have Apple Silicon (M1/M2/M3/M4)
- You're not on macOS 26 (Tahoe) or newer
- You need a large context window (Apfel is 4096 tokens)
- You need frontier-level reasoning (use Gemma 4 or Qwen 3.5 locally instead)

## Requirements

- Apple Silicon Mac (M1, M2, M3, M4, any variant)
- macOS 26 Tahoe or newer
- Apple Intelligence enabled in System Settings

Check if you qualify:
```bash
# Check your chip
sysctl -n machdep.cpu.brand_string

# Check your macOS version
sw_vers -productVersion
```

## Install

### Option A: Homebrew (Recommended)

```bash
brew tap Arthur-Ficial/tap
brew install Arthur-Ficial/tap/apfel
```

### Option B: Build from Source

```bash
git clone https://github.com/Arthur-Ficial/apfel.git
cd apfel
make install
```

Requires Command Line Tools with macOS 26.4 SDK (Swift 6.3). No Xcode needed.

## Use It

### Single prompt
```bash
apfel "What is the capital of Austria?"
```

### Stream output
```bash
apfel --stream "Write a haiku about code"
```

### Pipe input
```bash
echo "Summarize: $(cat README.md)" | apfel
```

### Attach files
```bash
apfel -f README.md "Summarize this project"
apfel -f old.swift -f new.swift "What changed between these files?"
```

### JSON output for scripting
```bash
apfel -o json "Translate to German: hello" | jq .content
```

### System prompt
```bash
apfel -s "You are a pirate" "What is recursion?"
```

### Interactive chat
```bash
apfel --chat
apfel --chat -s "You are a helpful coding assistant"
```

## Run as OpenAI-Compatible Server

Start the server:
```bash
apfel --serve
```

Then use it from any OpenAI SDK:
```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="unused")
resp = client.chat.completions.create(
    model="apple-foundationmodel",
    messages=[{"role": "user", "content": "What is 1+1?"}],
)
print(resp.choices[0].message.content)
```

Or curl:
```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"apple-foundationmodel","messages":[{"role":"user","content":"Hello"}]}'
```

## Connect Your Agent

Point any OpenAI-compatible agent at:
```
Base URL: http://localhost:11434/v1
Model: apple-foundationmodel
API Key: unused (any string works)
```

## MCP Tool Calling

Apfel supports MCP servers natively:
```bash
apfel --mcp ./mcp/calculator/server.py "What is 15 times 27?"
# tool: multiply({"a": 15, "b": 27}) = 405
# 15 times 27 is 405.

# Multiple MCP servers
apfel --mcp ./calc.py --mcp ./weather.py "What is sqrt(2025)?"

# Server mode with tools
apfel --serve --mcp ./mcp/calculator/server.py
```

## Shell Power Tools

Natural language to shell commands:
```bash
# Add this function to your .zshrc:
cmd(){ local x c r a; while [[ $1 == -* ]]; do case $1 in -x)x=1;shift;; -c)c=1;shift;; *)break;; esac; done; r=$(apfel -q -s 'Output only a shell command.' "$*" | sed '/^```/d;/^#/d;s/\\x1b\\[[0-9;]*[a-zA-Z]//g;s/^[[:space:]]*//;/^$/d' | head -1); [[ $r ]] || { echo "no command generated"; return 1; }; printf '\\e[32m$\\e[0m %s\\n' "$r"; [[ $c ]] && printf %s "$r" | pbcopy && echo "(copied)"; [[ $x ]] && { printf 'Run? [y/N] '; read -r a; [[ $a == y ]] && eval "$r"; }; return 0; }

# Then:
cmd find all swift files larger than 1MB
cmd -c show disk usage sorted by size
cmd -x what process is using port 3000
```

## Context Management

Apfel manages the 4096-token context automatically:
```bash
apfel --chat --context-strategy newest-first    # default: keep recent turns
apfel --chat --context-strategy sliding-window --context-max-turns 6
apfel --chat --context-strategy summarize        # compress old turns on-device
```

## Anti-Patterns

- **Don't expect frontier-level reasoning.** Apple's on-device model is compact. It's great for summarization, translation, shell commands, and quick tasks. For complex reasoning, use Gemma 4 or Qwen 3.5 locally.
- **Don't skip Apple Intelligence setup.** The model won't work unless Apple Intelligence is enabled in System Settings > Apple Intelligence & Siri.
- **Don't forget the 4096-token limit.** For long documents, chunk your input or use a larger local model.
- **Don't use this on Intel Macs.** Apple Silicon only. No workaround.

## What You Get

- AI that's already on your Mac. No download, no model pull.
- Completely private. No data leaves your machine. Ever.
- Zero cost. No API fees, no tokens, no subscriptions.
- OpenAI-compatible API for drop-in agent integration.
- MCP tool calling for agentic workflows.
- Pipe-friendly CLI for shell scripting.
- 1,500+ GitHub stars and growing fast.

## Links

- GitHub: https://github.com/Arthur-Ficial/apfel
- Docs: https://apfel.franzai.com
- Apple FoundationModels: https://developer.apple.com/documentation/foundationmodels

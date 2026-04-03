---
name: qwen35-local
description: Run Alibaba's Qwen 3.5 locally. Near-Opus reasoning on consumer hardware. No API key, no cloud, no cost.
---

## Run Qwen 3.5 Locally

Alibaba's open source model. Near-Opus reasoning quality. Runs on a Mac Mini. Free.

## When to Use

Use this skill when:

- You want Opus-level reasoning without paying per token
- Running coding agents locally (35b MoE is great for this)
- Processing images alongside text (vision model)
- Replacing expensive API calls with local inference
- Building cost-efficient agent pipelines

Skip this if:
- You have less than 16 GB RAM (try qwen3.5:9b for smaller machines)
- You need audio input (Qwen 3.5 is text + image only)
- Latency under 100ms matters (use a cloud API)

## Choose Your Model

| Model | Type | RAM | Speed | Intelligence | Best For |
|-------|------|-----|-------|-------------|----------|
| qwen3.5:4b | Dense | 4 GB | Fast | Good | Quick tasks, small machines |
| qwen3.5:9b | Dense | 7 GB | Fast | Better | Solid everyday model |
| qwen3.5:27b | Dense | 17 GB | Slower | Near-Opus | Deep reasoning, planning |
| qwen3.5:35b | MoE | 21 GB | Faster | Strong | Coding, interactive work |

**Quick pick:** For coding = `35b` (faster inference). For reasoning = `27b` (smarter). For small machines = `9b`.

**Hardware note:** 27b is dense, so inference is slower than the 35b MoE model. If you have an M4 Pro Mac Mini with 64 GB RAM, both run comfortably.

## Setup

First, check if you already have a local model runner installed:

```bash
ollama --version    # check for Ollama
```

If you get a version number, skip to "Pull the Model" below. If not, pick one of these options.

### Option A: Ollama (Recommended, CLI)

**Mac or Windows:** Download from https://ollama.com/download

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Option B: LM Studio (GUI, no terminal needed)

1. Download from https://lmstudio.ai (free)
2. Search "Qwen 3.5" in the model browser
3. Click Download, then Start
4. API available at `http://localhost:1234/v1`

LM Studio supports MLX backend on Mac, which can be faster than Ollama for some models. If you use LM Studio, skip the Ollama steps below.

### Option C: Hugging Face (Python, advanced)

```bash
pip install transformers torch
```

Then in Python:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen3.5-27B")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen3.5-27B")
```

Only use if you have a specific reason to avoid Ollama/LM Studio.

## Pull the Model (Ollama)

```bash
ollama pull qwen3.5:27b   # near-Opus reasoning
ollama pull qwen3.5:35b   # fast coding model
ollama pull qwen3.5:9b    # smaller machines
```

## Run It

Terminal chat:
```bash
ollama run qwen3.5:27b
```

REST API (runs on localhost:11434):
```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5:27b",
  "messages": [{"role": "user", "content": "Explain the trade-offs between dense and MoE architectures."}],
  "stream": false
}'
```

## Connect Your Agent

Point any OpenAI-compatible agent at:
```
Base URL: http://localhost:11434/v1  (Ollama)
         http://localhost:1234/v1   (LM Studio)
Model: qwen3.5:27b
API Key: (leave blank or use any placeholder)
```

## Vision Input

Qwen 3.5 processes images alongside text:

```bash
ollama run qwen3.5:27b "What's in this screenshot? /path/to/image.png"
```

## Anti-Patterns

- **Don't run 27b on 16 GB RAM expecting speed.** It fits (17 GB) but will swap. Use 32 GB+ or drop to 9b.
- **Don't use 27b for interactive coding.** It's dense and slower. Use 35b MoE for coding sessions where you need fast back-and-forth.
- **Don't confuse dense vs MoE.** 27b (dense) = all parameters active, slower, smarter. 35b (MoE) = only ~3B active at a time, faster, slightly less capable.
- **Don't ignore quantization.** Default 4-bit is the sweet spot. Higher bits = better quality but more RAM. Lower bits = worse quality, rarely worth it.

## Performance Tips

- **Mac:** Metal acceleration is automatic. No extra setup.
- **Linux (NVIDIA):** Ollama uses CUDA by default if drivers are installed.
- **Memory formula:** `Parameters * (Bits / 8) * 1.2 = RAM needed`. Example: 27B * 4/8 * 1.2 = ~16 GB.

## What You Get

- Near-Opus reasoning on your own hardware
- Zero ongoing cost after hardware purchase
- Full data privacy. Nothing leaves your machine.
- Vision support (text + image)
- Tool calling for agentic workflows
- Active open source community (Hugging Face top downloads)

## Links

- Models: https://huggingface.co/Qwen
- Ollama: https://ollama.com/library/qwen3.5
- LM Studio: https://lmstudio.ai
- Setup guide: https://kaiwern.com/posts/2026/03/01/run-qwen3.5-locally-on-your-mac/

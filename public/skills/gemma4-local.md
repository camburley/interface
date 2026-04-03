---
name: gemma4-local
description: Run Google's Gemma 4 locally on your machine. No API key, no cloud, no cost. Multimodal (text + image + audio). Works on Mac, Linux, Windows.
---

## Run Gemma 4 Locally

Google's most capable open model. Multimodal (text + image + audio). 256K context. Runs on your hardware for free.

## When to Use

Use this skill when:

- Setting up a local LLM for the first time
- Replacing cloud API calls with a local model
- Running an agent that needs vision (image input)
- Keeping data on-premise (privacy, compliance)
- Eliminating recurring AI API costs

Skip this if:
- You need >256K context (use a cloud model)
- You have less than 4 GB RAM
- You need real-time audio transcription (use Whisper instead)

## Choose Your Model

| Model | Type | RAM | Speed | Intelligence | Best For |
|-------|------|-----|-------|-------------|----------|
| gemma4:e2b | Dense | 4 GB | Fast | Good | Mobile, edge, Raspberry Pi |
| gemma4:e4b | Dense | 6 GB | Fast | Better | Laptops, everyday use |
| gemma4:26b | MoE | 16 GB | Fast | Strong | Best speed-to-smarts ratio |
| gemma4:31b | Dense | 19 GB | Slower | Strongest | Max capability |

**Quick pick:** 8 GB RAM = `e4b`. 16 GB+ = `26b` (recommended). 32 GB+ = `31b`.

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
2. Search "Gemma 4" in the model browser
3. Click Download, then Start
4. API available at `http://localhost:1234/v1`

If you use LM Studio, skip the Ollama steps below. Everything else (connecting your agent, image input) works the same way.

### Option C: Hugging Face (Python, advanced)

```bash
pip install transformers torch
```

Then in Python:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
model = AutoModelForCausalLM.from_pretrained("google/gemma-4-27b-it")
tokenizer = AutoTokenizer.from_pretrained("google/gemma-4-27b-it")
```

This is heavier to set up but gives full control. Only use if you have a specific reason to avoid Ollama/LM Studio.

## Pull the Model (Ollama)

```bash
ollama pull gemma4        # default (e4b)
ollama pull gemma4:26b    # recommended for 16GB+
ollama pull gemma4:31b    # max capability
```

## Run It

Terminal chat:
```bash
ollama run gemma4
```

REST API (runs on localhost:11434):
```bash
curl http://localhost:11434/api/chat -d '{
  "model": "gemma4",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}'
```

## Connect Your Agent

Point any OpenAI-compatible agent at:
```
Base URL: http://localhost:11434/v1  (Ollama)
         http://localhost:1234/v1   (LM Studio)
Model: gemma4
API Key: (leave blank or use any placeholder)
```

## Image Input

Gemma 4 handles vision. Pass images with text:

```bash
ollama run gemma4 "Describe this image /path/to/photo.jpg"
```

## Anti-Patterns

- **Don't run 31b on 16 GB RAM.** It will swap to disk and crawl. Use 26b instead.
- **Don't skip the GPU.** CPU-only inference on 26b/31b is 3-10x slower. Use Metal (Mac), CUDA (NVIDIA), or ROCm (AMD).
- **Don't forget the context window.** e2b/e4b = 128K. 26b/31b = 256K. If you need more, chunk your input or use a cloud model.
- **Don't mix up model types.** 26b is MoE (fast, efficient). 31b is dense (slower, smarter). Pick based on your use case.

## What You Get

- Frontier-level reasoning on your own hardware
- Zero ongoing cost (no API fees, no subscriptions)
- Your data never leaves your machine
- Multimodal: text, image, audio (small models)
- Native function calling for agentic workflows
- 400M+ downloads of the Gemma family

## Links

- Models: https://ai.google.dev/gemma
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Hugging Face: https://huggingface.co/google/gemma-4-27b-it

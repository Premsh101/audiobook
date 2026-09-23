# Hush TTS Worker

The web app creates GenerationJob records with status QUEUED. Run the worker on the KVM as a separate process/container.

## Environment

    DATABASE_URL=postgresql://...
    TTS_SERVICE_URL=http://tts-service:8000/synthesize
    TTS_PROVIDER=self-hosted
    TTS_MODEL=<model-name>
    VOICE_UPLOAD_DIR=/data/hush/voices
    VOICE_OUTPUT_DIR=/data/hush/voice-output
    TTS_PREVIEW_MAX_CHARACTERS=6000
    TTS_WORKER_POLL_MS=5000

Mount VOICE_UPLOAD_DIR and VOICE_OUTPUT_DIR into both the worker and TTS service. Keep these paths private and do not expose them as static assets.

## Start

    npm run tts:worker

## TTS service contract

The worker sends JSON to TTS_SERVICE_URL:

    {
      "jobId": "...",
      "text": "...",
      "language": "en",
      "voiceSamplePath": "/data/hush/voices/<profile>.<ext>",
      "outputPath": "/data/hush/voice-output/<job>.mp3",
      "requestedDurationSeconds": 300
    }

The self-hosted TTS service writes the MP3 to outputPath and returns:

    {
      "durationSeconds": 298
    }

The worker then marks the job COMPLETED, stores GeneratedAudio, records provider usage, and marks the voice profile READY.

Completed previews are streamed only to the owning signed-in user through:

    /api/voice/jobs/<jobId>/audio

This separation lets the Hush web app remain independent from the actual voice-cloning model.
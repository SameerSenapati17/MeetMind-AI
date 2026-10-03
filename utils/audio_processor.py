import yt_dlp
from pydub import AudioSegment
import os
import subprocess

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def download_youtube_audio(url: str) -> str:
    output_path = os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_path,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": "192",
            }
        ],
        "quiet": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

        filename = ydl.prepare_filename(info)

        # FFmpegExtractAudio changes the extension to .wav
        filename = os.path.splitext(filename)[0] + ".wav"

    return filename


def convert_to_wav(input_path: str) -> str:
    """
    Extract audio from an audio/video file and convert it to:
    - WAV
    - Mono
    - 16 kHz
    """

    output_path = os.path.splitext(input_path)[0] + "_converted.wav"

    print(f"Converting media to WAV:")
    print(f"  Input : {input_path}")
    print(f"  Output: {output_path}")

    if not os.path.exists(input_path):
        raise FileNotFoundError(
            f"Input media file not found: {input_path}"
        )

    try:
        result = subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                input_path,
                "-vn",
                "-map",
                "0:a:0",
                "-ac",
                "1",
                "-ar",
                "16000",
                "-c:a",
                "pcm_s16le",
                output_path,
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print("FFmpeg error:")
            print(result.stderr)

            raise RuntimeError(
                "FFmpeg could not extract an audio stream from the uploaded file."
            )

    except FileNotFoundError:
        raise RuntimeError(
            "FFmpeg was not found. Make sure FFmpeg is installed and available in PATH."
        )

    if not os.path.exists(output_path):
        raise RuntimeError(
            "WAV conversion failed: output file was not created."
        )

    print("Audio conversion successful.")

    return output_path


def chunk_audio(wav_path: str, chunk_minutes: int = 10) -> list:
    audio = AudioSegment.from_wav(wav_path)

    chunk_ms = chunk_minutes * 60 * 1000

    chunks = []

    for i, start in enumerate(range(0, len(audio), chunk_ms)):
        chunk = audio[start:start + chunk_ms]

        chunk_path = f"{wav_path}_chunk_{i}.wav"

        chunk.export(chunk_path, format="wav")

        chunks.append(chunk_path)

    return chunks

def cleanup_audio_files(paths: list):
    """Clean up temporary audio chunks and converted files"""
    for path in paths:
        if path and os.path.exists(path):
            try:
                os.remove(path)
                print(f"Cleaned up temporary file: {path}")
            except Exception as e:
                print(f"Failed to clean up {path}: {e}")



def process_input(source: str) -> list:
    if source.startswith("http://") or source.startswith("https://"):
        print("Detected YouTube URL. Downloading audio...")
        wav_path = download_youtube_audio(source)

    else:
        print("Detected local file. Converting to WAV...")
        wav_path = convert_to_wav(source)

    print("Chunking audio...")

    chunks = chunk_audio(wav_path)

    print(f"Audio ready — {len(chunks)} chunk(s) created.")

    return chunks
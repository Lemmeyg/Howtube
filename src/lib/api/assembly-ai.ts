import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { mkdir } from 'fs/promises';
import youtubeDl from 'youtube-dl-exec';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const assembly = axios.create({
  baseURL: 'https://api.assemblyai.com/v2',
  headers: {
    authorization: process.env.ASSEMBLY_AI_API_KEY,
  },
});

async function findYtDlp(): Promise<string> {
  try {
    // Try using where command for PATH lookup first
    const { stdout } = await execAsync('where yt-dlp');
    if (stdout.trim()) {
      const paths = stdout.split('\n').map(p => p.trim());
      // Return the first valid path
      for (const p of paths) {
        if (fs.existsSync(p)) {
          return p;
        }
      }
    }
  } catch (error) {
    console.log('yt-dlp not found in PATH, checking other locations...');
  }

  // Check other possible locations
  const possiblePaths = [
    path.join(process.env.APPDATA || '', 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
    'C:\\Python313\\Scripts\\yt-dlp.exe',
    'C:\\Users\\Gordo\\AppData\\Local\\Microsoft\\WinGet\\Packages\\yt-dlp.yt-dlp_yt-dlp\\yt-dlp.exe'
  ];

  for (const ytDlpPath of possiblePaths) {
    if (fs.existsSync(ytDlpPath)) {
      return ytDlpPath;
    }
    console.log(`Tried path ${ytDlpPath}: Not found`);
  }

  throw new Error('yt-dlp not found in any expected location. Please ensure it is installed correctly.');
}

export async function downloadYouTubeAudio(youtubeUrl: string): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true });
  }

  // Generate a unique filename
  const outputFile = path.join(tempDir, `${Date.now()}.mp3`);

  try {
    // Get the actual path to yt-dlp
    const ytDlpPath = await findYtDlp();
    console.log('Found yt-dlp at:', ytDlpPath);

    // Try direct command execution first
    try {
      await execAsync(`"${ytDlpPath}" -x --audio-format mp3 --output "${outputFile}" "${youtubeUrl}"`);
      if (fs.existsSync(outputFile)) {
        return outputFile;
      }
    } catch (directError) {
      console.log('Direct command execution failed, falling back to youtube-dl-exec...');
    }

    // Fallback to youtube-dl-exec
    const ytdl = youtubeDl.create({ cwd: tempDir, binary: ytDlpPath });
    await ytdl(youtubeUrl, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: path.basename(outputFile),
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ]
    });

    return outputFile;
  } catch (error) {
    console.error('Error downloading YouTube audio:', error);
    throw new Error(`Failed to download YouTube audio: ${error.message}`);
  }
}

export async function uploadAudioFile(audioPath: string): Promise<string> {
  try {
    // Read the audio file
    const audioData = fs.readFileSync(audioPath);

    // Upload to AssemblyAI
    const response = await assembly.post('/upload', audioData, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    // Clean up the temporary file
    fs.unlinkSync(audioPath);

    return response.data.upload_url;
  } catch (error) {
    console.error('Error uploading audio:', error);
    // Clean up the temporary file even if upload fails
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    throw new Error('Failed to upload audio to AssemblyAI');
  }
}

export async function transcribeAudio(uploadUrl: string) {
  try {
    // Submit the audio file for transcription
    const response = await assembly.post('/transcript', {
      audio_url: uploadUrl,
    });

    return response.data;
  } catch (error) {
    console.error('Error submitting transcription:', error);
    throw new Error('Failed to submit audio for transcription');
  }
}

export async function getTranscriptionResult(transcriptId: string) {
  try {
    const response = await assembly.get(`/transcript/${transcriptId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting transcription result:', error);
    throw new Error('Failed to get transcription result');
  }
}

export async function pollTranscriptionResult(transcriptId: string): Promise<any> {
  let result = await getTranscriptionResult(transcriptId);
  
  while (result.status !== 'completed' && result.status !== 'error') {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    result = await getTranscriptionResult(transcriptId);
  }

  if (result.status === 'error') {
    throw new Error('Transcription failed: ' + result.error);
  }

  return result;
} 
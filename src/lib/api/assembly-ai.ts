import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { mkdir } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Validate AssemblyAI API key
if (!process.env.ASSEMBLY_AI_API_KEY) {
  throw new Error('ASSEMBLY_AI_API_KEY is not set in environment variables');
}

// Create AssemblyAI client with proper configuration
const assembly = axios.create({
  baseURL: 'https://api.assemblyai.com/v2',
  headers: {
    authorization: process.env.ASSEMBLY_AI_API_KEY,
    'content-type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  maxRetries: 3,
});

// Verify API key on startup
(async () => {
  try {
    await assembly.get('/account');
    console.log('AssemblyAI API key verified successfully');
  } catch (error) {
    console.error('Failed to verify AssemblyAI API key:', error);
    throw new Error('Invalid AssemblyAI API key');
  }
})();

const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY;
const ASSEMBLY_AI_API = 'https://api.assemblyai.com/v2';

// Common Windows installation paths for yt-dlp
const YT_DLP_PATHS = [
  path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages', 'yt-dlp.yt-dlp_*', 'yt-dlp.exe'),
  path.join(process.env.PROGRAMFILES || '', 'yt-dlp', 'yt-dlp.exe'),
  path.join(process.env.PROGRAMFILES || '', 'yt-dlp', 'yt-dlp'),
  path.join(process.env.APPDATA || '', 'yt-dlp', 'yt-dlp.exe'),
  path.join(process.env.APPDATA || '', 'yt-dlp', 'yt-dlp'),
  'C:\\yt-dlp\\yt-dlp.exe',
  'C:\\yt-dlp\\yt-dlp',
  path.join(process.cwd(), 'yt-dlp.exe'),
  path.join(process.cwd(), 'yt-dlp')
];

async function findYtDlp(): Promise<string> {
  // First try the command directly in case it's in PATH
  try {
    await execAsync('yt-dlp --version');
    return 'yt-dlp';
  } catch (error) {
    console.log('yt-dlp not found in PATH, checking specific locations...');
  }

  // Common installation paths to check
  const possiblePaths = [
    // Winget installation paths
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages', 'yt-dlp.yt-dlp_*', 'yt-dlp.exe'),
    path.join(process.env.PROGRAMFILES || '', 'yt-dlp', 'yt-dlp.exe'),
    path.join(process.env.PROGRAMFILES || '', 'yt-dlp', 'yt-dlp'),
    path.join(process.env.PROGRAMFILES || '', 'yt-dlp', 'yt-dlp.exe'),
    path.join(process.env.PROGRAMFILES || '', 'yt-dlp', 'yt-dlp'),
    // User-specific paths
    path.join(process.env.APPDATA || '', 'yt-dlp', 'yt-dlp.exe'),
    path.join(process.env.APPDATA || '', 'yt-dlp', 'yt-dlp'),
    // Common installation directories
    'C:\\yt-dlp\\yt-dlp.exe',
    'C:\\yt-dlp\\yt-dlp',
    // Current directory
    path.join(process.cwd(), 'yt-dlp.exe'),
    path.join(process.cwd(), 'yt-dlp'),
  ];

  // Check each possible path
  for (const possiblePath of possiblePaths) {
    if (possiblePath.includes('*')) {
      // Handle wildcard paths
      const basePath = possiblePath.substring(0, possiblePath.indexOf('*'));
      const dir = path.dirname(basePath);
      try {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const matchingDir = files.find(f => f.startsWith('yt-dlp.yt-dlp_yt-dlp_'));
          if (matchingDir) {
            const fullPath = path.join(dir, matchingDir, 'yt-dlp.exe');
            if (fs.existsSync(fullPath)) {
              console.log('Found yt-dlp at:', fullPath);
              return fullPath;
            }
          }
        }
      } catch (error) {
        console.log('Error checking directory:', dir, error);
      }
    } else {
      try {
        if (fs.existsSync(possiblePath)) {
          console.log('Found yt-dlp at:', possiblePath);
          return possiblePath;
        }
      } catch (error) {
        console.log('Error checking path:', possiblePath, error);
      }
    }
  }

  // If we get here, we couldn't find yt-dlp
  console.error('yt-dlp not found in any of the following locations:');
  possiblePaths.forEach(path => console.error('-', path));
  throw new Error('yt-dlp not found. Please install it using: winget install yt-dlp');
}

async function downloadYouTubeAudio(url: string): Promise<string> {
  try {
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'tmp');
    await mkdir(tmpDir, { recursive: true });
    
    const outputPath = path.join(tmpDir, `${Date.now()}.mp3`);
    console.log('Downloading audio to:', outputPath);

    // Find yt-dlp executable
    const ytDlpPath = await findYtDlp();
    console.log('Using yt-dlp at:', ytDlpPath);

    // Use system yt-dlp directly
    const command = `"${ytDlpPath}" -x --audio-format mp3 -o "${outputPath}" "${url}"`;
    console.log('Executing command:', command);
    
    const { stdout, stderr } = await execAsync(command);
    console.log('Download stdout:', stdout);
    if (stderr) console.log('Download stderr:', stderr);

    // Verify the file was created
    if (!fs.existsSync(outputPath)) {
      throw new Error('Audio file was not created');
    }

    // Verify the file size is greater than 0
    const stats = fs.statSync(outputPath);
    if (stats.size === 0) {
      throw new Error('Downloaded audio file is empty');
    }

    return outputPath;
  } catch (error) {
    console.error('Error downloading YouTube audio:', error);
    throw new Error(`Failed to download audio: ${error.message}`);
  }
}

async function uploadAudioFile(audioPath: string): Promise<string> {
  try {
    const data = fs.readFileSync(audioPath);
    const response = await assembly.post('/upload', data, {
      headers: {
        'content-type': 'application/octet-stream'
      }
    });
    
    if (!response.data.upload_url) {
      throw new Error('No upload URL received from AssemblyAI');
    }
    
    return response.data.upload_url;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw new Error('Failed to upload audio to AssemblyAI');
  } finally {
    // Clean up the temporary audio file
    try {
      fs.unlinkSync(audioPath);
    } catch (error) {
      console.error('Error cleaning up audio file:', error);
    }
  }
}

export async function transcribeAudio(audioUrl: string) {
  try {
    const response = await assembly.post('/transcript', {
      audio_url: audioUrl,
      speaker_labels: true
    });
    
    if (!response.data.id) {
      throw new Error('No transcription ID received from AssemblyAI');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error starting transcription:', error);
    throw new Error('Failed to start transcription');
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

export async function pollTranscriptionResult(transcriptId: string) {
  try {
    while (true) {
      const response = await assembly.get(`/transcript/${transcriptId}`);
      const status = response.data.status;

      if (status === 'completed') {
        return response.data;
      } else if (status === 'error') {
        throw new Error(`Transcription failed: ${response.data.error || 'Unknown error'}`);
      } else if (!['queued', 'processing'].includes(status)) {
        throw new Error(`Unexpected transcription status: ${status}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  } catch (error) {
    console.error('Error polling transcription:', error);
    throw new Error('Failed to get transcription results');
  }
}

export async function downloadAndTranscribe(
  youtubeUrl: string,
  progressCallback: (progress: number, status: string, error?: string) => void
) {
  try {
    // Start downloading
    progressCallback(10, 'downloading');
    console.log('Starting YouTube audio download...');
    const audioPath = await downloadYouTubeAudio(youtubeUrl);
    console.log('Audio downloaded successfully:', audioPath);
    
    // Start uploading
    progressCallback(40, 'uploading');
    console.log('Uploading audio to AssemblyAI...');
    const uploadUrl = await uploadAudioFile(audioPath);
    console.log('Audio uploaded successfully');
    
    // Start transcribing
    progressCallback(60, 'transcribing');
    console.log('Starting transcription...');
    const transcription = await transcribeAudio(uploadUrl);
    console.log('Transcription started, ID:', transcription.id);
    
    // Polling for results
    progressCallback(70, 'processing');
    console.log('Polling for transcription results...');
    const result = await pollTranscriptionResult(transcription.id);
    console.log('Transcription completed');

    // Complete AssemblyAI phase
    progressCallback(80, 'completed_transcription');
    return result;
  } catch (error) {
    console.error('Error in processing:', error);
    progressCallback(0, 'error', error.message);
    throw error;
  }
} 
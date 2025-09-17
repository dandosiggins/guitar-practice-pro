import { SpotifyApi } from "@spotify/web-api-ts-sdk";

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=spotify',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);
   const refreshToken =
    connectionSettings?.settings?.oauth?.credentials?.refresh_token;
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
const clientId = connectionSettings?.settings?.oauth?.credentials?.client_id;
  const expiresIn = connectionSettings.settings?.oauth?.credentials?.expires_in;
  if (!connectionSettings || (!accessToken || !clientId || !refreshToken)) {
    throw new Error('Spotify not connected');
  }
  return {accessToken, clientId, refreshToken, expiresIn};
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSpotifyClient() {
  const {accessToken, clientId, refreshToken, expiresIn} = await getAccessToken();

  const spotify = SpotifyApi.withAccessToken(clientId, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: expiresIn || 3600,
    refresh_token: refreshToken,
  });

  return spotify;
}

// Helper function to convert Spotify track to our song format
export function convertSpotifyTrackToSong(track: any) {
  return {
    title: track.name,
    artist: track.artists.map((artist: any) => artist.name).join(', '),
    album: track.album?.name || null,
    genre: null, // Spotify doesn't provide genre in track object
    key: null, // Will be populated from audio features
    capo: 0,
    tempo: null, // Will be populated from audio features
    timeSignature: "4/4", // Will be populated from audio features
    difficulty: 1, // Default, can be set manually
    duration: Math.round(track.duration_ms / 1000), // Convert to seconds
    spotifyId: track.id,
    chordProgression: null, // To be populated separately
    lyrics: null,
    tabs: null,
    notes: null,
  };
}

// Helper function to get audio features for a track
export async function getTrackAudioFeatures(trackId: string) {
  const spotify = await getUncachableSpotifyClient();
  const features = await spotify.tracks.audioFeatures(trackId);
  
  return {
    key: getKeyFromSpotify(features.key, features.mode),
    tempo: Math.round(features.tempo),
    timeSignature: `${features.time_signature}/4`,
    energy: features.energy,
    danceability: features.danceability,
    valence: features.valence,
  };
}

// Convert Spotify key number to music notation
function getKeyFromSpotify(key: number, mode: number): string {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keyName = keys[key] || 'C';
  return mode === 0 ? `${keyName}m` : keyName; // 0 = minor, 1 = major
}
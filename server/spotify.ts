import { SpotifyApi } from "@spotify/web-api-ts-sdk";

let spotifyClient: SpotifyApi | null = null;

export async function getUncachableSpotifyClient() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  // Use client credentials flow for search (no user login required)
  const spotify = SpotifyApi.withClientCredentials(clientId, clientSecret);
  return spotify;
}

// Keep your existing helper functions
export function convertSpotifyTrackToSong(track: any) {
  return {
    title: track.name,
    artist: track.artists.map((artist: any) => artist.name).join(', '),
    album: track.album?.name || null,
    genre: null,
    key: null,
    capo: 0,
    tempo: null,
    timeSignature: "4/4",
    difficulty: 1,
    duration: Math.round(track.duration_ms / 1000),
    spotifyId: track.id,
    chordProgression: null,
    lyrics: null,
    tabs: null,
    notes: null,
  };
}

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

function getKeyFromSpotify(key: number, mode: number): string {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keyName = keys[key] || 'C';
  return mode === 0 ? `${keyName}m` : keyName;
}
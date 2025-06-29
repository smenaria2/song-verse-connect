// Music-related username generator

const musicAdjectives = [
  'Melodic', 'Harmonic', 'Rhythmic', 'Sonic', 'Acoustic', 'Electric', 'Cosmic', 'Sacred', 'Divine', 'Mystic',
  'Ethereal', 'Celestial', 'Spiritual', 'Peaceful', 'Serene', 'Blissful', 'Transcendent', 'Enlightened',
  'Vibrant', 'Resonant', 'Flowing', 'Dancing', 'Singing', 'Chanting', 'Meditative', 'Soulful', 'Heartfelt',
  'Inspiring', 'Uplifting', 'Healing', 'Calming', 'Energetic', 'Passionate', 'Creative', 'Artistic'
];

const musicNouns = [
  'Monk', 'Sage', 'Seeker', 'Dreamer', 'Wanderer', 'Pilgrim', 'Soul', 'Spirit', 'Heart', 'Voice',
  'Melody', 'Harmony', 'Rhythm', 'Beat', 'Note', 'Chord', 'Song', 'Tune', 'Sound', 'Echo',
  'Musician', 'Artist', 'Composer', 'Singer', 'Player', 'Listener', 'Lover', 'Devotee', 'Student',
  'Master', 'Guide', 'Teacher', 'Healer', 'Keeper', 'Guardian', 'Traveler', 'Explorer', 'Finder'
];

const musicInstruments = [
  'Sitar', 'Tabla', 'Flute', 'Harp', 'Bell', 'Drum', 'Chime', 'Gong', 'Violin', 'Piano',
  'Guitar', 'Veena', 'Tanpura', 'Harmonium', 'Santoor', 'Sarod', 'Bansuri', 'Shehnai'
];

export const generateMusicUsername = (): string => {
  const randomAdjective = musicAdjectives[Math.floor(Math.random() * musicAdjectives.length)];
  const randomNoun = musicNouns[Math.floor(Math.random() * musicNouns.length)];
  const randomInstrument = musicInstruments[Math.floor(Math.random() * musicInstruments.length)];
  
  // Different patterns for variety
  const patterns = [
    `${randomAdjective}${randomNoun}`,
    `${randomNoun}Of${randomInstrument}`,
    `${randomAdjective}${randomInstrument}`,
    `Sacred${randomNoun}`,
    `${randomInstrument}${randomNoun}`,
    `Mystic${randomAdjective}`,
    `${randomAdjective}Seeker`,
    `Divine${randomInstrument}`
  ];
  
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Add a random number for uniqueness (1-999)
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  
  return `${selectedPattern}${randomNumber}`;
};

// Generate a few examples for placeholder text
export const getExampleUsernames = (): string[] => {
  return [
    generateMusicUsername(),
    generateMusicUsername(),
    generateMusicUsername()
  ];
};
import { User } from '../data/mock';

/**
 * Calculates a dynamic compatibility percentage (60% to 99%) between two users
 * based on their interests, intent, smoking/drinking habits, personality, zodiac, and distance.
 */
export function calculateCompatibility(me: Partial<User> | null, other: User): number {
  if (!me) {
    return other.compatibility || 75;
  }

  // 1. Interests / Lifestyle Match (Weight: 45%)
  const myInterests = me.interests || me.lifestyle || [];
  const otherInterests = other.interests || other.lifestyle || [];
  
  let interestScore = 65; // Base fallback score
  if (myInterests.length > 0 && otherInterests.length > 0) {
    const commonInterests = myInterests.filter(item => 
      otherInterests.some(oItem => oItem.toLowerCase() === item.toLowerCase())
    );
    const totalUnique = new Set([...myInterests, ...otherInterests]).size;
    
    if (totalUnique > 0) {
      const ratio = commonInterests.length / Math.min(myInterests.length, otherInterests.length);
      const unionRatio = commonInterests.length / totalUnique;
      const blended = (ratio * 0.7) + (unionRatio * 0.3);
      interestScore = 40 + (blended * 60); // scale to 40 - 100
    }
  } else if (myInterests.length > 0 || otherInterests.length > 0) {
    interestScore = 55;
  }

  // 2. Relationship Intent Match (Weight: 15%)
  let intentScore = 75; 
  if (me.intent && other.intent) {
    const myIntent = me.intent.toLowerCase().trim();
    const otherIntent = other.intent.toLowerCase().trim();
    
    if (myIntent === otherIntent) {
      intentScore = 100;
    } else {
      const seriousMatch = myIntent.includes('sério') || otherIntent.includes('sério');
      const casualMatch = myIntent.includes('casual') || otherIntent.includes('casual');
      const friendMatch = myIntent.includes('amizade') || otherIntent.includes('amizade');
      
      if (seriousMatch && casualMatch) {
        intentScore = 30; // Direct clash
      } else if (friendMatch && seriousMatch) {
        intentScore = 65; // Friendship could lead to something serious
      } else if (friendMatch && casualMatch) {
        intentScore = 75; // Friendship can be casual
      } else {
        intentScore = 50;
      }
    }
  }

  // 3. Lifestyle Habits: Smoking & Drinking (Weight: 15%)
  let habitsScore = 75;
  let habitMatchCount = 0;
  let habitMaxCount = 0;

  if (me.drinking && other.drinking) {
    habitMaxCount++;
    const myDrink = me.drinking.toLowerCase();
    const otherDrink = other.drinking.toLowerCase();
    if (myDrink === otherDrink) {
      habitMatchCount += 1.0;
    } else if (
      (myDrink.includes('social') && otherDrink.includes('frequência')) ||
      (myDrink.includes('frequência') && otherDrink.includes('social'))
    ) {
      habitMatchCount += 0.8;
    } else if (
      (myDrink.includes('não') && otherDrink.includes('frequência')) ||
      (myDrink.includes('frequência') && otherDrink.includes('não'))
    ) {
      habitMatchCount += 0.2;
    } else {
      habitMatchCount += 0.6; // No drink vs social
    }
  }

  if (me.smoking && other.smoking) {
    habitMaxCount++;
    const mySmoke = me.smoking.toLowerCase();
    const otherSmoke = other.smoking.toLowerCase();
    if (mySmoke === otherSmoke) {
      habitMatchCount += 1.0;
    } else if (
      (mySmoke.includes('não') && otherSmoke.includes('fumante')) ||
      (mySmoke.includes('fumante') && otherSmoke.includes('não'))
    ) {
      habitMatchCount += 0.1;
    } else if (
      (mySmoke.includes('social') && otherSmoke.includes('fumante')) ||
      (mySmoke.includes('fumante') && otherSmoke.includes('social'))
    ) {
      habitMatchCount += 0.7;
    } else {
      habitMatchCount += 0.6; // No smoke vs social
    }
  }

  if (habitMaxCount > 0) {
    habitsScore = (habitMatchCount / habitMaxCount) * 100;
  }

  // 4. Personality & Zodiac Alignment (Weight: 15%)
  let vibeScore = 75;
  let vibeMatchCount = 0;
  let vibeMaxCount = 0;

  if (me.personality && other.personality) {
    vibeMaxCount++;
    const myPers = me.personality.toLowerCase();
    const otherPers = other.personality.toLowerCase();
    if (myPers === otherPers) {
      vibeMatchCount += 1.0;
    } else if (
      (myPers.includes('extrovertido') && otherPers.includes('introvertido')) ||
      (myPers.includes('introvertido') && otherPers.includes('extrovertido'))
    ) {
      vibeMatchCount += 0.95; // Opposites attract
    } else if (
      (myPers.includes('calmo') && otherPers.includes('aventureiro')) ||
      (myPers.includes('aventureiro') && otherPers.includes('calmo'))
    ) {
      vibeMatchCount += 0.85; // Balanced team
    } else {
      vibeMatchCount += 0.75;
    }
  }

  if (me.zodiac && other.zodiac) {
    vibeMaxCount++;
    const getZodiacElement = (z: string): string => {
      const name = z.toLowerCase();
      if (['áries', 'leão', 'sagitário'].some(s => name.includes(s))) return 'fire';
      if (['touro', 'virgem', 'capricórnio'].some(s => name.includes(s))) return 'earth';
      if (['gêmeos', 'libra', 'aquário'].some(s => name.includes(s))) return 'air';
      if (['câncer', 'escorpião', 'peixes'].some(s => name.includes(s))) return 'water';
      return 'other';
    };

    const myElem = getZodiacElement(me.zodiac);
    const otherElem = getZodiacElement(other.zodiac);

    if (myElem === otherElem) {
      vibeMatchCount += 0.95;
    } else if (
      (myElem === 'fire' && otherElem === 'air') || (myElem === 'air' && otherElem === 'fire') ||
      (myElem === 'earth' && otherElem === 'water') || (myElem === 'water' && otherElem === 'earth')
    ) {
      vibeMatchCount += 0.90; // Natural elements affinity
    } else if (
      (myElem === 'fire' && otherElem === 'water') || (myElem === 'water' && otherElem === 'fire')
    ) {
      vibeMatchCount += 0.40; // Extinguishers
    } else {
      vibeMatchCount += 0.70;
    }
  }

  if (vibeMaxCount > 0) {
    vibeScore = (vibeMatchCount / vibeMaxCount) * 100;
  }

  // 5. Distance Factor (Weight: 10%)
  let distanceScore = 80;
  if (other.distance !== undefined) {
    const km = typeof other.distance === 'number' ? other.distance : 0;
    if (km <= 2) distanceScore = 100;
    else if (km <= 5) distanceScore = 95;
    else if (km <= 10) distanceScore = 85;
    else if (km <= 20) distanceScore = 75;
    else distanceScore = 65;
  }

  // Calculate overall weighted score
  const finalScore = (interestScore * 0.45) + (intentScore * 0.15) + (habitsScore * 0.15) + (vibeScore * 0.15) + (distanceScore * 0.10);

  // Return formatted compatibility bounded perfectly between 60% and 99%
  return Math.round(Math.max(60, Math.min(99, finalScore)));
}

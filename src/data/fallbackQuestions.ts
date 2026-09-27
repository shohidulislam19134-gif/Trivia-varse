import { TriviaQuestion } from '../types';

export const FALLBACK_QUESTIONS: Record<string, TriviaQuestion[]> = {
  general: [
    {
      id: 'fb_gen_1',
      question: 'Which element on the periodic table has the highest electrical conductivity at room temperature?',
      options: ['Silver', 'Copper', 'Gold', 'Aluminum'],
      correctAnswerIndex: 0,
      explanation: 'Silver has the highest electrical and thermal conductivity of all known metals, slightly outperforming copper and gold.',
      category: 'Science & Curiosities',
      difficulty: 'medium',
      hostDialogue: 'Let us see if your scientific knowledge shines as brightly as precious metals!',
      hostMood: 'excited',
      groundingSources: [
        { title: 'Electrical Resistivity of the Elements', uri: 'https://en.wikipedia.org/wiki/Electrical_resistivity_and_conductivity' }
      ]
    },
    {
      id: 'fb_gen_2',
      question: 'What is the only mammal naturally capable of sustained, true powered flight?',
      options: ['Flying Squirrel', 'Bat', 'Sugar Glider', 'Colugo'],
      correctAnswerIndex: 1,
      explanation: 'Bats are the only mammals capable of true powered flapping flight. Flying squirrels and sugar gliders only glide using skin flaps.',
      category: 'Biology',
      difficulty: 'easy',
      hostDialogue: 'Keep your eyes on the night sky for this winged mystery!',
      hostMood: 'encouraging',
      groundingSources: [
        { title: 'Bat Flight Evolution & Aerodynamics', uri: 'https://en.wikipedia.org/wiki/Bat#Flight' }
      ]
    },
    {
      id: 'fb_gen_3',
      question: 'In computer science, what does the acronym "API" stand for?',
      options: ['Application Programming Interface', 'Automated Program Integration', 'Applied Protocol Interface', 'Advanced Processing Instruction'],
      correctAnswerIndex: 0,
      explanation: 'API stands for Application Programming Interface, which allows distinct software applications to communicate with each other.',
      category: 'Technology',
      difficulty: 'easy',
      hostDialogue: 'Developers live by this three-letter acronym every single hour!',
      hostMood: 'smug',
      groundingSources: [
        { title: 'API Definition & Architecture', uri: 'https://en.wikipedia.org/wiki/API' }
      ]
    },
    {
      id: 'fb_gen_4',
      question: 'Which ancient wonder of the world was located in the city of Babylon and celebrated for its terraced gardens?',
      options: ['Colossus of Rhodes', 'Hanging Gardens of Babylon', 'Lighthouse of Alexandria', 'Temple of Artemis'],
      correctAnswerIndex: 1,
      explanation: 'The Hanging Gardens of Babylon were legendary terraced gardens described as an architectural masterpiece in ancient Mesopotamia.',
      category: 'History',
      difficulty: 'medium',
      hostDialogue: 'A grand question steeped in antiquity and ancient marvels!',
      hostMood: 'dramatic',
      groundingSources: [
        { title: 'Hanging Gardens of Babylon', uri: 'https://en.wikipedia.org/wiki/Hanging_Gardens_of_Babylon' }
      ]
    },
    {
      id: 'fb_gen_5',
      question: 'Which planet in our solar system has the most extensive and visible ring system?',
      options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
      correctAnswerIndex: 1,
      explanation: 'Saturn features the most prominent ring system in the solar system, composed mainly of ice particles, rocky debris, and dust.',
      category: 'Space',
      difficulty: 'easy',
      hostDialogue: 'Look past the asteroid belt for this jewel of our solar system!',
      hostMood: 'excited',
      groundingSources: [
        { title: 'Rings of Saturn - NASA Solar System', uri: 'https://science.nasa.gov/saturn/rings/' }
      ]
    }
  ],
  breaking: [
    {
      id: 'fb_brk_1',
      question: 'Which major space telescope launched by NASA and ESA provided humanity with the deepest infrared images of early galaxies?',
      options: ['Hubble Space Telescope', 'James Webb Space Telescope (JWST)', 'Nancy Grace Roman', 'Spitzer'],
      correctAnswerIndex: 1,
      explanation: 'The James Webb Space Telescope (JWST), operating at Lagrange point L2, uses infrared instruments to capture the earliest cosmic structures.',
      category: 'Space Discoveries',
      difficulty: 'medium',
      hostDialogue: 'Peer back billions of years into the dawn of cosmic history!',
      hostMood: 'excited',
      groundingSources: [
        { title: 'James Webb Space Telescope Missions', uri: 'https://webb.nasa.gov/' }
      ]
    },
    {
      id: 'fb_brk_2',
      question: 'Which global sporting tournament will be jointly hosted across the United States, Canada, and Mexico in 2026?',
      options: ['Summer Olympic Games', 'FIFA Men\'s World Cup', 'Rugby World Cup', 'Cricket World Cup'],
      correctAnswerIndex: 1,
      explanation: 'The 2026 FIFA World Cup is the 23rd FIFA World Cup and the first to feature 48 teams hosted jointly across North America.',
      category: 'Sports',
      difficulty: 'easy',
      hostDialogue: 'A landmark global tournament touching three North American nations!',
      hostMood: 'excited',
      groundingSources: [
        { title: 'FIFA World Cup 2026 Official', uri: 'https://www.fifa.com/worldcup' }
      ]
    },
    {
      id: 'fb_brk_3',
      question: 'In modern generative artificial intelligence, what foundational deep learning architecture was introduced by the 2017 paper "Attention Is All You Need"?',
      options: ['Convolutional Neural Network', 'Transformer', 'Recurrent Neural Network', 'Random Forest'],
      correctAnswerIndex: 1,
      explanation: 'The Transformer architecture revolutionized AI by introducing self-attention mechanisms, powering modern large language models.',
      category: 'Technology',
      difficulty: 'medium',
      hostDialogue: 'The mathematical breakthrough that ignited the contemporary AI revolution!',
      hostMood: 'smug',
      groundingSources: [
        { title: 'Attention Is All You Need - Vaswani et al.', uri: 'https://arxiv.org/abs/1706.03762' }
      ]
    },
    {
      id: 'fb_brk_4',
      question: 'Which clean energy reactor experiment in France aims to prove the scientific feasibility of commercial magnetic confinement nuclear fusion?',
      options: ['ITER', 'CERN LHC', 'NIF', 'JET'],
      correctAnswerIndex: 0,
      explanation: 'ITER (International Thermonuclear Experimental Tokamak) is the world\'s largest magnetic confinement plasma physics experiment.',
      category: 'Science',
      difficulty: 'hard',
      hostDialogue: 'Recreating the power of the Sun right here on Earth!',
      hostMood: 'dramatic',
      groundingSources: [
        { title: 'ITER - The Way to New Energy', uri: 'https://www.iter.org/' }
      ]
    },
    {
      id: 'fb_brk_5',
      question: 'Which company developed the Gemini family of multimodal models with native audio, search grounding, and reasoning capabilities?',
      options: ['Google DeepMind', 'OpenAI', 'Anthropic', 'Meta AI'],
      correctAnswerIndex: 0,
      explanation: 'Google and Google DeepMind created Gemini, a native multimodal model built from the ground up to reason across text, code, audio, and images.',
      category: 'Tech Pioneers',
      difficulty: 'easy',
      hostDialogue: 'The very digital minds powering this game show right before your eyes!',
      hostMood: 'excited',
      groundingSources: [
        { title: 'Google Gemini AI', uri: 'https://deepmind.google/technologies/gemini/' }
      ]
    }
  ],
  science: [
    {
      id: 'fb_sci_1',
      question: 'What is the speed of light in a vacuum, rounded to the nearest thousand kilometers per second?',
      options: ['150,000 km/s', '300,000 km/s', '450,000 km/s', '600,000 km/s'],
      correctAnswerIndex: 1,
      explanation: 'The speed of light in a vacuum is exactly 299,792.458 km/s, commonly rounded to 300,000 km/s.',
      category: 'Physics',
      difficulty: 'easy',
      hostDialogue: 'Faster than anything in the known universe!',
      hostMood: 'excited',
      groundingSources: [
        { title: 'Speed of Light in Physics', uri: 'https://en.wikipedia.org/wiki/Speed_of_light' }
      ]
    },
    {
      id: 'fb_sci_2',
      question: 'What organelle is famously known as the powerhouse of eukaryotic cells?',
      options: ['Mitochondria', 'Ribosome', 'Golgi apparatus', 'Endoplasmic reticulum'],
      correctAnswerIndex: 0,
      explanation: 'Mitochondria generate most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.',
      category: 'Biology',
      difficulty: 'easy',
      hostDialogue: 'Every middle school biology student should have this locked in!',
      hostMood: 'encouraging',
      groundingSources: [
        { title: 'Mitochondria - Biology', uri: 'https://en.wikipedia.org/wiki/Mitochondrion' }
      ]
    },
    {
      id: 'fb_sci_3',
      question: 'What fundamental quantum principle states that you cannot simultaneously know both the exact position and momentum of a particle?',
      options: ['Heisenberg Uncertainty Principle', 'Pauli Exclusion Principle', 'Schrodinger Wave Equation', 'Planck Radiation Law'],
      correctAnswerIndex: 0,
      explanation: 'The Heisenberg Uncertainty Principle, formulated by Werner Heisenberg in 1927, establishes a fundamental limit to precision.',
      category: 'Quantum Physics',
      difficulty: 'hard',
      hostDialogue: 'The more certain you are of one, the less certain you are of the other!',
      hostMood: 'dramatic',
      groundingSources: [
        { title: 'Uncertainty Principle', uri: 'https://en.wikipedia.org/wiki/Uncertainty_principle' }
      ]
    },
    {
      id: 'fb_sci_4',
      question: 'What is the primary greenhouse gas produced by human fossil fuel combustion that drives global climate change?',
      options: ['Carbon Dioxide (CO2)', 'Methane', 'Nitrous Oxide', 'Ozone'],
      correctAnswerIndex: 0,
      explanation: 'Carbon dioxide (CO2) accounts for the largest share of human-generated greenhouse gas emissions from burning coal, oil, and gas.',
      category: 'Earth Science',
      difficulty: 'easy',
      hostDialogue: 'A critical scientific topic shaping our planet today!',
      hostMood: 'encouraging',
      groundingSources: [
        { title: 'Greenhouse Gases Overview - EPA', uri: 'https://www.epa.gov/ghgemissions/overview-greenhouse-gases' }
      ]
    },
    {
      id: 'fb_sci_5',
      question: 'In genetics, which four chemical base pairs compose the code of DNA?',
      options: ['Adenine, Thymine, Guanine, Cytosine', 'Adenine, Uracil, Guanine, Cytosine', 'Alanine, Threonine, Glycine, Cysteine', 'Adenine, Tyrosine, Glutamine, Cytosine'],
      correctAnswerIndex: 0,
      explanation: 'DNA is composed of the four nucleotide bases: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C). Uracil is found in RNA.',
      category: 'Genetics',
      difficulty: 'medium',
      hostDialogue: 'The molecular alphabet of all earthly life!',
      hostMood: 'smug',
      groundingSources: [
        { title: 'DNA Structure & Base Pairs', uri: 'https://en.wikipedia.org/wiki/DNA' }
      ]
    }
  ],
  popculture: [
    {
      id: 'fb_pop_1',
      question: 'Which 1994 film directed by Quentin Tarantino won the Palme d\'Or at the Cannes Film Festival?',
      options: ['Pulp Fiction', 'Reservoir Dogs', 'Jackie Brown', 'Fargo'],
      correctAnswerIndex: 0,
      explanation: 'Pulp Fiction won the prestigious Palme d\'Or in 1994 and became one of the most culturally influential films of the 1990s.',
      category: 'Movies',
      difficulty: 'easy',
      hostDialogue: 'A cinematic masterpiece filled with royale with cheese and twist contests!',
      hostMood: 'excited',
      groundingSources: [{ title: 'Pulp Fiction Cannes Festival', uri: 'https://en.wikipedia.org/wiki/Pulp_Fiction' }]
    },
    {
      id: 'fb_pop_2',
      question: 'In the original 1985 Nintendo NES game "Super Mario Bros.", what is Mario\'s brother\'s name?',
      options: ['Luigi', 'Wario', 'Waluigi', 'Toad'],
      correctAnswerIndex: 0,
      explanation: 'Luigi is Mario\'s taller, green-clad fraternal twin brother who first debuted in the 1983 arcade game Mario Bros.',
      category: 'Gaming',
      difficulty: 'easy',
      hostDialogue: 'Grab your mushrooms and jump into the Warp Pipes!',
      hostMood: 'encouraging',
      groundingSources: [{ title: 'Luigi Character History', uri: 'https://en.wikipedia.org/wiki/Luigi' }]
    },
    {
      id: 'fb_pop_3',
      question: 'Which British rock band released the landmark 1973 concept album "The Dark Side of the Moon"?',
      options: ['Pink Floyd', 'Led Zeppelin', 'The Who', 'Queen'],
      correctAnswerIndex: 0,
      explanation: 'Pink Floyd released The Dark Side of the Moon in 1973, which remained on the Billboard charts for a record 900+ weeks.',
      category: 'Music',
      difficulty: 'easy',
      hostDialogue: 'Turn up the prism and shine on, trivia rockstar!',
      hostMood: 'dramatic',
      groundingSources: [{ title: 'The Dark Side of the Moon', uri: 'https://en.wikipedia.org/wiki/The_Dark_Side_of_the_Moon' }]
    },
    {
      id: 'fb_pop_4',
      question: 'Who created the high fantasy world of Middle-earth, including "The Lord of the Rings" and "The Hobbit"?',
      options: ['J.R.R. Tolkien', 'C.S. Lewis', 'George R.R. Martin', 'Robert Jordan'],
      correctAnswerIndex: 0,
      explanation: 'John Ronald Reuel Tolkien, an Oxford philologist, created Middle-earth and its rich languages like Elvish and Dwarvish.',
      category: 'Literature & Fantasy',
      difficulty: 'easy',
      hostDialogue: 'One trivia question to rule them all, and in the darkness bind them!',
      hostMood: 'smug',
      groundingSources: [{ title: 'J.R.R. Tolkien Middle-earth', uri: 'https://en.wikipedia.org/wiki/J._R._R._Tolkien' }]
    },
    {
      id: 'fb_pop_5',
      question: 'Which legendary 1998 video game introduced the "Z-targeting" lock-on combat system to 3D adventure games?',
      options: ['The Legend of Zelda: Ocarina of Time', 'Super Mario 64', 'GoldenEye 007', 'Metal Gear Solid'],
      correctAnswerIndex: 0,
      explanation: 'The Legend of Zelda: Ocarina of Time on Nintendo 64 pioneered the Z-targeting lock-on mechanic still standard in gaming today.',
      category: 'Gaming',
      difficulty: 'medium',
      hostDialogue: 'Listen! Navi is whispering the answer straight into your ear!',
      hostMood: 'excited',
      groundingSources: [{ title: 'Ocarina of Time Game Design', uri: 'https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_Ocarina_of_Time' }]
    }
  ],
  history: [
    {
      id: 'fb_hist_1',
      question: 'In what year did the Apollo 11 mission land the first humans on the Moon?',
      options: ['1969', '1965', '1971', '1973'],
      correctAnswerIndex: 0,
      explanation: 'On July 20, 1969, Neil Armstrong and Buzz Aldrin landed the Apollo 11 Lunar Module Eagle on the Sea of Tranquility.',
      category: 'World History',
      difficulty: 'easy',
      hostDialogue: 'One small step for man, one giant leap for your trivia scoreboard!',
      hostMood: 'excited',
      groundingSources: [{ title: 'Apollo 11 Mission - NASA', uri: 'https://www.nasa.gov/mission_pages/apollo/apollo-11.html' }]
    },
    {
      id: 'fb_hist_2',
      question: 'Who was the first Emperor of a unified China and creator of the Terracotta Army?',
      options: ['Qin Shi Huang', 'Han Wudi', 'Kublai Khan', 'Sun Yat-sen'],
      correctAnswerIndex: 0,
      explanation: 'Qin Shi Huang unified China in 221 BC, standardizing currency, weights, and script, and commissioning the Terracotta Army.',
      category: 'Ancient History',
      difficulty: 'medium',
      hostDialogue: 'Imperial history marching right across the centuries!',
      hostMood: 'dramatic',
      groundingSources: [{ title: 'Qin Shi Huang Biography', uri: 'https://en.wikipedia.org/wiki/Qin_Shi_Huang' }]
    },
    {
      id: 'fb_hist_3',
      question: 'What document signed in 1215 at Runnymede placed legal limits on the powers of the King of England?',
      options: ['Magna Carta', 'Treaty of Versailles', 'English Bill of Rights', 'Domesday Book'],
      correctAnswerIndex: 0,
      explanation: 'The Magna Carta (Great Charter) was signed by King John in June 1215, laying cornerstones for modern constitutional law.',
      category: 'Medieval History',
      difficulty: 'medium',
      hostDialogue: 'A historic showdown between English barons and King John!',
      hostMood: 'smug',
      groundingSources: [{ title: 'Magna Carta - British Library', uri: 'https://www.bl.uk/magna-carta' }]
    },
    {
      id: 'fb_hist_4',
      question: 'The ancient city of Alexandria in Egypt was founded by which Macedonian conqueror?',
      options: ['Alexander the Great', 'Philip II', 'Ptolemy I', 'Seleucus Nicator'],
      correctAnswerIndex: 0,
      explanation: 'Alexander the Great founded Alexandria in 331 BC. It quickly became the cultural and intellectual capital of the Hellenistic world.',
      category: 'Ancient History',
      difficulty: 'easy',
      hostDialogue: 'A conqueror whose empire stretched from the Balkans to the Indus river!',
      hostMood: 'dramatic',
      groundingSources: [{ title: 'Alexandria History', uri: 'https://en.wikipedia.org/wiki/Alexandria' }]
    },
    {
      id: 'fb_hist_5',
      question: 'Which trade route network connected China with the Mediterranean world for centuries, facilitating silk, spice, and ideas exchange?',
      options: ['The Silk Road', 'The Amber Road', 'The Incense Route', 'The Trans-Saharan Highway'],
      correctAnswerIndex: 0,
      explanation: 'The Silk Road was an expansive network of Eurasian trade routes active from the Han dynasty until the Ottoman boycott.',
      category: 'World History',
      difficulty: 'easy',
      hostDialogue: 'Caravans laden with spices, paper, and gemstones across mountains and deserts!',
      hostMood: 'encouraging',
      groundingSources: [{ title: 'Silk Road UNESCO', uri: 'https://en.unesco.org/silkroad/' }]
    }
  ],
  geography: [
    {
      id: 'fb_geo_1',
      question: 'Which river is the longest in the world by total length?',
      options: ['Nile River', 'Amazon River', 'Yangtze River', 'Mississippi River'],
      correctAnswerIndex: 0,
      explanation: 'The Nile River spans approximately 6,650 km (4,132 miles), making it traditionally recognized as the longest river on Earth.',
      category: 'Geography',
      difficulty: 'easy',
      hostDialogue: 'Flowing from central Africa through Egypt and into the Mediterranean!',
      hostMood: 'excited',
      groundingSources: [{ title: 'Nile River Geography', uri: 'https://en.wikipedia.org/wiki/Nile' }]
    },
    {
      id: 'fb_geo_2',
      question: 'Which is the largest desert on Earth by surface area?',
      options: ['Antarctic Desert', 'Sahara Desert', 'Arabian Desert', 'Gobi Desert'],
      correctAnswerIndex: 0,
      explanation: 'The Antarctic Desert covers 14.2 million square kilometers, making it the largest desert in the world (defined by low precipitation).',
      category: 'Geography',
      difficulty: 'medium',
      hostDialogue: 'Do not be fooled by sand dunes—ice deserts count too!',
      hostMood: 'smug',
      groundingSources: [{ title: 'List of Deserts by Area', uri: 'https://en.wikipedia.org/wiki/List_of_deserts_by_area' }]
    },
    {
      id: 'fb_geo_3',
      question: 'What is the capital city of Australia?',
      options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'],
      correctAnswerIndex: 0,
      explanation: 'Canberra was selected as the compromise capital of Australia in 1908, situated between rivals Sydney and Melbourne.',
      category: 'World Capitals',
      difficulty: 'medium',
      hostDialogue: 'A classic game show trick question that catches millions off guard!',
      hostMood: 'roasting',
      groundingSources: [{ title: 'Canberra National Capital', uri: 'https://en.wikipedia.org/wiki/Canberra' }]
    },
    {
      id: 'fb_geo_4',
      question: 'Mount Kilimanjaro, the highest free-standing mountain in the world, is located in which country?',
      options: ['Tanzania', 'Kenya', 'Uganda', 'Ethiopia'],
      correctAnswerIndex: 0,
      explanation: 'Mount Kilimanjaro is a dormant volcano in northeastern Tanzania, rising 5,895 meters (19,341 ft) above sea level.',
      category: 'Geography',
      difficulty: 'easy',
      hostDialogue: 'Rising like a snow-capped giant above the African savannah!',
      hostMood: 'encouraging',
      groundingSources: [{ title: 'Mount Kilimanjaro - UNESCO', uri: 'https://whc.unesco.org/en/list/403' }]
    },
    {
      id: 'fb_geo_5',
      question: 'Which strait separates the continents of Europe and Asia in Istanbul, Turkey?',
      options: ['Bosphorus Strait', 'Strait of Gibraltar', 'Dardanelles Strait', 'Bering Strait'],
      correctAnswerIndex: 0,
      explanation: 'The Bosphorus Strait connects the Black Sea with the Sea of Marmara, demarcating the continental boundary between Europe and Asia.',
      category: 'Geography',
      difficulty: 'medium',
      hostDialogue: 'The historic crossroads connecting two great continents!',
      hostMood: 'dramatic',
      groundingSources: [{ title: 'Bosphorus Geography', uri: 'https://en.wikipedia.org/wiki/Bosphorus' }]
    }
  ]
};

export function getFallbackQuestions(category: string = 'general', count: number = 5): TriviaQuestion[] {
  const pool = FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS.general;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

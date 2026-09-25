// Parent & child education guide — English source text.
// STATUS: DRAFT, pending expert review.
// Tamil draft lives in guide.ta.ts (pending native-speaker review, flagged site-wide by TAMIL_REVIEWED).
// Grooming is described at the pattern level only, on purpose.

export type Guide = typeof guide;
export const guide = {
  title: 'What you can do',
  lead: 'A one-page map for parents: what to teach, what to watch, and what to do if a child tells you something. Keep it short, calm and often.',

  mindset: [
    { t: 'Watch the circle, not the street', b: 'In most reported cases the child knew the person. Safety lives inside the circle of trust: relatives, family friends, neighbours, tutors, coaches, drivers.' },
    { t: "It's an adult's job", b: 'Body-safety rules help, but prevention is what adults do: who you trust, which situations you allow, how early you notice.' },
    { t: 'Small talks, often', b: "Not one big scary talk. Five calm minutes at bath time, while dressing, or when something comes up on TV." },
    { t: 'Calm beats fear', b: 'A frightened child hides things. A child who has heard "you can tell me anything, you won\'t be in trouble" many times will tell you.' },
    { t: "You don't need perfect words", b: 'Simple, honest, age-appropriate sentences are enough. This page gives you the sentences.' },
  ],

  ages: [
    {
      id: 'age-2-5', label: 'Ages 2–5', focus: 'Names and "my body"',
      points: [
        'Use the real names for private parts. Nicknames teach shame; silence helps abusers.',
        'No forced hugs or kisses, not even for grandma. Their "no" works with you, so they trust it works everywhere.',
        'Underwear rule: parts covered by underwear are private. No one sees or touches them.',
        'Two or three minutes at a time. Repeat monthly.',
      ],
      say: '"Your body belongs to you. You can always tell me anything."',
    },
    {
      id: 'age-6-9', label: 'Ages 6–9', focus: 'Rules, secrets, trusted adults',
      points: [
        'Safe touch feels caring. Unsafe touch is on private parts, or any touch that feels scary or confusing, even from someone they love.',
        'Surprises end happily. Secrets that make you feel bad must always be told.',
        'Choose 3–5 trusted adults together, including one outside the family. Put the list on the fridge.',
        'Practise No · Go · Tell once, lightly, like a fire drill.',
      ],
      say: '"If one grown-up doesn\'t listen, tell the next one. Keep telling."',
    },
    {
      id: 'age-10-12', label: 'Ages 10–12', focus: 'Peers and screens',
      points: [
        'Boundaries apply to older children and cousins too, not only adults.',
        'Never share photos of your body with anyone. A friend met only online is still a stranger.',
        'Anyone who asks for photos or secrecy online: tell a parent straight away.',
        'Keep the door open for awkward questions.',
      ],
      say: '"You can ask me anything. I won\'t get angry. I\'ll just answer."',
    },
    {
      id: 'age-teens', label: 'Teens', focus: 'Consent, pressure, help',
      points: [
        'Consent is a clear yes, and it can change at any time. Silence, fear or pressure is not consent.',
        'Name manipulation: gifts with strings, threats to share photos, cutting them off from friends.',
        'Porn is not what real bodies or relationships look like. Questions get answers, not punishment.',
        'Make sure they know 1098 and the cyber helpline themselves. Teens often won\'t come to parents first.',
      ],
      say: '"If anyone ever threatens you with photos, tell me. We\'ll handle it together."',
    },
  ],

  rules: [
    { k: 'P', t: 'Privates are private', b: 'Parts under underwear are private. Doctors or parents helping with hygiene explain and ask first.' },
    { k: 'A', t: 'Always: your body belongs to you', b: 'No one can make you do anything with your body that feels wrong.' },
    { k: 'N', t: 'No means no', b: 'Even to family, even to someone you love. Respect it at home first.' },
    { k: 'T', t: 'Talk about secrets that upset you', b: 'Surprises are fine. Bad secrets always get told.' },
    { k: 'S', t: 'Speak up, someone can help', b: 'Name trusted adults. Keep telling until someone listens. It is never your fault.' },
  ],
  rulesSource: 'Adapted from the NSPCC "Talk PANTS" rule.',

  precautions: [
    { t: 'Cut one-adult, one-child time', b: 'Abuse needs privacy. Prefer groups and open doors. If a tutor or coach insists on closed-door sessions, sit in or say no.' },
    { t: 'Vet people and places', b: 'Ask schools, tuition centres and academies: written child-protection policy? Police-verified staff? Toilets supervised? Pickup rules? Evasive answers are answers.' },
    { t: 'Notice who singles your child out', b: 'Warmth is normal. Special gifts, seeking alone time, and ignoring the child\'s "no" are not.' },
    { t: 'Say the open-door line often', b: '"If anyone touches you in a way you don\'t like, or asks you to keep a bad secret, tell me. You won\'t be in trouble. I will believe you."' },
    { t: 'Set online basics', b: 'Devices charge outside bedrooms. Know the games and apps and who they chat with. No private photos, ever. Talk about sextortion before it happens.' },
    { t: 'Trust your gut', b: "You don't need proof to create distance. Change the situation (\"we don't do closed-door sessions\") rather than accusing the person." },
  ],

  signs: {
    note: 'Signs are not proof. Look for a sudden change, a pattern, or a cluster, and trust your instinct enough to ask gently.',
    groups: [
      { t: 'Behaviour and mood', items: ['Withdrawn, or suddenly aggressive', 'Anxious, clingy, tearful', 'Nightmares, bedwetting, thumb-sucking again', 'Falling grades, dropping friends', 'Teens: risk-taking, running away, self-harm'] },
      { t: 'Sexual knowledge beyond their age', items: ['Words or knowledge they could not normally have', 'Acting out sexually with toys or other children'] },
      { t: 'Fear of a person or place', items: ["Won't be alone with someone", "Panics about a relative's house, tuition or camp", 'Never force it. Always take it seriously.'] },
      { t: 'Physical (see a doctor)', items: ['Pain, soreness, bruising or bleeding near the genitals', 'Pain walking or sitting', 'Infections or pregnancy'] },
    ],
    ask: '"I\'ve noticed you seem sad lately. I\'m here, and you can tell me anything. You won\'t be in trouble."',
  },

  grooming: {
    def: 'Grooming is when someone builds trust with a child (and often the family) in order to abuse. It can happen in person or online, by any age or gender. Many children don\'t realise it is happening.',
    steps: [
      { t: 'Targets', b: 'Picks a child who is lonely or simply easy to reach.' },
      { t: 'Wins the family', b: 'Becomes helpful and trusted by the parents too.' },
      { t: 'Fills a need', b: 'Gifts, attention, outings, money, a phone.' },
      { t: 'Isolates', b: 'Creates time alone: trips, extra coaching, babysitting.' },
      { t: 'Crosses lines slowly', b: 'Small boundary tests that grow over time.' },
      { t: 'Controls', b: 'Secrecy, blame and threats keep the child silent.' },
    ],
    flags: [
      'Special attention, gifts or privileges for one child',
      'Seeks or volunteers for one-on-one time',
      'Ignores a child\'s "stop" (tickling, lap-sitting)',
      'Sexual jokes or talk around children',
      'Befriends you mainly to reach your child',
      'Private messages or a second phone with your child',
    ],
    online: 'Online signs in your child: new secrecy about devices, unexplained gifts or money, an older "friend" you have never met. Look for unexplained change, not the behaviour alone.',
  },

  disclosure: {
    first: {
      do: ['Stay calm. Breathe. Listen.', 'Believe them.', 'Say "Thank you for telling me."', 'Say "It is not your fault."', 'Write down their words afterwards.'],
      dont: ["Don't interrogate or ask leading questions.", "Don't promise to keep it secret.", "Don't confront the person yourself.", "Don't show shock or anger at the child."],
    },
    steps: [
      { t: 'Get medical care promptly', b: 'For health and for evidence. If you can, avoid bathing or changing clothes first, but never delay care for this.' },
      { t: 'Report: it is your legal duty', b: 'POCSO Section 19: anyone who knows or suspects abuse must report to police or the Special Juvenile Police Unit. Not reporting is punishable (Section 21). You do not need proof.' },
      { t: 'Where to report', b: 'Nearest police station or SJPU · Childline 1098 (24×7) · NCPCR POCSO e-Box · cybercrime.gov.in or 1930 for anything online.' },
      { t: "Protect the child's identity", b: "Never share name, photo or school with neighbours, social media or press. Revealing it is itself an offence (POCSO Section 23)." },
      { t: 'Afterwards', b: 'Keep routines normal. Get counselling for the child and for yourself. Your steady belief is the biggest factor in recovery.' },
    ],
  },

  kids: {
    intro: 'Read this with younger children, or let older ones read it themselves.',
    rules: [
      { t: 'Your body belongs to you', b: 'You are the boss of your body. Hugs, kisses, tickles: you can say yes or no.' },
      { t: 'Private parts are private', b: 'The parts under your underwear. Nobody looks or touches. A doctor or parent helping you wash will explain and ask first.' },
      { t: 'Unsafe touch is never okay', b: 'Even from someone you know and love. If your tummy feels yucky or scared, that is your alarm.' },
      { t: 'Bad secrets get told', b: 'Surprises make everyone happy. Secrets that feel bad must always be told.' },
      { t: 'Keep telling', b: 'If one grown-up doesn\'t help, tell the next one, until someone helps you.' },
      { t: 'It is never your fault', b: 'Not if they gave you gifts. Not if you didn\'t say no loudly. Never.' },
    ],
    ngt: [
      { k: 'NO', b: 'Say it in a big, loud voice.' },
      { k: 'GO', b: 'Get away as fast as you can.' },
      { k: 'TELL', b: 'Tell a trusted grown-up.' },
    ],
    trusted: 'My trusted grown-ups',
    teens: [
      { t: 'Your body, your rules', b: 'Only a clear yes is yes. Pressure, guilt or "you owe me" is not consent. You can change your mind anytime.' },
      { t: 'Spot manipulation', b: 'Gifts with strings, "if you loved me you would", threats to share photos, cutting you off from friends. That is control, not love.' },
      { t: 'Online is real life', b: 'Anyone can pretend to be anyone. Never send intimate photos. Asked for photos or secrecy? Screenshot, block, tell.' },
      { t: 'If someone threatens to share photos', b: "Don't pay. Don't send more. Save the evidence, tell an adult, report on cybercrime.gov.in or 1930, or call 1098. You won't be in trouble." },
      { t: 'If something happened', b: 'It was not your fault. Tell someone you trust, or call 1098 yourself. It is free and 24×7.' },
      { t: 'Be the friend who listens', b: "Believe them, don't spread it, and help them tell an adult." },
    ],
  },

  keyParents: [
    'Most children knew the person: guard the trusted circle.',
    'Prevention is the adult\'s job.',
    'Talk early, often, calmly.',
    'Teach the five PANTS rules.',
    'Use real body-part names.',
    'Respect your child\'s "no" at home.',
    'Avoid closed-door one-on-one time.',
    'Vet caregivers and institutions.',
    'Know the signs; trust your gut.',
    'If a child tells you: stay calm, believe, get care, report.',
  ],
  keyKids: [
    'My body belongs to me.',
    'Private parts are private.',
    'Unsafe touch is never okay.',
    'No · Go · Tell.',
    'Bad secrets get told.',
    'I have trusted grown-ups.',
    'No private photos online.',
    'It is never my fault.',
  ],

  books: {
    kids: [
      ['My Body! What I Say Goes!', 'Jayneen Sanders', 'Body safety, safe and unsafe touch'],
      ['No Means No!', 'Jayneen Sanders', 'Personal boundaries'],
      ['Some Secrets Should Never Be Kept', 'Jayneen Sanders', 'Bad secrets vs surprises'],
      ['I Said No!', 'Kimberly & Zack King', 'Kid-to-kid guide, older children'],
      ['Your Body Belongs to You', 'Cornelia Spelman', 'Very young children'],
      ['The Right Touch', 'Sandy Kleven', 'Read-aloud story'],
      ["It's MY Body", 'Lory Freeman', 'Pre-schoolers'],
      ['My Body is Private', 'Linda Walvoord Girard', 'Early primary'],
      ['My Body Belongs to Me', 'Jill Starishevsky', 'Rhyming read-aloud'],
    ],
    parents: [
      ['Protecting the Gift', 'Gavin de Becker', 'Trusting your instincts without raising children in fear'],
    ],
    orgs: [
      ['NSPCC — Talk PANTS', 'https://www.nspcc.org.uk/keeping-children-safe/support-for-parents/pants-underwear-rule/', 'The five-rule framework used above'],
      ['Darkness to Light — Five Steps', 'https://www.d2l.org/', 'Learn · minimise opportunity · talk · recognise · react'],
      ['Arpan, Mumbai', 'https://www.arpan.org.in/', 'Personal Safety Education for ages 4–18'],
      ['Aarambh India', 'https://aarambhindia.org/', 'Recognising abuse and grooming'],
      ['Stop It Now', 'https://www.stopitnow.org/', 'Free parent tip sheets and safety plans'],
      ['Kidpower', 'https://www.kidpower.org/', 'Practice-based personal-safety skills'],
      ['WHO — INSPIRE', 'https://www.who.int/publications/i/item/inspire-seven-strategies-for-ending-violence-against-children', 'Seven evidence-based strategies'],
    ],
  },
};

export const guideUiEn = {
  map: [
    ['mindset', '01', 'Start here', 'The mindset'],
    ['by-age', '02', 'Talk by age', '2–5 · 6–9 · 10–12 · teens'],
    ['rules', '03', 'Five rules', 'P · A · N · T · S'],
    ['precautions', '04', 'Precautions', 'What adults control'],
    ['signs', '05', 'Warning signs', 'Change, pattern, cluster'],
    ['grooming', '06', 'Grooming', 'How it works'],
    ['tells', '07', 'If a child tells you', 'Calm → care → report'],
    ['kids', '08', 'For kids & teens', 'Read together'],
  ],
  forParents: 'For parents', draft: 'DRAFT · pending expert review', onPage: 'On this page',
  sos: 'Child in danger now?', call112: 'Call 112', childline: 'Childline 1098', ifTells: 'If a child tells you →', preferLearn: 'Prefer short lessons? Learn →',
  k1: '01 · Start here', h1: 'The mindset',
  stat: (n: number, y: number) => `In ${n} of every 100 reported POCSO cases (India, ${y}), the child knew the person. So "don't talk to strangers" was never the main lesson.`,
  statSrc: (y: number, a: string, b: string) => `Reported cases only · NCRB, Crime in India ${y} · ${a} of ${b}.`,
  k2: '02 · How to talk', h2: 'By age',
  k3: '03 · The core curriculum', h3: 'Five rules to teach until they can say them back',
  k4: '04 · What adults control', h4: 'Precautions', l4: 'Most prevention is about the situation, not the lesson.',
  k5: '05 · Notice', h5: 'Warning signs in children', open: 'If you notice something, open gently',
  k6: '06 · Understand', h6: 'How grooming works', flagsH: 'Red flags in an adult or older teen', onlineH: 'Online',
  k7: '07 · Respond', h7: 'If a child tells you, or you suspect abuse', doH: 'First ten minutes: do', dontH: "Don't",
  k8: '08 · For kids & teens', h8: 'Your body-safety rules', fillIn: "Fill in together. If the first person doesn't help, tell the next.", teensH: 'For teens',
  kS: 'Summary', hS: 'Key learnings', forP: 'For parents', forK: 'For kids',
  hSrc: 'Books and materials this guide draws on', kidsBooks: 'Books for children', parentBooks: 'For parents', orgs: 'Organisations & frameworks',
  disclaimer: 'Educational information, not a substitute for professional advice. Pending expert review before publication.',
};
export type GuideUi = typeof guideUiEn;

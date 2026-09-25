// Learning modules — English source text (DRAFT, pending expert review; Tamil pending native review).
// Every module has the same five beats: Hook → Learn → Say it → Do it this week → Check.
// Text supports **bold** only. Grooming is described at the pattern level on purpose.

export type Track = 'parent' | 'kid' | 'teen';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'rules'; items: { t: string; b: string }[] }
  | { type: 'steps'; items: { t: string; b: string }[] }
  | { type: 'tabs'; items: { label: string; text: string; say: string }[] }
  | { type: 'callout'; title: string; items: string[]; tone?: 'warm' | 'plain' };

export interface Hook {
  kind: 'kpi' | 'statement' | 'scenario' | 'plain';
  big?: string;           // "97 of 100" — for kpi, filled from data at build time when big === '{known}'
  text: string;
  meaning?: string;
  action?: string;
}

export interface Game {
  kind: 'pairs' | 'sort';
  prompt: string;
  cards: { text: string; answer: 'a' | 'b'; fb: string }[];
  a: string; b: string;   // button labels
}

export interface Module {
  id: string; track: Track; title: string; minutes: number;
  hook: Hook;
  learn: Block[];
  sayTitle?: string;
  say?: string[];
  game?: Game;
  builder?: 'trusted' | 'plan';
  doIt: string;
  checks: { q: string; a: string }[];
  share?: boolean;
}

export const TRACKS: Record<Track, { title: string; door: string; blurb: string; tone: string }> = {
  parent: { title: "I'm a parent", door: 'Parent track', blurb: 'What to teach, what to watch, what to do if a child tells you. Ends with a printable family safety plan.', tone: 'Plain language, exact words to use.' },
  kid: { title: "I'm a kid", door: 'Kid track', blurb: 'Your body, secrets vs surprises, and No · Go · Tell. Best done together with a parent.', tone: 'Warm and simple. No scary words.' },
  teen: { title: "I'm a teen", door: 'Teen track', blurb: 'Consent and pressure, staying safe online, and what to do if something happened.', tone: 'Straight talk. No lectures.' },
};

export const MODULES: Module[] = [
  // ─────────────────────────── PARENT ───────────────────────────
  {
    id: 'p1', track: 'parent', title: 'Why this matters', minutes: 4,
    hook: { kind: 'kpi', big: '{known}', text: 'In about {known} of every 100 **reported** POCSO cases, the child knew the person. (Reported is not the same as occurred.)', meaning: '"Don\'t talk to strangers" was never the lesson. Safety lives inside the circle of trust.', action: 'This week, look at your child\'s circle (relatives, tutors, coaches, neighbours), not the street.' },
    learn: [
      { type: 'list', items: [
        'Most abuse is by someone the family knows and trusts. That is exactly why it is hard to see, and why **"but he\'s such a nice man"** is the most dangerous sentence in prevention.',
        'The burden of prevention is on **adults, not children** (Darkness to Light). Teaching rules helps; your supervision and choices do the heavy lifting.',
        '**Calm beats fear.** A frightened child hides things. A child who has heard "you can tell me anything" a hundred times will tell you.',
        'Skip the one big scary talk. Children learn through **small, repeated, casual conversations**.',
      ] },
    ],
    say: ['"If anyone ever touches you in a way you don\'t like, or asks you to keep a secret that feels bad, tell me. You will never get in trouble for telling. I will believe you."'],
    doIt: 'Say that sentence to your child tonight. Word for word. Then say it again next week.',
    checks: [
      { q: 'A stranger offers your child sweets at the park. A trusted uncle insists on closed-door tuition sessions. Where does your prevention energy go?', a: 'The uncle. In most reported cases the child knew the person.' },
      { q: 'True or false: "One big serious talk at age 10 covers it."', a: 'False. Small, repeated, casual conversations are how children actually learn.' },
    ],
  },
  {
    id: 'p2', track: 'parent', title: 'The 5 body-safety rules', minutes: 5,
    hook: { kind: 'scenario', text: 'Your 6-year-old asks, "What are private parts?" and you freeze. This module ends the freezing. **Five sentences**, that\'s all.' },
    learn: [
      { type: 'rules', items: [
        { t: 'Privates are private', b: 'The parts covered by underwear are private. Nobody should ask to see or touch them, and your child shouldn\'t see or touch anyone else\'s. Doctors, or parents helping with washing, explain why and ask first.' },
        { t: 'Your body belongs to you', b: 'Nobody has the right to make your child do anything with their body that feels wrong. How they feel is what matters.' },
        { t: 'No means no', b: 'Your child can say no to unwanted touch, even to family, even to someone they love.' },
        { t: 'Talk about secrets that upset you', b: 'Surprises make everyone happy later. Secrets that feel sad, scary or weird must always be told.' },
        { t: 'Speak up, someone can help', b: 'Name trusted adults together (the family plan in module 8 makes this a written list). Keep telling until someone listens. It is never their fault.' },
      ] },
      { type: 'p', text: 'Adapted from the NSPCC "Talk PANTS" rule.' },
    ],
    say: ['"The parts of your body covered by your underwear are called private parts. They\'re private: nobody should see them or touch them. Your body belongs to you. If anyone tries, say NO loudly and tell me. You won\'t get in trouble. I\'ll be proud you told me."'],
    doIt: 'Teach rules 1 and 2 at bedtime. Rules 3–5 next week. Repetition, not a lecture.',
    checks: [
      { q: 'Your child asks what "private parts" means. You…', a: 'Use the real names, calmly and briefly. Nicknames teach shame, and shame protects abusers.' },
      { q: 'Your child doesn\'t want to hug grandma goodbye. You…', a: '"That\'s fine, wave instead!" Respect their no at home so they trust it works everywhere.' },
    ],
  },
  {
    id: 'p3', track: 'parent', title: 'Words that work: talking by age', minutes: 6,
    hook: { kind: 'scenario', text: 'Your 4-year-old asks, "Why does uncle tickle me even when I say stop?" The answer you give in the next **30 seconds** teaches more than any rulebook.' },
    learn: [
      { type: 'p', text: 'Match the words to the age. Short, honest, at their level. Pick your child\'s age band, and peek at the others.' },
      { type: 'tabs', items: [
        { label: '2–5', text: 'Use real names for body parts (penis, vagina/vulva, breasts, bottom). Teach body autonomy first: "You don\'t have to hug or kiss anyone if you don\'t want to, not even grandma." Keep it to 2–3 minutes, repeat monthly.', say: '"Your body belongs to you. You decide about hugs."' },
        { label: '6–9', text: 'Safe vs unsafe touch (unsafe = private-part touch, or any touch that feels yucky, confusing or scary, even from someone loved). Secrets vs surprises. Name 3–5 trusted adults together, including one outside the family. Practise No · Go · Tell once, lightly, like a fire drill.', say: '"A surprise makes everyone happy later. A secret that makes you feel bad must always be told, even if someone says don\'t."' },
        { label: '10–12', text: 'Boundaries apply to peers and older children too, not just adults. Introduce online safety: never share body photos with anyone; online "friends" are strangers; anyone asking for secrecy gets reported to a parent straight away.', say: '"If anyone online asks for your photo or wants to keep chats secret, stop and tell me. You won\'t be in trouble."' },
        { label: 'Teens', text: 'Consent in plain words: only a clear, enthusiastic yes is yes, and you can change your mind anytime. Name manipulation out loud: gifts with strings, "if you loved me", threats, isolation. Porn isn\'t real life; confusing things can be asked about without punishment.', say: '"Pressure isn\'t love. If someone threatens you or won\'t take no for an answer, that\'s control. Tell me and we\'ll handle it together."' },
      ] },
    ],
    doIt: 'Pick your child\'s age band. Read one script out loud, to yourself, in the mirror. It feels silly. It works.',
    checks: [
      { q: 'When should body-safety talk start?', a: 'As soon as they can talk, beginning with the real names of body parts.' },
      { q: 'Your teen says a friend sent them something "weird" online. Your first response?', a: '"Thanks for telling me", then listen. Punishing the messenger guarantees you\'ll never hear about it again.' },
    ],
  },
  {
    id: 'p4', track: 'parent', title: 'Make your home safer: precautions', minutes: 5,
    hook: { kind: 'statement', text: 'Abuse needs privacy. **Remove the privacy, remove most of the opportunity.** The highest-leverage five minutes on this site.' },
    learn: [
      { type: 'rules', items: [
        { t: 'Minimise one-adult, one-child time', b: 'Prefer group settings. If a tutor, coach or music teacher insists on closed-door one-on-one sessions, the insistence itself is the red flag. Ask for the door open, or sit in.' },
        { t: 'Vet every caregiver and institution', b: 'Ask schools, tuition centres, daycares and academies: a written child-protection policy? Police-verified staff? How are toilets and changing areas supervised? A good institution answers easily; an evasive one is telling you something.' },
        { t: 'Watch the circle, not the street', b: 'Notice adults who single out your child: special gifts, seeking alone time, always wanting the child on their lap, ignoring the child\'s "no". Warmth toward children is normal; singling out one child is not.' },
        { t: 'Online rules', b: 'Non-negotiable under 13, strongly advised for teens: devices charge overnight in the living room. Know the games and apps and who they talk to (gaming chat is a major grooming channel). No personal photos to anyone online. Talk about sexting pressure before it happens.' },
        { t: 'Trust your instincts', b: 'You will often sense something is wrong before you can explain it. You don\'t need proof to create distance. Change the situation ("we don\'t do closed-door sessions"), not accuse the person.' },
      ] },
    ],
    sayTitle: 'Say it like this (to a tuition centre or coach)',
    say: ['"Quick questions: do you have a child-protection policy? Are staff police-verified? And can doors stay open during one-on-one sessions?"'],
    doIt: 'Ask one institution one question from the list above.',
    checks: [
      { q: 'A coach insists on closed-door solo sessions and says you\'re overthinking it. You…', a: 'No closed doors, or you find another coach. The insistence is the red flag, not your question.' },
      { q: 'A relative is wonderful with children but always singles yours out for solo outings and gifts. Concerning?', a: 'Yes. Warmth is normal; singling out one child plus arranging alone time is the pattern to watch.' },
    ],
  },
  {
    id: 'p5', track: 'parent', title: 'Notice early: warning signs', minutes: 5,
    hook: { kind: 'statement', text: 'Signs are **smoke, not fire**. Your job is to notice, not to diagnose. One sign means little; a sudden change or a cluster means pay attention.' },
    learn: [
      { type: 'callout', title: 'Behaviour and mood', items: ['Sudden withdrawal, or sudden aggression', 'Anxiety, clinginess, tearfulness', 'Sleep problems, nightmares, bedwetting or thumb-sucking again', 'Falling grades, missing school, losing interest in friends', 'Eating changes', 'Teens: risk-taking, running away, alcohol or drugs, self-harm'] },
      { type: 'callout', title: 'Sexual behaviour or knowledge beyond their age', items: ['One of the strongest signals', 'Language they couldn\'t have picked up normally', 'Acting out sexually with toys or other children'] },
      { type: 'callout', title: 'Fear or avoidance', items: ['Won\'t be alone with a particular person', 'Panics about a place they used to like: a relative\'s house, tuition, camp', '**Always take it seriously. Never force it.**'], tone: 'warm' },
      { type: 'callout', title: 'Physical (always see a doctor)', items: ['Soreness, bruising or bleeding near the genitals', 'Pain walking or sitting', 'Unusual discharge'] },
      { type: 'p', text: '**The rule:** a single sign proves nothing, and most have innocent explanations. Look for pattern + sudden change + your gut. Then don\'t interrogate: create a calm private moment and listen.' },
    ],
    say: ['"I\'ve noticed you seem quiet lately. I\'m here, and you can tell me anything. You won\'t get in trouble."'],
    doIt: 'Quietly note your child\'s normal: mood, sleep, appetite, enthusiasm. You can\'t spot a change if you never registered the baseline.',
    checks: [
      { q: 'Your 7-year-old suddenly dreads going to a relative\'s house she used to love. You…', a: 'Take it seriously, don\'t force it, and open a calm moment to talk, with no leading questions.' },
      { q: 'True or false: "Bedwetting after being dry for a year proves something happened."', a: 'False. It\'s a signal to gently pay attention, not a verdict. Look for patterns, not single signs.' },
    ],
  },
  {
    id: 'p6', track: 'parent', title: 'How grooming works', minutes: 5,
    hook: { kind: 'statement', text: 'Groomers don\'t just groom the child. **They groom the parents too**: helpful, trusted, always around. That\'s why "but he\'s such a nice man" is the most dangerous sentence in prevention.' },
    learn: [
      { type: 'steps', items: [
        { t: 'Target and befriend', b: 'Picks a child who is easy to reach and becomes the fun, understanding adult.' },
        { t: 'Win the parents', b: 'Helpful, trusted, always around. Access runs through your trust.' },
        { t: 'Fill a need', b: 'Gifts, attention, outings, money, a phone.' },
        { t: 'Isolate', b: 'Arranges alone time: trips, "extra practice", babysitting offers.' },
        { t: 'Cross lines slowly', b: 'Small boundary tests that grow over time.' },
        { t: 'Control', b: 'Secrecy, blame and threats keep the child silent.' },
      ] },
      { type: 'callout', title: 'Red flags in an adult or older teen', tone: 'warm', items: ['Singles out your child for attention or gifts', 'Seeks or creates one-on-one time', 'Ignores the child\'s "no" (tickling after "stop")', 'Overly physical with children generally', 'Befriends you mainly to reach your child', 'Secret messages with your child'] },
      { type: 'callout', title: 'Online signs in your child', items: ['Sudden secrecy about online activity', 'Unexplained clothes, phone or money', 'Older "boyfriend/girlfriend" you\'ve never met', 'Unusual places to meet "friends"', 'In teens this can look like normal teenage behaviour: look for unexplained change'] },
    ],
    sayTitle: 'Say it like this (change the situation, not accuse the person)',
    say: ['"In our family we don\'t do closed-door sessions."', '"We don\'t keep secrets in this house. We keep surprises."'],
    doIt: 'Look at the adults around your child with fresh eyes. Is anyone consistently arranging alone time?',
    checks: [
      { q: 'A neighbour showers your child with gifts and offers free solo outings. Your child adores him. You…', a: 'Warmth is normal; singling out + gifts + alone time is the grooming pattern. Reduce the alone time, stay watchful, keep talking with your child.' },
      { q: 'Your child has a new phone you didn\'t buy and won\'t say where it came from. You…', a: 'Treat it as a serious signal. Calmly find out more, look at online activity, and talk with your child without anger.' },
    ],
  },
  {
    id: 'p7', track: 'parent', title: 'The first 10 minutes: if a child tells you', minutes: 6,
    hook: { kind: 'statement', text: 'What you do in the **first 10 minutes** decides whether the child keeps talking, or shuts down for years.' },
    learn: [
      { type: 'callout', title: 'In the moment', items: ['**Stay calm.** Shock, anger or tears will shut them down. Breathe. Listen.', '**Believe them.** Children very rarely lie about abuse.', '**Thank them.**', '**Don\'t interrogate.** No leading questions. Open prompts only: "Can you tell me more about that?"', '**Say it\'s not their fault**, explicitly.', '**Don\'t promise total secrecy.**', '**Don\'t confront the suspected abuser yourself.** It can endanger the child and damage the case.'] },
      { type: 'steps', items: [
        { t: 'Medical care, promptly', b: 'As soon as possible. If you can without distressing the child, avoid bathing or changing clothes before the exam (it preserves evidence), but never delay care for this.' },
        { t: 'Report: it\'s your legal duty', b: 'Under POCSO Section 19, anyone who knows or reasonably suspects abuse must report to the Special Juvenile Police Unit or local police. Not reporting is punishable under Section 21 (up to six months\' imprisonment, a fine, or both). You don\'t need proof: investigating is the system\'s job.' },
        { t: 'Where', b: 'Nearest police station or SJPU · Childline 1098 (24×7) · POCSO e-Box on ncpcr.gov.in · cybercrime.gov.in or 1930 for anything online.' },
        { t: 'Protect their identity', b: 'Never share the child\'s name, photo or school. Disclosing it is itself an offence (POCSO Section 23).' },
        { t: 'After', b: 'Keep routines normal. Let the child lead: talking or distraction are both fine. Get counselling for the child and for yourself. Your steady belief is the biggest factor in recovery.' },
      ] },
    ],
    sayTitle: 'Say it like this (learn these three)',
    say: ['"Thank you for telling me. That was very brave."', '"This is not your fault. Not even a little bit."', '"I\'m going to tell people whose job is to keep children safe, so we can make this stop."'],
    doIt: 'Save **1098** in your phone right now. Thirty seconds.',
    checks: [
      { q: 'Your child starts telling you something awful. Your first move?', a: 'Stay calm, listen, believe. Your reaction in this moment matters more than anything else.' },
      { q: 'You suspect, but have no proof. Do you report?', a: 'Yes. Reasonable suspicion is the legal threshold. Proof is the system\'s job, not yours.' },
    ],
  },
  {
    id: 'p8', track: 'parent', title: 'Capstone: your family safety plan', minutes: 10,
    hook: { kind: 'statement', text: 'Knowledge fades. **A plan on the fridge doesn\'t.** Leave this track with one page your whole family can follow.' },
    learn: [{ type: 'p', text: 'Fill in the plan below. It stays on this device only, is never sent anywhere, and you can clear it at any time. Then print it.' }],
    builder: 'plan',
    doIt: 'Print it. Put it on the fridge. Revisit it every 6 months, or whenever your child changes school, starts a new activity or gets a new device.',
    checks: [],
  },

  // ─────────────────────────── KID ───────────────────────────
  {
    id: 'k1', track: 'kid', title: 'Your body belongs to you', minutes: 4,
    hook: { kind: 'plain', text: 'You are the **boss of your body**. Hugs, kisses, tickles: you decide, every time.' },
    learn: [
      { type: 'p', text: 'The parts of your body covered by your underwear are called **private parts**. They\'re private: nobody should see them or touch them, and you shouldn\'t see or touch anyone else\'s. (If a doctor checks, or Amma or Appa help you wash, they explain why and ask first. That\'s okay.)' },
      { type: 'p', text: '**Unsafe touch is never okay.** Touching private parts, or ANY touch that makes you feel yucky, scared, confused or weird in your tummy, even if it\'s someone you know and love, even if they smile. Your feelings are the alarm. Trust them.' },
    ],
    game: { kind: 'pairs', prompt: 'Safe or unsafe? Tap one.', a: 'Safe 👍', b: 'Unsafe ✋', cards: [
      { text: 'A hug from Paati that you wanted', answer: 'a', fb: 'Safe. You wanted it, and it felt good.' },
      { text: 'Someone touches your private parts and says it\'s a game', answer: 'b', fb: 'Unsafe. Say NO, get away, and tell a grown-up.' },
      { text: 'A high-five from your coach', answer: 'a', fb: 'Safe. Friendly and out in the open.' },
      { text: 'Tickling that keeps going after you say stop', answer: 'b', fb: 'Unsafe. Your "stop" should be listened to. Tell a grown-up.' },
    ] },
    doIt: 'Practise saying **"NO!"** in your biggest, loudest voice, together with your parent. (Fun, not scary.)',
    checks: [{ q: 'Someone you know touches your private parts and smiles. It\'s okay because they\'re nice, right?', a: 'No. Nice people can break rules too. Say NO, get away, and tell a grown-up.' }],
  },
  {
    id: 'k2', track: 'kid', title: 'Secrets vs surprises', minutes: 3,
    hook: { kind: 'plain', text: 'Some secrets are fun. Some secrets feel awful. **Can you tell which is which?**' },
    learn: [
      { type: 'list', items: [
        'A **surprise** (a birthday present, a party plan) makes everyone happy when it\'s found out.',
        'A **bad secret** makes you feel sad, scared or weird in your tummy. Anyone who says "don\'t tell anyone" about something that feels bad is breaking the rule, not you.',
        '**Bad secrets must ALWAYS be told.** Telling a bad secret never gets you in trouble.',
      ] },
    ],
    game: { kind: 'sort', prompt: 'Surprise, or tell a grown-up?', a: 'Surprise 🎁', b: 'Tell a grown-up 📢', cards: [
      { text: '"We\'re getting Appa a cake. Shh!"', answer: 'a', fb: 'A surprise! Everyone will be happy when it\'s found out.' },
      { text: '"Don\'t tell anyone I touched you there."', answer: 'b', fb: 'Tell a grown-up right away. That\'s a bad secret.' },
      { text: '"Let\'s hide Akka\'s present till her birthday."', answer: 'a', fb: 'A surprise. It ends happily.' },
      { text: '"If you tell your parents, you\'ll be in big trouble."', answer: 'b', fb: 'Tell a grown-up. The "trouble" part is not true.' },
    ] },
    doIt: 'Tell your parent one surprise you\'re keeping. A fun one!',
    checks: [{ q: 'Someone says, "This is our secret. Don\'t tell your parents or you\'ll be in big trouble." You…', a: 'Tell a grown-up right away. That\'s a bad secret, and the "trouble" part is a lie.' }],
  },
  {
    id: 'k3', track: 'kid', title: 'No · Go · Tell + your trusted grown-ups', minutes: 4,
    hook: { kind: 'plain', text: 'Three magic steps: **NO · GO · TELL.**' },
    learn: [
      { type: 'rules', items: [
        { t: 'NO!', b: 'Say it in a big, loud voice.' },
        { t: 'GO!', b: 'Get away from that person as fast as you can.' },
        { t: 'TELL!', b: 'Tell a trusted grown-up what happened.' },
      ] },
      { type: 'p', text: 'If the first person doesn\'t listen or doesn\'t help, tell the next one. **Keep telling until someone helps you.**' },
      { type: 'p', text: '**It is NEVER your fault.** Not if they gave you gifts. Not if you didn\'t shout. Not ever. Grown-ups who break these rules are the ones doing wrong.' },
    ],
    builder: 'trusted',
    doIt: 'Fill in the list with your parent, print it, and stick it where you can see it.',
    checks: [{ q: 'You told one grown-up and they said "don\'t make up stories." What now?', a: 'Tell the next grown-up on your list. Keep telling until someone helps.' }],
  },

  // ─────────────────────────── TEEN ───────────────────────────
  {
    id: 't1', track: 'teen', title: 'Consent and pressure', minutes: 5,
    hook: { kind: 'scenario', text: '"If you loved me, you would." You\'ve heard it in films. **Here\'s what it actually is.**' },
    learn: [
      { type: 'list', items: [
        '**Only a clear, enthusiastic yes is yes.** Silence isn\'t yes. Freezing isn\'t yes. "Fine, whatever" isn\'t yes. And you can change your mind at any time, even halfway.',
        '**Know manipulation when you see it:** gifts with strings attached · "if you loved me" · threats ("I\'ll tell everyone") · cutting you off from friends · someone much older who "understands you like no one else". None of this is love. It\'s control.',
        'Pressure doesn\'t always shout. Sometimes it guilt-trips, sulks, or keeps "joking" until you give in. That\'s still pressure.',
      ] },
    ],
    sayTitle: 'Lines you can use',
    say: ['"I said no."', '"I\'m leaving."', '"If you keep pushing, I\'m done talking."'],
    doIt: 'Send this module to one friend. (Seriously: the friend who needs it won\'t ask for it.)',
    share: true,
    checks: [{ q: 'They said yes at first, then went quiet and froze. Consent?', a: 'No. Freezing isn\'t yes. Check in, and stop if there\'s no real yes.' }],
  },
  {
    id: 't2', track: 'teen', title: 'Online safety', minutes: 5,
    hook: { kind: 'statement', text: '**Anyone can pretend to be anyone online.** That "17-year-old friend" can be a 40-year-old stranger.' },
    learn: [
      { type: 'list', items: [
        '**Never share intimate photos or videos of yourself with anyone**: not a boyfriend, not a girlfriend, not a best friend. Once sent, you lose control of them forever.',
        '**Grooming signs online:** someone older befriends you fast · lots of attention · asks for photos · wants to move to private chats · says "don\'t tell anyone about us".',
        'Under Indian law (POCSO), any sexual activity with someone under 18 is a crime, even over messages, even if someone calls it "consensual". The law is on your side.',
      ] },
      { type: 'steps', items: [
        { t: 'Don\'t send more', b: 'Whatever they threaten.' },
        { t: 'Don\'t pay', b: 'Paying usually leads to more demands.' },
        { t: 'Save the evidence', b: 'Screenshots of chats, profile and any payment requests. Then block.' },
        { t: 'Tell a trusted adult', b: 'Straight away. You will not get in trouble for asking for help.' },
        { t: 'Report', b: 'cybercrime.gov.in or 1930 · POCSO e-Box on ncpcr.gov.in · Childline 1098 · police.' },
      ] },
    ],
    doIt: 'Check the privacy settings on one app you use every day. Two minutes.',
    checks: [{ q: 'An online friend you\'ve never met asks for a photo and says "don\'t tell anyone." You…', a: 'Stop. Screenshot. Block. Tell a trusted adult. Every step matters.' }],
  },
  {
    id: 't3', track: 'teen', title: 'If it happened to you', minutes: 4,
    hook: { kind: 'plain', text: 'It was **not your fault.** Read that again. **Not your fault.**' },
    learn: [
      { type: 'list', items: [
        'Not if you didn\'t say no loudly enough. Not if you went along at first. Not if they gave you things. Not ever.',
        '**Tell someone you trust**: a parent, teacher, school counsellor, relative, a friend\'s parent. If they don\'t act, tell someone else.',
        '**You can call Childline 1098 yourself.** It\'s free, it\'s 24×7, and it\'s for exactly this.',
        'Healing is real and help exists. You have a whole life ahead of you.',
      ] },
      { type: 'callout', title: 'Be the friend someone can tell', items: ['Believe them', 'Don\'t spread it around', 'Help them tell a trusted adult. Don\'t try to handle it alone: adults need to be involved so your friend stays safe.'] },
    ],
    doIt: 'Save **1098** in your phone. Right now.',
    checks: [{ q: 'Your friend tells you something happened to them and begs you not to tell anyone. You…', a: 'You don\'t spread it, but you don\'t keep it either. Help them tell a trusted adult, together. Keeping it secret keeps them unsafe.' }],
  },
];

export const byTrack = (t: Track) => MODULES.filter((m) => m.track === t);
export const trackMinutes = (t: Track) => byTrack(t).reduce((s, m) => s + m.minutes, 0);

export const PLAN_DEFAULT_RULES = [
  'Privates are private.',
  'Your body belongs to you.',
  'No means no, even with family.',
  'Bad secrets always get told.',
  'Keep telling until someone helps. It is never your fault.',
];
export const PLAN_ONLINE = [
  'Devices charge overnight in the living room.',
  'No photos of ourselves to anyone online.',
  'If anyone asks us to keep a secret online, we tell a parent straight away.',
];
export const PLAN_PROMISE = 'If anything feels wrong, tell. You will never get in trouble for telling. We will believe you.';

/** **bold** → <strong>, everything else escaped. */
export function rich(s: string) {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// ── Language selection ───────────────────────────────────────────────────────
import { MODULES_TA, TRACKS_TA, PLAN_DEFAULT_RULES_TA, PLAN_ONLINE_TA, PLAN_PROMISE_TA } from './learn.ta';
export type L = 'en' | 'ta';
export const modulesFor = (l: L) => (l === 'ta' ? MODULES_TA : MODULES);
export const tracksFor = (l: L) => (l === 'ta' ? TRACKS_TA : TRACKS);
export const byTrackL = (l: L, t: Track) => modulesFor(l).filter((m) => m.track === t);
export const trackMinutesL = (l: L, t: Track) => byTrackL(l, t).reduce((s, m) => s + m.minutes, 0);
export const planFor = (l: L) => (l === 'ta'
  ? { rules: PLAN_DEFAULT_RULES_TA, online: PLAN_ONLINE_TA, promise: PLAN_PROMISE_TA }
  : { rules: PLAN_DEFAULT_RULES, online: PLAN_ONLINE, promise: PLAN_PROMISE });

// The Tamil set must mirror the English one (same ids, tracks, order), or the build fails.
{
  const a = MODULES.map((m) => `${m.id}:${m.track}:${m.builder ?? ''}:${m.game?.cards.length ?? 0}`).join();
  const b = MODULES_TA.map((m) => `${m.id}:${m.track}:${m.builder ?? ''}:${m.game?.cards.length ?? 0}`).join();
  if (a !== b) throw new Error('learn.ta.ts is out of step with learn.ts');
}

const UI_EN = {
  learn: 'Learn', draft: 'DRAFT · pending expert review',
  h1: 'Small lessons. Real words. One action each.',
  lead: 'Pick where you are starting from. Each module takes a few minutes, and your progress is saved only on this device. No account, no tracking.',
  modules: 'modules', min: 'min', start: 'Start →',
  beatsH: 'Every module works the same way',
  beats: [['Hook', 'One number or one real-life moment.'], ['Learn', 'A 3-minute read. One idea, plain words.'], ['Say it', 'The exact words to use.'], ['Do it', 'One small action this week.'], ['Check', 'A few scenarios. Never scored.']],
  note: "Built on NSPCC Talk PANTS, Darkness to Light's five steps, Arpan's personal-safety work, Stop It Now, Kidpower and WHO INSPIRE. Educational information, not professional advice. Pending expert review before launch.",
  prefer: 'Prefer everything on one page?', guideLink: 'Read the one-page guide',
  moduleOf: (i: number, n: number) => `Module ${i} of ${n}`,
  withParent: 'Best done together: a parent reads, the child answers and taps.',
  planNote: 'Build a printable one-page plan',
  startFirst: 'Start with module 1 →', otherTracks: 'Other tracks',
  hook: { kpi: 'The number', statement: 'Remember this', scenario: 'Picture this', plain: '' },
  ofHundred: 'of 100', meaning: 'Meaning:', action: 'Action:',
  kpiSrc: (y: number, a: string, b: string) => `NCRB, Crime in India ${y} · POCSO Sec 4 & 6 · ${a} of ${b} · Tier 1`,
  learnH: 'Learn', buildH: 'Build', tryIt: 'Try it', ages: 'Ages', ageBand: 'Age band',
  say: 'Say it like this', doIt: 'Do it this week', check: 'Check yourself', checkHint: 'Think about it, then tap to see. Nothing is scored.',
  markDone: 'Mark this module done', done: '✓ Done. Nice work.', next: 'Next:', all: 'All modules', back: 'Back to Learn',
  ok: '✓ ', again: 'Look again: ',
  whatsapp: 'Send on WhatsApp', shareBtn: 'Share…',
  trustedH: 'My trusted grown-ups', trustedHint: "Fill in three names with your parent. Include one person outside the family, like a teacher or a friend's parent.",
  name: 'Name', outside: 'Someone outside the family', phone: 'Phone',
  cardRules: 'NO · GO · TELL. Keep telling until someone helps. It is never my fault.',
  cardNums: 'Childline <strong>1098</strong> · Emergency <strong>112</strong>',
  savedDevice: 'Saved only on this device.', savedNever: 'Saved only on this device. Never sent anywhere.',
  printCard: 'Print my card', printPlan: 'Print our plan', clear: 'Clear',
  planH: 'Your family safety plan', planPrint: 'Our family safety plan',
  legends: ['1 · Our 5 rules, in our words', '2 · Our trusted adults', '3 · Our online rules', '4 · Our promise', '5 · Emergency numbers'],
  trustedAdultsHint: '3–5 people, including at least one outside the family.',
  addOwn: 'Add your own rule', trustedAria: (i: number) => `Trusted adult ${i}`,
  nums: '<strong>1098</strong> Childline (24×7) · <strong>112</strong> Police / emergency · <strong>1930</strong> Cyber crime · POCSO e-Box: ncpcr.gov.in',
  revisit: 'Revisit every 6 months, or when something changes: a new school, activity or device. · notstrangers.org',
  doneMsg: "When it's on the fridge: your family has a plan. That's prevention.",
};
type UI = typeof UI_EN;
const UI_TA: UI = {
  learn: 'கற்க', draft: 'வரைவு · நிபுணர் சரிபார்ப்பு நிலுவையில்',
  h1: 'சிறிய பாடங்கள். உண்மையான வார்த்தைகள். ஒவ்வொன்றுக்கும் ஒரு செயல்.',
  lead: 'நீங்கள் எங்கிருந்து தொடங்குகிறீர்கள் என்று தேர்ந்தெடுங்கள். ஒவ்வொரு பாடமும் சில நிமிடங்களே. உங்கள் முன்னேற்றம் இந்தச் சாதனத்தில் மட்டுமே சேமிக்கப்படும். கணக்கு இல்லை, கண்காணிப்பு இல்லை.',
  modules: 'பாடங்கள்', min: 'நிமி', start: 'தொடங்கு →',
  beatsH: 'ஒவ்வொரு பாடமும் ஒரே மாதிரி',
  beats: [['தொடக்கம்', 'ஒரு எண் அல்லது ஒரு நிஜ வாழ்க்கைத் தருணம்.'], ['கற்க', '3 நிமிட வாசிப்பு. ஒரு கருத்து, எளிய வார்த்தைகள்.'], ['சொல்லுங்கள்', 'பயன்படுத்த வேண்டிய சரியான வார்த்தைகள்.'], ['செய்யுங்கள்', 'இந்த வாரம் ஒரு சிறிய செயல்.'], ['சரிபார்', 'சில சூழ்நிலைகள். மதிப்பெண் இல்லை.']],
  note: 'NSPCC Talk PANTS, Darkness to Light-இன் ஐந்து படிகள், Arpan-இன் தனிப்பட்ட பாதுகாப்புப் பணி, Stop It Now, Kidpower, WHO INSPIRE ஆகியவற்றின் அடிப்படையில். இது கல்வித் தகவல், தொழில்முறை ஆலோசனை அல்ல. வெளியீட்டுக்கு முன் நிபுணர் சரிபார்ப்பு நிலுவையில்.',
  prefer: 'எல்லாவற்றையும் ஒரே பக்கத்தில் பார்க்க வேண்டுமா?', guideLink: 'ஒரு பக்க வழிகாட்டியைப் படியுங்கள்',
  moduleOf: (i, n) => `பாடம் ${i} / ${n}`,
  withParent: 'சேர்ந்து செய்வது சிறந்தது: பெற்றோர் படிக்க, குழந்தை பதில் சொல்லித் தொடட்டும்.',
  planNote: 'அச்சிடக்கூடிய ஒரு பக்கத் திட்டத்தை உருவாக்குங்கள்',
  startFirst: 'பாடம் 1-இலிருந்து தொடங்குங்கள் →', otherTracks: 'மற்ற பாதைகள்',
  hook: { kpi: 'எண்', statement: 'நினைவில் கொள்ளுங்கள்', scenario: 'கற்பனை செய்யுங்கள்', plain: '' },
  ofHundred: '/ 100', meaning: 'பொருள்:', action: 'செயல்:',
  kpiSrc: (y, a, b) => `NCRB, இந்தியாவில் குற்றங்கள் ${y} · போக்சோ பிரிவு 4 & 6 · ${b}-இல் ${a} · அடுக்கு 1`,
  learnH: 'கற்க', buildH: 'உருவாக்கு', tryIt: 'முயன்று பார்', ages: 'வயது', ageBand: 'வயதுப் பிரிவு',
  say: 'இப்படிச் சொல்லுங்கள்', doIt: 'இந்த வாரம் செய்யுங்கள்', check: 'உங்களைச் சரிபாருங்கள்', checkHint: 'யோசித்துவிட்டு, பார்க்கத் தொடுங்கள். மதிப்பெண் இல்லை.',
  markDone: 'இந்தப் பாடம் முடிந்தது எனக் குறி', done: '✓ முடிந்தது. அருமை.', next: 'அடுத்து:', all: 'எல்லாப் பாடங்களும்', back: 'கற்க பக்கத்துக்குத் திரும்பு',
  ok: '✓ ', again: 'மீண்டும் பார்: ',
  whatsapp: 'வாட்ஸ்அப்பில் அனுப்பு', shareBtn: 'பகிர்…',
  trustedH: 'என் நம்பிக்கைக்குரிய பெரியவர்கள்', trustedHint: 'உன் பெற்றோருடன் மூன்று பெயர்களை நிரப்பு. குடும்பத்துக்கு வெளியே ஒருவரைச் சேர்: ஆசிரியர் அல்லது நண்பரின் பெற்றோர் போல.',
  name: 'பெயர்', outside: 'குடும்பத்துக்கு வெளியே ஒருவர்', phone: 'தொலைபேசி',
  cardRules: 'வேண்டாம் · ஓடு · சொல். யாராவது உதவும் வரை சொல்லிக்கொண்டே இரு. அது ஒருபோதும் என் தவறு அல்ல.',
  cardNums: 'சைல்டுலைன் <strong>1098</strong> · அவசரம் <strong>112</strong>',
  savedDevice: 'இந்தச் சாதனத்தில் மட்டுமே சேமிக்கப்படும்.', savedNever: 'இந்தச் சாதனத்தில் மட்டுமே சேமிக்கப்படும். எங்கும் அனுப்பப்படாது.',
  printCard: 'என் அட்டையை அச்சிடு', printPlan: 'எங்கள் திட்டத்தை அச்சிடு', clear: 'அழி',
  planH: 'உங்கள் குடும்பப் பாதுகாப்புத் திட்டம்', planPrint: 'எங்கள் குடும்பப் பாதுகாப்புத் திட்டம்',
  legends: ['1 · எங்கள் 5 விதிகள், எங்கள் வார்த்தைகளில்', '2 · எங்கள் நம்பிக்கைக்குரிய பெரியவர்கள்', '3 · எங்கள் இணைய விதிகள்', '4 · எங்கள் வாக்குறுதி', '5 · அவசர எண்கள்'],
  trustedAdultsHint: '3–5 பேர், குடும்பத்துக்கு வெளியே குறைந்தது ஒருவர் உட்பட.',
  addOwn: 'உங்கள் சொந்த விதியைச் சேருங்கள்', trustedAria: (i) => `நம்பிக்கைக்குரிய பெரியவர் ${i}`,
  nums: '<strong>1098</strong> சைல்டுலைன் (24×7) · <strong>112</strong> காவல் / அவசரம் · <strong>1930</strong> சைபர் குற்றம் · POCSO e-Box: ncpcr.gov.in',
  revisit: '6 மாதங்களுக்கு ஒருமுறை, அல்லது ஏதாவது மாறும்போது மீண்டும் பாருங்கள்: புதிய பள்ளி, செயல்பாடு அல்லது கைபேசி. · notstrangers.org',
  doneMsg: 'ஃப்ரிட்ஜில் ஒட்டியதும்: உங்கள் குடும்பத்துக்கு ஒரு திட்டம் இருக்கிறது. அதுதான் தடுப்பு.',
};
export const uiFor = (l: L): UI => (l === 'ta' ? UI_TA : UI_EN);

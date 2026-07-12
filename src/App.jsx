import React, { useState, useMemo, useRef } from "react";
import {
  Footprints, Dumbbell, Droplet, Wine, Moon, Battery, Calendar as CalIcon,
  ChevronLeft, ChevronRight, Check, Download, Upload, Copy, Settings as SettingsIcon,
  Home, ClipboardList, UtensilsCrossed, TrendingUp, Menu, X, Leaf, Sparkles, Sun
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  DATA                                                                   */
/* ---------------------------------------------------------------------- */

const PHASES = [
  { id: 1, range: [1, 7], title: "Establish the Floor", stepGoal: 8000,
    points: [
      "Average 8,000 steps",
      "Three full strength workouts",
      "One optional minimum or mobility workout",
      "Learn the movements",
      "Protein target most days",
      "Track normal alcohol without changing everything at once",
      "Record starting weight, waist, and photos",
    ] },
  { id: 2, range: [8, 21], title: "Build Consistency", stepGoal: 8500,
    points: [
      "Average 8,500 steps",
      "Three full strength workouts",
      "Optional fourth workout or minimum circuit",
      "Gradually increase kettlebell load or reps",
      "Maintain protein",
      "Practice planning social drinking rather than reacting afterward",
    ] },
  { id: 3, range: [22, 35], title: "Progress", stepGoal: 9000,
    points: [
      "Average 9,000 steps",
      "Three to four strength workouts",
      "Add a round, load, or reps when form is strong",
      "Review weight trend and measurements",
      "Only one adjustment at a time if stalled 2+ weeks",
    ] },
  { id: 4, range: [36, 50], title: "Bali Finish", stepGoal: 9500,
    points: [
      "Average 9,500 steps",
      "Three to four strength workouts",
      "Prioritize sleep and consistency",
      "Avoid crash dieting",
      "Keep sodium and hydration reasonably consistent",
      "Final week reduces chaos, not carbohydrates",
      "No dehydration tactics, laxatives, or extreme restriction",
      "Complete final measurements and photos",
    ] },
];

function getPhaseForDay(day) {
  return PHASES.find(p => day >= p.range[0] && day <= p.range[1]) || PHASES[PHASES.length - 1];
}
function getBaseStepGoal(day) {
  return getPhaseForDay(day).stepGoal;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_SCHEDULE = {
  Monday: "A", Tuesday: "B", Wednesday: "walk", Thursday: "C",
  Friday: "minimum", Saturday: "flex", Sunday: "rest",
};
const WORKOUT_LABELS = {
  A: "Workout A — Lower Body + Glutes", B: "Workout B — Upper Body + Core",
  C: "Workout C — Full Body", minimum: "Busy AF Circuit (8–12 min)",
  walk: "Walk / Recovery", flex: "Flexible strength or active day", rest: "Rest day",
};

const WARMUP = {
  title: "Warm-Up", duration: "~3 minutes",
  note: "Warm muscles should feel prepared, not exhausted.",
  exercises: [
    { name: "March in place", sets: 1, reps: "30 seconds" },
    { name: "Bodyweight good mornings", sets: 1, reps: "10 reps" },
    { name: "Bodyweight squats", sets: 1, reps: "8 reps, comfortable depth" },
    { name: "Arm circles", sets: 1, reps: "10 each direction" },
    { name: "Glute bridges", sets: 1, reps: "10 reps" },
  ],
};

const WORKOUTS = {
  A: {
    key: "A", title: "Workout A", subtitle: "Lower Body + Glutes", duration: "20–25 min",
    exercises: [
      { name: "Goblet Squat", sets: 3, reps: "8–12",
        cues: ["Hold one kettlebell close to the chest", "Feet about shoulder-width apart", "Sit down between the hips", "Keep the whole foot grounded", "Stand by pushing the floor away"],
        mistakes: ["Heels lifting", "Knees collapsing inward", "Bell drifting away from the body"],
        easier: "Squat to a chair", harder: "Heavier kettlebell or slower lowering" },
      { name: "Kettlebell Romanian Deadlift", sets: 3, reps: "10–12",
        cues: ["Hold the bell with both hands in front of the thighs", "Knees softly bent", "Push hips backward (this is a hip hinge, not a squat)", "Keep the back long, ribs controlled", "Stop when hamstrings feel tension, squeeze glutes to stand"],
        mistakes: ["Rounding the back", "Bending deeply through the knees", "Letting the bell travel far from the legs"],
        easier: "Reduce range of motion", harder: "Heavier bell, slower tempo" },
      { name: "Reverse Lunge", sets: 3, reps: "6–8 per leg",
        cues: ["Step backward and lower under control", "Most pressure through the front foot", "Use a wall or chair for balance if needed"],
        mistakes: ["Knee caving inward", "Rushing the step"],
        easier: "Supported split squat holding a chair", harder: "Hold one kettlebell at the chest" },
      { name: "Glute Bridge", sets: 3, reps: "12–15",
        cues: ["Feet flat, about hip-width", "Exhale and gently brace", "Push through feet and squeeze glutes", "Don't overarch the low back"],
        mistakes: ["Overarching the back", "Feet too far from hips"],
        easier: "Bodyweight only", harder: "Kettlebell across hips, padded" },
      { name: "Dead Bug", sets: 2, reps: "6–10 per side",
        cues: ["Low back gently connected to the floor", "Extend opposite arm and leg only as far as control allows"],
        mistakes: ["Low back arching off the floor"],
        easier: "Smaller range of motion", harder: "Slower tempo, longer hold" },
    ],
  },
  B: {
    key: "B", title: "Workout B", subtitle: "Upper Body + Core", duration: "20–25 min",
    exercises: [
      { name: "One-Arm Supported Row", sets: 3, reps: "8–12 per side",
        cues: ["Support the free hand on a chair or stable surface", "Hinge at the hips", "Pull elbow toward the back pocket", "Avoid twisting the torso"],
        mistakes: ["Twisting to finish the pull", "Rounding the low back"],
        easier: "Use both hands to guide the 15 lb bell or shorten the range", harder: "Pause at the top and lower slowly" },
      { name: "Half-Kneeling / Standing One-Arm Overhead Press", sets: 3, reps: "6–10 per side",
        cues: ["Begin with kettlebell at shoulder", "Brace the abdomen, squeeze glutes", "Press overhead without leaning backward"],
        mistakes: ["Leaning back to press", "Shrugging instead of pressing"],
        easier: "If 15 lb is too heavy, do an incline push-up against a counter or a two-hand floor press", harder: "Half-kneeling press only when 15 lb feels controlled" },
      { name: "Kettlebell Floor Press", sets: 3, reps: "8–12 per side",
        cues: ["Lie on back, knees bent", "Hold one kettlebell securely", "Lower upper arm until it gently contacts the floor", "Press up with wrist stacked over elbow"],
        mistakes: ["Letting the kettlebell pull the wrist backward"],
        easier: "Hold the 15 lb bell with both hands by the horns for a two-hand floor press", harder: "Single-arm press with slow lowering" },
      { name: "Suitcase Carry", sets: 3, reps: "30–45 seconds per side",
        cues: ["Hold one kettlebell beside the body", "Stand tall without leaning", "Walk slowly, controlled breathing"],
        mistakes: ["Leaning away from the weight"],
        easier: "Shorter distance/time", harder: "Heavier bell" },
      { name: "Side Plank", sets: 2, reps: "15–30 seconds per side",
        cues: ["Stack shoulder over elbow", "Keep hips lifted and in line"],
        mistakes: ["Hips sagging"],
        easier: "Bottom knee on the floor", harder: "Full side plank" },
    ],
  },
  C: {
    key: "C", title: "Workout C", subtitle: "Full Body — 3 rounds, 45–75s rest between rounds", duration: "20–30 min",
    exercises: [
      { name: "Kettlebell Deadlift", sets: 3, reps: "10–12", cues: ["Hinge at the hips, flat back"], mistakes: ["Rounding the back"], easier: "Shorter range", harder: "Heavier bell" },
      { name: "Goblet Squat", sets: 3, reps: "8–10", cues: ["Sit down between the hips"], mistakes: ["Heels lifting"], easier: "Squat to a chair", harder: "Heavier bell" },
      { name: "One-Arm Row", sets: 3, reps: "8 per side", cues: ["Hinge at hips, pull to back pocket"], mistakes: ["Twisting the torso"], easier: "Use both hands to guide the 15 lb bell or shorten the range", harder: "Pause at the top and lower slowly" },
      { name: "Floor Press or Overhead Press", sets: 3, reps: "8 per side", cues: ["Wrist stacked over elbow"], mistakes: ["Flaring the wrist"], easier: "Two-hand floor press or incline push-up", harder: "Standing overhead press only with clean form" },
      { name: "Reverse Lunge or Supported Split Squat", sets: 3, reps: "6 per side", cues: ["Control the lowering phase"], mistakes: ["Knee caving in"], easier: "Supported split squat", harder: "Hold kettlebell at chest" },
      { name: "Farmer Carry", sets: 3, reps: "30–45 seconds", cues: ["Stand tall, shoulders down"], mistakes: ["Leaning to one side"], easier: "Shorter carry", harder: "Longer carry or slower steps" },
      { name: "Plank", sets: 3, reps: "20–30 seconds", cues: ["Straight line from head to heels"], mistakes: ["Hips sagging or piking"], easier: "Knees down", harder: "Longer hold" },
    ],
    learnLater: { name: "Kettlebell Swing", note: "Not included in Version 1 — technical coaching recommended before adding speed or heavy weight. Consider one in-person or video-coached session before trying this on your own." },
  },
  minimum: {
    key: "minimum", title: "Busy AF Circuit", subtitle: "2 rounds — that's it", duration: "8–12 min",
    exercises: [
      { name: "Goblet Squat or Chair Squat", sets: 2, reps: "10" },
      { name: "Kettlebell Romanian Deadlift", sets: 2, reps: "10" },
      { name: "Supported Row", sets: 2, reps: "8 per side" },
      { name: "Glute Bridge", sets: 2, reps: "10" },
      { name: "Plank or Dead Bug", sets: 2, reps: "20 seconds" },
    ],
    footer: "Two rounds and you are done. Additional work is optional.",
  },
};

const SAFETY_NOTE = "Muscle effort and mild fatigue are expected. Sharp, sudden, radiating, or joint pain is not — stop that exercise, modify range or load, or check in with a qualified professional. This is general fitness guidance, not medical care.";

const MEAL_OPTIONS = {
  protein: ["Chicken", "Turkey", "Lean beef", "Steak", "Fish", "Shrimp", "Eggs", "Greek yogurt", "Cottage cheese", "Protein shake"],
  carb: ["Rice", "Potatoes", "Bread", "Tortilla", "Fruit", "Pasta"],
  produce: ["Tomatoes", "Arugula", "Carrots", "Onions", "Kimchi", "Berries", "Other fruit", "Another vegetable"],
  flavor: ["Olive oil", "Avocado", "Cheese", "Sauce", "Dressing", "Butter"],
};

const SAMPLE_MEALS = {
  Breakfast: ["Greek yogurt and berries", "Eggs with fruit", "Eggs with potatoes and tomatoes", "Protein shake plus fruit"],
  "Lunch or dinner": ["Chicken, rice, kimchi, and tomatoes", "Steak, potatoes, and arugula", "Burger with a side salad or fries", "Chicken wrap with tomatoes and onions", "Salmon or shrimp with rice", "Greek-style plate with meat, tomatoes, onions, and pita", "Leftover protein with potatoes and arugula"],
  Snacks: ["Greek yogurt", "Cottage cheese", "Fruit", "Jerky", "Cheese stick", "Protein shake", "Hard-boiled eggs"],
};

const ALCOHOL_TYPES = [
  { key: "Gin and soda", cals: "~100–150" },
  { key: "Martini", cals: "~150–250+" },
  { key: "Wine", cals: "~120–170" },
  { key: "Beer", cals: "~150–200" },
  { key: "Fun cocktail", cals: "~180–350+" },
  { key: "Other", cals: "varies" },
];

const NIGHT_OUT_PROMPTS = [
  "Eat a protein-forward meal beforehand",
  "Alternate with water",
  "Decide the number of drinks before starting",
  "Resume the normal plan at the next meal",
  "Avoid turning one social evening into an abandoned weekend",
];

const QUOTES = [
  "Show up, not show off.", "The minimum version counts.", "No spiral. Reset at the next choice.",
  "A social life and progress can coexist.", "Stack the boring wins.", "One weigh-in is data, not a verdict.",
  "You do not need a perfect week.", "Protein, steps, strength, repeat.",
  "Bali is the deadline. The habits are the point.", "Locked in, not locked away.",
];

const BLOAT_LABELS = ["", "Very low", "Low", "Moderate", "High", "Very high"];
const BLOAT_NOTE_OPTIONS = ["Menstrual cycle", "Restaurant meal", "High sodium", "Alcohol", "Constipation", "Poor sleep", "Travel", "Unknown"];

/* ---------------------------------------------------------------------- */
/*  HELPERS                                                                */
/* ---------------------------------------------------------------------- */

function isoDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function addDays(dateStr, n) { const d = new Date(dateStr + "T00:00:00"); d.setDate(d.getDate() + n); return d; }
function dayToDate(startDate, day) { return addDays(startDate, day - 1); }
function fmtDate(d) { return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function round1(n) { return Math.round(n * 10) / 10; }
function challengeDayForDate(startDate, date = new Date()) {
  const start = new Date(startDate + "T00:00:00");
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return clamp(Math.floor((today - start) / 86400000) + 1, 1, 50);
}
function defaultDayLog() {
  return {
    steps: "", workout: null, protein: "", water: "", fruit: false, veg: false,
    alcohol: { count: 0, type: "Gin and soda", notes: "" },
    bloating: null, bloatingNote: "", energy: null, sleep: "", calories: "",
    busyAF: false, logged: false, workoutSets: {}, workoutWeights: {},
  };
}

function computeStepGoal(day, busyAF, override) {
  if (busyAF) return 6000;
  if (override) return override;
  return getBaseStepGoal(day);
}

function computeScore(log, day, waterUnit = "oz", stepOverride = null, plannedWorkout = null) {
  const parsedOverride = Number(stepOverride) || null;
  const stepGoal = computeStepGoal(day, log.busyAF, parsedOverride);
  const stepsVal = Number(log.steps) || 0;
  const stepScore = clamp(stepsVal / stepGoal, 0, 1) * 25;

  let workoutScore = 0;
  const plannedRecovery = ["rest", "walk", "flex"].includes(plannedWorkout);
  if (log.workout === "full") workoutScore = 25;
  else if (log.workout === "minimum") workoutScore = 20;
  else if (log.workout === "walk") workoutScore = plannedRecovery ? 25 : 15;
  else if (log.workout === "rest") workoutScore = plannedWorkout === "rest" ? 25 : 10;
  else workoutScore = 0;

  const proteinTarget = log.busyAF ? 100 : 110;
  const proteinVal = Number(log.protein) || 0;
  const proteinScore = clamp(proteinVal / proteinTarget, 0, 1) * 20;

  const waterTarget = waterUnit === "l"
    ? (log.busyAF ? 2 : 2.5)
    : (log.busyAF ? 68 : 84);
  const waterVal = Number(log.water) || 0;
  const waterScore = clamp(waterVal / waterTarget, 0, 1) * 10;

  let produceScore = 0;
  if (log.busyAF) produceScore = (log.fruit || log.veg) ? 10 : 0;
  else produceScore = ((log.fruit ? 1 : 0) + (log.veg ? 1 : 0)) / 2 * 10;

  const loggedScore = log.logged ? 10 : 0;

  return Math.round(stepScore + workoutScore + proteinScore + waterScore + produceScore + loggedScore);
}

function scoreFeedback(score) {
  if (score >= 85) return "Locked in 🌴";
  if (score >= 65) return "Solid day. Keep stacking.";
  if (score >= 40) return "Still counts. Pick one easy win.";
  return "No spiral. Reset at the next choice.";
}

function litersToOz(l) { return l * 33.814; }

function uid() { return Math.random().toString(36).slice(2, 10); }

/* ---------------------------------------------------------------------- */
/*  STYLE                                                                  */
/* ---------------------------------------------------------------------- */

const Style = () => (
  <style>{`
    .bp-root { --jungle:#1F3D2E; --jungle-dark:#152A20; --sand:#D9C5A0; --cream:#FBF6EE; --coral:#E8836F;
      --terracotta:#B5622F; --turquoise:#3FA9A0; --ink:#20302A; --line:#E4DBC8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--cream); color: var(--ink);
      max-width: 480px; margin: 0 auto; min-height: 100vh; position: relative; padding-bottom: 84px;
      -webkit-font-smoothing: antialiased; }
    .bp-root * { box-sizing: border-box; }
    .bp-display { font-family: Georgia, 'Times New Roman', serif; }
    .bp-header { background: var(--jungle); color: var(--cream); padding: 22px 20px 26px; position: relative; overflow: hidden; }
    .bp-header::after { content:''; position:absolute; right:-30px; bottom:-30px; width:140px; height:140px;
      background: radial-gradient(circle, rgba(63,169,160,0.25), transparent 70%); }
    .bp-leaf { position:absolute; opacity:0.15; }
    .bp-title { font-size: 28px; font-weight: 600; letter-spacing: -0.01em; margin:0; }
    .bp-subtitle { font-size: 13px; color: var(--sand); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 2px; }
    .bp-section { padding: 16px 16px 4px; }
    .bp-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 16px; margin-bottom: 12px;
      box-shadow: 0 1px 2px rgba(31,61,46,0.04); }
    .bp-card-title { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-weight: 600; margin: 0 0 10px; color: var(--jungle-dark); display:flex; align-items:center; gap:8px;}
    .bp-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .bp-pill { display:inline-flex; align-items:center; gap:6px; background: var(--sand); color: var(--jungle-dark);
      border-radius: 999px; padding: 5px 12px; font-size: 12px; font-weight: 600; }
    .bp-pill.turq { background: rgba(63,169,160,0.18); color: #21625c; }
    .bp-pill.coral { background: rgba(232,131,111,0.18); color: #a34a35; }
    .bp-btn { border:none; border-radius: 14px; padding: 12px 16px; font-weight: 600; font-size: 14px; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height: 44px; }
    .bp-btn.primary { background: var(--jungle); color: #fff; width: 100%; }
    .bp-btn.primary:active { background: var(--jungle-dark); }
    .bp-btn.secondary { background: var(--cream); color: var(--jungle-dark); border: 1.5px solid var(--jungle); }
    .bp-btn.coral { background: var(--coral); color: #fff; }
    .bp-btn.ghost { background: transparent; color: var(--jungle-dark); border: 1px solid var(--line); }
    .bp-input, .bp-select, .bp-textarea { width: 100%; border: 1.5px solid var(--line); border-radius: 12px; padding: 10px 12px;
      font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: var(--ink); min-height: 44px; }
    .bp-textarea { min-height: 80px; resize: vertical; }
    .bp-label { font-size: 12px; font-weight: 600; color: #6b7d72; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; display:block; }
    .bp-progressbar { height: 10px; background: var(--sand); border-radius: 999px; overflow: hidden; }
    .bp-progressbar > div { height: 100%; background: linear-gradient(90deg, var(--turquoise), var(--jungle)); border-radius: 999px; transition: width .3s; }
    .bp-tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px;
      background: #fff; border-top: 1px solid var(--line); display:flex; z-index: 40; padding-bottom: env(safe-area-inset-bottom); }
    .bp-tab { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding: 10px 4px 8px; border:none; background:none;
      color: #8a9990; font-size: 10.5px; font-weight: 600; cursor:pointer; }
    .bp-tab.active { color: var(--jungle); }
    .bp-toggle { width: 46px; height: 26px; border-radius: 999px; background: var(--line); position: relative; cursor:pointer; border:none; flex-shrink:0; }
    .bp-toggle.on { background: var(--turquoise); }
    .bp-toggle > span { position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition: transform .18s; box-shadow:0 1px 2px rgba(0,0,0,0.2); }
    .bp-toggle.on > span { transform: translateX(20px); }
    .bp-chip { border: 1.5px solid var(--line); border-radius: 12px; padding: 9px 10px; font-size: 13px; font-weight: 500; background:#fff;
      cursor:pointer; text-align:center; color: var(--ink); }
    .bp-chip.selected { background: var(--jungle); color: #fff; border-color: var(--jungle); }
    .bp-scale { display:flex; gap:6px; }
    .bp-scale-btn { flex:1; height: 40px; border-radius: 10px; border: 1.5px solid var(--line); background:#fff; font-weight:700; cursor:pointer; }
    .bp-scale-btn.selected { background: var(--coral); color:#fff; border-color: var(--coral); }
    .bp-divider-leaf { display:flex; align-items:center; gap:8px; color: var(--turquoise); margin: 4px 0 10px; font-size: 11px; letter-spacing:0.1em; text-transform:uppercase; font-weight:700;}
    .bp-divider-leaf::before, .bp-divider-leaf::after { content:''; flex:1; height:1px; background: var(--line); }
    .bp-sheet-overlay { position: fixed; inset:0; background: rgba(20,30,25,0.45); z-index: 50; }
    .bp-sheet { position: fixed; bottom:0; left:50%; transform: translateX(-50%); width:100%; max-width: 480px; background: var(--cream);
      border-radius: 22px 22px 0 0; z-index: 51; padding: 8px 16px 28px; max-height: 82vh; overflow-y:auto; }
    .bp-calgrid { display:grid; grid-template-columns: repeat(7,1fr); gap: 6px; }
    .bp-calcell { aspect-ratio:1; border-radius: 8px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600;
      border: 1.5px solid var(--line); background:#fff; cursor:pointer; color:var(--ink); }
    .bp-calcell.today { border-color: var(--jungle); border-width:2px; }
    .bp-calcell.full { background: var(--jungle); color:#fff; border-color:var(--jungle); }
    .bp-calcell.partial { background: var(--sand); border-color: var(--sand); }
    .bp-calcell.rest { background: rgba(63,169,160,0.2); border-color: rgba(63,169,160,0.4); }
    .bp-small { font-size: 12.5px; color: #6b7d72; line-height:1.5; }
    .bp-exercise { border-top: 1px solid var(--line); padding: 12px 0; }
    .bp-exercise:first-child { border-top:none; }
    .bp-ex-name { font-weight: 700; font-size: 14.5px; color: var(--jungle-dark); }
    .bp-setrow { display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; }
    .bp-setbox { width:32px; height:32px; border-radius:8px; border:1.5px solid var(--line); background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .bp-setbox.checked { background: var(--turquoise); border-color: var(--turquoise); color:#fff; }
    .bp-phase-badge { background: var(--terracotta); color:#fff; border-radius:999px; padding:3px 10px; font-size:11px; font-weight:700; }
    a.bp-link { color: var(--jungle); }
  `}</style>
);

const Leafy = ({ size = 90, style }) => (
  <svg className="bp-leaf" width={size} height={size} viewBox="0 0 100 100" style={style} fill="none">
    <path d="M10 90 C 10 40, 40 10, 90 10 C 90 60, 60 90, 10 90 Z" stroke="#FBF6EE" strokeWidth="2" />
    <path d="M10 90 C 40 70, 60 50, 90 10" stroke="#FBF6EE" strokeWidth="1.5" />
  </svg>
);

/* ---------------------------------------------------------------------- */
/*  MAIN APP                                                               */
/* ---------------------------------------------------------------------- */

export default function BaliProject() {
  const [onboarded, setOnboarded] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);

  const defaultSetup = {
    startDate: isoDate(new Date()),
    baliDate: isoDate(addDays(isoDate(new Date()), 49)),
    weighTime: "Saturday morning",
    stepUnit: "steps",
    waterUnit: "oz",
    startingWeight: 150.4,
    heightFeet: 5, heightInches: 5,
    kettlebells: "15 lb",
    stepGoalOverride: "",
    schedule: { ...DEFAULT_SCHEDULE },
  };
  // Data lives in memory for this session only. Claude.ai artifacts cannot
  // reliably use browser storage (localStorage/sessionStorage are blocked in
  // this sandboxed environment), so the Export/Import backup below is the
  // one reliable way to carry data across sessions.
  const [setup, setSetup] = useState(defaultSetup);
  const [days, setDays] = useState({});
  const [currentDay, setCurrentDay] = useState(() => challengeDayForDate(defaultSetup.startDate));
  const [tab, setTab] = useState("today");
  const [moreOpen, setMoreOpen] = useState(false);
  const [morePage, setMorePage] = useState(null);

  const [progressEntries, setProgressEntries] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const backupRef = useRef(null);

  const quote = useMemo(() => QUOTES[currentDay % QUOTES.length], [currentDay]);

  function getLog(day) { return days[day] || defaultDayLog(); }
  function updateLog(day, patch) {
    setDays(prev => ({ ...prev, [day]: { ...getLog(day), ...patch } }));
  }
  function updateAlcohol(day, patch) {
    const log = getLog(day);
    setDays(prev => ({ ...prev, [day]: { ...log, alcohol: { ...log.alcohol, ...patch } } }));
  }

  const todayLog = getLog(currentDay);
  const phase = getPhaseForDay(currentDay);
  const weekdayForDay = (day) => WEEKDAYS[dayToDate(setup.startDate, day).getDay()];
  const todaysWorkoutKey = setup.schedule[weekdayForDay(currentDay)];
  const stepGoal = computeStepGoal(currentDay, todayLog.busyAF, Number(setup.stepGoalOverride) || null);
  const score = computeScore(todayLog, currentDay, setup.waterUnit, setup.stepGoalOverride, todaysWorkoutKey);
  const daysRemaining = 50 - currentDay;
  const progressPct = clamp((currentDay / 50) * 100, 0, 100);

  const latestWeight = progressEntries.length
    ? progressEntries[progressEntries.length - 1].weight
    : setup.startingWeight;

  /* ---------------- Backup / Export / Import ---------------- */
  function buildBackupObject() {
    return { version: 3, onboarded, setup, days, progressEntries, checkins, currentDay };
  }
  function exportBackup() {
    const text = JSON.stringify(buildBackupObject(), null, 2);
    try {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "bali-project-backup.json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { /* fallback handled by textarea below */ }
    return text;
  }
  function importBackup() {
    try {
      const parsed = JSON.parse(importText);
      const valid = parsed && typeof parsed === "object" && [2, 3].includes(parsed.version)
        && parsed.setup && typeof parsed.setup === "object"
        && parsed.days && typeof parsed.days === "object"
        && Array.isArray(parsed.progressEntries || [])
        && Array.isArray(parsed.checkins || [])
        && Number(parsed.currentDay || 1) >= 1 && Number(parsed.currentDay || 1) <= 50;
      if (!valid) {
        setImportMsg("That backup is incomplete or incompatible. Paste the full exported JSON and try again.");
        return;
      }
      if (!window.confirm("Restore this backup? It will replace the data currently in the app.")) return;
      setSetup({ ...setup, ...parsed.setup, stepGoalOverride: parsed.setup?.stepGoalOverride || "" });
      setDays(parsed.days);
      setProgressEntries(parsed.progressEntries || []);
      setCheckins(parsed.checkins || []);
      setCurrentDay(Number(parsed.currentDay || 1));
      setImportMsg("Backup restored ✅");
      setOnboarded(parsed.onboarded !== false);
    } catch (e) {
      setImportMsg("Couldn't read that backup. Make sure you pasted the complete text.");
    }
  }
  function copyText(text, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => cb && cb(true)).catch(() => cb && cb(false));
    } else { cb && cb(false); }
  }

  /* ---------------- Onboarding ---------------- */
  if (!onboarded) {
    return (
      <div className="bp-root">
        <Style />
        <Onboarding
          step={onboardStep} setStep={setOnboardStep}
          setup={setup} setSetup={setSetup}
          onFinish={() => { setCurrentDay(challengeDayForDate(setup.startDate)); setOnboarded(true); }}
          onImport={() => { setMorePage("backup"); setOnboarded(true); }}
        />
      </div>
    );
  }

  return (
    <div className="bp-root">
      <Style />
      <Header currentDay={currentDay} daysRemaining={daysRemaining} progressPct={progressPct}
        phase={phase} setCurrentDay={setCurrentDay} setup={setup} quote={quote} />

      {tab === "today" && (
        <TodayTab
          day={currentDay} setCurrentDay={setCurrentDay} log={todayLog} updateLog={updateLog} updateAlcohol={updateAlcohol}
          stepGoal={stepGoal} score={score} setup={setup} todaysWorkoutKey={todaysWorkoutKey}
          latestWeight={latestWeight} setTab={setTab}
        />
      )}
      {tab === "plan" && <PlanTab setup={setup} setSetup={setSetup} days={days} currentDay={currentDay} setCurrentDay={setCurrentDay} />}
      {tab === "workouts" && <WorkoutsTab setup={setup} setSetup={setSetup} day={currentDay} log={todayLog} updateLog={updateLog} />}
      {tab === "food" && <FoodTab />}

      {moreOpen && (
        <>
          <div className="bp-sheet-overlay" onClick={() => setMoreOpen(false)} />
          <div className="bp-sheet">
            <div style={{ width: 40, height: 4, background: "var(--line)", borderRadius: 2, margin: "8px auto 16px" }} />
            <MoreMenu setMorePage={(p) => { setMorePage(p); setMoreOpen(false); }} />
          </div>
        </>
      )}

      {morePage === "progress" && (
        <FullScreenSheet title="Progress" onClose={() => setMorePage(null)}>
          <ProgressTab entries={progressEntries} setEntries={setProgressEntries} setup={setup} days={days} currentDay={currentDay} />
        </FullScreenSheet>
      )}
      {morePage === "checkin" && (
        <FullScreenSheet title="Weekly Check-In" onClose={() => setMorePage(null)}>
          <CheckinTab days={days} currentDay={currentDay} progressEntries={progressEntries} checkins={checkins} setCheckins={setCheckins} copyText={copyText} />
        </FullScreenSheet>
      )}
      {morePage === "backup" && (
        <FullScreenSheet title="Backup & Settings" onClose={() => setMorePage(null)}>
          <BackupTab setup={setup} setSetup={setSetup} exportBackup={exportBackup} importText={importText}
            setImportText={setImportText} importBackup={importBackup} importMsg={importMsg} copyText={copyText}
            buildBackupObject={buildBackupObject} />
        </FullScreenSheet>
      )}

      <TabBar tab={tab} setTab={(t) => { setTab(t); setMoreOpen(false); setMorePage(null); }} openMore={() => setMoreOpen(true)} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  HEADER + NAV                                                          */
/* ---------------------------------------------------------------------- */

function Header({ currentDay, daysRemaining, progressPct, phase, setCurrentDay, quote }) {
  return (
    <div className="bp-header">
      <Leafy size={110} style={{ top: -20, right: -20 }} />
      <div className="bp-subtitle">50 Days</div>
      <h1 className="bp-title bp-display">Bali Project</h1>
      <div style={{ marginTop: 14 }}>
        <div className="bp-row" style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: "var(--sand)" }}>Day {currentDay} of 50 · {phase.title}</span>
          <span style={{ fontSize: 13, color: "var(--sand)" }}>{daysRemaining} to go</span>
        </div>
        <div className="bp-progressbar" style={{ background: "rgba(255,255,255,0.2)" }}>
          <div style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      <div className="bp-row" style={{ marginTop: 14 }}>
        <button className="bp-btn ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)", padding: "8px 12px" }}
          onClick={() => setCurrentDay(d => clamp(d - 1, 1, 50))}><ChevronLeft size={16} /></button>
        <span style={{ fontSize: 12, color: "var(--sand)", fontStyle: "italic" }}>{quote}</span>
        <button className="bp-btn ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)", padding: "8px 12px" }}
          onClick={() => setCurrentDay(d => clamp(d + 1, 1, 50))}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

function TabBar({ tab, setTab, openMore }) {
  const items = [
    { key: "today", label: "Today", icon: Home },
    { key: "plan", label: "Plan", icon: ClipboardList },
    { key: "workouts", label: "Workouts", icon: Dumbbell },
    { key: "food", label: "Food", icon: UtensilsCrossed },
  ];
  return (
    <div className="bp-tabbar">
      {items.map(it => (
        <button key={it.key} className={`bp-tab ${tab === it.key ? "active" : ""}`} onClick={() => setTab(it.key)}>
          <it.icon size={20} /> {it.label}
        </button>
      ))}
      <button className="bp-tab" onClick={openMore}><Menu size={20} /> More</button>
    </div>
  );
}

function MoreMenu({ setMorePage }) {
  const items = [
    { key: "progress", label: "Progress", desc: "Weight, measurements, trends", icon: TrendingUp },
    { key: "checkin", label: "Weekly Check-In", desc: "Saturday summary + copy for ChatGPT", icon: CalIcon },
    { key: "backup", label: "Backup & Settings", desc: "Export/import data, dates, kettlebells", icon: SettingsIcon },
  ];
  return (
    <div>
      <div className="bp-card-title bp-display" style={{ fontSize: 18, marginBottom: 12 }}>More</div>
      {items.map(it => (
        <button key={it.key} className="bp-card" style={{ width: "100%", textAlign: "left", border: "1px solid var(--line)", display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}
          onClick={() => setMorePage(it.key)}>
          <it.icon size={22} color="var(--turquoise)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{it.label}</div>
            <div className="bp-small">{it.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function FullScreenSheet({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--cream)", zIndex: 60, maxWidth: 480, margin: "0 auto", overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: "var(--jungle)", color: "#fff", padding: "16px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
        <span className="bp-display" style={{ fontSize: 19, fontWeight: 600 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={22} /></button>
      </div>
      <div style={{ padding: "12px 16px 40px" }}>{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  ONBOARDING                                                             */
/* ---------------------------------------------------------------------- */

function Onboarding({ step, setStep, setup, setSetup, onFinish, onImport }) {
  const screens = ["welcome", "dates", "schedule", "priorities", "backup"];
  const s = screens[step];

  return (
    <div style={{ padding: "24px 20px 40px", minHeight: "100vh" }}>
      <Leafy size={70} style={{ position: "static", opacity: 0.5, marginBottom: 12 }} />
      {s === "welcome" && (
        <div>
          <div className="bp-subtitle" style={{ color: "var(--terracotta)" }}>50 Days</div>
          <h1 className="bp-display" style={{ fontSize: 34, margin: "4px 0 10px" }}>Welcome to Bali Project</h1>
          <p className="bp-small" style={{ fontSize: 15 }}>A realistic 50-day dashboard for steps, strength, protein, and the occasional martini — built around your actual life, not a stock-photo one.</p>
        </div>
      )}
      {s === "dates" && (
        <div>
          <h2 className="bp-display" style={{ fontSize: 24 }}>Set your dates</h2>
          <div className="bp-card" style={{ marginTop: 12 }}>
            <label className="bp-label">Start date</label>
            <input type="date" className="bp-input" value={setup.startDate}
              onChange={e => setSetup(s => ({ ...s, startDate: e.target.value }))} />
            <label className="bp-label" style={{ marginTop: 12 }}>Bali departure date</label>
            <input type="date" className="bp-input" value={setup.baliDate}
              onChange={e => setSetup(s => ({ ...s, baliDate: e.target.value }))} />
            <label className="bp-label" style={{ marginTop: 12 }}>Current weight (lb)</label>
            <input type="number" className="bp-input" value={setup.startingWeight}
              onChange={e => setSetup(s => ({ ...s, startingWeight: Number(e.target.value) }))} />
          </div>
        </div>
      )}
      {s === "schedule" && (
        <div>
          <h2 className="bp-display" style={{ fontSize: 24 }}>Workout days & weights</h2>
          <div className="bp-card" style={{ marginTop: 12 }}>
            <label className="bp-label">Kettlebell weights on hand</label>
            <input className="bp-input" value={setup.kettlebells}
              onChange={e => setSetup(s => ({ ...s, kettlebells: e.target.value }))} placeholder="e.g. 15 lb" />
            <label className="bp-label" style={{ marginTop: 12 }}>Steps unit</label>
            <select className="bp-select" value={setup.stepUnit} onChange={e => setSetup(s => ({ ...s, stepUnit: e.target.value }))}>
              <option value="steps">Steps</option>
            </select>
            <label className="bp-label" style={{ marginTop: 12 }}>Water unit</label>
            <select className="bp-select" value={setup.waterUnit} onChange={e => setSetup(s => ({ ...s, waterUnit: e.target.value }))}>
              <option value="oz">Ounces</option>
              <option value="l">Liters</option>
            </select>
            <p className="bp-small" style={{ marginTop: 10 }}>You can fine-tune the weekly schedule anytime from the Plan tab.</p>
          </div>
        </div>
      )}
      {s === "priorities" && (
        <div>
          <h2 className="bp-display" style={{ fontSize: 24 }}>Three priorities</h2>
          <div className="bp-card" style={{ marginTop: 12 }}>
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              <li style={{ marginBottom: 10 }}>Walk consistently</li>
              <li style={{ marginBottom: 10 }}>Strength train three to four times weekly</li>
              <li>Eat enough protein while keeping normal life intact</li>
            </ol>
          </div>
        </div>
      )}
      {s === "backup" && (
        <div>
          <h2 className="bp-display" style={{ fontSize: 24 }}>One important note</h2>
          <div className="bp-card" style={{ marginTop: 12 }}>
            <p style={{ fontSize: 14.5 }}>This artifact keeps your data during this session, but it isn't cloud-connected. <strong>Save a backup regularly</strong> — a simple copyable text file lives under More → Backup & Settings.</p>
            <p className="bp-small" style={{ marginTop: 8 }}>Already have a backup from before?</p>
            <button className="bp-btn secondary" style={{ width: "100%", marginTop: 6 }} onClick={onImport}>Restore a backup instead</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {step > 0 && <button className="bp-btn ghost" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>Back</button>}
        {step < screens.length - 1 && <button className="bp-btn primary" style={{ flex: 2 }} onClick={() => setStep(s => s + 1)}>Continue</button>}
        {step === screens.length - 1 && <button className="bp-btn primary" style={{ flex: 2 }} onClick={onFinish}>Start Day 1</button>}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
        {screens.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === step ? "var(--jungle)" : "var(--line)" }} />)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  TODAY TAB                                                              */
/* ---------------------------------------------------------------------- */

function TodayTab({ day, setCurrentDay, log, updateLog, updateAlcohol, stepGoal, score, setup, todaysWorkoutKey, latestWeight, setTab }) {
  const stepsVal = Number(log.steps) || 0;
  const stepPct = clamp(Math.round((stepsVal / stepGoal) * 100), 0, 999);
  const waterTarget = setup.waterUnit === "l" ? (log.busyAF ? 2 : 2.5) : (log.busyAF ? 68 : 84);
  const workoutLabel = WORKOUT_LABELS[log.busyAF ? "minimum" : todaysWorkoutKey];

  return (
    <div className="bp-section">
      <div className="bp-card" style={{ background: "var(--jungle)", color: "#fff" }}>
        <div className="bp-row">
          <div>
            <div className="bp-label" style={{ color: "var(--sand)" }}>Today's mission</div>
            <div className="bp-display" style={{ fontSize: 25, fontWeight: 700 }}>{workoutLabel}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="bp-label" style={{ color: "var(--sand)" }}>Score</div>
            <div className="bp-display" style={{ fontSize: 28, fontWeight: 700 }}>{score}<span style={{ fontSize: 14 }}>/100</span></div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 13 }}>{scoreFeedback(score)}</div>
      </div>

      <div className="bp-card">
        <div className="bp-row">
          <span className="bp-card-title" style={{ marginBottom: 0 }}><Sparkles size={17} color="var(--coral)" /> Busy AF today?</span>
          <button type="button" aria-label="Toggle Busy AF mode" aria-pressed={log.busyAF} className={`bp-toggle ${log.busyAF ? "on" : ""}`} onClick={() => updateLog(day, { busyAF: !log.busyAF })}><span /></button>
        </div>
        {log.busyAF && <p className="bp-small" style={{ marginTop: 8 }}>Today is about maintaining the habit, not maximizing the day.</p>}
      </div>

      <div className="bp-card">
        <div className="bp-card-title">Today's mission</div>
        <div className="bp-row" style={{ marginBottom: 10 }}>
          <span style={{ fontWeight: 600 }}>{workoutLabel}</span>
          <button className="bp-btn secondary" style={{ padding: "8px 14px" }} onClick={() => setTab("workouts")}>Open</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[["full", "Full"], ["minimum", "Minimum"], ["walk", "Walk/recovery"], ["rest", "Rest"], ["none", "Not yet"]].map(([k, label]) => (
            <button key={k} className={`bp-chip ${log.workout === k ? "selected" : ""}`} style={{ flex: "1 1 30%" }} onClick={() => updateLog(day, { workout: k })}>{label}</button>
          ))}
        </div>

        <label className="bp-label"><Footprints size={14} style={{ verticalAlign: "middle" }} /> Steps</label>
        <input type="number" className="bp-input" placeholder="e.g. 7500" value={log.steps} onChange={e => updateLog(day, { steps: e.target.value })} />
        <div className="bp-row" style={{ marginTop: 7 }}><span className="bp-small">Goal: {stepGoal.toLocaleString()}</span><span className="bp-pill turq">{stepPct}%</span></div>
        <div className="bp-progressbar" style={{ marginTop: 7, marginBottom: 14 }}><div style={{ width: `${clamp(stepPct, 0, 100)}%` }} /></div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label className="bp-label">Protein (g)</label><input type="number" className="bp-input" placeholder="110" value={log.protein} onChange={e => updateLog(day, { protein: e.target.value })} /></div>
          <div><label className="bp-label">Water ({setup.waterUnit === "l" ? "L" : "oz"})</label><input type="number" className="bp-input" placeholder={setup.waterUnit === "l" ? "2.5" : "84"} value={log.water} onChange={e => updateLog(day, { water: e.target.value })} /></div>
        </div>
        <p className="bp-small" style={{ margin: "7px 0 12px" }}>Targets: 100–120g protein and about {waterTarget}{setup.waterUnit === "l" ? "L" : "oz"} water.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={`bp-chip ${log.fruit ? "selected" : ""}`} style={{ flex: 1 }} onClick={() => updateLog(day, { fruit: !log.fruit })}>Fruit ✓</button>
          <button className={`bp-chip ${log.veg ? "selected" : ""}`} style={{ flex: 1 }} onClick={() => updateLog(day, { veg: !log.veg })}>Vegetable ✓</button>
        </div>
      </div>

      <details className="bp-card">
        <summary className="bp-card-title" style={{ cursor: "pointer", marginBottom: 0 }}>Evening check-in</summary>
        <div style={{ marginTop: 14 }}>
          <div className="bp-card-title"><Wine size={17} color="var(--terracotta)" /> Drinks</div>
          <div className="bp-row"><span className="bp-small">Number of drinks</span><div style={{ display: "flex", alignItems: "center", gap: 10 }}><button className="bp-btn ghost" style={{ padding: "6px 12px" }} onClick={() => updateAlcohol(day, { count: Math.max(0, log.alcohol.count - 1) })}>–</button><strong>{log.alcohol.count}</strong><button className="bp-btn ghost" style={{ padding: "6px 12px" }} onClick={() => updateAlcohol(day, { count: log.alcohol.count + 1 })}>+</button></div></div>
          {log.alcohol.count > 0 && <select className="bp-select" style={{ marginTop: 8 }} value={log.alcohol.type} onChange={e => updateAlcohol(day, { type: e.target.value })}>{ALCOHOL_TYPES.map(a => <option key={a.key} value={a.key}>{a.key}</option>)}</select>}

          <label className="bp-label" style={{ marginTop: 14 }}>Bloating (1–5)</label>
          <div className="bp-scale">{[1,2,3,4,5].map(n => <button key={n} className={`bp-scale-btn ${log.bloating === n ? "selected" : ""}`} onClick={() => updateLog(day, { bloating: n })}>{n}</button>)}</div>
          <select className="bp-select" style={{ marginTop: 8 }} value={log.bloatingNote} onChange={e => updateLog(day, { bloatingNote: e.target.value })}><option value="">Optional context…</option>{BLOAT_NOTE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select>

          <label className="bp-label" style={{ marginTop: 14 }}>Energy (1–5)</label>
          <div className="bp-scale">{[1,2,3,4,5].map(n => <button key={n} className={`bp-scale-btn ${log.energy === n ? "selected" : ""}`} onClick={() => updateLog(day, { energy: n })}>{n}</button>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <div><label className="bp-label">Sleep (hours)</label><input type="number" className="bp-input" value={log.sleep} onChange={e => updateLog(day, { sleep: e.target.value })} /></div>
            <div><label className="bp-label">Calories (optional)</label><input type="number" className="bp-input" value={log.calories} onChange={e => updateLog(day, { calories: e.target.value })} /></div>
          </div>
        </div>
      </details>

      <div className="bp-card">
        <div className="bp-row"><div><div className="bp-label">Current weight</div><strong>{latestWeight} lb</strong></div><div style={{ textAlign: "right" }}><div className="bp-label">Target range</div><strong>142–145 lb</strong></div></div>
      </div>

      <button className={`bp-btn ${log.logged ? "secondary" : "primary"}`} style={{ width: "100%", marginBottom: 18 }} onClick={() => updateLog(day, { logged: !log.logged })}>
        <Check size={16} /> {log.logged ? "Day complete — edit if needed" : "Complete today"}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  PLAN TAB                                                               */
/* ---------------------------------------------------------------------- */

function PlanTab({ setup, setSetup, days, currentDay, setCurrentDay }) {
  const [view, setView] = useState("phases");

  return (
    <div className="bp-section">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[["phases", "Phases"], ["calendar", "Calendar"], ["checklist", "Checklist"], ["schedule", "Schedule"]].map(([k, l]) => (
          <button key={k} className={`bp-chip ${view === k ? "selected" : ""}`} style={{ flex: 1, fontSize: 12 }} onClick={() => setView(k)}>{l}</button>
        ))}
      </div>

      {view === "phases" && PHASES.map(p => (
        <div className="bp-card" key={p.id}>
          <div className="bp-row" style={{ marginBottom: 8 }}>
            <span className="bp-card-title" style={{ marginBottom: 0 }}>{p.title}</span>
            <span className="bp-phase-badge">Days {p.range[0]}–{p.range[1]}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {p.points.map((pt, i) => <li key={i} className="bp-small" style={{ marginBottom: 4 }}>{pt}</li>)}
          </ul>
        </div>
      ))}

      {view === "calendar" && (
        <div className="bp-card">
          <div className="bp-calgrid">
            {Array.from({ length: 50 }, (_, i) => i + 1).map(d => {
              const log = days[d];
              let cls = "";
              if (log) {
                if (log.workout === "rest") cls = "rest";
                else if (log.logged && (log.workout === "full" || log.workout === "minimum")) cls = "full";
                else if (log.logged) cls = "partial";
              }
              return (
                <div key={d} className={`bp-calcell ${cls} ${d === currentDay ? "today" : ""}`} onClick={() => setCurrentDay(d)}>{d}</div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <LegendDot color="var(--jungle)" label="Full/minimum" />
            <LegendDot color="var(--sand)" label="Partial" />
            <LegendDot color="rgba(63,169,160,0.4)" label="Rest" />
            <LegendDot color="#fff" border label="Not logged" />
          </div>
        </div>
      )}

      {view === "checklist" && (
        <div className="bp-card">
          {Array.from({ length: 50 }, (_, i) => i + 1).map(d => {
            const log = days[d];
            const done = log && log.logged;
            return (
              <div key={d} className="bp-row" style={{ padding: "8px 0", borderTop: d > 1 ? "1px solid var(--line)" : "none" }}>
                <span style={{ fontSize: 14 }}>Day {d} — {getPhaseForDay(d).title}</span>
                <button className={`bp-setbox ${done ? "checked" : ""}`} onClick={() => setCurrentDay(d)}>{done ? <Check size={16} /> : ""}</button>
              </div>
            );
          })}
        </div>
      )}

      {view === "schedule" && (
        <div className="bp-card">
          <p className="bp-small" style={{ marginBottom: 10 }}>Move workouts to whatever days actually work.</p>
          {WEEKDAYS.filter(w => w !== "Sunday").concat(["Sunday"]).map(w => (
            <div key={w} className="bp-row" style={{ padding: "8px 0", borderTop: w !== "Monday" ? "1px solid var(--line)" : "none" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{w}</span>
              <select className="bp-select" style={{ width: 170 }} value={setup.schedule[w]}
                onChange={e => setSetup(s => ({ ...s, schedule: { ...s.schedule, [w]: e.target.value } }))}>
                {Object.entries(WORKOUT_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label, border }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: border ? "1.5px solid var(--line)" : "none" }} />
      <span className="bp-small">{label}</span>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  WORKOUTS TAB                                                           */
/* ---------------------------------------------------------------------- */

function WorkoutsTab({ setup, day, log, updateLog }) {
  const weekdayForDay = (d) => WEEKDAYS[dayToDate(setup.startDate, d).getDay()];
  const scheduledKey = setup.schedule[weekdayForDay(day)];
  const [selected, setSelected] = useState(scheduledKey && WORKOUTS[scheduledKey] ? scheduledKey : "A");
  const workout = WORKOUTS[selected];
  const setChecks = log.workoutSets || {};
  const kbWeights = log.workoutWeights || {};

  function toggleSet(exName, idx) {
    const key = `${selected}-${exName}`;
    const arr = setChecks[key] ? [...setChecks[key]] : [];
    arr[idx] = !arr[idx];
    updateLog(day, { workoutSets: { ...setChecks, [key]: arr } });
  }

  return (
    <div className="bp-section">
      <div className="bp-card" style={{ background: "var(--sand)" }}>
        <p className="bp-small" style={{ margin: 0 }}>{SAFETY_NOTE}</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {Object.keys(WORKOUTS).map(k => (
          <button key={k} className={`bp-chip ${selected === k ? "selected" : ""}`} onClick={() => setSelected(k)}>{WORKOUTS[k].title}</button>
        ))}
      </div>

      <div className="bp-card">
        <div className="bp-card-title">{WARMUP.title} <span className="bp-pill" style={{ marginLeft: "auto" }}>{WARMUP.duration}</span></div>
        {WARMUP.exercises.map((e, i) => (
          <div key={i} className="bp-small" style={{ marginBottom: 4 }}>• {e.name} — {e.reps}</div>
        ))}
        <p className="bp-small" style={{ marginTop: 8, fontStyle: "italic" }}>{WARMUP.note}</p>
      </div>

      <div className="bp-card">
        <div className="bp-row" style={{ marginBottom: 4 }}>
          <span className="bp-card-title" style={{ marginBottom: 0 }}>{workout.title}{workout.subtitle ? ` — ${workout.subtitle}` : ""}</span>
        </div>
        <span className="bp-pill turq">{workout.duration}</span>
        <div style={{ marginTop: 10 }}>
          <label className="bp-label">Kettlebell weight used today</label>
          <input className="bp-input" placeholder="e.g. 20 lb" value={kbWeights[selected] || ""}
            onChange={e => updateLog(day, { workoutWeights: { ...kbWeights, [selected]: e.target.value } })} />
        </div>

        {workout.exercises.map((ex, i) => {
          const key = `${selected}-${ex.name}`;
          const checks = setChecks[key] || [];
          return (
            <div className="bp-exercise" key={i}>
              <div className="bp-row">
                <span className="bp-ex-name">{ex.name}</span>
                <span className="bp-pill">{ex.sets} × {ex.reps}</span>
              </div>
              {ex.cues && (
                <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                  {ex.cues.map((c, ci) => <li key={ci} className="bp-small">{c}</li>)}
                </ul>
              )}
              {ex.mistakes && (
                <div className="bp-small" style={{ marginTop: 6 }}><strong>Watch for:</strong> {ex.mistakes.join("; ")}</div>
              )}
              {(ex.easier || ex.harder) && (
                <div className="bp-small" style={{ marginTop: 6, display: "flex", gap: 16 }}>
                  {ex.easier && <span><strong>Easier:</strong> {ex.easier}</span>}
                  {ex.harder && <span><strong>Harder:</strong> {ex.harder}</span>}
                </div>
              )}
              <div className="bp-setrow">
                {Array.from({ length: ex.sets }, (_, si) => (
                  <button key={si} className={`bp-setbox ${checks[si] ? "checked" : ""}`} onClick={() => toggleSet(ex.name, si)}>
                    {checks[si] ? <Check size={16} /> : si + 1}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {workout.learnLater && (
          <div className="bp-small" style={{ marginTop: 10, padding: 10, background: "var(--cream)", borderRadius: 10 }}>
            <strong>Learn later — {workout.learnLater.name}:</strong> {workout.learnLater.note}
          </div>
        )}
        {workout.footer && <p className="bp-small" style={{ marginTop: 10, fontStyle: "italic" }}>{workout.footer}</p>}
      </div>

      <button className="bp-btn primary" style={{ width: "100%", marginBottom: 20 }}
        onClick={() => updateLog(day, { workout: selected === "minimum" ? "minimum" : "full" })}>
        <Check size={16} /> Mark this workout complete for Day {day}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  FOOD TAB                                                               */
/* ---------------------------------------------------------------------- */

function FoodTab() {
  const [meal, setMeal] = useState({ protein: null, carb: null, produce: null, flavor: null });
  const [planner, setPlanner] = useState({ drinks: 2, type: "Gin and soda", meal: "Restaurant", waterPlan: "Yes", morning: "Normal breakfast" });

  const assembled = [meal.protein, meal.carb, meal.produce, meal.flavor].filter(Boolean).join(" + ");

  return (
    <div className="bp-section">
      <div className="bp-card">
        <div className="bp-card-title">Daily framework</div>
        <div className="bp-small">
          Protein ~100–120g · typical calories ~1,650–1,800 (optional to track) · one fruit + one vegetable serving daily.
          Rice, fruit, and potatoes are all allowed. No foods here are morally good or bad.
        </div>
      </div>

      <div className="bp-card">
        <div className="bp-card-title">Build a meal</div>
        {Object.entries(MEAL_OPTIONS).map(([cat, opts]) => (
          <div key={cat} style={{ marginBottom: 10 }}>
            <label className="bp-label">{cat}</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {opts.map(o => (
                <button key={o} className={`bp-chip ${meal[cat] === o ? "selected" : ""}`} style={{ fontSize: 12.5, padding: "7px 10px" }}
                  onClick={() => setMeal(m => ({ ...m, [cat]: m[cat] === o ? null : o }))}>{o}</button>
              ))}
            </div>
          </div>
        ))}
        {assembled && (
          <div className="bp-pill coral" style={{ display: "block", marginTop: 8 }}>Your plate: {assembled}</div>
        )}
        <p className="bp-small" style={{ marginTop: 8 }}>Oils, sauces, and dressings can add up calorie-wise — not forbidden, just worth noticing.</p>
      </div>

      <div className="bp-card">
        <div className="bp-card-title">Sample ideas</div>
        {Object.entries(SAMPLE_MEALS).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{cat}</div>
            {items.map((it, i) => <div key={i} className="bp-small">• {it}</div>)}
          </div>
        ))}
      </div>

      <div className="bp-card">
        <div className="bp-card-title">Going out tonight?</div>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li className="bp-small">Eat normally earlier in the day</li>
          <li className="bp-small">Include protein before or with drinks</li>
          <li className="bp-small">Choose what matters most rather than ordering everything</li>
          <li className="bp-small">Enjoy the meal</li>
          <li className="bp-small">Stop when satisfied, when practical</li>
          <li className="bp-small">Return to the normal plan at the next meal</li>
        </ol>
      </div>

      <div className="bp-card">
        <div className="bp-card-title"><Wine size={17} color="var(--terracotta)" /> Alcohol guide</div>
        <div className="bp-small" style={{ marginBottom: 6 }}>Estimates only — pours and recipes vary.</div>
        {ALCOHOL_TYPES.map(a => (
          <div key={a.key} className="bp-row" style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 13.5 }}>{a.key}</span>
            <span className="bp-small">{a.cals} cal</span>
          </div>
        ))}
      </div>

      <div className="bp-card">
        <div className="bp-card-title">Night-out planner</div>
        <label className="bp-label">Expected drinks</label>
        <input type="number" className="bp-input" value={planner.drinks} onChange={e => setPlanner(p => ({ ...p, drinks: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Type</label>
        <select className="bp-select" value={planner.type} onChange={e => setPlanner(p => ({ ...p, type: e.target.value }))}>
          {ALCOHOL_TYPES.map(a => <option key={a.key} value={a.key}>{a.key}</option>)}
        </select>
        <label className="bp-label" style={{ marginTop: 10 }}>Setting</label>
        <select className="bp-select" value={planner.meal} onChange={e => setPlanner(p => ({ ...p, meal: e.target.value }))}>
          <option>Restaurant</option><option>Home</option><option>Bar/party</option>
        </select>
        <div className="bp-card" style={{ marginTop: 12, background: "var(--cream)" }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            Have your normal protein-forward dinner, enjoy your planned {planner.drinks} {planner.type.toLowerCase()}
            {Number(planner.drinks) === 1 ? "" : "s"}, add water during the evening, and resume your normal breakfast tomorrow. No compensation workout required.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  PROGRESS TAB                                                          */
/* ---------------------------------------------------------------------- */

function ProgressTab({ entries, setEntries, setup, days, currentDay }) {
  const [form, setForm] = useState({ date: isoDate(new Date()), weight: "", waist: "", hip: "", notes: "" });

  function addEntry() {
    if (!form.weight) return;
    setEntries(prev => [...prev, { ...form, id: uid() }].sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ date: isoDate(new Date()), weight: "", waist: "", hip: "", notes: "" });
  }

  const start = setup.startingWeight;
  const latest = entries.length ? Number(entries[entries.length - 1].weight) : start;
  const totalChange = round1(latest - start);
  const weeksElapsed = Math.max(1, Math.round(currentDay / 7));
  const avgPerWeek = round1(totalChange / weeksElapsed);
  const remaining = round1(latest - 145);

  let trendMsg = null;
  if (entries.length >= 2) {
    const prevWeek = Number(entries[entries.length - 2].weight);
    if (latest > prevWeek) trendMsg = "One weigh-in can reflect hydration, sodium, alcohol, digestion, or the menstrual cycle. Review the trend before changing the plan.";
  }

  // last 7 logged days for habit summary
  const last7 = Array.from({ length: 7 }, (_, i) => currentDay - i).filter(d => d >= 1 && days[d]);
  const avg = (key) => last7.length ? round1(last7.reduce((s, d) => s + (Number(days[d][key]) || 0), 0) / last7.length) : 0;
  const fullWorkouts = last7.filter(d => days[d].workout === "full").length;
  const minWorkouts = last7.filter(d => days[d].workout === "minimum").length;
  const totalDrinks = last7.reduce((s, d) => s + (days[d].alcohol ? days[d].alcohol.count : 0), 0);
  const avgBloat = last7.filter(d => days[d].bloating).length
    ? round1(last7.reduce((s, d) => s + (days[d].bloating || 0), 0) / last7.filter(d => days[d].bloating).length) : 0;
  const completion = last7.length ? Math.round((last7.filter(d => days[d].logged).length / 7) * 100) : 0;

  const chartW = 300, chartH = 90;
  const points = entries.length > 1 ? entries.map((e, i) => {
    const x = (i / (entries.length - 1)) * chartW;
    const min = Math.min(...entries.map(e => Number(e.weight)), 140);
    const max = Math.max(...entries.map(e => Number(e.weight)), 150);
    const y = chartH - ((Number(e.weight) - min) / Math.max(1, (max - min))) * chartH;
    return `${x},${y}`;
  }).join(" ") : "";

  return (
    <div>
      <div className="bp-card">
        <div className="bp-card-title">Add an entry</div>
        <label className="bp-label">Date</label>
        <input type="date" className="bp-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Weight (lb)</label>
        <input type="number" className="bp-input" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Waist (in, optional)</label>
        <input type="number" className="bp-input" value={form.waist} onChange={e => setForm(f => ({ ...f, waist: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Hips (in, optional)</label>
        <input type="number" className="bp-input" value={form.hip} onChange={e => setForm(f => ({ ...f, hip: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Notes</label>
        <input className="bp-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Clothing fit, photo reminder, etc." />
        <button className="bp-btn primary" style={{ width: "100%", marginTop: 12 }} onClick={addEntry}>Save entry</button>
        <p className="bp-small" style={{ marginTop: 8 }}>Recommended: weigh in once weekly (Saturday morning). Waist/hips and photos at the start, midpoint, and final week. Daily weighing isn't wrong — weekly was chosen here because it's simpler and less noisy.</p>
      </div>

      <div className="bp-card">
        <div className="bp-card-title">Weight trend</div>
        <div className="bp-row"><span className="bp-small">Starting weight</span><span style={{ fontWeight: 700 }}>{start} lb</span></div>
        <div className="bp-row"><span className="bp-small">Latest</span><span style={{ fontWeight: 700 }}>{latest} lb</span></div>
        <div className="bp-row"><span className="bp-small">Total change</span><span style={{ fontWeight: 700 }}>{totalChange > 0 ? "+" : ""}{totalChange} lb</span></div>
        <div className="bp-row"><span className="bp-small">Avg / week</span><span style={{ fontWeight: 700 }}>{avgPerWeek} lb</span></div>
        <div className="bp-row"><span className="bp-small">To target range (142–145)</span><span style={{ fontWeight: 700 }}>{remaining > 0 ? `${remaining} lb to go` : "In range 🎉"}</span></div>
        {entries.length > 1 && (
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ marginTop: 12 }}>
            <polyline points={points} fill="none" stroke="#3FA9A0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {trendMsg && <p className="bp-small" style={{ marginTop: 8, fontStyle: "italic" }}>{trendMsg}</p>}
      </div>

      <div className="bp-card">
        <div className="bp-card-title">Last 7 logged days</div>
        <div className="bp-row"><span className="bp-small">Avg steps</span><span>{avg("steps")}</span></div>
        <div className="bp-row"><span className="bp-small">Full workouts</span><span>{fullWorkouts}</span></div>
        <div className="bp-row"><span className="bp-small">Minimum workouts</span><span>{minWorkouts}</span></div>
        <div className="bp-row"><span className="bp-small">Avg protein</span><span>{avg("protein")}g</span></div>
        <div className="bp-row"><span className="bp-small">Avg water</span><span>{avg("water")}</span></div>
        <div className="bp-row"><span className="bp-small">Total drinks</span><span>{totalDrinks}</span></div>
        <div className="bp-row"><span className="bp-small">Avg bloating</span><span>{avgBloat || "—"}</span></div>
        <div className="bp-row"><span className="bp-small">Avg sleep</span><span>{avg("sleep")}h</span></div>
        <div className="bp-row"><span className="bp-small">Completion</span><span>{completion}%</span></div>
      </div>

      {entries.length > 0 && (
        <div className="bp-card">
          <div className="bp-card-title">Entries</div>
          {[...entries].reverse().map(e => (
            <div key={e.id} className="bp-row" style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>
              <span className="bp-small">{e.date}</span>
              <span style={{ fontSize: 13.5 }}>{e.weight} lb {e.waist ? `· W ${e.waist}"` : ""} {e.hip ? `· H ${e.hip}"` : ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  WEEKLY CHECK-IN TAB                                                    */
/* ---------------------------------------------------------------------- */

function CheckinTab({ days, currentDay, progressEntries, checkins, setCheckins, copyText }) {
  const last7 = Array.from({ length: 7 }, (_, i) => currentDay - i).filter(d => d >= 1 && days[d]);
  const avg = (key) => last7.length ? round1(last7.reduce((s, d) => s + (Number(days[d][key]) || 0), 0) / last7.length) : 0;
  const proteinDays = last7.filter(d => (Number(days[d].protein) || 0) >= 100).length;
  const totalDrinks = last7.reduce((s, d) => s + (days[d].alcohol ? days[d].alcohol.count : 0), 0);
  const avgBloat = last7.filter(d => days[d].bloating).length
    ? round1(last7.reduce((s, d) => s + (days[d].bloating || 0), 0) / last7.filter(d => days[d].bloating).length) : "—";
  const latestWeight = progressEntries.length ? progressEntries[progressEntries.length - 1].weight : "";
  const prevWeight = progressEntries.length > 1 ? progressEntries[progressEntries.length - 2].weight : null;
  const change = prevWeight != null ? round1(latestWeight - prevWeight) : "";

  const [form, setForm] = useState({
    week: Math.ceil(currentDay / 7), weight: latestWeight, change,
    steps: avg("steps"), full: last7.filter(d => days[d].workout === "full").length,
    minimum: last7.filter(d => days[d].workout === "minimum").length,
    proteinDays, drinks: totalDrinks, sleep: avg("sleep"), bloating: avgBloat,
    energy: avg("energy"), win: "", challenge: "", cycle: "", unrealistic: "", support: "",
  });
  const [copied, setCopied] = useState(false);

  function buildText() {
    return `BALI WEEKLY CHECK-IN
Week: ${form.week}
Current weight: ${form.weight}
Change from last week: ${form.change}
Average steps: ${form.steps}
Full workouts: ${form.full}
Minimum workouts: ${form.minimum}
Protein target days: ${form.proteinDays}
Total drinks: ${form.drinks}
Average sleep: ${form.sleep}
Average bloating: ${form.bloating}
Energy: ${form.energy}
Biggest win: ${form.win}
Biggest challenge: ${form.challenge}
What felt unrealistic: ${form.unrealistic}
Notes: ${form.cycle}${form.support ? " | Support needed: " + form.support : ""}`;
  }

  function saveAndCopy() {
    const text = buildText();
    setCheckins(prev => [...prev, { ...form, id: uid(), savedAt: isoDate(new Date()) }]);
    copyText(text, (ok) => setCopied(ok ? "copied" : "manual"));
  }

  const guidance = [];
  if (form.change !== "" && Number(form.change) < 0) guidance.push("Weight trending down and plan feels manageable? Keep the plan unchanged.");
  if (Number(form.full) + Number(form.minimum) < 2) guidance.push("Fewer workouts this week — no judgment, just notice what got in the way for next week.");
  if (Number(form.energy) && Number(form.energy) <= 2) guidance.push("Energy running low — consider sleep, recovery, or slightly more food rather than cutting further.");

  return (
    <div>
      <div className="bp-card">
        <div className="bp-card-title">This week, auto-filled from your logs</div>
        {[
          ["week", "Week #"], ["weight", "Current weight"], ["change", "Change from last week"],
          ["steps", "Average steps"], ["full", "Full workouts"], ["minimum", "Minimum workouts"],
          ["proteinDays", "Protein target days"], ["drinks", "Total drinks"], ["sleep", "Average sleep"],
          ["bloating", "Average bloating"], ["energy", "Energy"],
        ].map(([key, label]) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <label className="bp-label">{label}</label>
            <input className="bp-input" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
        <label className="bp-label">Biggest win</label>
        <textarea className="bp-textarea" value={form.win} onChange={e => setForm(f => ({ ...f, win: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Biggest challenge</label>
        <textarea className="bp-textarea" value={form.challenge} onChange={e => setForm(f => ({ ...f, challenge: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>What felt unrealistic</label>
        <textarea className="bp-textarea" value={form.unrealistic} onChange={e => setForm(f => ({ ...f, unrealistic: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Cycle / other notes</label>
        <input className="bp-input" value={form.cycle} onChange={e => setForm(f => ({ ...f, cycle: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Support needed next week</label>
        <input className="bp-input" value={form.support} onChange={e => setForm(f => ({ ...f, support: e.target.value }))} />
      </div>

      {guidance.length > 0 && (
        <div className="bp-card">
          <div className="bp-card-title">Gentle observations</div>
          {guidance.map((g, i) => <p key={i} className="bp-small">• {g}</p>)}
        </div>
      )}

      <div className="bp-card">
        <div className="bp-card-title">Copyable summary</div>
        <textarea className="bp-textarea" style={{ minHeight: 220, fontFamily: "monospace", fontSize: 12.5 }} readOnly value={buildText()} />
        <button className="bp-btn primary" style={{ width: "100%", marginTop: 10 }} onClick={saveAndCopy}>
          <Copy size={16} /> Copy for my ChatGPT check-in
        </button>
        {copied === "copied" && <p className="bp-small" style={{ marginTop: 6 }}>Copied ✅</p>}
        {copied === "manual" && <p className="bp-small" style={{ marginTop: 6 }}>Clipboard unavailable — select the text above and copy manually.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  BACKUP TAB                                                             */
/* ---------------------------------------------------------------------- */

function BackupTab({ setup, setSetup, exportBackup, importText, setImportText, importBackup, importMsg, copyText, buildBackupObject }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(buildBackupObject(), null, 2);

  return (
    <div>
      <div className="bp-card" style={{ background: "var(--sand)" }}>
        <p className="bp-small" style={{ margin: 0 }}>Save a backup regularly. This Artifact keeps your entries in memory for the current session only — there's no browser or cloud sync, so data resets if the tab reloads or the session ends.</p>
      </div>

      <div className="bp-card">
        <div className="bp-card-title">Settings</div>
        <label className="bp-label">Start date</label>
        <input type="date" className="bp-input" value={setup.startDate} onChange={e => setSetup(s => ({ ...s, startDate: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Bali departure date</label>
        <input type="date" className="bp-input" value={setup.baliDate} onChange={e => setSetup(s => ({ ...s, baliDate: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Kettlebell weights on hand</label>
        <input className="bp-input" value={setup.kettlebells} onChange={e => setSetup(s => ({ ...s, kettlebells: e.target.value }))} />
        <label className="bp-label" style={{ marginTop: 10 }}>Water unit</label>
        <select className="bp-select" value={setup.waterUnit} onChange={e => setSetup(s => ({ ...s, waterUnit: e.target.value }))}>
          <option value="oz">Ounces</option><option value="l">Liters</option>
        </select>
        <label className="bp-label" style={{ marginTop: 10 }}>Optional custom step goal</label>
        <input type="number" className="bp-input" placeholder="Leave blank to use the phase goal" value={setup.stepGoalOverride || ""}
          onChange={e => setSetup(s => ({ ...s, stepGoalOverride: e.target.value }))} />
      </div>

      <div className="bp-card">
        <div className="bp-card-title"><Download size={17} /> Export backup</div>
        <button className="bp-btn primary" style={{ width: "100%" }} onClick={() => { exportBackup(); }}>Download backup file</button>
        <button className="bp-btn secondary" style={{ width: "100%", marginTop: 8 }}
          onClick={() => copyText(text, (ok) => setCopied(ok ? "copied" : "manual"))}>
          <Copy size={16} /> Copy backup text
        </button>
        {copied === "copied" && <p className="bp-small" style={{ marginTop: 6 }}>Copied ✅</p>}
        <textarea className="bp-textarea" style={{ minHeight: 160, fontFamily: "monospace", fontSize: 11, marginTop: 10 }} readOnly value={text} />
      </div>

      <div className="bp-card">
        <div className="bp-card-title"><Upload size={17} /> Import backup</div>
        <textarea className="bp-textarea" style={{ minHeight: 120 }} placeholder="Paste your exported backup JSON here"
          value={importText} onChange={e => setImportText(e.target.value)} />
        <button className="bp-btn coral" style={{ width: "100%", marginTop: 8 }} onClick={importBackup}>Restore from backup</button>
        {importMsg && <p className="bp-small" style={{ marginTop: 6 }}>{importMsg}</p>}
      </div>
    </div>
  );
}

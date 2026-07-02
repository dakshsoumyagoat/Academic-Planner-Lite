import { db, syllabusTable } from "@workspace/db";
import { count } from "drizzle-orm";

const CHAPTERS: { subject: string; track: string; chapter: string }[] = [
  // Physics Track 01
  { subject: "Physics", track: "01", chapter: "Vectors" },
  { subject: "Physics", track: "01", chapter: "Rectilinear Motion" },
  { subject: "Physics", track: "01", chapter: "Projectile Motion" },
  { subject: "Physics", track: "01", chapter: "Relative Motion" },
  { subject: "Physics", track: "01", chapter: "Circular Kinematics" },
  { subject: "Physics", track: "01", chapter: "Work, Power, and Energy" },
  { subject: "Physics", track: "01", chapter: "COM, Momentum, and Collision" },
  { subject: "Physics", track: "01", chapter: "Rigid Body Mechanics" },
  { subject: "Physics", track: "01", chapter: "Simple Harmonic Motion" },
  { subject: "Physics", track: "01", chapter: "Gravitation" },

  // Physics Track 02
  { subject: "Physics", track: "02", chapter: "Basic Mathematics" },
  { subject: "Physics", track: "02", chapter: "Units and Measurements, Errors, and Experiments" },
  { subject: "Physics", track: "02", chapter: "Newton's Laws of Motion" },
  { subject: "Physics", track: "02", chapter: "Mechanical Properties of Solids (Elasticity)" },
  { subject: "Physics", track: "02", chapter: "Thermometry" },
  { subject: "Physics", track: "02", chapter: "Thermal Expansion" },
  { subject: "Physics", track: "02", chapter: "Calorimetry" },
  { subject: "Physics", track: "02", chapter: "Heat Transfer" },
  { subject: "Physics", track: "02", chapter: "Kinetic Theory of Gases" },
  { subject: "Physics", track: "02", chapter: "Thermodynamics" },
  { subject: "Physics", track: "02", chapter: "Fluid Mechanics" },
  { subject: "Physics", track: "02", chapter: "Transverse Waves (String Waves)" },
  { subject: "Physics", track: "02", chapter: "Longitudinal Waves (Sound Waves)" },

  // Chemistry Track 01
  { subject: "Chemistry", track: "01", chapter: "Atomic Structure" },
  { subject: "Chemistry", track: "01", chapter: "Chemical Bonding" },
  { subject: "Chemistry", track: "01", chapter: "Gaseous States" },
  { subject: "Chemistry", track: "01", chapter: "Liquids" },
  { subject: "Chemistry", track: "01", chapter: "Thermodynamics" },
  { subject: "Chemistry", track: "01", chapter: "Thermochemistry" },
  { subject: "Chemistry", track: "01", chapter: "Chemical Equilibrium" },
  { subject: "Chemistry", track: "01", chapter: "Ionic Equilibrium" },
  { subject: "Chemistry", track: "01", chapter: "Redox Reactions" },
  { subject: "Chemistry", track: "01", chapter: "Equivalent Concept and Volumetric Analysis" },

  // Chemistry Track 02
  { subject: "Chemistry", track: "02", chapter: "Some Basic Concepts of Chemistry (Mole Concept)" },
  { subject: "Chemistry", track: "02", chapter: "Periodic Classification" },
  { subject: "Chemistry", track: "02", chapter: "IUPAC Nomenclature" },
  { subject: "Chemistry", track: "02", chapter: "Physical Properties, Qualitative and Quantitative Analysis" },
  { subject: "Chemistry", track: "02", chapter: "GOC-I" },
  { subject: "Chemistry", track: "02", chapter: "GOC-II" },
  { subject: "Chemistry", track: "02", chapter: "Stereochemistry" },
  { subject: "Chemistry", track: "02", chapter: "Hydrocarbons" },
  { subject: "Chemistry", track: "02", chapter: "Hydrogen" },
  { subject: "Chemistry", track: "02", chapter: "s-Block Elements" },
  { subject: "Chemistry", track: "02", chapter: "Environmental Chemistry" },
  { subject: "Chemistry", track: "02", chapter: "p-Block Elements" },

  // Maths Track 01
  { subject: "Maths", track: "01", chapter: "Basic Maths" },
  { subject: "Maths", track: "01", chapter: "Trigonometric Ratios and Identities" },
  { subject: "Maths", track: "01", chapter: "Trigonometric Equations and Inequalities" },
  { subject: "Maths", track: "01", chapter: "Properties of Triangles" },
  { subject: "Maths", track: "01", chapter: "Introduction to Co-ordinate Geometry" },
  { subject: "Maths", track: "01", chapter: "Straight Lines" },
  { subject: "Maths", track: "01", chapter: "Introduction to 3D Geometry" },
  { subject: "Maths", track: "01", chapter: "Pair of Lines" },
  { subject: "Maths", track: "01", chapter: "Circles" },
  { subject: "Maths", track: "01", chapter: "Conic Sections" },
  { subject: "Maths", track: "01", chapter: "Statistics" },
  { subject: "Maths", track: "01", chapter: "Limits" },
  { subject: "Maths", track: "01", chapter: "Methods of Differentiation" },

  // Maths Track 02
  { subject: "Maths", track: "02", chapter: "Sets" },
  { subject: "Maths", track: "02", chapter: "Relations" },
  { subject: "Maths", track: "02", chapter: "Introduction to Functions" },
  { subject: "Maths", track: "02", chapter: "Linear Inequalities" },
  { subject: "Maths", track: "02", chapter: "Fundamentals of Mathematics" },
  { subject: "Maths", track: "02", chapter: "Quadratic Equations and Expressions" },
  { subject: "Maths", track: "02", chapter: "Sequence and Series" },
  { subject: "Maths", track: "02", chapter: "Binomial Theorem" },
  { subject: "Maths", track: "02", chapter: "Permutations and Combinations" },
  { subject: "Maths", track: "02", chapter: "Functions" },
  { subject: "Maths", track: "02", chapter: "Probability" },
];

async function main() {
  const [{ value: existing }] = await db.select({ value: count() }).from(syllabusTable);
  if (Number(existing) > 0) {
    console.log(`Syllabus already seeded (${existing} chapters). Skipping.`);
    process.exit(0);
  }

  await db.insert(syllabusTable).values(CHAPTERS.map((c) => ({ ...c, status: "not_started" as const })));
  console.log(`Seeded ${CHAPTERS.length} syllabus chapters.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

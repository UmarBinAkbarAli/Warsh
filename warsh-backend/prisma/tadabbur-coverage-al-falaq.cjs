// Canonical curriculum evidence for complete word-level coverage of Al-Falaq.
// Shared vocabulary points to its first real teaching lesson; surah-specific
// vocabulary is taught in the lesson whose grammar it fits: ما (113:2) in Ch18 L3,
// النفاثات/عقد (113:4) in Ch18 L4, الفلق in Ch19 L1, غاسق/اذا/وقب (113:3) in Ch19 L2,
// حاسد/حسد (113:5) in Ch19 L3. The Ch19 review only recalls; the chapter test has none.
const AL_FALAQ_COVERAGE = [
  { key: "قل", lesson: "chapter-16-lesson-04.json", exerciseId: "ch16-l04-ex09" },
  { key: "اعوذ", lesson: "chapter-18-lesson-06-review.json", exerciseId: "ch18-l06-ex01" },
  { key: "ب", lesson: "chapter-02-lesson-14.json", exerciseId: "ch02-l14-ex01", componentOf: "برب" },
  { key: "رب", lesson: "chapter-03-lesson-03.json", exerciseId: "ch03-l02-ex09" },
  { key: "الفلق", lesson: "chapter-19-lesson-01.json", exerciseId: "ch19-l01-ex02" },
  { key: "من", lesson: "chapter-02-lesson-07.json", exerciseId: "ch02-l07-ex01" },
  { key: "شر", lesson: "chapter-18-lesson-01.json", exerciseId: "ch18-l01-ex06" },
  { key: "ما", lesson: "chapter-18-lesson-03.json", exerciseId: "ch18-l03-ex09" },
  { key: "خلق", lesson: "chapter-12-lesson-04.json", exerciseId: "ch12-l04-ex03" },
  { key: "و", lesson: "chapter-02-lesson-15.json", exerciseId: "ch02-l15-ex01", componentOf: "ومن" },
  { key: "غاسق", lesson: "chapter-19-lesson-02.json", exerciseId: "ch19-l02-ex09" },
  { key: "اذا", lesson: "chapter-19-lesson-02.json", exerciseId: "ch19-l02-ex09" },
  { key: "وقب", lesson: "chapter-19-lesson-02.json", exerciseId: "ch19-l02-ex09" },
  { key: "النفاثات", lesson: "chapter-18-lesson-04.json", exerciseId: "ch18-l04-ex09" },
  { key: "في", lesson: "chapter-02-lesson-05.json", exerciseId: "ch02-l05-ex01" },
  { key: "عقد", exerciseForm: "العقد", lesson: "chapter-18-lesson-04.json", exerciseId: "ch18-l04-ex09" },
  { key: "حاسد", lesson: "chapter-19-lesson-03.json", exerciseId: "ch19-l03-ex09" },
  { key: "حسد", lesson: "chapter-19-lesson-03.json", exerciseId: "ch19-l03-ex09" },
];

module.exports = { AL_FALAQ_COVERAGE };

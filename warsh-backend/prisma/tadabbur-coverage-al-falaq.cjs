// Canonical curriculum evidence for complete word-level coverage of Al-Falaq.
// Shared vocabulary points to its first real teaching lesson; surah-specific
// vocabulary is completed and assessed in Chapter 19 (الفلق in Lesson 1, the rest
// in the review's glossed Al-Falaq word bridge; none of it is in the chapter test).
const AL_FALAQ_COVERAGE = [
  { key: "قل", lesson: "chapter-16-lesson-04.json", exerciseId: "ch16-l04-ex09" },
  { key: "اعوذ", lesson: "chapter-18-lesson-06-review.json", exerciseId: "ch18-l06-ex01" },
  { key: "ب", lesson: "chapter-02-lesson-14.json", exerciseId: "ch02-l14-ex01", componentOf: "برب" },
  { key: "رب", lesson: "chapter-03-lesson-03.json", exerciseId: "ch03-l02-ex09" },
  { key: "الفلق", lesson: "chapter-19-lesson-01.json", exerciseId: "ch19-l01-ex02" },
  { key: "من", lesson: "chapter-02-lesson-07.json", exerciseId: "ch02-l07-ex01" },
  { key: "شر", lesson: "chapter-18-lesson-01.json", exerciseId: "ch18-l01-ex06" },
  { key: "ما", lesson: "chapter-19-lesson-06-review.json", exerciseId: "ch19-l06-ex07" },
  { key: "خلق", lesson: "chapter-12-lesson-04.json", exerciseId: "ch12-l04-ex03" },
  { key: "و", lesson: "chapter-02-lesson-15.json", exerciseId: "ch02-l15-ex01", componentOf: "ومن" },
  { key: "غاسق", lesson: "chapter-19-lesson-06-review.json", exerciseId: "ch19-l06-ex08" },
  { key: "اذا", lesson: "chapter-19-lesson-06-review.json", exerciseId: "ch19-l06-ex08" },
  { key: "وقب", lesson: "chapter-19-lesson-06-review.json", exerciseId: "ch19-l06-ex08" },
  { key: "النفاثات", lesson: "chapter-19-lesson-06-review.json", exerciseId: "ch19-l06-ex09" },
  { key: "في", lesson: "chapter-02-lesson-05.json", exerciseId: "ch02-l05-ex01" },
  { key: "عقد", exerciseForm: "العقد", lesson: "chapter-19-lesson-06-review.json", exerciseId: "ch19-l06-ex09" },
  { key: "حاسد", lesson: "chapter-19-lesson-06-review.json", exerciseId: "ch19-l06-ex10" },
  { key: "حسد", lesson: "chapter-19-lesson-06-review.json", exerciseId: "ch19-l06-ex10" },
];

module.exports = { AL_FALAQ_COVERAGE };

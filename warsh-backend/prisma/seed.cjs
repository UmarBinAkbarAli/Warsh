require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { chapters } = require("./curriculum-book1.cjs");
const { chapters: chapters2 } = require("./curriculum-books2-4.cjs");
const { chapters: chapters3 } = require("./curriculum-books5-6.cjs");
const { chapters: chapters4 } = require("./curriculum-books7-8.cjs");
const { seedVocabulary } = require("./vocabulary-seed.cjs");
const { seedTadabbur } = require("./tadabbur-seed.cjs");
const { localizeMetadata } = require("./urdu-metadata.cjs");
const ch01L01Content = require("./fixtures/chapter-01-lesson-01.json");
const ch01L02Content = require("./fixtures/chapter-01-lesson-02.json");
const ch01L03Content = require("./fixtures/chapter-01-lesson-03.json");
const ch01L04Content = require("./fixtures/chapter-01-lesson-04.json");
const ch02L01Content = require("./fixtures/chapter-02-lesson-01.json");
const ch02L02Content = require("./fixtures/chapter-02-lesson-02.json");
const ch02L03Content = require("./fixtures/chapter-02-lesson-03.json");
const ch02L04Content = require("./fixtures/chapter-02-lesson-04.json");
const ch03L01Content = require("./fixtures/chapter-03-lesson-01.json");
const ch03L02Content = require("./fixtures/chapter-03-lesson-02.json");
const ch03L03Content = require("./fixtures/chapter-03-lesson-03.json");
const ch03L04Content = require("./fixtures/chapter-03-lesson-04.json");
const ch03L05SpokenContent = require("./fixtures/chapter-03-lesson-05-spoken-phrases.json");
const ch04L01Content = require("./fixtures/chapter-04-lesson-01.json");
const ch04L02Content = require("./fixtures/chapter-04-lesson-02.json");
const ch04L03Content = require("./fixtures/chapter-04-lesson-03.json");
const ch04L04Content = require("./fixtures/chapter-04-lesson-04.json");
const ch05L01Content = require("./fixtures/chapter-05-lesson-01.json");
const ch05L02Content = require("./fixtures/chapter-05-lesson-02.json");
const ch05L03Content = require("./fixtures/chapter-05-lesson-03.json");
const ch05L04Content = require("./fixtures/chapter-05-lesson-04.json");
const ch05L05Content = require("./fixtures/chapter-05-lesson-05.json");
const ch06L01Content = require("./fixtures/chapter-06-lesson-01.json");
const ch06L02Content = require("./fixtures/chapter-06-lesson-02.json");
const ch06L03Content = require("./fixtures/chapter-06-lesson-03.json");
const ch06L04Content = require("./fixtures/chapter-06-lesson-04.json");
const ch07L01Content = require("./fixtures/chapter-07-lesson-01.json");
const ch07L02Content = require("./fixtures/chapter-07-lesson-02.json");
const ch07L03Content = require("./fixtures/chapter-07-lesson-03.json");
const ch07L04Content = require("./fixtures/chapter-07-lesson-04.json");
const ch07L05SpokenContent = require("./fixtures/chapter-07-lesson-05-spoken-phrases.json");
const ch08L01Content = require("./fixtures/chapter-08-lesson-01.json");
const ch08L02Content = require("./fixtures/chapter-08-lesson-02.json");
const ch08L03Content = require("./fixtures/chapter-08-lesson-03.json");
const ch08L04Content = require("./fixtures/chapter-08-lesson-04.json");
const ch09L01Content     = require("./fixtures/chapter-09-lesson-01.json");
const ch09L02Content     = require("./fixtures/chapter-09-lesson-02.json");
const ch09L03Content     = require("./fixtures/chapter-09-lesson-03.json");
const ch09L04Content     = require("./fixtures/chapter-09-lesson-04.json");
const ch09L05VerbContent = require("./fixtures/chapter-09-lesson-05-verb-pattern.json");
const ch10L01Content     = require("./fixtures/chapter-10-lesson-01.json");
const ch10L02Content     = require("./fixtures/chapter-10-lesson-02.json");
const ch10L03Content     = require("./fixtures/chapter-10-lesson-03.json");
const ch10L04Content     = require("./fixtures/chapter-10-lesson-04.json");
const ch11L01Content     = require("./fixtures/chapter-11-lesson-01.json");
const ch11L02Content     = require("./fixtures/chapter-11-lesson-02.json");
const ch11L03Content     = require("./fixtures/chapter-11-lesson-03.json");
const ch11L04Content     = require("./fixtures/chapter-11-lesson-04.json");
const ch11L05Content     = require("./fixtures/chapter-11-lesson-05.json");
const ch12L01Content     = require("./fixtures/chapter-12-lesson-01.json");
const ch12L02Content     = require("./fixtures/chapter-12-lesson-02.json");
const ch12L03Content     = require("./fixtures/chapter-12-lesson-03.json");
const ch12L04Content     = require("./fixtures/chapter-12-lesson-04.json");
const ch12L05SpokenContent = require("./fixtures/chapter-12-lesson-05-spoken-phrases.json");
const ch13L01Content     = require("./fixtures/chapter-13-lesson-01.json");
const ch13L02Content     = require("./fixtures/chapter-13-lesson-02.json");
const ch13L03Content     = require("./fixtures/chapter-13-lesson-03.json");
const ch13L04Content     = require("./fixtures/chapter-13-lesson-04.json");
const ch14L01Content     = require("./fixtures/chapter-14-lesson-01.json");
const ch14L02Content     = require("./fixtures/chapter-14-lesson-02.json");
const ch14L03Content     = require("./fixtures/chapter-14-lesson-03.json");
const ch14L04Content     = require("./fixtures/chapter-14-lesson-04.json");
const ch14L05Content     = require("./fixtures/chapter-14-lesson-05.json");
const ch15L01Content     = require("./fixtures/chapter-15-lesson-01.json");
const ch15L02Content     = require("./fixtures/chapter-15-lesson-02.json");
const ch15L03Content     = require("./fixtures/chapter-15-lesson-03.json");
const ch15L04Content     = require("./fixtures/chapter-15-lesson-04.json");
const ch15L05Content     = require("./fixtures/chapter-15-lesson-05.json");
const ch16L01Content     = require("./fixtures/chapter-16-lesson-01.json");
const ch16L02Content     = require("./fixtures/chapter-16-lesson-02.json");
const ch16L03Content     = require("./fixtures/chapter-16-lesson-03.json");
const ch16L04Content     = require("./fixtures/chapter-16-lesson-04.json");
const ch16L05Content     = require("./fixtures/chapter-16-lesson-05.json");
const ch17L01Content     = require("./fixtures/chapter-17-lesson-01.json");
const ch17L02Content     = require("./fixtures/chapter-17-lesson-02.json");
const ch17L03Content     = require("./fixtures/chapter-17-lesson-03.json");
const ch17L04Content     = require("./fixtures/chapter-17-lesson-04.json");
const ch17L05Content     = require("./fixtures/chapter-17-lesson-05.json");
const ch17L06Content     = require("./fixtures/chapter-17-lesson-06.json");
const ch18L01Content     = require("./fixtures/chapter-18-lesson-01.json");
const ch18L02Content     = require("./fixtures/chapter-18-lesson-02.json");
const ch18L03Content     = require("./fixtures/chapter-18-lesson-03.json");
const ch18L04Content     = require("./fixtures/chapter-18-lesson-04.json");
const ch18L05Content     = require("./fixtures/chapter-18-lesson-05.json");
const ch18L06Content     = require("./fixtures/chapter-18-lesson-06.json");
const ch19L01Content     = require("./fixtures/chapter-19-lesson-01.json");
const ch19L02Content     = require("./fixtures/chapter-19-lesson-02.json");
const ch19L03Content     = require("./fixtures/chapter-19-lesson-03.json");
const ch19L04Content     = require("./fixtures/chapter-19-lesson-04.json");
const ch19L05Content     = require("./fixtures/chapter-19-lesson-05.json");
const ch19L06Content     = require("./fixtures/chapter-19-lesson-06.json");
const ch20L01Content     = require("./fixtures/chapter-20-lesson-01.json");
const ch20L02Content     = require("./fixtures/chapter-20-lesson-02.json");
const ch20L03Content     = require("./fixtures/chapter-20-lesson-03.json");
const ch20L04Content     = require("./fixtures/chapter-20-lesson-04.json");
const ch20L05Content     = require("./fixtures/chapter-20-lesson-05.json");
const ch21L01Content     = require("./fixtures/chapter-21-lesson-01.json");
const ch21L02Content     = require("./fixtures/chapter-21-lesson-02.json");
const ch21L03Content     = require("./fixtures/chapter-21-lesson-03.json");
const ch21L04Content     = require("./fixtures/chapter-21-lesson-04.json");
const ch21L05Content     = require("./fixtures/chapter-21-lesson-05.json");
const ch22L01Content     = require("./fixtures/chapter-22-lesson-01.json");
const ch22L02Content     = require("./fixtures/chapter-22-lesson-02.json");
const ch22L03Content     = require("./fixtures/chapter-22-lesson-03.json");
const ch22L04Content     = require("./fixtures/chapter-22-lesson-04.json");
const ch22L05Content     = require("./fixtures/chapter-22-lesson-05.json");
const ch23L01Content     = require("./fixtures/chapter-23-lesson-01.json");
const ch23L02Content     = require("./fixtures/chapter-23-lesson-02.json");
const ch23L03Content     = require("./fixtures/chapter-23-lesson-03.json");
const ch23L04Content     = require("./fixtures/chapter-23-lesson-04.json");
const ch24L01Content     = require("./fixtures/chapter-24-lesson-01.json");
const ch24L02Content     = require("./fixtures/chapter-24-lesson-02.json");
const ch24L03Content     = require("./fixtures/chapter-24-lesson-03.json");
const ch24L04Content     = require("./fixtures/chapter-24-lesson-04.json");
const ch24L05Content     = require("./fixtures/chapter-24-lesson-05.json");
const ch24L06Content     = require("./fixtures/chapter-24-lesson-06.json");
const ch25L01Content     = require("./fixtures/chapter-25-lesson-01.json");
const ch25L02Content     = require("./fixtures/chapter-25-lesson-02.json");
const ch25L03Content     = require("./fixtures/chapter-25-lesson-03.json");
const ch25L04Content     = require("./fixtures/chapter-25-lesson-04.json");
const ch25L05Content     = require("./fixtures/chapter-25-lesson-05.json");
const ch25L06Content     = require("./fixtures/chapter-25-lesson-06.json");
const ch26L01Content     = require("./fixtures/chapter-26-lesson-01.json");
const ch26L02Content     = require("./fixtures/chapter-26-lesson-02.json");
const ch26L03Content     = require("./fixtures/chapter-26-lesson-03.json");
const ch26L04Content     = require("./fixtures/chapter-26-lesson-04.json");
const ch27L01Content     = require("./fixtures/chapter-27-lesson-01.json");
const ch27L02Content     = require("./fixtures/chapter-27-lesson-02.json");
const ch27L03Content     = require("./fixtures/chapter-27-lesson-03.json");
const ch27L04Content     = require("./fixtures/chapter-27-lesson-04.json");
const ch27L05Content     = require("./fixtures/chapter-27-lesson-05.json");
const ch28L01Content     = require("./fixtures/chapter-28-lesson-01.json");
const ch28L02Content     = require("./fixtures/chapter-28-lesson-02.json");
const ch28L03Content     = require("./fixtures/chapter-28-lesson-03.json");
const ch28L04Content     = require("./fixtures/chapter-28-lesson-04.json");
const ch28L05Content     = require("./fixtures/chapter-28-lesson-05.json");
const ch29L01Content     = require("./fixtures/chapter-29-lesson-01.json");
const ch29L02Content     = require("./fixtures/chapter-29-lesson-02.json");
const ch29L03Content     = require("./fixtures/chapter-29-lesson-03.json");
const ch29L04Content     = require("./fixtures/chapter-29-lesson-04.json");
const ch29L05Content     = require("./fixtures/chapter-29-lesson-05.json");
const ch29L06Content     = require("./fixtures/chapter-29-lesson-06.json");

const ch30L01Content = require("./fixtures/chapter-30-lesson-01.json");
const ch30L02Content = require("./fixtures/chapter-30-lesson-02.json");
const ch30L03Content = require("./fixtures/chapter-30-lesson-03.json");
const ch30L04Content = require("./fixtures/chapter-30-lesson-04.json");
const ch30L05Content = require("./fixtures/chapter-30-lesson-05.json");
const ch31L01Content = require("./fixtures/chapter-31-lesson-01.json");
const ch31L02Content = require("./fixtures/chapter-31-lesson-02.json");
const ch31L03Content = require("./fixtures/chapter-31-lesson-03.json");
const ch31L04Content = require("./fixtures/chapter-31-lesson-04.json");
const ch31L05Content = require("./fixtures/chapter-31-lesson-05.json");
const ch31L06SpContent = require("./fixtures/chapter-31-lesson-06-spoken-phrases.json");
const ch32L01Content = require("./fixtures/chapter-32-lesson-01.json");
const ch32L02Content = require("./fixtures/chapter-32-lesson-02.json");
const ch32L03Content = require("./fixtures/chapter-32-lesson-03.json");
const ch32L04Content = require("./fixtures/chapter-32-lesson-04.json");
const ch33L01Content = require("./fixtures/chapter-33-lesson-01.json");
const ch33L02Content = require("./fixtures/chapter-33-lesson-02.json");
const ch33L03Content = require("./fixtures/chapter-33-lesson-03.json");
const ch33L04Content = require("./fixtures/chapter-33-lesson-04.json");
const ch33L05Content = require("./fixtures/chapter-33-lesson-05.json");
const ch34L01Content = require("./fixtures/chapter-34-lesson-01.json");
const ch34L02Content = require("./fixtures/chapter-34-lesson-02.json");
const ch34L03Content = require("./fixtures/chapter-34-lesson-03.json");
const ch34L04Content = require("./fixtures/chapter-34-lesson-04.json");
const ch34L05Content = require("./fixtures/chapter-34-lesson-05.json");
const ch34L06Content = require("./fixtures/chapter-34-lesson-06.json");
const ch34L07Content = require("./fixtures/chapter-34-lesson-07.json");
const ch35L01Content = require("./fixtures/chapter-35-lesson-01.json");
const ch35L02Content = require("./fixtures/chapter-35-lesson-02.json");
const ch35L03Content = require("./fixtures/chapter-35-lesson-03.json");
const ch35L04Content = require("./fixtures/chapter-35-lesson-04.json");
const ch35L05Content = require("./fixtures/chapter-35-lesson-05.json");
const ch36L01Content = require("./fixtures/chapter-36-lesson-01.json");
const ch36L02Content = require("./fixtures/chapter-36-lesson-02.json");
const ch36L03Content = require("./fixtures/chapter-36-lesson-03.json");
const ch36L04Content = require("./fixtures/chapter-36-lesson-04.json");
const ch36L05Content = require("./fixtures/chapter-36-lesson-05.json");
const ch36L06Content = require("./fixtures/chapter-36-lesson-06.json");
const ch37L01Content = require("./fixtures/chapter-37-lesson-01.json");
const ch37L02Content = require("./fixtures/chapter-37-lesson-02.json");
const ch37L03Content = require("./fixtures/chapter-37-lesson-03.json");
const ch37L04Content = require("./fixtures/chapter-37-lesson-04.json");
const ch37L05Content = require("./fixtures/chapter-37-lesson-05.json");
const ch38L01Content = require("./fixtures/chapter-38-lesson-01.json");
const ch38L02Content = require("./fixtures/chapter-38-lesson-02.json");
const ch38L03Content = require("./fixtures/chapter-38-lesson-03.json");
const ch38L04Content = require("./fixtures/chapter-38-lesson-04.json");
const ch38L05Content = require("./fixtures/chapter-38-lesson-05.json");
const ch39L01Content = require("./fixtures/chapter-39-lesson-01.json");
const ch39L02Content = require("./fixtures/chapter-39-lesson-02.json");
const ch39L03Content = require("./fixtures/chapter-39-lesson-03.json");
const ch39L04Content = require("./fixtures/chapter-39-lesson-04.json");
const ch39L05Content = require("./fixtures/chapter-39-lesson-05.json");
const ch40L01Content = require("./fixtures/chapter-40-lesson-01.json");
const ch40L02Content = require("./fixtures/chapter-40-lesson-02.json");
const ch40L03Content = require("./fixtures/chapter-40-lesson-03.json");
const ch40L04Content = require("./fixtures/chapter-40-lesson-04.json");
const ch40L05Content = require("./fixtures/chapter-40-lesson-05.json");
const ch40L06SpContent = require("./fixtures/chapter-40-lesson-06-spoken-phrases.json");
const ch41L01Content = require("./fixtures/chapter-41-lesson-01.json");
const ch41L02Content = require("./fixtures/chapter-41-lesson-02.json");
const ch41L03Content = require("./fixtures/chapter-41-lesson-03.json");
const ch41L04Content = require("./fixtures/chapter-41-lesson-04.json");
const ch41L05Content = require("./fixtures/chapter-41-lesson-05.json");
const ch42L01Content = require("./fixtures/chapter-42-lesson-01.json");
const ch42L02Content = require("./fixtures/chapter-42-lesson-02.json");
const ch42L03Content = require("./fixtures/chapter-42-lesson-03.json");
const ch42L04Content = require("./fixtures/chapter-42-lesson-04.json");
const ch42L05Content = require("./fixtures/chapter-42-lesson-05.json");
const ch43L01Content = require("./fixtures/chapter-43-lesson-01.json");
const ch43L02Content = require("./fixtures/chapter-43-lesson-02.json");
const ch43L03Content = require("./fixtures/chapter-43-lesson-03.json");
const ch43L04Content = require("./fixtures/chapter-43-lesson-04.json");
const ch43L05Content = require("./fixtures/chapter-43-lesson-05.json");
const ch44L01Content = require("./fixtures/chapter-44-lesson-01.json");
const ch44L02Content = require("./fixtures/chapter-44-lesson-02.json");
const ch44L03Content = require("./fixtures/chapter-44-lesson-03.json");
const ch44L04Content = require("./fixtures/chapter-44-lesson-04.json");
const ch44L05Content = require("./fixtures/chapter-44-lesson-05.json");
const ch44L06Content = require("./fixtures/chapter-44-lesson-06.json");
const ch44L07Content = require("./fixtures/chapter-44-lesson-07.json");
const ch45L01Content = require("./fixtures/chapter-45-lesson-01.json");
const ch45L02Content = require("./fixtures/chapter-45-lesson-02.json");
const ch45L03Content = require("./fixtures/chapter-45-lesson-03.json");
const ch45L04Content = require("./fixtures/chapter-45-lesson-04.json");
const ch45L05Content = require("./fixtures/chapter-45-lesson-05.json");
const ch45L06Content = require("./fixtures/chapter-45-lesson-06.json");
const ch45L07Content = require("./fixtures/chapter-45-lesson-07.json");
const ch46L01Content = require("./fixtures/chapter-46-lesson-01.json");
const ch46L02Content = require("./fixtures/chapter-46-lesson-02.json");
const ch46L03Content = require("./fixtures/chapter-46-lesson-03.json");
const ch46L04Content = require("./fixtures/chapter-46-lesson-04.json");
const ch46L05Content = require("./fixtures/chapter-46-lesson-05.json");
const ch46L06Content = require("./fixtures/chapter-46-lesson-06.json");
const ch47L01Content = require("./fixtures/chapter-47-lesson-01.json");
const ch47L02Content = require("./fixtures/chapter-47-lesson-02.json");
const ch47L03Content = require("./fixtures/chapter-47-lesson-03.json");
const ch47L04Content = require("./fixtures/chapter-47-lesson-04.json");
const ch47L05Content = require("./fixtures/chapter-47-lesson-05.json");
const ch47L06R10Content = require("./fixtures/chapter-47-lesson-06-review.json");
const ch48L01Content = require("./fixtures/chapter-48-lesson-01.json");
const ch48L02Content = require("./fixtures/chapter-48-lesson-02.json");
const ch48L03Content = require("./fixtures/chapter-48-lesson-03.json");
const ch48L04Content = require("./fixtures/chapter-48-lesson-04.json");
const ch48L05SpContent = require("./fixtures/chapter-48-lesson-05-spoken-phrases.json");
const ch49L01Content = require("./fixtures/chapter-49-lesson-01.json");
const ch49L02Content = require("./fixtures/chapter-49-lesson-02.json");
const ch49L03Content = require("./fixtures/chapter-49-lesson-03.json");
const ch49L04Content = require("./fixtures/chapter-49-lesson-04.json");
const ch49L05Content = require("./fixtures/chapter-49-lesson-05.json");
const ch50L01Content = require("./fixtures/chapter-50-lesson-01.json");
const ch50L02Content = require("./fixtures/chapter-50-lesson-02.json");
const ch50L03Content = require("./fixtures/chapter-50-lesson-03.json");
const ch50L04Content = require("./fixtures/chapter-50-lesson-04.json");
const ch50L05Content = require("./fixtures/chapter-50-lesson-05.json");
const ch51L01Content = require("./fixtures/chapter-51-lesson-01.json");
const ch51L02Content = require("./fixtures/chapter-51-lesson-02.json");
const ch51L03Content = require("./fixtures/chapter-51-lesson-03.json");
const ch51L04Content = require("./fixtures/chapter-51-lesson-04.json");
const ch51L05Content = require("./fixtures/chapter-51-lesson-05.json");
const ch52L01Content = require("./fixtures/chapter-52-lesson-01.json");
const ch52L02Content = require("./fixtures/chapter-52-lesson-02.json");
const ch52L03Content = require("./fixtures/chapter-52-lesson-03.json");
const ch52L04Content = require("./fixtures/chapter-52-lesson-04.json");
const ch52L05Content = require("./fixtures/chapter-52-lesson-05.json");
const ch53L01Content = require("./fixtures/chapter-53-lesson-01.json");
const ch53L02Content = require("./fixtures/chapter-53-lesson-02.json");
const ch53L03Content = require("./fixtures/chapter-53-lesson-03.json");
const ch53L04Content = require("./fixtures/chapter-53-lesson-04.json");
const ch54L01Content = require("./fixtures/chapter-54-lesson-01.json");
const ch54L02Content = require("./fixtures/chapter-54-lesson-02.json");
const ch54L03Content = require("./fixtures/chapter-54-lesson-03.json");
const ch54L04Content = require("./fixtures/chapter-54-lesson-04.json");
const ch55L01Content = require("./fixtures/chapter-55-lesson-01.json");
const ch55L02Content = require("./fixtures/chapter-55-lesson-02.json");
const ch55L03Content = require("./fixtures/chapter-55-lesson-03.json");
const ch55L04Content = require("./fixtures/chapter-55-lesson-04.json");
const ch55L05Content = require("./fixtures/chapter-55-lesson-05.json");
const ch55L06Content = require("./fixtures/chapter-55-lesson-06.json");
const ch55L07Content = require("./fixtures/chapter-55-lesson-07.json");
const ch55L08Content = require("./fixtures/chapter-55-lesson-08.json");
const ch56L01Content = require("./fixtures/chapter-56-lesson-01.json");
const ch56L02Content = require("./fixtures/chapter-56-lesson-02.json");
const ch56L03Content = require("./fixtures/chapter-56-lesson-03.json");
const ch56L04Content = require("./fixtures/chapter-56-lesson-04.json");
const ch56L05Content = require("./fixtures/chapter-56-lesson-05.json");
const ch56L06Content = require("./fixtures/chapter-56-lesson-06.json");
const ch56L07Content = require("./fixtures/chapter-56-lesson-07.json");
const ch56L08Content = require("./fixtures/chapter-56-lesson-08.json");
const ch56L09Content = require("./fixtures/chapter-56-lesson-09.json");
const ch57L01Content = require("./fixtures/chapter-57-lesson-01.json");
const ch57L02Content = require("./fixtures/chapter-57-lesson-02.json");
const ch57L03Content = require("./fixtures/chapter-57-lesson-03.json");
const ch57L04Content = require("./fixtures/chapter-57-lesson-04.json");
const ch57L05Content = require("./fixtures/chapter-57-lesson-05.json");
const ch57L06Content = require("./fixtures/chapter-57-lesson-06.json");
const ch57L07Content = require("./fixtures/chapter-57-lesson-07.json");
const ch57L08Content = require("./fixtures/chapter-57-lesson-08.json");
const ch57L09Content = require("./fixtures/chapter-57-lesson-09.json");
const ch57L10SpContent = require("./fixtures/chapter-57-lesson-10-spoken-phrases.json");
const ch58L01Content = require("./fixtures/chapter-58-lesson-01.json");
const ch58L02Content = require("./fixtures/chapter-58-lesson-02.json");
const ch58L03Content = require("./fixtures/chapter-58-lesson-03.json");
const ch58L04Content = require("./fixtures/chapter-58-lesson-04.json");
const ch58L05Content = require("./fixtures/chapter-58-lesson-05.json");
const ch58L06Content = require("./fixtures/chapter-58-lesson-06.json");
const ch59L01Content = require("./fixtures/chapter-59-lesson-01.json");
const ch59L02Content = require("./fixtures/chapter-59-lesson-02.json");
const ch59L03Content = require("./fixtures/chapter-59-lesson-03.json");
const ch59L04Content = require("./fixtures/chapter-59-lesson-04.json");
const ch59L05Content = require("./fixtures/chapter-59-lesson-05.json");
const ch60L01Content = require("./fixtures/chapter-60-lesson-01.json");
const ch60L02Content = require("./fixtures/chapter-60-lesson-02.json");
const ch60L03Content = require("./fixtures/chapter-60-lesson-03.json");
const ch60L04Content = require("./fixtures/chapter-60-lesson-04.json");
const ch60L05Content = require("./fixtures/chapter-60-lesson-05.json");
const ch60L06Content = require("./fixtures/chapter-60-lesson-06.json");
const ch61L01Content = require("./fixtures/chapter-61-lesson-01.json");
const ch61L02Content = require("./fixtures/chapter-61-lesson-02.json");
const ch61L03Content = require("./fixtures/chapter-61-lesson-03.json");
const ch61L04Content = require("./fixtures/chapter-61-lesson-04.json");
const ch61L05Content = require("./fixtures/chapter-61-lesson-05.json");
const ch61L06Content = require("./fixtures/chapter-61-lesson-06.json");
const ch61L07Content = require("./fixtures/chapter-61-lesson-07.json");
const ch62L01Content = require("./fixtures/chapter-62-lesson-01.json");
const ch62L02Content = require("./fixtures/chapter-62-lesson-02.json");
const ch62L03Content = require("./fixtures/chapter-62-lesson-03.json");
const ch62L04Content = require("./fixtures/chapter-62-lesson-04.json");
const ch62L05SpokenContent = require("./fixtures/chapter-62-lesson-05-spoken-phrases.json");
const ch63L01Content = require("./fixtures/chapter-63-lesson-01.json");
const ch63L02Content = require("./fixtures/chapter-63-lesson-02.json");
const ch63L03Content = require("./fixtures/chapter-63-lesson-03.json");
const ch63L04Content = require("./fixtures/chapter-63-lesson-04.json");
const ch63L05Content = require("./fixtures/chapter-63-lesson-05.json");
const ch64L01Content = require("./fixtures/chapter-64-lesson-01.json");
const ch64L02Content = require("./fixtures/chapter-64-lesson-02.json");
const ch64L03Content = require("./fixtures/chapter-64-lesson-03.json");
const ch64L04Content = require("./fixtures/chapter-64-lesson-04.json");
const ch64L05Content = require("./fixtures/chapter-64-lesson-05.json");
const ch65L01Content = require("./fixtures/chapter-65-lesson-01.json");
const ch65L02Content = require("./fixtures/chapter-65-lesson-02.json");
const ch65L03Content = require("./fixtures/chapter-65-lesson-03.json");
const ch65L04Content = require("./fixtures/chapter-65-lesson-04.json");
const ch65L05Content = require("./fixtures/chapter-65-lesson-05.json");
const ch65L06Content = require("./fixtures/chapter-65-lesson-06.json");
const ch66L01Content = require("./fixtures/chapter-66-lesson-01.json");
const ch66L02Content = require("./fixtures/chapter-66-lesson-02.json");
const ch66L03Content = require("./fixtures/chapter-66-lesson-03.json");
const ch66L04Content = require("./fixtures/chapter-66-lesson-04.json");
const ch66L05Content = require("./fixtures/chapter-66-lesson-05.json");
const ch66L06Content = require("./fixtures/chapter-66-lesson-06.json");
const ch67L01Content = require("./fixtures/chapter-67-lesson-01.json");
const ch67L02Content = require("./fixtures/chapter-67-lesson-02.json");
const ch67L03Content = require("./fixtures/chapter-67-lesson-03.json");
const ch67L04Content = require("./fixtures/chapter-67-lesson-04.json");
const ch67L05Content = require("./fixtures/chapter-67-lesson-05.json");
const ch68L01Content = require("./fixtures/chapter-68-lesson-01.json");
const ch68L02Content = require("./fixtures/chapter-68-lesson-02.json");
const ch68L03Content = require("./fixtures/chapter-68-lesson-03.json");
const ch68L04Content = require("./fixtures/chapter-68-lesson-04.json");
const ch68L05Content = require("./fixtures/chapter-68-lesson-05.json");
const ch68L06Content = require("./fixtures/chapter-68-lesson-06.json");
const ch69L01Content = require("./fixtures/chapter-69-lesson-01.json");
const ch69L02Content = require("./fixtures/chapter-69-lesson-02.json");
const ch69L03Content = require("./fixtures/chapter-69-lesson-03.json");
const ch69L04Content = require("./fixtures/chapter-69-lesson-04.json");
const ch69L05Content = require("./fixtures/chapter-69-lesson-05.json");
const ch70L01Content = require("./fixtures/chapter-70-lesson-01.json");
const ch70L02Content = require("./fixtures/chapter-70-lesson-02.json");
const ch70L03Content = require("./fixtures/chapter-70-lesson-03.json");
const ch70L04Content = require("./fixtures/chapter-70-lesson-04.json");
const ch70L05Content = require("./fixtures/chapter-70-lesson-05.json");
const ch70L06Content = require("./fixtures/chapter-70-lesson-06.json");
const ch70L07SpContent = require("./fixtures/chapter-70-lesson-07-spoken-phrases.json");
const ch71L01Content = require("./fixtures/chapter-71-lesson-01.json");
const ch71L02Content = require("./fixtures/chapter-71-lesson-02.json");
const ch71L03Content = require("./fixtures/chapter-71-lesson-03.json");
const ch71L04Content = require("./fixtures/chapter-71-lesson-04.json");
const ch71L05Content = require("./fixtures/chapter-71-lesson-05.json");
const ch71L06Content = require("./fixtures/chapter-71-lesson-06.json");
const ch71L07Content = require("./fixtures/chapter-71-lesson-07.json");
const ch72L01Content = require("./fixtures/chapter-72-lesson-01.json");
const ch72L02Content = require("./fixtures/chapter-72-lesson-02.json");
const ch72L03Content = require("./fixtures/chapter-72-lesson-03.json");
const ch72L04Content = require("./fixtures/chapter-72-lesson-04.json");
const ch72L05Content = require("./fixtures/chapter-72-lesson-05.json");
const ch72L06Content = require("./fixtures/chapter-72-lesson-06.json");
const ch72L07Content = require("./fixtures/chapter-72-lesson-07.json");
const ch72L08Content = require("./fixtures/chapter-72-lesson-08-review.json");

const ACHIEVEMENTS = [
  { key: "first_lesson",           title: "الخُطْوَة الأُولَى",            description: "Complete your very first lesson",                    icon: "footsteps-outline",   xpReward: 25  },
  { key: "first_chapter",          title: "إِكْمَال الفَصْل الأَوَّل",     description: "Complete your first full chapter",                    icon: "book-outline",        xpReward: 50  },
  { key: "streak_3",               title: "ثَلَاثَة أَيَّام",               description: "Study 3 days in a row",                               icon: "flame-outline",       xpReward: 15  },
  { key: "streak_7",               title: "أُسْبُوع",                       description: "Keep a 7-day streak",                                  icon: "star-outline",        xpReward: 25  },
  { key: "streak_30",              title: "شَهْر كَامِل",                   description: "Keep a 30-day streak",                                 icon: "trophy-outline",      xpReward: 100 },
  { key: "xp_100",                 title: "عَالِم نَاشِئ",                  description: "Earn 100 points",                                      icon: "medal-outline",       xpReward: 10  },
  { key: "xp_500",                 title: "عَالِم فِضِّيّ",                 description: "Earn 500 points",                                      icon: "medal-outline",       xpReward: 25  },
  { key: "xp_1000",                title: "عَالِم ذَهَبِيّ",                description: "Earn 1,000 points",                                    icon: "medal-outline",       xpReward: 50  },
  { key: "lessons_10",             title: "عَشْرَة دُرُوس",                 description: "Complete 10 lessons",                                  icon: "library-outline",     xpReward: 20  },
  { key: "first_noor",             title: "أَوَّل سُؤَال",                  description: "Send your first message to Ustaad Noor",               icon: "chatbubble-outline",  xpReward: 10  },
  { key: "first_shadow_repeat",    title: "أَوَّل مُحَاكَاة",               description: "Complete your first speaking exercise",                icon: "mic-outline",         xpReward: 10  },
  { key: "first_spoken_lesson",    title: "أَوَّل دَرْس كَلَام",            description: "Complete your first spoken phrases lesson",            icon: "chatbubbles-outline", xpReward: 25  },
  { key: "phrases_10",             title: "عَشْرَة جُمَل",                  description: "Learn to say 10 phrases",                              icon: "mic-outline",         xpReward: 15  },
  { key: "phrases_50",             title: "خَمْسُونَ جُمْلَة",              description: "Learn to say 50 phrases",                              icon: "mic-outline",         xpReward: 25  },
  { key: "phrases_100",            title: "مِئَة جُمْلَة",                  description: "Learn to say 100 phrases",                             icon: "mic-outline",         xpReward: 50  },
  { key: "phrases_250",            title: "مِئَتَا وَخَمْسُونَ جُمْلَة",    description: "Learn to say 250 phrases",                             icon: "mic-outline",         xpReward: 100 },
  { key: "phrases_500",            title: "خَمْسُمِئَة جُمْلَة",            description: "Learn to say 500 phrases",                             icon: "mic-outline",         xpReward: 200 },
];

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || ""
});

const prisma = new PrismaClient({ adapter });

const PROGRESS_PRIORITY = {
  NOT_STARTED: 0,
  SKIPPED_BY_PLACEMENT: 1,
  COMPLETED: 2,
};

async function waitForNeon(retries = 8, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`Neon cold-start — waiting ${delayMs / 1000}s (attempt ${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, delayMs));
      await prisma.$disconnect();
    }
  }
}

function chooseProgressData(existing, incoming) {
  if (!existing) return incoming;

  const existingStatus = existing.status || (existing.completed ? "COMPLETED" : "NOT_STARTED");
  const incomingStatus = incoming.status || (incoming.completed ? "COMPLETED" : "NOT_STARTED");
  const existingPriority = PROGRESS_PRIORITY[existingStatus] ?? 0;
  const incomingPriority = PROGRESS_PRIORITY[incomingStatus] ?? 0;

  if (incomingPriority > existingPriority) return incoming;
  if (incomingPriority < existingPriority) return null;

  return {
    ...incoming,
    attempts: Math.max(existing.attempts ?? 0, incoming.attempts ?? 0),
    xpEarned: Math.max(existing.xpEarned ?? 0, incoming.xpEarned ?? 0),
    completedAt: existing.completedAt ?? incoming.completedAt,
  };
}

async function cleanupObsoleteAuthoredLessons(stableLessons) {
  const stableLessonIds = stableLessons.map((lesson) => lesson.id);
  const chapterIds = Array.from(new Set(stableLessons.map((lesson) => lesson.chapterId)));
  const stableByChapterOrder = new Map(
    stableLessons.map((lesson) => [`${lesson.chapterId}:${lesson.order}`, lesson])
  );

  const obsoleteLessons = await prisma.lesson.findMany({
    where: {
      chapterId: { in: chapterIds },
      id: { notIn: stableLessonIds },
    },
    select: {
      id: true,
      chapterId: true,
      order: true,
      progress: {
        select: {
          userId: true,
          completed: true,
          status: true,
          score: true,
          attempts: true,
          xpEarned: true,
          completedAt: true,
        },
      },
    },
  });

  if (obsoleteLessons.length === 0) return;

  for (const obsoleteLesson of obsoleteLessons) {
    const stableLesson = stableByChapterOrder.get(`${obsoleteLesson.chapterId}:${obsoleteLesson.order}`);
    if (!stableLesson) continue;

    for (const progress of obsoleteLesson.progress) {
      const existing = await prisma.progress.findUnique({
        where: { userId_lessonId: { userId: progress.userId, lessonId: stableLesson.id } },
      });
      const incoming = {
        completed: progress.completed,
        status: progress.status,
        score: progress.score,
        attempts: progress.attempts,
        xpEarned: progress.xpEarned,
        completedAt: progress.completedAt,
      };
      const merged = chooseProgressData(existing, incoming);

      if (merged) {
        await prisma.progress.upsert({
          where: { userId_lessonId: { userId: progress.userId, lessonId: stableLesson.id } },
          create: {
            userId: progress.userId,
            lessonId: stableLesson.id,
            ...merged,
          },
          update: merged,
        });
      }
    }
  }

  const obsoleteLessonIds = obsoleteLessons.map((lesson) => lesson.id);
  await prisma.$transaction([
    prisma.progress.deleteMany({ where: { lessonId: { in: obsoleteLessonIds } } }),
    prisma.lesson.deleteMany({ where: { id: { in: obsoleteLessonIds } } }),
  ]);

  console.log(`Removed ${obsoleteLessonIds.length} obsolete duplicate lesson row(s) from fixture-authored chapters.`);
}

async function main() {
  await waitForNeon();

  const userCount = await prisma.user.count();
  const existingVocabularyMedia = await prisma.vocabularyWord.findMany({
    where: {
      OR: [
        { imageUrl: { not: null } },
        { audioUrl: { not: null } },
      ],
    },
    select: {
      arabicPlain: true,
      transliteration: true,
      sortOrder: true,
      imageUrl: true,
      audioUrl: true,
    },
  });

  if (userCount === 0) {
    // No users — safe to do a full clean reset before seeding
    console.log("No users found — performing full reset...");
    await prisma.userSurahProgress.deleteMany();
    await prisma.userVocabularyWord.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.streak.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.chapter.deleteMany();
    await prisma.user.deleteMany();
    await prisma.vocabularyWord.deleteMany();
    await prisma.tadabburSurah.deleteMany();
  } else {
    // Users exist — only refresh vocabulary/tadabbur; preserve all user progress
    console.log(`${userCount} user(s) found — preserving accounts and progress, refreshing vocabulary/tadabbur...`);
    await prisma.userSurahProgress.deleteMany();
    await prisma.userVocabularyWord.deleteMany();
    await prisma.vocabularyWord.deleteMany();
    await prisma.tadabburSurah.deleteMany();
  }

  // Upsert achievements by key (safe for both modes)
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  // Upsert chapters by order — stable across seed runs
  const allChapters = [...chapters, ...chapters2, ...chapters3, ...chapters4];
  const chapterIdByOrder = new Map();

  for (const chapterData of allChapters) {
    const { lessons: _unused, ...chapterFields } = chapterData;
    const localizedChapterFields = {
      ...chapterFields,
      titleUr: chapterFields.titleUr ?? localizeMetadata(chapterFields.title),
      descriptionUr: chapterFields.descriptionUr ?? localizeMetadata(chapterFields.description),
    };
    const created = await prisma.chapter.upsert({
      where: { order: chapterFields.order },
      update: localizedChapterFields,
      create: localizedChapterFields,
    });
    chapterIdByOrder.set(created.order, created.id);
  }

  // Upsert lessons with stable IDs (ch01-l01 … ch08-l04).
  // Stable IDs mean progress records survive future seed runs.
  const ch1Id = chapterIdByOrder.get(1);
  const ch2Id = chapterIdByOrder.get(2);
  const ch3Id = chapterIdByOrder.get(3);
  const ch4Id = chapterIdByOrder.get(4);
  const ch5Id = chapterIdByOrder.get(5);
  const ch6Id = chapterIdByOrder.get(6);
  const ch7Id = chapterIdByOrder.get(7);
  const ch8Id = chapterIdByOrder.get(8);
  const ch9Id  = chapterIdByOrder.get(9);
  const ch10Id = chapterIdByOrder.get(10);
  const ch11Id = chapterIdByOrder.get(11);
  const ch12Id = chapterIdByOrder.get(12);
  const ch13Id = chapterIdByOrder.get(13);
  const ch14Id = chapterIdByOrder.get(14);
  const ch15Id = chapterIdByOrder.get(15);
  const ch16Id = chapterIdByOrder.get(16);
  const ch17Id = chapterIdByOrder.get(17);
  const ch18Id = chapterIdByOrder.get(18);
  const ch19Id = chapterIdByOrder.get(19);
  const ch20Id = chapterIdByOrder.get(20);
  const ch21Id = chapterIdByOrder.get(21);
  const ch22Id = chapterIdByOrder.get(22);
  const ch23Id = chapterIdByOrder.get(23);
  const ch24Id = chapterIdByOrder.get(24);
  const ch25Id = chapterIdByOrder.get(25);
  const ch26Id = chapterIdByOrder.get(26);
  const ch27Id = chapterIdByOrder.get(27);
  const ch28Id = chapterIdByOrder.get(28);
  const ch29Id = chapterIdByOrder.get(29);
  const ch30Id = chapterIdByOrder.get(30);
  const ch31Id = chapterIdByOrder.get(31);
  const ch32Id = chapterIdByOrder.get(32);
  const ch33Id = chapterIdByOrder.get(33);
  const ch34Id = chapterIdByOrder.get(34);
  const ch35Id = chapterIdByOrder.get(35);
  const ch36Id = chapterIdByOrder.get(36);
  const ch37Id = chapterIdByOrder.get(37);
  const ch38Id = chapterIdByOrder.get(38);
  const ch39Id = chapterIdByOrder.get(39);
  const ch40Id = chapterIdByOrder.get(40);
  const ch41Id = chapterIdByOrder.get(41);
  const ch42Id = chapterIdByOrder.get(42);
  const ch43Id = chapterIdByOrder.get(43);
  const ch44Id = chapterIdByOrder.get(44);
  const ch45Id = chapterIdByOrder.get(45);
  const ch46Id = chapterIdByOrder.get(46);
  const ch47Id = chapterIdByOrder.get(47);
  const ch48Id = chapterIdByOrder.get(48);
  const ch49Id = chapterIdByOrder.get(49);
  const ch50Id = chapterIdByOrder.get(50);
  const ch51Id = chapterIdByOrder.get(51);
  const ch52Id = chapterIdByOrder.get(52);
  const ch53Id = chapterIdByOrder.get(53);
  const ch54Id = chapterIdByOrder.get(54);
  const ch55Id = chapterIdByOrder.get(55);
  const ch56Id = chapterIdByOrder.get(56);
  const ch57Id = chapterIdByOrder.get(57);
  const ch58Id = chapterIdByOrder.get(58);
  const ch59Id = chapterIdByOrder.get(59);
  const ch60Id = chapterIdByOrder.get(60);
  const ch61Id = chapterIdByOrder.get(61);
  const ch62Id = chapterIdByOrder.get(62);
  const ch63Id = chapterIdByOrder.get(63);
  const ch64Id = chapterIdByOrder.get(64);
  const ch65Id = chapterIdByOrder.get(65);
  const ch66Id = chapterIdByOrder.get(66);
  const ch67Id = chapterIdByOrder.get(67);
  const ch68Id = chapterIdByOrder.get(68);
  const ch69Id = chapterIdByOrder.get(69);
  const ch70Id = chapterIdByOrder.get(70);
  const ch71Id = chapterIdByOrder.get(71);
  const ch72Id = chapterIdByOrder.get(72);


  const lessons = [
    // Chapter 1
    { id: "ch01-l01", chapterId: ch1Id, order: 1, title: "First Encounter with هَذَا",           titleAr: "اللقاء الأول مع هَذَا",                    template: "STANDARD", xpReward: ch01L01Content._meta?.xp_reward ?? 10, content: ch01L01Content },
    { id: "ch01-l02", chapterId: ch1Id, order: 2, title: "That, What, and Who — ذٰلِكَ، مَا، مَنْ", titleAr: "ذٰلِكَ وَمَا وَمَنْ",                        template: "STANDARD", xpReward: ch01L02Content._meta?.xp_reward ?? 10, content: ch01L02Content },
    { id: "ch01-l03", chapterId: ch1Id, order: 3, title: "Feminine Forms — هَذِهِ and تِلْكَ",      titleAr: "هَذِهِ وَتِلْكَ",                            template: "STANDARD", xpReward: ch01L03Content._meta?.xp_reward ?? 10, content: ch01L03Content },
    { id: "ch01-l04", chapterId: ch1Id, order: 4, title: "Chapter 1 Review",                      titleAr: "مُرَاجَعَة الفَصْل الأَوَّل",                template: "REVIEW",   xpReward: ch01L04Content._meta?.xp_reward ?? 20, content: ch01L04Content },
    // Chapter 2
    { id: "ch02-l01", chapterId: ch2Id, order: 1, title: "Tanween — The Sound of 'A'",            titleAr: "التَّنْوِين — صَوْتُ النَّكِرَة",            template: "STANDARD", xpReward: ch02L01Content._meta?.xp_reward ?? 10, content: ch02L01Content },
    { id: "ch02-l02", chapterId: ch2Id, order: 2, title: "ال — The Definite Article",              titleAr: "التَّعْرِيف بِالْ",                          template: "STANDARD", xpReward: ch02L02Content._meta?.xp_reward ?? 10, content: ch02L02Content },
    { id: "ch02-l03", chapterId: ch2Id, order: 3, title: "أَيْنَ — Where?",                        titleAr: "أَيْنَ وَحُرُوف الْجَرّ",                    template: "STANDARD", xpReward: ch02L03Content._meta?.xp_reward ?? 10, content: ch02L03Content },
    { id: "ch02-l04", chapterId: ch2Id, order: 4, title: "Chapter 2 Review",                      titleAr: "مُرَاجَعَة الفَصْل الثَّانِي",               template: "REVIEW",   xpReward: ch02L04Content._meta?.xp_reward ?? 20, content: ch02L04Content },
    // Chapter 3
    { id: "ch03-l01", chapterId: ch3Id, order: 1, title: "The Idafa Construction — Possession",   titleAr: "الإِضَافَة — الْمِلْكِيَّة",                 template: "STANDARD", xpReward: ch03L01Content._meta?.xp_reward ?? 10, content: ch03L01Content },
    { id: "ch03-l02", chapterId: ch3Id, order: 2, title: "Whose? and O! — لِمَنْ and يَا",         titleAr: "لِمَنْ وَيَا",                               template: "STANDARD", xpReward: ch03L02Content._meta?.xp_reward ?? 10, content: ch03L02Content },
    { id: "ch03-l03", chapterId: ch3Id, order: 3, title: "Basmalah Unlocked — بِسْمِ اللَّهِ",     titleAr: "بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ",     template: "STANDARD", xpReward: ch03L03Content._meta?.xp_reward ?? 10, content: ch03L03Content },
    { id: "ch03-l04", chapterId: ch3Id, order: 4, title: "Chapter 3 Review",                      titleAr: "مُرَاجَعَة الفَصْل الثَّالِث",               template: "REVIEW",   xpReward: ch03L04Content._meta?.xp_reward ?? 20, content: ch03L04Content },
    { id: "ch03-l05", chapterId: ch3Id, order: 5, title: "SP1 — Greetings and Introductions",      titleAr: "السَّلَامُ وَالتَّعَارُف",                    template: "SPOKEN_PHRASES", xpReward: ch03L05SpokenContent._meta?.xp_reward ?? 15, content: ch03L05SpokenContent },
    // Chapter 4
    { id: "ch04-l01", chapterId: ch4Id, order: 1, title: "Adjective Follows Noun",                titleAr: "الصِّفَة بَعْدَ الْمَوْصُوف",                template: "STANDARD", xpReward: ch04L01Content._meta?.xp_reward ?? 10, content: ch04L01Content },
    { id: "ch04-l02", chapterId: ch4Id, order: 2, title: "Definite Agreement — الْبَيْتُ الْكَبِيرُ", titleAr: "الصِّفَة الْمَعْرِفَة",                  template: "STANDARD", xpReward: ch04L02Content._meta?.xp_reward ?? 10, content: ch04L02Content },
    { id: "ch04-l03", chapterId: ch4Id, order: 3, title: "Feminine Agreement — كَلِمَةٌ طَيِّبَةٌ",  titleAr: "الصِّفَة الْمُؤَنَّثَة",                   template: "STANDARD", xpReward: ch04L03Content._meta?.xp_reward ?? 10, content: ch04L03Content },
    { id: "ch04-l04", chapterId: ch4Id, order: 4, title: "Chapter 4 Review",                      titleAr: "مُرَاجَعَة الْفَصْل الرَّابِع",              template: "REVIEW",   xpReward: ch04L04Content._meta?.xp_reward ?? 20, content: ch04L04Content },
    // Chapter 5
    { id: "ch05-l01", chapterId: ch5Id, order: 1, title: "This Feminine — هَٰذِهِ",                 titleAr: "هَٰذِهِ لِلْمُؤَنَّثِ الْقَرِيب",                       template: "STANDARD", xpReward: ch05L01Content._meta?.xp_reward ?? 10, content: ch05L01Content },
    { id: "ch05-l02", chapterId: ch5Id, order: 2, title: "That Feminine — تِلْكَ",                 titleAr: "تِلْكَ لِلْمُؤَنَّثِ الْبَعِيد",                        template: "STANDARD", xpReward: ch05L02Content._meta?.xp_reward ?? 10, content: ch05L02Content },
    { id: "ch05-l03", chapterId: ch5Id, order: 3, title: "Possession — لِي، لَكَ، لَهُ",           titleAr: "لَامُ الْمِلْكِيَّة",                                  template: "STANDARD", xpReward: ch05L03Content._meta?.xp_reward ?? 10, content: ch05L03Content },
    { id: "ch05-l04", chapterId: ch5Id, order: 4, title: "First Verb — ذَهَبَ",                    titleAr: "أَوَّلُ فِعْلٍ — ذَهَبَ",                              template: "STANDARD", xpReward: ch05L04Content._meta?.xp_reward ?? 10, content: ch05L04Content },
    { id: "ch05-l05", chapterId: ch5Id, order: 5, title: "R1 Review — Mid-Book 1",                 titleAr: "المُرَاجَعَةُ الأُولَى — مُنْتَصَفُ الكِتَابِ الأَوَّل",  template: "REVIEW",   xpReward: ch05L05Content._meta?.xp_reward ?? 20, content: ch05L05Content },
    // Chapter 6
    { id: "ch06-l01", chapterId: ch6Id, order: 1, title: "Described Subject — الرَّجُلُ الْكَرِيمُ", titleAr: "المُبْتَدَأ المَوْصُوف",                   template: "STANDARD", xpReward: ch06L01Content._meta?.xp_reward ?? 10, content: ch06L01Content },
    { id: "ch06-l02", chapterId: ch6Id, order: 2, title: "الَّذِي — Who, That, Which",              titleAr: "الَّذِي — اسْمٌ مَوْصُول",                 template: "STANDARD", xpReward: ch06L02Content._meta?.xp_reward ?? 10, content: ch06L02Content },
    { id: "ch06-l03", chapterId: ch6Id, order: 3, title: "الَّذِي with Place Phrases",             titleAr: "الَّذِي مَعَ عِبَارَاتِ المَكَان",          template: "STANDARD", xpReward: ch06L03Content._meta?.xp_reward ?? 10, content: ch06L03Content },
    { id: "ch06-l04", chapterId: ch6Id, order: 4, title: "الَّذِي in Al-A'la",                     titleAr: "الَّذِي فِي سُورَةِ الأَعْلَى",             template: "STANDARD", xpReward: ch06L04Content._meta?.xp_reward ?? 10, content: ch06L04Content },
    // Chapter 7
    { id: "ch07-l01", chapterId: ch7Id, order: 1, title: "My — attached ي",                         titleAr: "كِتَابِي — يَاءُ المُتَكَلِّم",              template: "STANDARD", xpReward: ch07L01Content._meta?.xp_reward ?? 10, content: ch07L01Content },
    { id: "ch07-l02", chapterId: ch7Id, order: 2, title: "Your — attached كَ and كِ",               titleAr: "كِتَابُكَ — كَافُ الخِطَاب",                template: "STANDARD", xpReward: ch07L02Content._meta?.xp_reward ?? 10, content: ch07L02Content },
    { id: "ch07-l03", chapterId: ch7Id, order: 3, title: "His and Her — attached هُ and هَا",        titleAr: "كِتَابُهُ وَمَدْرَسَتُهَا",                 template: "STANDARD", xpReward: ch07L03Content._meta?.xp_reward ?? 10, content: ch07L03Content },
    { id: "ch07-l04", chapterId: ch7Id, order: 4, title: "I Have — عِنْدِي",                         titleAr: "عِنْدِي — المِلْكِيَّة بِعِنْد",             template: "STANDARD", xpReward: ch07L04Content._meta?.xp_reward ?? 10, content: ch07L04Content },
    { id: "ch07-l05", chapterId: ch7Id, order: 5, title: "SP2 - Simple Questions",                    titleAr: "الأَسْئِلَةُ السَّهْلَة",                               template: "SPOKEN_PHRASES", xpReward: ch07L05SpokenContent._meta?.xp_reward ?? 15, content: ch07L05SpokenContent },
    // Chapter 8
    { id: "ch08-l01", chapterId: ch8Id, order: 1, title: "She Went - ذَهَبَتْ",                        titleAr: "ذَهَبَتْ - تَاءُ التَّأْنِيث",                         template: "STANDARD", xpReward: ch08L01Content._meta?.xp_reward ?? 10, content: ch08L01Content },
    { id: "ch08-l02", chapterId: ch8Id, order: 2, title: "Feminine Marker Across Verbs",              titleAr: "تَاءُ التَّأْنِيث فِي الأَفْعَال",                       template: "STANDARD", xpReward: ch08L02Content._meta?.xp_reward ?? 10, content: ch08L02Content },
    { id: "ch08-l03", chapterId: ch8Id, order: 3, title: "الَّتِي - Feminine Relative",                titleAr: "الَّتِي - اسْمٌ مَوْصُولٌ مُؤَنَّث",                    template: "STANDARD", xpReward: ch08L03Content._meta?.xp_reward ?? 10, content: ch08L03Content },
    { id: "ch08-l04", chapterId: ch8Id, order: 4, title: "My Mother - أُمِّي",                         titleAr: "أُمِّي - تَطْبِيقُ المُؤَنَّث",                          template: "STANDARD", xpReward: ch08L04Content._meta?.xp_reward ?? 10, content: ch08L04Content },
    // Chapter 9
    { id: "ch09-l01", chapterId: ch9Id, order: 1, title: "Sound Masculine Plural — مُسْلِمُونَ",    titleAr: "جَمْعُ الْمُذَكَّرِ السَّالِم",          template: "STANDARD",     xpReward: ch09L01Content._meta?.xp_reward     ?? 10, content: ch09L01Content },
    { id: "ch09-l02", chapterId: ch9Id, order: 2, title: "Sound Feminine Plural — مُؤْمِنَاتٌ",    titleAr: "جَمْعُ الْمُؤَنَّثِ السَّالِم",          template: "STANDARD",     xpReward: ch09L02Content._meta?.xp_reward     ?? 10, content: ch09L02Content },
    { id: "ch09-l03", chapterId: ch9Id, order: 3, title: "Broken Plural — كُتُبٌ and بُيُوتٌ",     titleAr: "الْجَمْعُ الْمُكَسَّر",                  template: "STANDARD",     xpReward: ch09L03Content._meta?.xp_reward     ?? 10, content: ch09L03Content },
    { id: "ch09-l04", chapterId: ch9Id, order: 4, title: "Plural Demonstrative — هٰؤُلَاءِ",        titleAr: "هٰؤُلَاءِ لِلْجَمَاعَة",                 template: "STANDARD",     xpReward: ch09L04Content._meta?.xp_reward     ?? 10, content: ch09L04Content },
    { id: "ch09-l05", chapterId: ch9Id, order: 5, title: "Verb Pattern — Past Tense ذَهَبَ",        titleAr: "فِعْل مَاضٍ — نَمُوذَج الصَّرْف",        template: "VERB_PATTERN", xpReward: ch09L05VerbContent._meta?.xp_reward ?? 10, content: ch09L05VerbContent },
    // Chapter 10
    { id: "ch10-l01", chapterId: ch10Id, order: 1, title: "Plural Pronouns — هُمْ and هُنَّ",       titleAr: "هُمْ وَهُنَّ — ضَمِيرُ الْجَمَاعَة",    template: "STANDARD",     xpReward: ch10L01Content._meta?.xp_reward     ?? 10, content: ch10L01Content },
    { id: "ch10-l02", chapterId: ch10Id, order: 2, title: "We — نَحْنُ",                            titleAr: "نَحْنُ — ضَمِيرُ الْمُتَكَلِّمِ الجَمْع", template: "STANDARD",    xpReward: ch10L02Content._meta?.xp_reward     ?? 10, content: ch10L02Content },
    { id: "ch10-l03", chapterId: ch10Id, order: 3, title: "Before — قَبْلَ",                        titleAr: "قَبْلَ — الظَّرْفُ الزَّمَانِيّ",         template: "STANDARD",    xpReward: ch10L03Content._meta?.xp_reward     ?? 10, content: ch10L03Content },
    { id: "ch10-l04", chapterId: ch10Id, order: 4, title: "After — بَعْدَ",                         titleAr: "بَعْدَ — الظَّرْفُ الزَّمَانِيّ",         template: "STANDARD",    xpReward: ch10L04Content._meta?.xp_reward     ?? 10, content: ch10L04Content },
    // Chapter 11
    { id: "ch11-l01", chapterId: ch11Id, order: 1, title: "My Father and My Mother — أَبِي and أُمِّي", titleAr: "أَبِي وَأُمِّي",                    template: "STANDARD",    xpReward: ch11L01Content._meta?.xp_reward     ?? 10, content: ch11L01Content },
    { id: "ch11-l02", chapterId: ch11Id, order: 2, title: "Family Vocabulary",                      titleAr: "كَلِمَاتُ الْعَائِلَة",                   template: "STANDARD",    xpReward: ch11L02Content._meta?.xp_reward     ?? 10, content: ch11L02Content },
    { id: "ch11-l03", chapterId: ch11Id, order: 3, title: "In It — فِيهِ",                          titleAr: "فِيهِ — ضَمِيرُ الْمُفْرَدِ الْغَائِب",  template: "STANDARD",    xpReward: ch11L03Content._meta?.xp_reward     ?? 10, content: ch11L03Content },
    { id: "ch11-l04", chapterId: ch11Id, order: 4, title: "In It — فِيهَا",                         titleAr: "فِيهَا — ضَمِيرُ الْمُؤَنَّث",            template: "STANDARD",    xpReward: ch11L04Content._meta?.xp_reward     ?? 10, content: ch11L04Content },
    { id: "ch11-l05", chapterId: ch11Id, order: 5, title: "Home in the Quran — بُيُوتِكُمْ",        titleAr: "بُيُوتِكُمْ فِي الْقُرْآن",               template: "STANDARD",    xpReward: ch11L05Content._meta?.xp_reward     ?? 10, content: ch11L05Content },
    // Chapter 12
    { id: "ch12-l01", chapterId: ch12Id, order: 1, title: "What Is Your Name?",                     titleAr: "مَا اسْمُكَ؟",                            template: "STANDARD",        xpReward: ch12L01Content._meta?.xp_reward       ?? 10, content: ch12L01Content },
    { id: "ch12-l02", chapterId: ch12Id, order: 2, title: "Where Are You From?",                    titleAr: "مِنْ أَيْنَ أَنْتَ؟",                     template: "STANDARD",        xpReward: ch12L02Content._meta?.xp_reward       ?? 10, content: ch12L02Content },
    { id: "ch12-l03", chapterId: ch12Id, order: 3, title: "Professions",                            titleAr: "الْمِهَن",                                template: "STANDARD",        xpReward: ch12L03Content._meta?.xp_reward       ?? 10, content: ch12L03Content },
    { id: "ch12-l04", chapterId: ch12Id, order: 4, title: "Past Tense as Vocabulary",               titleAr: "الْفِعْل الْمَاضِي لِلتَّعَرُّف",          template: "STANDARD",        xpReward: ch12L04Content._meta?.xp_reward       ?? 10, content: ch12L04Content },
    { id: "ch12-l05", chapterId: ch12Id, order: 5, title: "SP3 - Classroom and Halaqa Phrases",      titleAr: "عِبَارَاتُ الدَّرْسِ وَالحَلْقَة",        template: "SPOKEN_PHRASES",  xpReward: ch12L05SpokenContent._meta?.xp_reward ?? 15, content: ch12L05SpokenContent },
    // Chapter 13
    { id: "ch13-l01", chapterId: ch13Id, order: 1, title: "Sound Masculine Plural — ونَ",            titleAr: "الْمُذَكَّر السَّالِم",                   template: "STANDARD",        xpReward: ch13L01Content._meta?.xp_reward       ?? 10, content: ch13L01Content },
    { id: "ch13-l02", chapterId: ch13Id, order: 2, title: "Sound Feminine Plural — ات",              titleAr: "الْمُؤَنَّث السَّالِم",                   template: "STANDARD",        xpReward: ch13L02Content._meta?.xp_reward       ?? 10, content: ch13L02Content },
    { id: "ch13-l03", chapterId: ch13Id, order: 3, title: "Broken Plurals — Recognition",            titleAr: "الْجَمْع الْمُكَسَّر",                    template: "STANDARD",        xpReward: ch13L03Content._meta?.xp_reward       ?? 10, content: ch13L03Content },
    { id: "ch13-l04", chapterId: ch13Id, order: 4, title: "Non-Human Plurals — Feminine Treatment",  titleAr: "جَمْع غَيْر الْعَاقِل",                   template: "STANDARD",        xpReward: ch13L04Content._meta?.xp_reward       ?? 10, content: ch13L04Content },
    // Chapter 14
    { id: "ch14-l01", chapterId: ch14Id, order: 1, title: "Adjectives with Human Plurals",           titleAr: "الصِّفَة مَعَ الْجَمْعِ الْعَاقِل",        template: "STANDARD",        xpReward: ch14L01Content._meta?.xp_reward       ?? 10, content: ch14L01Content },
    { id: "ch14-l02", chapterId: ch14Id, order: 2, title: "The Non-Human Plural Rule",               titleAr: "جَمْعُ غَيْرِ الْعَاقِل + الصِّفَة الْمُفْرَدَة الْمُؤَنَّثَة", template: "STANDARD", xpReward: ch14L02Content._meta?.xp_reward ?? 10, content: ch14L02Content },
    { id: "ch14-l03", chapterId: ch14Id, order: 3, title: "Non-Human Plurals in the Quran",          titleAr: "جَمْعُ غَيْرِ الْعَاقِل فِي الْقُرْآن",   template: "STANDARD",        xpReward: ch14L03Content._meta?.xp_reward       ?? 10, content: ch14L03Content },
    { id: "ch14-l04", chapterId: ch14Id, order: 4, title: "Human vs Non-Human: Spotting the Diff",   titleAr: "الْعَاقِل وَغَيْرُ الْعَاقِل — الْفَرْق", template: "STANDARD",        xpReward: ch14L04Content._meta?.xp_reward       ?? 10, content: ch14L04Content },
    { id: "ch14-l05", chapterId: ch14Id, order: 5, title: "Chapter 14 Review — Plural Agreement",    titleAr: "مُرَاجَعَة — الصِّفَة مَعَ الْجَمْع",     template: "REVIEW",          xpReward: ch14L05Content._meta?.xp_reward       ?? 10, content: ch14L05Content },
    // Chapter 15
    { id: "ch15-l01", chapterId: ch15Id, order: 1, title: "هَؤُلَاءِ — These (Near)",              titleAr: "هَؤُلَاءِ — هَذِهِ لِلْجَمَاعَة",          template: "STANDARD",        xpReward: ch15L01Content._meta?.xp_reward       ?? 10, content: ch15L01Content },
    { id: "ch15-l02", chapterId: ch15Id, order: 2, title: "أُولَٰئِكَ — Those (Far)",               titleAr: "أُولَٰئِكَ — تِلْكَ لِلْجَمَاعَة",          template: "STANDARD",        xpReward: ch15L02Content._meta?.xp_reward       ?? 10, content: ch15L02Content },
    { id: "ch15-l03", chapterId: ch15Id, order: 3, title: "Contrast: هَؤُلَاءِ vs أُولَٰئِكَ",    titleAr: "الْفَرْقُ بَيْنَ هَؤُلَاءِ وَأُولَٰئِكَ",  template: "STANDARD",        xpReward: ch15L03Content._meta?.xp_reward       ?? 10, content: ch15L03Content },
    { id: "ch15-l04", chapterId: ch15Id, order: 4, title: "Position Words — أَمَام، خَلْف، فَوْق، تَحْت", titleAr: "أَسْمَاءُ الْمَوَاضِع", template: "STANDARD", xpReward: ch15L04Content._meta?.xp_reward ?? 10, content: ch15L04Content },
    { id: "ch15-l05", chapterId: ch15Id, order: 5, title: "Chapter 15 Review",                      titleAr: "مُرَاجَعَة الْفَصْل الْخَامِس عَشَر",      template: "REVIEW",          xpReward: ch15L05Content._meta?.xp_reward       ?? 5,  content: ch15L05Content },
    // Chapter 16
    { id: "ch16-l01", chapterId: ch16Id, order: 1, title: "School Places and Things",              titleAr: "أَمَاكِنُ الْمَدْرَسَةِ وَأَشْيَاؤُهَا",   template: "STANDARD",        xpReward: ch16L01Content._meta?.xp_reward       ?? 10, content: ch16L01Content },
    { id: "ch16-l02", chapterId: ch16Id, order: 2, title: "Teacher and Student",                   titleAr: "الْأُسْتَاذُ وَالطَّالِبُ",               template: "STANDARD",        xpReward: ch16L02Content._meta?.xp_reward       ?? 10, content: ch16L02Content },
    { id: "ch16-l03", chapterId: ch16Id, order: 3, title: "Time Markers — الْيَوْم، أَمْس، غَدًا", titleAr: "الْإِشَارَةُ إِلَى الْوَقْتِ",           template: "STANDARD",        xpReward: ch16L03Content._meta?.xp_reward       ?? 10, content: ch16L03Content },
    { id: "ch16-l04", chapterId: ch16Id, order: 4, title: "Classroom Imperatives",                titleAr: "أَوَامِرُ الْفَصْلِ",                    template: "STANDARD",        xpReward: ch16L04Content._meta?.xp_reward       ?? 10, content: ch16L04Content },
    { id: "ch16-l05", chapterId: ch16Id, order: 5, title: "Chapter 16 Review",                    titleAr: "مُرَاجَعَة الْفَصْل السَّادِس عَشَر",    template: "REVIEW",          xpReward: ch16L05Content._meta?.xp_reward       ?? 5,  content: ch16L05Content },
    // Chapter 17
    { id: "ch17-l01", chapterId: ch17Id, order: 1, title: "أَكَلَ and شَرِبَ — Eating and Drinking",titleAr: "أَكَلَ وَشَرِبَ",                         template: "STANDARD",        xpReward: ch17L01Content._meta?.xp_reward       ?? 10, content: ch17L01Content },
    { id: "ch17-l02", chapterId: ch17Id, order: 2, title: "قَرَأَ and كَتَبَ — Reading and Writing", titleAr: "قَرَأَ وَكَتَبَ",                         template: "STANDARD",        xpReward: ch17L02Content._meta?.xp_reward       ?? 10, content: ch17L02Content },
    { id: "ch17-l03", chapterId: ch17Id, order: 3, title: "نَامَ and قَامَ — Sleeping and Standing", titleAr: "نَامَ وَقَامَ",                          template: "STANDARD",        xpReward: ch17L03Content._meta?.xp_reward       ?? 10, content: ch17L03Content },
    { id: "ch17-l04", chapterId: ch17Id, order: 4, title: "صَلَّى and ذَهَبَ — Prayer and Going",   titleAr: "صَلَّى وَذَهَبَ",                        template: "STANDARD",        xpReward: ch17L04Content._meta?.xp_reward       ?? 10, content: ch17L04Content },
    { id: "ch17-l05", chapterId: ch17Id, order: 5, title: "جَلَسَ and سَمِعَ — Sitting and Hearing", titleAr: "جَلَسَ وَسَمِعَ",                        template: "STANDARD",        xpReward: ch17L05Content._meta?.xp_reward       ?? 10, content: ch17L05Content },
    { id: "ch17-l06", chapterId: ch17Id, order: 6, title: "ت Marker — Masculine vs Feminine",      titleAr: "تَاءُ التَّأْنِيثِ — الْفَاعِل الْمُؤَنَّثُ", template: "STANDARD",        xpReward: ch17L06Content._meta?.xp_reward       ?? 10, content: ch17L06Content },
    // Chapter 18
    { id: "ch18-l01", chapterId: ch18Id, order: 1, title: "الَّذِي — The One Who (Masculine)",      titleAr: "الَّذِي — اسْمٌ مَوْصُولٌ مُذَكَّر",      template: "STANDARD",        xpReward: ch18L01Content._meta?.xp_reward       ?? 10, content: ch18L01Content },
    { id: "ch18-l02", chapterId: ch18Id, order: 2, title: "الَّتِي — The One Who (Feminine)",       titleAr: "الَّتِي — اسْمٌ مَوْصُولٌ مُؤَنَّث",      template: "STANDARD",        xpReward: ch18L02Content._meta?.xp_reward       ?? 10, content: ch18L02Content },
    { id: "ch18-l03", chapterId: ch18Id, order: 3, title: "Contrast: الَّذِي vs الَّتِي",           titleAr: "الْفَرْقُ بَيْنَ الَّذِي وَالَّتِي",      template: "STANDARD",        xpReward: ch18L03Content._meta?.xp_reward       ?? 10, content: ch18L03Content },
    { id: "ch18-l04", chapterId: ch18Id, order: 4, title: "الَّذِي Deep Practice",                  titleAr: "تَمْرِينُ الَّذِي — مُزَلْزِلٌ",          template: "STANDARD",        xpReward: ch18L04Content._meta?.xp_reward       ?? 10, content: ch18L04Content },
    { id: "ch18-l05", chapterId: ch18Id, order: 5, title: "الَّتِي Deep Practice",                  titleAr: "تَمْرِينُ الَّتِي — مُزَلْزِلٌ",          template: "STANDARD",        xpReward: ch18L05Content._meta?.xp_reward       ?? 10, content: ch18L05Content },
    { id: "ch18-l06", chapterId: ch18Id, order: 6, title: "An-Nas Integration — Tadabbur Unlock #2", titleAr: "النَّاس — تَحَابُّ الَّذِي",           template: "STANDARD",        xpReward: ch18L06Content._meta?.xp_reward       ?? 10, content: ch18L06Content },
    // Chapter 19
    { id: "ch19-l01", chapterId: ch19Id, order: 1, title: "My — ي (my)",                            titleAr: "كِتَابِي — يَاءُ الْمِلْكِيَّة",           template: "STANDARD",        xpReward: ch19L01Content._meta?.xp_reward       ?? 10, content: ch19L01Content },
    { id: "ch19-l02", chapterId: ch19Id, order: 2, title: "Your — كَ and كِ (your-m/f)",            titleAr: "كِتَابُكَ — كَافُ الْخِطَابِ",            template: "STANDARD",        xpReward: ch19L02Content._meta?.xp_reward       ?? 10, content: ch19L02Content },
    { id: "ch19-l03", chapterId: ch19Id, order: 3, title: "His and Her — هُ and هَا",               titleAr: "كِتَابُهُ وَكِتَابُهَا",                  template: "STANDARD",        xpReward: ch19L03Content._meta?.xp_reward       ?? 10, content: ch19L03Content },
    { id: "ch19-l04", chapterId: ch19Id, order: 4, title: "Full Singular Paradigm",                 titleAr: "جَدْوَلُ الضَّمَائِر الْمُفْرَدَة",       template: "STANDARD",        xpReward: ch19L04Content._meta?.xp_reward       ?? 10, content: ch19L04Content },
    { id: "ch19-l05", chapterId: ch19Id, order: 5, title: "Plural Possessives — أَنْفُسُهُمْ",     titleAr: "أَنْفُسُهُمْ وَأَنْفُسُكُمْ",            template: "STANDARD",        xpReward: ch19L05Content._meta?.xp_reward       ?? 10, content: ch19L05Content },
    { id: "ch19-l06", chapterId: ch19Id, order: 6, title: "Al-Falaq Integration — Tadabbur #3",     titleAr: "الْفَلَقُ — رَبِّي رَبُّكُمْ رَبُّنَا",   template: "STANDARD",        xpReward: ch19L06Content._meta?.xp_reward       ?? 10, content: ch19L06Content },
    // Chapter 20
    { id: "ch20-l01", chapterId: ch20Id, order: 1, title: "Our — نَا (our)",                       titleAr: "رَبَّنَا — نَا الْجَمْعِيَّة",              template: "STANDARD",        xpReward: ch20L01Content._meta?.xp_reward       ?? 10, content: ch20L01Content },
    { id: "ch20-l02", chapterId: ch20Id, order: 2, title: "Your-pl — كُمْ (your-pl)",              titleAr: "رَبَّكُمْ — كُمْ لِلْجَمَاعَة",           template: "STANDARD",        xpReward: ch20L02Content._meta?.xp_reward       ?? 10, content: ch20L02Content },
    { id: "ch20-l03", chapterId: ch20Id, order: 3, title: "Their — هُمْ and هُنَّ",               titleAr: "رَبَّهُمْ وَرَبَّهُنَّ",                  template: "STANDARD",        xpReward: ch20L03Content._meta?.xp_reward       ?? 10, content: ch20L03Content },
    { id: "ch20-l04", chapterId: ch20Id, order: 4, title: "Singular vs Plural Contrast",             titleAr: "الْمُفْرَدُ وَالْجَمْعُ — الْفَرْقُ",     template: "STANDARD",        xpReward: ch20L04Content._meta?.xp_reward       ?? 10, content: ch20L04Content },
    { id: "ch20-l05", chapterId: ch20Id, order: 5, title: "رَبَّنَا in Al-Fatiha + Al-Ikhlas",     titleAr: "رَبَّنَا فِي الْفَاتِحَةِ وَالْإِخْلَاص", template: "STANDARD",        xpReward: ch20L05Content._meta?.xp_reward       ?? 10, content: ch20L05Content },
    // Chapter 21
    { id: "ch21-l01", chapterId: ch21Id, order: 1, title: "Places — مَدِينَة، قَرْيَة، سُوق",      titleAr: "الْمَكَانُ — مَدِينَةٌ وَقَرْيَةٌ",     template: "STANDARD",        xpReward: ch21L01Content._meta?.xp_reward       ?? 10, content: ch21L01Content },
    { id: "ch21-l02", chapterId: ch21Id, order: 2, title: "Directional Prepositions — إِلَى، مِنْ، فِي", titleAr: "حُرُوفُ الْجِهَةِ",                   template: "STANDARD",        xpReward: ch21L02Content._meta?.xp_reward       ?? 10, content: ch21L02Content },
    { id: "ch21-l03", chapterId: ch21Id, order: 3, title: "Movement Verbs — ذَهَبَ، خَرَجَ، دَخَلَ", titleAr: "أَفْعَالُ الْحَرَكَةِ",                 template: "STANDARD",        xpReward: ch21L03Content._meta?.xp_reward       ?? 10, content: ch21L03Content },
    { id: "ch21-l04", chapterId: ch21Id, order: 4, title: "Position Words — أَمَام، خَلْف، فَوْق، تَحْت", titleAr: "أَسْمَاءُ الْمَوَاضِعِ",             template: "STANDARD",        xpReward: ch21L04Content._meta?.xp_reward       ?? 10, content: ch21L04Content },
    { id: "ch21-l05", chapterId: ch21Id, order: 5, title: "Chapter 21 Review",                     titleAr: "مُرَاجَعَة الْفَصْل الْحَادِي وَالْعِشْرِينَ", template: "REVIEW",      xpReward: ch21L05Content._meta?.xp_reward       ?? 5,  content: ch21L05Content },
    // Chapter 22
    { id: "ch22-l01", chapterId: ch22Id, order: 1, title: "قَالَ — Speaker and Speech",            titleAr: "قَالَ — الْمُتَكَلِّمُ وَكَلَامُهُ",       template: "STANDARD",        xpReward: ch22L01Content._meta?.xp_reward       ?? 10, content: ch22L01Content },
    { id: "ch22-l02", chapterId: ch22Id, order: 2, title: "سَأَلَ — Asking Questions",             titleAr: "سَأَلَ — إِطْرَاحُ الْأَسْئِلَة",          template: "STANDARD",        xpReward: ch22L02Content._meta?.xp_reward       ?? 10, content: ch22L02Content },
    { id: "ch22-l03", chapterId: ch22Id, order: 3, title: "أَجَابَ — Answering",                   titleAr: "أَجَابَ — الرَّدُّ وَالْإِجَابَة",         template: "STANDARD",        xpReward: ch22L03Content._meta?.xp_reward       ?? 10, content: ch22L03Content },
    { id: "ch22-l04", chapterId: ch22Id, order: 4, title: "Full Conversation",                     titleAr: "الْحِوَارُ الْكَامِلُ",                  template: "STANDARD",        xpReward: ch22L04Content._meta?.xp_reward       ?? 10, content: ch22L04Content },
    { id: "ch22-l05", chapterId: ch22Id, order: 5, title: "Chapter 22 Review",                     titleAr: "مُرَاجَعَة الْفَصْل الثَّانِي وَالْعِشْرِينَ", template: "REVIEW",    xpReward: ch22L05Content._meta?.xp_reward       ?? 5,  content: ch22L05Content },
    // Chapter 23
    { id: "ch23-l01", chapterId: ch23Id, order: 1, title: "Idafa + Demonstratives Integration",    titleAr: "الْإِضَافَةُ وَإِشَارَةُ الْمَفْهُومِ", template: "STANDARD",        xpReward: ch23L01Content._meta?.xp_reward       ?? 10, content: ch23L01Content },
    { id: "ch23-l02", chapterId: ch23Id, order: 2, title: "Relative + Attached Pronouns Integration", titleAr: "الْمَوْصُولُ وَالضَّمِيرُ",             template: "STANDARD",        xpReward: ch23L02Content._meta?.xp_reward       ?? 10, content: ch23L02Content },
    { id: "ch23-l03", chapterId: ch23Id, order: 3, title: "Verbs + Prepositions + Plurals",       titleAr: "الْفِعْلُ وَالْحَرْفُ وَالْجَمْعُ",      template: "STANDARD",        xpReward: ch23L03Content._meta?.xp_reward       ?? 10, content: ch23L03Content },
    { id: "ch23-l04", chapterId: ch23Id, order: 4, title: "Full Review: Al-Falaq toward Al-Ikhlas", titleAr: "الْفَلَقُ وَالْإِخْلَاصُ",              template: "STANDARD",        xpReward: ch23L04Content._meta?.xp_reward       ?? 10, content: ch23L04Content },
    // Chapter 24
    { id: "ch24-l01", chapterId: ch24Id, order: 1, title: "The Particle إِنَّ — Indeed, Truly",       titleAr: "إِنَّ — حَرْفُ التَّوْكِيدِ",              template: "STANDARD",        xpReward: ch24L01Content._meta?.xp_reward       ?? 10, content: ch24L01Content },
    { id: "ch24-l02", chapterId: ch24Id, order: 2, title: "إِنَّ Takes Accusative — نصب",          titleAr: "إِنَّ تَنْصِبُ الْخَبَرَ",               template: "STANDARD",        xpReward: ch24L02Content._meta?.xp_reward       ?? 10, content: ch24L02Content },
    { id: "ch24-l03", chapterId: ch24Id, order: 3, title: "إِنَّا — We Truly",                     titleAr: "إِنَّا — نَحْنُ حَقًّا",                  template: "STANDARD",        xpReward: ch24L03Content._meta?.xp_reward       ?? 10, content: ch24L03Content },
    { id: "ch24-l04", chapterId: ch24Id, order: 4, title: "Numbers 1-10 in Arabic",                titleAr: "الْأَعْدَادُ مِنْ ١ إِلَى ١٠",           template: "STANDARD",        xpReward: ch24L04Content._meta?.xp_reward       ?? 10, content: ch24L04Content },
    { id: "ch24-l05", chapterId: ch24Id, order: 5, title: "Al-Kawthar: إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", titleAr: "الْكَوْثَرُ — إِنَّا أَعْطَيْنَاكَ",  template: "STANDARD",        xpReward: ch24L05Content._meta?.xp_reward       ?? 10, content: ch24L05Content },
    { id: "ch24-l06", chapterId: ch24Id, order: 6, title: "إِنَّ with Descriptive Vocabulary",     titleAr: "إِنَّ مَعَ صِفَاتٍ",                      template: "STANDARD",        xpReward: ch24L06Content._meta?.xp_reward       ?? 10, content: ch24L06Content },
    // Chapter 25
    { id: "ch25-l01", chapterId: ch25Id, order: 1, title: "لَيْسَ — He Is Not",                    titleAr: "لَيْسَ — لَيْسَ هُوَ",                   template: "STANDARD",        xpReward: ch25L01Content._meta?.xp_reward       ?? 10, content: ch25L01Content },
    { id: "ch25-l02", chapterId: ch25Id, order: 2, title: "لَيْسَتْ — She Is Not",                 titleAr: "لَيْسَتْ — لَيْسَتْ هِيَ",               template: "STANDARD",        xpReward: ch25L02Content._meta?.xp_reward       ?? 10, content: ch25L02Content },
    { id: "ch25-l03", chapterId: ch25Id, order: 3, title: "لَيْسُوا — They Are Not",               titleAr: "لَيْسُوا — لَيْسُوا هُمْ",               template: "STANDARD",        xpReward: ch25L03Content._meta?.xp_reward       ?? 10, content: ch25L03Content },
    { id: "ch25-l04", chapterId: ch25Id, order: 4, title: "لَيْسَ with Adjectives",               titleAr: "لَيْسَ مَعَ الصِّفَاتِ",                  template: "STANDARD",        xpReward: ch25L04Content._meta?.xp_reward       ?? 10, content: ch25L04Content },
    { id: "ch25-l05", chapterId: ch25Id, order: 5, title: "إِنَّ vs لَيْسَ — Assertion vs Negation", titleAr: "إِنَّ وَلَيْسَ — الْإِيجَابُ وَالنَّفْيُ", template: "STANDARD", xpReward: ch25L05Content._meta?.xp_reward ?? 10, content: ch25L05Content },
    { id: "ch25-l06", chapterId: ch25Id, order: 6, title: "Al-Ikhlas Context: كُفُو أَحَد",        titleAr: "الْإِخْلَاصُ — لَمْ يَلِدْ وَلَمْ يُولَدْ", template: "STANDARD",        xpReward: ch25L06Content._meta?.xp_reward       ?? 10, content: ch25L06Content },
    // Chapter 26
    { id: "ch26-l01", chapterId: ch26Id, order: 1, title: "هَذَا/ذَلِكَ with Idafa",              titleAr: "الْمُشِيرُ وَالْإِضَافَةُ",                template: "STANDARD",        xpReward: ch26L01Content._meta?.xp_reward       ?? 10, content: ch26L01Content },
    { id: "ch26-l02", chapterId: ch26Id, order: 2, title: "هَؤُلَاء/أُولَئِكَ with Idafa",        titleAr: "الْمُشِيرُ الْجَمْعِيُّ وَالْإِضَافَةُ",  template: "STANDARD",        xpReward: ch26L02Content._meta?.xp_reward       ?? 10, content: ch26L02Content },
    { id: "ch26-l03", chapterId: ch26Id, order: 3, title: "Complex Idafa Chains",                titleAr: "سَلَاسِلُ الْإِضَافَةِ الْمُرَكَّبَة",     template: "STANDARD",        xpReward: ch26L03Content._meta?.xp_reward       ?? 10, content: ch26L03Content },
    { id: "ch26-l04", chapterId: ch26Id, order: 4, title: "Mixed: إِنَّ and لَيْسَ + Demonstratives", titleAr: "الْمُرَاجَعَةُ — إِنَّ وَلَيْسَ وَالْمُشِيرُ", template: "STANDARD", xpReward: ch26L04Content._meta?.xp_reward ?? 10, content: ch26L04Content },
    // Chapter 27
    { id: "ch27-l01", chapterId: ch27Id, order: 1, title: "فِي and إِلَى — In and To",            titleAr: "فِي وَإِلَى — حَرْفَا الْمَكَانِ",       template: "STANDARD",        xpReward: ch27L01Content._meta?.xp_reward       ?? 10, content: ch27L01Content },
    { id: "ch27-l02", chapterId: ch27Id, order: 2, title: "مِنْ and عَلَى — From and On",         titleAr: "مِنْ وَعَلَى — حَرْفَا الْجِهَةِ",        template: "STANDARD",        xpReward: ch27L02Content._meta?.xp_reward       ?? 10, content: ch27L02Content },
    { id: "ch27-l03", chapterId: ch27Id, order: 3, title: "بِ and لِ — With and For",             titleAr: "بِ وَلِ — حَرْفَا الْعِلَاقَةِ",          template: "STANDARD",        xpReward: ch27L03Content._meta?.xp_reward       ?? 10, content: ch27L03Content },
    { id: "ch27-l04", chapterId: ch27Id, order: 4, title: "عَنْ and كَ — About and Like",         titleAr: "عَنْ وَكَ — حَرْفَا الْمَعْنَى",          template: "STANDARD",        xpReward: ch27L04Content._meta?.xp_reward       ?? 10, content: ch27L04Content },
    { id: "ch27-l05", chapterId: ch27Id, order: 5, title: "All 8 Prepositions Review",            titleAr: "مُرَاجَعَةُ حُرُوفِ الْجَرِّ",           template: "REVIEW",          xpReward: ch27L05Content._meta?.xp_reward       ?? 5,  content: ch27L05Content },
    // Chapter 28
    { id: "ch28-l01", chapterId: ch28Id, order: 1, title: "عَلِمَ and فَهِمَ — Knowing",        titleAr: "عَلِمَ وَفَهِمَ — الْمَعْرِفَةُ",        template: "STANDARD",        xpReward: ch28L01Content._meta?.xp_reward       ?? 10, content: ch28L01Content },
    { id: "ch28-l02", chapterId: ch28Id, order: 2, title: "حَفِظَ and رَضِيَ — Memorizing",       titleAr: "حَفِظَ وَرَضِيَ — الْحِفْظُ وَالرِّضَا", template: "STANDARD",        xpReward: ch28L02Content._meta?.xp_reward       ?? 10, content: ch28L02Content },
    { id: "ch28-l03", chapterId: ch28Id, order: 3, title: "أَتَى and أَعْطَى — Coming and Giving", titleAr: "أَتَى وَأَعْطَى — الْحُضُورُ وَالْعَطَاءُ", template: "STANDARD",        xpReward: ch28L03Content._meta?.xp_reward       ?? 10, content: ch28L03Content },
    { id: "ch28-l04", chapterId: ch28Id, order: 4, title: "جَمَعَ and بَدَأَ — Gathering and Beginning", titleAr: "جَمَعَ وَبَدَأَ",                    template: "STANDARD",        xpReward: ch28L04Content._meta?.xp_reward       ?? 10, content: ch28L04Content },
    { id: "ch28-l05", chapterId: ch28Id, order: 5, title: "Mixed Verbs toward Al-Kafirun",       titleAr: "الْمُرَاجَعَةُ — نَحْوَ الْكَافِرُونَ",  template: "REVIEW",          xpReward: ch28L05Content._meta?.xp_reward       ?? 5,  content: ch28L05Content },
    // Chapter 29
    { id: "ch29-l01", chapterId: ch29Id, order: 1, title: "What is a Nominal Sentence?",        titleAr: "مَا هُوَ الْجُمْلَة الِاسْمِيَّة؟",        template: "STANDARD",        xpReward: ch29L01Content._meta?.xp_reward       ?? 10, content: ch29L01Content },
    { id: "ch29-l02", chapterId: ch29Id, order: 2, title: "What is a Verbal Sentence?",           titleAr: "مَا هُوَ الْجُمْلَة الْفِعْلِيَّة؟",        template: "STANDARD",        xpReward: ch29L02Content._meta?.xp_reward       ?? 10, content: ch29L02Content },
    { id: "ch29-l03", chapterId: ch29Id, order: 3, title: "Contrast: Nominal vs Verbal",        titleAr: "الِاسْمِيَّة وَالْفِعْلِيَّة — الْفَرْقُ", template: "STANDARD",        xpReward: ch29L03Content._meta?.xp_reward       ?? 10, content: ch29L03Content },
    { id: "ch29-l04", chapterId: ch29Id, order: 4, title: "إِنَّ Opens a Nominal Sentence",      titleAr: "إِنَّ تَفْتَحُ الْجُمْلَة الِاسْمِيَّة",   template: "STANDARD",        xpReward: ch29L04Content._meta?.xp_reward       ?? 10, content: ch29L04Content },
    { id: "ch29-l05", chapterId: ch29Id, order: 5, title: "GRAMMAR_PARSE on Al-Kafirun",          titleAr: "تَحْلِيلُ سُورَةِ الْكَافِرُونَ",          template: "STANDARD",        xpReward: ch29L05Content._meta?.xp_reward       ?? 10, content: ch29L05Content },
    { id: "ch29-l06", chapterId: ch29Id, order: 6, title: "Al-Kafirun Full Parse + Tadabbur #5",   titleAr: "الْكَافِرُونَ — قُلْ يَا أَيُّهَا الْكَافِرُونَ", template: "STANDARD", xpReward: ch29L06Content._meta?.xp_reward ?? 10, content: ch29L06Content },
    { id: "ch30-l01", chapterId: ch30Id, order: 01, title: ch30L01Content._meta?.title ?? "Lesson 01", titleAr: ch30L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch30L01Content._meta?.xp_reward ?? 10, content: ch30L01Content },
    { id: "ch30-l02", chapterId: ch30Id, order: 02, title: ch30L02Content._meta?.title ?? "Lesson 02", titleAr: ch30L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch30L02Content._meta?.xp_reward ?? 10, content: ch30L02Content },
    { id: "ch30-l03", chapterId: ch30Id, order: 03, title: ch30L03Content._meta?.title ?? "Lesson 03", titleAr: ch30L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch30L03Content._meta?.xp_reward ?? 10, content: ch30L03Content },
    { id: "ch30-l04", chapterId: ch30Id, order: 04, title: ch30L04Content._meta?.title ?? "Lesson 04", titleAr: ch30L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch30L04Content._meta?.xp_reward ?? 10, content: ch30L04Content },
    { id: "ch30-l05", chapterId: ch30Id, order: 05, title: ch30L05Content._meta?.title ?? "Lesson 05", titleAr: ch30L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch30L05Content._meta?.xp_reward ?? 10, content: ch30L05Content },
    { id: "ch31-l01", chapterId: ch31Id, order: 01, title: ch31L01Content._meta?.title ?? "Lesson 01", titleAr: ch31L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch31L01Content._meta?.xp_reward ?? 10, content: ch31L01Content },
    { id: "ch31-l02", chapterId: ch31Id, order: 02, title: ch31L02Content._meta?.title ?? "Lesson 02", titleAr: ch31L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch31L02Content._meta?.xp_reward ?? 10, content: ch31L02Content },
    { id: "ch31-l03", chapterId: ch31Id, order: 03, title: ch31L03Content._meta?.title ?? "Lesson 03", titleAr: ch31L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch31L03Content._meta?.xp_reward ?? 10, content: ch31L03Content },
    { id: "ch31-l04", chapterId: ch31Id, order: 04, title: ch31L04Content._meta?.title ?? "Lesson 04", titleAr: ch31L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch31L04Content._meta?.xp_reward ?? 10, content: ch31L04Content },
    { id: "ch31-l05", chapterId: ch31Id, order: 05, title: ch31L05Content._meta?.title ?? "Lesson 05", titleAr: ch31L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch31L05Content._meta?.xp_reward ?? 10, content: ch31L05Content },
    { id: "ch31-l06", chapterId: ch31Id, order: 06, title: ch31L06SpContent._meta?.title ?? "SP6 — Questions for a Scholar", titleAr: ch31L06SpContent._meta?.titleAr ?? "SP6 — أَسْئِلَةٌ لِلْعَالِمِ", template: "SPOKEN_PHRASES", xpReward: ch31L06SpContent._meta?.xp_reward ?? 15, content: ch31L06SpContent },
    { id: "ch32-l01", chapterId: ch32Id, order: 01, title: ch32L01Content._meta?.title ?? "Lesson 01", titleAr: ch32L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch32L01Content._meta?.xp_reward ?? 10, content: ch32L01Content },
    { id: "ch32-l02", chapterId: ch32Id, order: 02, title: ch32L02Content._meta?.title ?? "Lesson 02", titleAr: ch32L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch32L02Content._meta?.xp_reward ?? 10, content: ch32L02Content },
    { id: "ch32-l03", chapterId: ch32Id, order: 03, title: ch32L03Content._meta?.title ?? "Lesson 03", titleAr: ch32L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch32L03Content._meta?.xp_reward ?? 10, content: ch32L03Content },
    { id: "ch32-l04", chapterId: ch32Id, order: 04, title: ch32L04Content._meta?.title ?? "Lesson 04", titleAr: ch32L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch32L04Content._meta?.xp_reward ?? 10, content: ch32L04Content },
    { id: "ch33-l01", chapterId: ch33Id, order: 01, title: ch33L01Content._meta?.title ?? "Lesson 01", titleAr: ch33L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch33L01Content._meta?.xp_reward ?? 10, content: ch33L01Content },
    { id: "ch33-l02", chapterId: ch33Id, order: 02, title: ch33L02Content._meta?.title ?? "Lesson 02", titleAr: ch33L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch33L02Content._meta?.xp_reward ?? 10, content: ch33L02Content },
    { id: "ch33-l03", chapterId: ch33Id, order: 03, title: ch33L03Content._meta?.title ?? "Lesson 03", titleAr: ch33L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch33L03Content._meta?.xp_reward ?? 10, content: ch33L03Content },
    { id: "ch33-l04", chapterId: ch33Id, order: 04, title: ch33L04Content._meta?.title ?? "Lesson 04", titleAr: ch33L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch33L04Content._meta?.xp_reward ?? 10, content: ch33L04Content },
    { id: "ch33-l05", chapterId: ch33Id, order: 05, title: ch33L05Content._meta?.title ?? "Lesson 05", titleAr: ch33L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch33L05Content._meta?.xp_reward ?? 10, content: ch33L05Content },
    { id: "ch34-l01", chapterId: ch34Id, order: 01, title: ch34L01Content._meta?.title ?? "Lesson 01", titleAr: ch34L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch34L01Content._meta?.xp_reward ?? 10, content: ch34L01Content },
    { id: "ch34-l02", chapterId: ch34Id, order: 02, title: ch34L02Content._meta?.title ?? "Lesson 02", titleAr: ch34L02Content._meta?.titleAr ?? "", template: ch34L02Content._meta?.template ?? "STANDARD", xpReward: ch34L02Content._meta?.xp_reward ?? 10, content: ch34L02Content },
    { id: "ch34-l03", chapterId: ch34Id, order: 03, title: ch34L03Content._meta?.title ?? "Lesson 03", titleAr: ch34L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch34L03Content._meta?.xp_reward ?? 10, content: ch34L03Content },
    { id: "ch34-l04", chapterId: ch34Id, order: 04, title: ch34L04Content._meta?.title ?? "Lesson 04", titleAr: ch34L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch34L04Content._meta?.xp_reward ?? 10, content: ch34L04Content },
    { id: "ch34-l05", chapterId: ch34Id, order: 05, title: ch34L05Content._meta?.title ?? "Lesson 05", titleAr: ch34L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch34L05Content._meta?.xp_reward ?? 10, content: ch34L05Content },
    { id: "ch34-l06", chapterId: ch34Id, order: 06, title: ch34L06Content._meta?.title ?? "Lesson 06", titleAr: ch34L06Content._meta?.titleAr ?? "", template: ch34L06Content._meta?.template ?? "STANDARD", xpReward: ch34L06Content._meta?.xp_reward ?? 10, content: ch34L06Content },
    { id: "ch34-l07", chapterId: ch34Id, order: 07, title: ch34L07Content._meta?.title ?? "Lesson 07", titleAr: ch34L07Content._meta?.titleAr ?? "", template: ch34L07Content._meta?.template ?? "STANDARD", xpReward: ch34L07Content._meta?.xp_reward ?? 10, content: ch34L07Content },
    { id: "ch35-l01", chapterId: ch35Id, order: 01, title: ch35L01Content._meta?.title ?? "Lesson 01", titleAr: ch35L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch35L01Content._meta?.xp_reward ?? 10, content: ch35L01Content },
    { id: "ch35-l02", chapterId: ch35Id, order: 02, title: ch35L02Content._meta?.title ?? "Lesson 02", titleAr: ch35L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch35L02Content._meta?.xp_reward ?? 10, content: ch35L02Content },
    { id: "ch35-l03", chapterId: ch35Id, order: 03, title: ch35L03Content._meta?.title ?? "Lesson 03", titleAr: ch35L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch35L03Content._meta?.xp_reward ?? 10, content: ch35L03Content },
    { id: "ch35-l04", chapterId: ch35Id, order: 04, title: ch35L04Content._meta?.title ?? "Lesson 04", titleAr: ch35L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch35L04Content._meta?.xp_reward ?? 10, content: ch35L04Content },
    { id: "ch35-l05", chapterId: ch35Id, order: 05, title: ch35L05Content._meta?.title ?? "Lesson 05", titleAr: ch35L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch35L05Content._meta?.xp_reward ?? 10, content: ch35L05Content },
    { id: "ch36-l01", chapterId: ch36Id, order: 01, title: ch36L01Content._meta?.title ?? "Lesson 01", titleAr: ch36L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch36L01Content._meta?.xp_reward ?? 10, content: ch36L01Content },
    { id: "ch36-l02", chapterId: ch36Id, order: 02, title: ch36L02Content._meta?.title ?? "Lesson 02", titleAr: ch36L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch36L02Content._meta?.xp_reward ?? 10, content: ch36L02Content },
    { id: "ch36-l03", chapterId: ch36Id, order: 03, title: ch36L03Content._meta?.title ?? "Lesson 03", titleAr: ch36L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch36L03Content._meta?.xp_reward ?? 10, content: ch36L03Content },
    { id: "ch36-l04", chapterId: ch36Id, order: 04, title: ch36L04Content._meta?.title ?? "Lesson 04", titleAr: ch36L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch36L04Content._meta?.xp_reward ?? 10, content: ch36L04Content },
    { id: "ch36-l05", chapterId: ch36Id, order: 05, title: ch36L05Content._meta?.title ?? "Lesson 05", titleAr: ch36L05Content._meta?.titleAr ?? "", template: ch36L05Content._meta?.template ?? "STANDARD", xpReward: ch36L05Content._meta?.xp_reward ?? 10, content: ch36L05Content },
    { id: "ch36-l06", chapterId: ch36Id, order: 06, title: ch36L06Content._meta?.title ?? "Lesson 06", titleAr: ch36L06Content._meta?.titleAr ?? "", template: ch36L06Content._meta?.template ?? "STANDARD", xpReward: ch36L06Content._meta?.xp_reward ?? 10, content: ch36L06Content },
    { id: "ch37-l01", chapterId: ch37Id, order: 01, title: ch37L01Content._meta?.title ?? "Lesson 01", titleAr: ch37L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch37L01Content._meta?.xp_reward ?? 10, content: ch37L01Content },
    { id: "ch37-l02", chapterId: ch37Id, order: 02, title: ch37L02Content._meta?.title ?? "Lesson 02", titleAr: ch37L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch37L02Content._meta?.xp_reward ?? 10, content: ch37L02Content },
    { id: "ch37-l03", chapterId: ch37Id, order: 03, title: ch37L03Content._meta?.title ?? "Lesson 03", titleAr: ch37L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch37L03Content._meta?.xp_reward ?? 10, content: ch37L03Content },
    { id: "ch37-l04", chapterId: ch37Id, order: 04, title: ch37L04Content._meta?.title ?? "Lesson 04", titleAr: ch37L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch37L04Content._meta?.xp_reward ?? 10, content: ch37L04Content },
    { id: "ch37-l05", chapterId: ch37Id, order: 05, title: ch37L05Content._meta?.title ?? "Lesson 05", titleAr: ch37L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch37L05Content._meta?.xp_reward ?? 10, content: ch37L05Content },
    { id: "ch38-l01", chapterId: ch38Id, order: 01, title: ch38L01Content._meta?.title ?? "Lesson 01", titleAr: ch38L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch38L01Content._meta?.xp_reward ?? 10, content: ch38L01Content },
    { id: "ch38-l02", chapterId: ch38Id, order: 02, title: ch38L02Content._meta?.title ?? "Lesson 02", titleAr: ch38L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch38L02Content._meta?.xp_reward ?? 10, content: ch38L02Content },
    { id: "ch38-l03", chapterId: ch38Id, order: 03, title: ch38L03Content._meta?.title ?? "Lesson 03", titleAr: ch38L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch38L03Content._meta?.xp_reward ?? 10, content: ch38L03Content },
    { id: "ch38-l04", chapterId: ch38Id, order: 04, title: ch38L04Content._meta?.title ?? "Lesson 04", titleAr: ch38L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch38L04Content._meta?.xp_reward ?? 10, content: ch38L04Content },
    { id: "ch38-l05", chapterId: ch38Id, order: 05, title: ch38L05Content._meta?.title ?? "Lesson 05", titleAr: ch38L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch38L05Content._meta?.xp_reward ?? 10, content: ch38L05Content },
    { id: "ch39-l01", chapterId: ch39Id, order: 01, title: ch39L01Content._meta?.title ?? "Lesson 01", titleAr: ch39L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch39L01Content._meta?.xp_reward ?? 10, content: ch39L01Content },
    { id: "ch39-l02", chapterId: ch39Id, order: 02, title: ch39L02Content._meta?.title ?? "Lesson 02", titleAr: ch39L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch39L02Content._meta?.xp_reward ?? 10, content: ch39L02Content },
    { id: "ch39-l03", chapterId: ch39Id, order: 03, title: ch39L03Content._meta?.title ?? "Lesson 03", titleAr: ch39L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch39L03Content._meta?.xp_reward ?? 10, content: ch39L03Content },
    { id: "ch39-l04", chapterId: ch39Id, order: 04, title: ch39L04Content._meta?.title ?? "Lesson 04", titleAr: ch39L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch39L04Content._meta?.xp_reward ?? 10, content: ch39L04Content },
    { id: "ch39-l05", chapterId: ch39Id, order: 05, title: ch39L05Content._meta?.title ?? "Lesson 05", titleAr: ch39L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch39L05Content._meta?.xp_reward ?? 10, content: ch39L05Content },
    { id: "ch40-l01", chapterId: ch40Id, order: 01, title: ch40L01Content._meta?.title ?? "Lesson 01", titleAr: ch40L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch40L01Content._meta?.xp_reward ?? 10, content: ch40L01Content },
    { id: "ch40-l02", chapterId: ch40Id, order: 02, title: ch40L02Content._meta?.title ?? "Lesson 02", titleAr: ch40L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch40L02Content._meta?.xp_reward ?? 10, content: ch40L02Content },
    { id: "ch40-l03", chapterId: ch40Id, order: 03, title: ch40L03Content._meta?.title ?? "Lesson 03", titleAr: ch40L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch40L03Content._meta?.xp_reward ?? 10, content: ch40L03Content },
    { id: "ch40-l04", chapterId: ch40Id, order: 04, title: ch40L04Content._meta?.title ?? "Lesson 04", titleAr: ch40L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch40L04Content._meta?.xp_reward ?? 10, content: ch40L04Content },
    { id: "ch40-l05", chapterId: ch40Id, order: 05, title: ch40L05Content._meta?.title ?? "Lesson 05", titleAr: ch40L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch40L05Content._meta?.xp_reward ?? 10, content: ch40L05Content },
    { id: "ch40-l06", chapterId: ch40Id, order: 06, title: ch40L06SpContent._meta?.title ?? "SP7 — Masjid Scenarios", titleAr: ch40L06SpContent._meta?.titleAr ?? "SP7 — مَشَاهِدُ الْمَسْجِدِ", template: "SPOKEN_PHRASES", xpReward: ch40L06SpContent._meta?.xp_reward ?? 15, content: ch40L06SpContent },
    { id: "ch41-l01", chapterId: ch41Id, order: 01, title: ch41L01Content._meta?.title ?? "Lesson 01", titleAr: ch41L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch41L01Content._meta?.xp_reward ?? 10, content: ch41L01Content },
    { id: "ch41-l02", chapterId: ch41Id, order: 02, title: ch41L02Content._meta?.title ?? "Lesson 02", titleAr: ch41L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch41L02Content._meta?.xp_reward ?? 10, content: ch41L02Content },
    { id: "ch41-l03", chapterId: ch41Id, order: 03, title: ch41L03Content._meta?.title ?? "Lesson 03", titleAr: ch41L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch41L03Content._meta?.xp_reward ?? 10, content: ch41L03Content },
    { id: "ch41-l04", chapterId: ch41Id, order: 04, title: ch41L04Content._meta?.title ?? "Lesson 04", titleAr: ch41L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch41L04Content._meta?.xp_reward ?? 10, content: ch41L04Content },
    { id: "ch41-l05", chapterId: ch41Id, order: 05, title: ch41L05Content._meta?.title ?? "Lesson 05", titleAr: ch41L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch41L05Content._meta?.xp_reward ?? 10, content: ch41L05Content },
    { id: "ch42-l01", chapterId: ch42Id, order: 01, title: ch42L01Content._meta?.title ?? "Lesson 01", titleAr: ch42L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch42L01Content._meta?.xp_reward ?? 10, content: ch42L01Content },
    { id: "ch42-l02", chapterId: ch42Id, order: 02, title: ch42L02Content._meta?.title ?? "Lesson 02", titleAr: ch42L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch42L02Content._meta?.xp_reward ?? 10, content: ch42L02Content },
    { id: "ch42-l03", chapterId: ch42Id, order: 03, title: ch42L03Content._meta?.title ?? "Lesson 03", titleAr: ch42L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch42L03Content._meta?.xp_reward ?? 10, content: ch42L03Content },
    { id: "ch42-l04", chapterId: ch42Id, order: 04, title: ch42L04Content._meta?.title ?? "Lesson 04", titleAr: ch42L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch42L04Content._meta?.xp_reward ?? 10, content: ch42L04Content },
    { id: "ch42-l05", chapterId: ch42Id, order: 05, title: ch42L05Content._meta?.title ?? "Lesson 05", titleAr: ch42L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch42L05Content._meta?.xp_reward ?? 10, content: ch42L05Content },
    { id: "ch43-l01", chapterId: ch43Id, order: 01, title: ch43L01Content._meta?.title ?? "Lesson 01", titleAr: ch43L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch43L01Content._meta?.xp_reward ?? 10, content: ch43L01Content },
    { id: "ch43-l02", chapterId: ch43Id, order: 02, title: ch43L02Content._meta?.title ?? "Lesson 02", titleAr: ch43L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch43L02Content._meta?.xp_reward ?? 10, content: ch43L02Content },
    { id: "ch43-l03", chapterId: ch43Id, order: 03, title: ch43L03Content._meta?.title ?? "Lesson 03", titleAr: ch43L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch43L03Content._meta?.xp_reward ?? 10, content: ch43L03Content },
    { id: "ch43-l04", chapterId: ch43Id, order: 04, title: ch43L04Content._meta?.title ?? "Lesson 04", titleAr: ch43L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch43L04Content._meta?.xp_reward ?? 10, content: ch43L04Content },
    { id: "ch43-l05", chapterId: ch43Id, order: 05, title: ch43L05Content._meta?.title ?? "R9 — End-of-Book 4 Review", titleAr: ch43L05Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch43L05Content._meta?.xp_reward ?? 10, content: ch43L05Content },
    { id: "ch44-l01", chapterId: ch44Id, order: 01, title: ch44L01Content._meta?.title ?? "Lesson 01", titleAr: ch44L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch44L01Content._meta?.xp_reward ?? 10, content: ch44L01Content },
    { id: "ch44-l02", chapterId: ch44Id, order: 02, title: ch44L02Content._meta?.title ?? "Lesson 02", titleAr: ch44L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch44L02Content._meta?.xp_reward ?? 10, content: ch44L02Content },
    { id: "ch44-l03", chapterId: ch44Id, order: 03, title: ch44L03Content._meta?.title ?? "Lesson 03", titleAr: ch44L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch44L03Content._meta?.xp_reward ?? 10, content: ch44L03Content },
    { id: "ch44-l04", chapterId: ch44Id, order: 04, title: ch44L04Content._meta?.title ?? "Lesson 04", titleAr: ch44L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch44L04Content._meta?.xp_reward ?? 10, content: ch44L04Content },
    { id: "ch44-l05", chapterId: ch44Id, order: 05, title: ch44L05Content._meta?.title ?? "Lesson 05", titleAr: ch44L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch44L05Content._meta?.xp_reward ?? 10, content: ch44L05Content },
    { id: "ch44-l06", chapterId: ch44Id, order: 06, title: ch44L06Content._meta?.title ?? "Lesson 06", titleAr: ch44L06Content._meta?.titleAr ?? "", template: ch44L06Content.template ?? "STANDARD", xpReward: ch44L06Content._meta?.xp_reward ?? 10, content: ch44L06Content },
    { id: "ch44-l07", chapterId: ch44Id, order: 07, title: ch44L07Content._meta?.title ?? "Lesson 07", titleAr: ch44L07Content._meta?.titleAr ?? "", template: ch44L07Content.template ?? "STANDARD", xpReward: ch44L07Content._meta?.xp_reward ?? 10, content: ch44L07Content },
    { id: "ch45-l01", chapterId: ch45Id, order: 01, title: ch45L01Content._meta?.title ?? "Lesson 01", titleAr: ch45L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch45L01Content._meta?.xp_reward ?? 10, content: ch45L01Content },
    { id: "ch45-l02", chapterId: ch45Id, order: 02, title: ch45L02Content._meta?.title ?? "Lesson 02", titleAr: ch45L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch45L02Content._meta?.xp_reward ?? 10, content: ch45L02Content },
    { id: "ch45-l03", chapterId: ch45Id, order: 03, title: ch45L03Content._meta?.title ?? "Lesson 03", titleAr: ch45L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch45L03Content._meta?.xp_reward ?? 10, content: ch45L03Content },
    { id: "ch45-l04", chapterId: ch45Id, order: 04, title: ch45L04Content._meta?.title ?? "Lesson 04", titleAr: ch45L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch45L04Content._meta?.xp_reward ?? 10, content: ch45L04Content },
    { id: "ch45-l05", chapterId: ch45Id, order: 05, title: ch45L05Content._meta?.title ?? "Lesson 05", titleAr: ch45L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch45L05Content._meta?.xp_reward ?? 10, content: ch45L05Content },
    { id: "ch45-l06", chapterId: ch45Id, order: 06, title: ch45L06Content._meta?.title ?? "Lesson 06", titleAr: ch45L06Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch45L06Content._meta?.xp_reward ?? 10, content: ch45L06Content },
    { id: "ch45-l07", chapterId: ch45Id, order: 07, title: ch45L07Content._meta?.title ?? "Lesson 07", titleAr: ch45L07Content._meta?.titleAr ?? "", template: ch45L07Content.template ?? "REVIEW", xpReward: ch45L07Content._meta?.xp_reward ?? 10, content: ch45L07Content },
    { id: "ch46-l01", chapterId: ch46Id, order: 01, title: ch46L01Content._meta?.title ?? "Lesson 01", titleAr: ch46L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch46L01Content._meta?.xp_reward ?? 10, content: ch46L01Content },
    { id: "ch46-l02", chapterId: ch46Id, order: 02, title: ch46L02Content._meta?.title ?? "Lesson 02", titleAr: ch46L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch46L02Content._meta?.xp_reward ?? 10, content: ch46L02Content },
    { id: "ch46-l03", chapterId: ch46Id, order: 03, title: ch46L03Content._meta?.title ?? "Lesson 03", titleAr: ch46L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch46L03Content._meta?.xp_reward ?? 10, content: ch46L03Content },
    { id: "ch46-l04", chapterId: ch46Id, order: 04, title: ch46L04Content._meta?.title ?? "Lesson 04", titleAr: ch46L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch46L04Content._meta?.xp_reward ?? 10, content: ch46L04Content },
    { id: "ch46-l05", chapterId: ch46Id, order: 05, title: ch46L05Content._meta?.title ?? "Lesson 05", titleAr: ch46L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch46L05Content._meta?.xp_reward ?? 10, content: ch46L05Content },
    { id: "ch46-l06", chapterId: ch46Id, order: 06, title: ch46L06Content._meta?.title ?? "Lesson 06", titleAr: ch46L06Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch46L06Content._meta?.xp_reward ?? 15, content: ch46L06Content },
    { id: "ch47-l01", chapterId: ch47Id, order: 01, title: ch47L01Content._meta?.title ?? "Lesson 01", titleAr: ch47L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch47L01Content._meta?.xp_reward ?? 10, content: ch47L01Content },
    { id: "ch47-l02", chapterId: ch47Id, order: 02, title: ch47L02Content._meta?.title ?? "Lesson 02", titleAr: ch47L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch47L02Content._meta?.xp_reward ?? 10, content: ch47L02Content },
    { id: "ch47-l03", chapterId: ch47Id, order: 03, title: ch47L03Content._meta?.title ?? "Lesson 03", titleAr: ch47L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch47L03Content._meta?.xp_reward ?? 10, content: ch47L03Content },
    { id: "ch47-l04", chapterId: ch47Id, order: 04, title: ch47L04Content._meta?.title ?? "Lesson 04", titleAr: ch47L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch47L04Content._meta?.xp_reward ?? 10, content: ch47L04Content },
    { id: "ch47-l05", chapterId: ch47Id, order: 05, title: ch47L05Content._meta?.title ?? "Lesson 05", titleAr: ch47L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch47L05Content._meta?.xp_reward ?? 10, content: ch47L05Content },
    { id: "ch47-l06", chapterId: ch47Id, order: 06, title: ch47L06R10Content._meta?.title ?? "R10 Review", titleAr: ch47L06R10Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch47L06R10Content._meta?.xp_reward ?? 15, content: ch47L06R10Content },
    { id: "ch48-l01", chapterId: ch48Id, order: 01, title: ch48L01Content._meta?.title ?? "Lesson 01", titleAr: ch48L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch48L01Content._meta?.xp_reward ?? 10, content: ch48L01Content },
    { id: "ch48-l02", chapterId: ch48Id, order: 02, title: ch48L02Content._meta?.title ?? "Lesson 02", titleAr: ch48L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch48L02Content._meta?.xp_reward ?? 10, content: ch48L02Content },
    { id: "ch48-l03", chapterId: ch48Id, order: 03, title: ch48L03Content._meta?.title ?? "Lesson 03", titleAr: ch48L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch48L03Content._meta?.xp_reward ?? 10, content: ch48L03Content },
    { id: "ch48-l04", chapterId: ch48Id, order: 04, title: ch48L04Content._meta?.title ?? "Lesson 04", titleAr: ch48L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch48L04Content._meta?.xp_reward ?? 10, content: ch48L04Content },
    { id: "ch48-l05", chapterId: ch48Id, order: 05, title: ch48L05SpContent._meta?.title ?? "SP8 Travel and Hajj Dua", titleAr: ch48L05SpContent._meta?.titleAr ?? "", template: "SPOKEN_PHRASES", xpReward: ch48L05SpContent._meta?.xp_reward ?? 15, content: ch48L05SpContent },
    { id: "ch49-l01", chapterId: ch49Id, order: 01, title: ch49L01Content._meta?.title ?? "Lesson 01", titleAr: ch49L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch49L01Content._meta?.xp_reward ?? 10, content: ch49L01Content },
    { id: "ch49-l02", chapterId: ch49Id, order: 02, title: ch49L02Content._meta?.title ?? "Lesson 02", titleAr: ch49L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch49L02Content._meta?.xp_reward ?? 10, content: ch49L02Content },
    { id: "ch49-l03", chapterId: ch49Id, order: 03, title: ch49L03Content._meta?.title ?? "Lesson 03", titleAr: ch49L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch49L03Content._meta?.xp_reward ?? 10, content: ch49L03Content },
    { id: "ch49-l04", chapterId: ch49Id, order: 04, title: ch49L04Content._meta?.title ?? "Lesson 04", titleAr: ch49L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch49L04Content._meta?.xp_reward ?? 10, content: ch49L04Content },
    { id: "ch49-l05", chapterId: ch49Id, order: 05, title: ch49L05Content._meta?.title ?? "Lesson 05", titleAr: ch49L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch49L05Content._meta?.xp_reward ?? 10, content: ch49L05Content },
    { id: "ch50-l01", chapterId: ch50Id, order: 01, title: ch50L01Content._meta?.title ?? "Lesson 01", titleAr: ch50L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch50L01Content._meta?.xp_reward ?? 10, content: ch50L01Content },
    { id: "ch50-l02", chapterId: ch50Id, order: 02, title: ch50L02Content._meta?.title ?? "Lesson 02", titleAr: ch50L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch50L02Content._meta?.xp_reward ?? 10, content: ch50L02Content },
    { id: "ch50-l03", chapterId: ch50Id, order: 03, title: ch50L03Content._meta?.title ?? "Lesson 03", titleAr: ch50L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch50L03Content._meta?.xp_reward ?? 10, content: ch50L03Content },
    { id: "ch50-l04", chapterId: ch50Id, order: 04, title: ch50L04Content._meta?.title ?? "Lesson 04", titleAr: ch50L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch50L04Content._meta?.xp_reward ?? 10, content: ch50L04Content },
    { id: "ch50-l05", chapterId: ch50Id, order: 05, title: ch50L05Content._meta?.title ?? "Lesson 05", titleAr: ch50L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch50L05Content._meta?.xp_reward ?? 10, content: ch50L05Content },
    { id: "ch51-l01", chapterId: ch51Id, order: 01, title: ch51L01Content._meta?.title ?? "Lesson 01", titleAr: ch51L01Content._meta?.titleAr ?? "", template: "VERB_PATTERN", xpReward: ch51L01Content._meta?.xp_reward ?? 10, content: ch51L01Content },
    { id: "ch51-l02", chapterId: ch51Id, order: 02, title: ch51L02Content._meta?.title ?? "Lesson 02", titleAr: ch51L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch51L02Content._meta?.xp_reward ?? 10, content: ch51L02Content },
    { id: "ch51-l03", chapterId: ch51Id, order: 03, title: ch51L03Content._meta?.title ?? "Lesson 03", titleAr: ch51L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch51L03Content._meta?.xp_reward ?? 10, content: ch51L03Content },
    { id: "ch51-l04", chapterId: ch51Id, order: 04, title: ch51L04Content._meta?.title ?? "Lesson 04", titleAr: ch51L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch51L04Content._meta?.xp_reward ?? 10, content: ch51L04Content },
    { id: "ch51-l05", chapterId: ch51Id, order: 05, title: ch51L05Content._meta?.title ?? "Lesson 05", titleAr: ch51L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch51L05Content._meta?.xp_reward ?? 10, content: ch51L05Content },
    { id: "ch52-l01", chapterId: ch52Id, order: 01, title: ch52L01Content._meta?.title ?? "Lesson 01", titleAr: ch52L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch52L01Content._meta?.xp_reward ?? 10, content: ch52L01Content },
    { id: "ch52-l02", chapterId: ch52Id, order: 02, title: ch52L02Content._meta?.title ?? "Lesson 02", titleAr: ch52L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch52L02Content._meta?.xp_reward ?? 10, content: ch52L02Content },
    { id: "ch52-l03", chapterId: ch52Id, order: 03, title: ch52L03Content._meta?.title ?? "Lesson 03", titleAr: ch52L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch52L03Content._meta?.xp_reward ?? 10, content: ch52L03Content },
    { id: "ch52-l04", chapterId: ch52Id, order: 04, title: ch52L04Content._meta?.title ?? "Lesson 04", titleAr: ch52L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch52L04Content._meta?.xp_reward ?? 10, content: ch52L04Content },
    { id: "ch52-l05", chapterId: ch52Id, order: 05, title: ch52L05Content._meta?.title ?? "Lesson 05", titleAr: ch52L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch52L05Content._meta?.xp_reward ?? 10, content: ch52L05Content },
    { id: "ch53-l01", chapterId: ch53Id, order: 01, title: ch53L01Content._meta?.title ?? "Lesson 01", titleAr: ch53L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch53L01Content._meta?.xp_reward ?? 10, content: ch53L01Content },
    { id: "ch53-l02", chapterId: ch53Id, order: 02, title: ch53L02Content._meta?.title ?? "Lesson 02", titleAr: ch53L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch53L02Content._meta?.xp_reward ?? 10, content: ch53L02Content },
    { id: "ch53-l03", chapterId: ch53Id, order: 03, title: ch53L03Content._meta?.title ?? "Lesson 03", titleAr: ch53L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch53L03Content._meta?.xp_reward ?? 10, content: ch53L03Content },
    { id: "ch53-l04", chapterId: ch53Id, order: 04, title: ch53L04Content._meta?.title ?? "Lesson 04", titleAr: ch53L04Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch53L04Content._meta?.xp_reward ?? 15, content: ch53L04Content },
    { id: "ch54-l01", chapterId: ch54Id, order: 01, title: ch54L01Content._meta?.title ?? "Lesson 01", titleAr: ch54L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch54L01Content._meta?.xp_reward ?? 10, content: ch54L01Content },
    { id: "ch54-l02", chapterId: ch54Id, order: 02, title: ch54L02Content._meta?.title ?? "Lesson 02", titleAr: ch54L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch54L02Content._meta?.xp_reward ?? 10, content: ch54L02Content },
    { id: "ch54-l03", chapterId: ch54Id, order: 03, title: ch54L03Content._meta?.title ?? "Lesson 03", titleAr: ch54L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch54L03Content._meta?.xp_reward ?? 10, content: ch54L03Content },
    { id: "ch54-l04", chapterId: ch54Id, order: 04, title: ch54L04Content._meta?.title ?? "Lesson 04", titleAr: ch54L04Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch54L04Content._meta?.xp_reward ?? 20, content: ch54L04Content },
    // Chapter 55
    { id: "ch55-l01", chapterId: ch55Id, order: 01, title: ch55L01Content._meta?.title ?? "Lesson 01", titleAr: ch55L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch55L01Content._meta?.xp_reward ?? 10, content: ch55L01Content },
    { id: "ch55-l02", chapterId: ch55Id, order: 02, title: ch55L02Content._meta?.title ?? "Lesson 02", titleAr: ch55L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch55L02Content._meta?.xp_reward ?? 10, content: ch55L02Content },
    { id: "ch55-l03", chapterId: ch55Id, order: 03, title: ch55L03Content._meta?.title ?? "Lesson 03", titleAr: ch55L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch55L03Content._meta?.xp_reward ?? 10, content: ch55L03Content },
    { id: "ch55-l04", chapterId: ch55Id, order: 04, title: ch55L04Content._meta?.title ?? "Lesson 04", titleAr: ch55L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch55L04Content._meta?.xp_reward ?? 10, content: ch55L04Content },
    { id: "ch55-l05", chapterId: ch55Id, order: 05, title: ch55L05Content._meta?.title ?? "Lesson 05", titleAr: ch55L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch55L05Content._meta?.xp_reward ?? 10, content: ch55L05Content },
    { id: "ch55-l06", chapterId: ch55Id, order: 06, title: ch55L06Content._meta?.title ?? "Lesson 06", titleAr: ch55L06Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch55L06Content._meta?.xp_reward ?? 10, content: ch55L06Content },
    { id: "ch55-l07", chapterId: ch55Id, order: 07, title: ch55L07Content._meta?.title ?? "Lesson 07", titleAr: ch55L07Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch55L07Content._meta?.xp_reward ?? 10, content: ch55L07Content },
    { id: "ch55-l08", chapterId: ch55Id, order: 08, title: ch55L08Content._meta?.title ?? "Lesson 08", titleAr: ch55L08Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch55L08Content._meta?.xp_reward ?? 10, content: ch55L08Content },
    // Chapter 56
    { id: "ch56-l01", chapterId: ch56Id, order: 01, title: ch56L01Content._meta?.title ?? "Lesson 01", titleAr: ch56L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L01Content._meta?.xp_reward ?? 10, content: ch56L01Content },
    { id: "ch56-l02", chapterId: ch56Id, order: 02, title: ch56L02Content._meta?.title ?? "Lesson 02", titleAr: ch56L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L02Content._meta?.xp_reward ?? 10, content: ch56L02Content },
    { id: "ch56-l03", chapterId: ch56Id, order: 03, title: ch56L03Content._meta?.title ?? "Lesson 03", titleAr: ch56L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L03Content._meta?.xp_reward ?? 10, content: ch56L03Content },
    { id: "ch56-l04", chapterId: ch56Id, order: 04, title: ch56L04Content._meta?.title ?? "Lesson 04", titleAr: ch56L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L04Content._meta?.xp_reward ?? 10, content: ch56L04Content },
    { id: "ch56-l05", chapterId: ch56Id, order: 05, title: ch56L05Content._meta?.title ?? "Lesson 05", titleAr: ch56L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L05Content._meta?.xp_reward ?? 10, content: ch56L05Content },
    { id: "ch56-l06", chapterId: ch56Id, order: 06, title: ch56L06Content._meta?.title ?? "Lesson 06", titleAr: ch56L06Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L06Content._meta?.xp_reward ?? 10, content: ch56L06Content },
    { id: "ch56-l07", chapterId: ch56Id, order: 07, title: ch56L07Content._meta?.title ?? "Lesson 07", titleAr: ch56L07Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L07Content._meta?.xp_reward ?? 10, content: ch56L07Content },
    { id: "ch56-l08", chapterId: ch56Id, order: 08, title: ch56L08Content._meta?.title ?? "Lesson 08", titleAr: ch56L08Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L08Content._meta?.xp_reward ?? 10, content: ch56L08Content },
    { id: "ch56-l09", chapterId: ch56Id, order: 09, title: ch56L09Content._meta?.title ?? "Lesson 09", titleAr: ch56L09Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch56L09Content._meta?.xp_reward ?? 10, content: ch56L09Content },
    // Chapter 57
    { id: "ch57-l01", chapterId: ch57Id, order: 01, title: ch57L01Content._meta?.title ?? "Lesson 01", titleAr: ch57L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch57L01Content._meta?.xp_reward ?? 10, content: ch57L01Content },
    { id: "ch57-l02", chapterId: ch57Id, order: 02, title: ch57L02Content._meta?.title ?? "Lesson 02", titleAr: ch57L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch57L02Content._meta?.xp_reward ?? 10, content: ch57L02Content },
    { id: "ch57-l03", chapterId: ch57Id, order: 03, title: ch57L03Content._meta?.title ?? "Lesson 03", titleAr: ch57L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch57L03Content._meta?.xp_reward ?? 10, content: ch57L03Content },
    { id: "ch57-l04", chapterId: ch57Id, order: 04, title: ch57L04Content._meta?.title ?? "Lesson 04", titleAr: ch57L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch57L04Content._meta?.xp_reward ?? 10, content: ch57L04Content },
    { id: "ch57-l05", chapterId: ch57Id, order: 05, title: ch57L05Content._meta?.title ?? "Lesson 05", titleAr: ch57L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch57L05Content._meta?.xp_reward ?? 10, content: ch57L05Content },
    { id: "ch57-l06", chapterId: ch57Id, order: 06, title: ch57L06Content._meta?.title ?? "الأفعال الخمسة — The Five Special Verbs", titleAr: ch57L06Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch57L06Content._meta?.xp_reward ?? 10, content: ch57L06Content },
    { id: "ch57-l07", chapterId: ch57Id, order: 07, title: ch57L07Content._meta?.title ?? "الأفعال الخمسة — Full Conjugation Table", titleAr: ch57L07Content._meta?.titleAr ?? "", template: "VERB_PATTERN", xpReward: ch57L07Content._meta?.xp_reward ?? 10, content: ch57L07Content },
    { id: "ch57-l08", chapterId: ch57Id, order: 08, title: ch57L08Content._meta?.title ?? "الأفعال الخمسة in the Quran", titleAr: ch57L08Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch57L08Content._meta?.xp_reward ?? 12, content: ch57L08Content },
    { id: "ch57-l09", chapterId: ch57Id, order: 09, title: ch57L09Content._meta?.title ?? "R12 — Peak 2 Mastery Review", titleAr: ch57L09Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch57L09Content._meta?.xp_reward ?? 20, content: ch57L09Content },
    { id: "ch57-l10", chapterId: ch57Id, order: 10, title: ch57L10SpContent._meta?.title ?? "SP9 — Khutbah Phrases", titleAr: ch57L10SpContent._meta?.titleAr ?? "", template: "SPOKEN_PHRASES", xpReward: ch57L10SpContent._meta?.xp_reward ?? 15, content: ch57L10SpContent },
    // Chapter 58
    { id: "ch58-l01", chapterId: ch58Id, order: 01, title: ch58L01Content._meta?.title ?? "Lesson 01", titleAr: ch58L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch58L01Content._meta?.xp_reward ?? 10, content: ch58L01Content },
    { id: "ch58-l02", chapterId: ch58Id, order: 02, title: ch58L02Content._meta?.title ?? "Lesson 02", titleAr: ch58L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch58L02Content._meta?.xp_reward ?? 10, content: ch58L02Content },
    { id: "ch58-l03", chapterId: ch58Id, order: 03, title: ch58L03Content._meta?.title ?? "Lesson 03", titleAr: ch58L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch58L03Content._meta?.xp_reward ?? 10, content: ch58L03Content },
    { id: "ch58-l04", chapterId: ch58Id, order: 04, title: ch58L04Content._meta?.title ?? "Lesson 04", titleAr: ch58L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch58L04Content._meta?.xp_reward ?? 10, content: ch58L04Content },
    { id: "ch58-l05", chapterId: ch58Id, order: 05, title: ch58L05Content._meta?.title ?? "Lesson 05", titleAr: ch58L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch58L05Content._meta?.xp_reward ?? 10, content: ch58L05Content },
    { id: "ch58-l06", chapterId: ch58Id, order: 06, title: ch58L06Content._meta?.title ?? "Lesson 06", titleAr: ch58L06Content._meta?.titleAr ?? "", template: ch58L06Content.template ?? "REVIEW", xpReward: ch58L06Content._meta?.xp_reward ?? 10, content: ch58L06Content },
    // Chapter 59
    { id: "ch59-l01", chapterId: ch59Id, order: 01, title: ch59L01Content._meta?.title ?? "Lesson 01", titleAr: ch59L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch59L01Content._meta?.xp_reward ?? 10, content: ch59L01Content },
    { id: "ch59-l02", chapterId: ch59Id, order: 02, title: ch59L02Content._meta?.title ?? "Lesson 02", titleAr: ch59L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch59L02Content._meta?.xp_reward ?? 10, content: ch59L02Content },
    { id: "ch59-l03", chapterId: ch59Id, order: 03, title: ch59L03Content._meta?.title ?? "Lesson 03", titleAr: ch59L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch59L03Content._meta?.xp_reward ?? 10, content: ch59L03Content },
    { id: "ch59-l04", chapterId: ch59Id, order: 04, title: ch59L04Content._meta?.title ?? "Lesson 04", titleAr: ch59L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch59L04Content._meta?.xp_reward ?? 10, content: ch59L04Content },
    { id: "ch59-l05", chapterId: ch59Id, order: 05, title: ch59L05Content._meta?.title ?? "Lesson 05", titleAr: ch59L05Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch59L05Content._meta?.xp_reward ?? 20, content: ch59L05Content },
    // Chapter 60
    { id: "ch60-l01", chapterId: ch60Id, order: 01, title: ch60L01Content._meta?.title ?? "Lesson 01", titleAr: ch60L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch60L01Content._meta?.xp_reward ?? 10, content: ch60L01Content },
    { id: "ch60-l02", chapterId: ch60Id, order: 02, title: ch60L02Content._meta?.title ?? "Lesson 02", titleAr: ch60L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch60L02Content._meta?.xp_reward ?? 10, content: ch60L02Content },
    { id: "ch60-l03", chapterId: ch60Id, order: 03, title: ch60L03Content._meta?.title ?? "Lesson 03", titleAr: ch60L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch60L03Content._meta?.xp_reward ?? 10, content: ch60L03Content },
    { id: "ch60-l04", chapterId: ch60Id, order: 04, title: ch60L04Content._meta?.title ?? "Lesson 04", titleAr: ch60L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch60L04Content._meta?.xp_reward ?? 10, content: ch60L04Content },
    { id: "ch60-l05", chapterId: ch60Id, order: 05, title: ch60L05Content._meta?.title ?? "Lesson 05", titleAr: ch60L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch60L05Content._meta?.xp_reward ?? 10, content: ch60L05Content },
    { id: "ch60-l06", chapterId: ch60Id, order: 06, title: ch60L06Content._meta?.title ?? "Lesson 06", titleAr: ch60L06Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch60L06Content._meta?.xp_reward ?? 10, content: ch60L06Content },
    // Chapter 61
    { id: "ch61-l01", chapterId: ch61Id, order: 01, title: ch61L01Content._meta?.title ?? "Lesson 01", titleAr: ch61L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch61L01Content._meta?.xp_reward ?? 10, content: ch61L01Content },
    { id: "ch61-l02", chapterId: ch61Id, order: 02, title: ch61L02Content._meta?.title ?? "Lesson 02", titleAr: ch61L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch61L02Content._meta?.xp_reward ?? 10, content: ch61L02Content },
    { id: "ch61-l03", chapterId: ch61Id, order: 03, title: ch61L03Content._meta?.title ?? "Lesson 03", titleAr: ch61L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch61L03Content._meta?.xp_reward ?? 10, content: ch61L03Content },
    { id: "ch61-l04", chapterId: ch61Id, order: 04, title: ch61L04Content._meta?.title ?? "Lesson 04", titleAr: ch61L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch61L04Content._meta?.xp_reward ?? 10, content: ch61L04Content },
    { id: "ch61-l05", chapterId: ch61Id, order: 05, title: ch61L05Content._meta?.title ?? "Lesson 05", titleAr: ch61L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch61L05Content._meta?.xp_reward ?? 10, content: ch61L05Content },
    { id: "ch61-l06", chapterId: ch61Id, order: 06, title: ch61L06Content._meta?.title ?? "Lesson 06", titleAr: ch61L06Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch61L06Content._meta?.xp_reward ?? 10, content: ch61L06Content },
    { id: "ch61-l07", chapterId: ch61Id, order: 07, title: ch61L07Content._meta?.title ?? "Lesson 07", titleAr: ch61L07Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch61L07Content._meta?.xp_reward ?? 20, content: ch61L07Content },
    // Chapter 62
    { id: "ch62-l01", chapterId: ch62Id, order: 01, title: ch62L01Content._meta?.title ?? "Lesson 01", titleAr: ch62L01Content._meta?.titleAr ?? "", template: ch62L01Content._meta?.template ?? "STANDARD", xpReward: ch62L01Content._meta?.xp_reward ?? 10, content: ch62L01Content },
    { id: "ch62-l02", chapterId: ch62Id, order: 02, title: ch62L02Content._meta?.title ?? "Lesson 02", titleAr: ch62L02Content._meta?.titleAr ?? "", template: ch62L02Content._meta?.template ?? "STANDARD", xpReward: ch62L02Content._meta?.xp_reward ?? 10, content: ch62L02Content },
    { id: "ch62-l03", chapterId: ch62Id, order: 03, title: ch62L03Content._meta?.title ?? "Lesson 03", titleAr: ch62L03Content._meta?.titleAr ?? "", template: ch62L03Content._meta?.template ?? "STANDARD", xpReward: ch62L03Content._meta?.xp_reward ?? 10, content: ch62L03Content },
    { id: "ch62-l04", chapterId: ch62Id, order: 04, title: ch62L04Content._meta?.title ?? "Lesson 04", titleAr: ch62L04Content._meta?.titleAr ?? "", template: ch62L04Content._meta?.template ?? "STANDARD", xpReward: ch62L04Content._meta?.xp_reward ?? 10, content: ch62L04Content },
    { id: "ch62-l05", chapterId: ch62Id, order: 05, title: ch62L05SpokenContent._meta?.title ?? "Lesson 05", titleAr: ch62L05SpokenContent._meta?.titleAr ?? "", template: ch62L05SpokenContent._meta?.template ?? "SPOKEN_PHRASES", xpReward: ch62L05SpokenContent._meta?.xp_reward ?? 10, content: ch62L05SpokenContent },
    // Chapter 63
    { id: "ch63-l01", chapterId: ch63Id, order: 01, title: ch63L01Content._meta?.title ?? "Lesson 01", titleAr: ch63L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch63L01Content._meta?.xp_reward ?? 10, content: ch63L01Content },
    { id: "ch63-l02", chapterId: ch63Id, order: 02, title: ch63L02Content._meta?.title ?? "Lesson 02", titleAr: ch63L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch63L02Content._meta?.xp_reward ?? 10, content: ch63L02Content },
    { id: "ch63-l03", chapterId: ch63Id, order: 03, title: ch63L03Content._meta?.title ?? "Lesson 03", titleAr: ch63L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch63L03Content._meta?.xp_reward ?? 10, content: ch63L03Content },
    { id: "ch63-l04", chapterId: ch63Id, order: 04, title: ch63L04Content._meta?.title ?? "Lesson 04", titleAr: ch63L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch63L04Content._meta?.xp_reward ?? 10, content: ch63L04Content },
    { id: "ch63-l05", chapterId: ch63Id, order: 05, title: ch63L05Content._meta?.title ?? "Lesson 05", titleAr: ch63L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch63L05Content._meta?.xp_reward ?? 10, content: ch63L05Content },
    // Chapter 64
    { id: "ch64-l01", chapterId: ch64Id, order: 01, title: ch64L01Content._meta?.title ?? "Lesson 01", titleAr: ch64L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch64L01Content._meta?.xp_reward ?? 10, content: ch64L01Content },
    { id: "ch64-l02", chapterId: ch64Id, order: 02, title: ch64L02Content._meta?.title ?? "Lesson 02", titleAr: ch64L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch64L02Content._meta?.xp_reward ?? 10, content: ch64L02Content },
    { id: "ch64-l03", chapterId: ch64Id, order: 03, title: ch64L03Content._meta?.title ?? "Lesson 03", titleAr: ch64L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch64L03Content._meta?.xp_reward ?? 10, content: ch64L03Content },
    { id: "ch64-l04", chapterId: ch64Id, order: 04, title: ch64L04Content._meta?.title ?? "Lesson 04", titleAr: ch64L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch64L04Content._meta?.xp_reward ?? 10, content: ch64L04Content },
    { id: "ch64-l05", chapterId: ch64Id, order: 05, title: ch64L05Content._meta?.title ?? "Lesson 05", titleAr: ch64L05Content._meta?.titleAr ?? "", template: ch64L05Content.template ?? "REVIEW", xpReward: ch64L05Content._meta?.xp_reward ?? 10, content: ch64L05Content },
    // Chapter 65
    { id: "ch65-l01", chapterId: ch65Id, order: 01, title: ch65L01Content._meta?.title ?? "Lesson 01", titleAr: ch65L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch65L01Content._meta?.xp_reward ?? 10, content: ch65L01Content },
    { id: "ch65-l02", chapterId: ch65Id, order: 02, title: ch65L02Content._meta?.title ?? "Lesson 02", titleAr: ch65L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch65L02Content._meta?.xp_reward ?? 10, content: ch65L02Content },
    { id: "ch65-l03", chapterId: ch65Id, order: 03, title: ch65L03Content._meta?.title ?? "Lesson 03", titleAr: ch65L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch65L03Content._meta?.xp_reward ?? 10, content: ch65L03Content },
    { id: "ch65-l04", chapterId: ch65Id, order: 04, title: ch65L04Content._meta?.title ?? "Lesson 04", titleAr: ch65L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch65L04Content._meta?.xp_reward ?? 10, content: ch65L04Content },
    { id: "ch65-l05", chapterId: ch65Id, order: 05, title: ch65L05Content._meta?.title ?? "Lesson 05", titleAr: ch65L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch65L05Content._meta?.xp_reward ?? 10, content: ch65L05Content },
    { id: "ch65-l06", chapterId: ch65Id, order: 06, title: ch65L06Content._meta?.title ?? "Lesson 06", titleAr: ch65L06Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch65L06Content._meta?.xp_reward ?? 15, content: ch65L06Content },
    // Chapter 66
    { id: "ch66-l01", chapterId: ch66Id, order: 01, title: ch66L01Content._meta?.title ?? "Lesson 01", titleAr: ch66L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch66L01Content._meta?.xp_reward ?? 10, content: ch66L01Content },
    { id: "ch66-l02", chapterId: ch66Id, order: 02, title: ch66L02Content._meta?.title ?? "Lesson 02", titleAr: ch66L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch66L02Content._meta?.xp_reward ?? 10, content: ch66L02Content },
    { id: "ch66-l03", chapterId: ch66Id, order: 03, title: ch66L03Content._meta?.title ?? "Lesson 03", titleAr: ch66L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch66L03Content._meta?.xp_reward ?? 10, content: ch66L03Content },
    { id: "ch66-l04", chapterId: ch66Id, order: 04, title: ch66L04Content._meta?.title ?? "Lesson 04", titleAr: ch66L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch66L04Content._meta?.xp_reward ?? 10, content: ch66L04Content },
    { id: "ch66-l05", chapterId: ch66Id, order: 05, title: ch66L05Content._meta?.title ?? "Lesson 05", titleAr: ch66L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch66L05Content._meta?.xp_reward ?? 10, content: ch66L05Content },
    { id: "ch66-l06", chapterId: ch66Id, order: 06, title: ch66L06Content._meta?.title ?? "Lesson 06", titleAr: ch66L06Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch66L06Content._meta?.xp_reward ?? 5, content: ch66L06Content },
    // Chapter 67
    { id: "ch67-l01", chapterId: ch67Id, order: 01, title: ch67L01Content._meta?.title ?? "Lesson 01", titleAr: ch67L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch67L01Content._meta?.xp_reward ?? 10, content: ch67L01Content },
    { id: "ch67-l02", chapterId: ch67Id, order: 02, title: ch67L02Content._meta?.title ?? "Lesson 02", titleAr: ch67L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch67L02Content._meta?.xp_reward ?? 10, content: ch67L02Content },
    { id: "ch67-l03", chapterId: ch67Id, order: 03, title: ch67L03Content._meta?.title ?? "Lesson 03", titleAr: ch67L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch67L03Content._meta?.xp_reward ?? 10, content: ch67L03Content },
    { id: "ch67-l04", chapterId: ch67Id, order: 04, title: ch67L04Content._meta?.title ?? "Lesson 04", titleAr: ch67L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch67L04Content._meta?.xp_reward ?? 10, content: ch67L04Content },
    { id: "ch67-l05", chapterId: ch67Id, order: 05, title: ch67L05Content._meta?.title ?? "Lesson 05", titleAr: ch67L05Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch67L05Content._meta?.xp_reward ?? 5, content: ch67L05Content },
    // Chapter 68
    { id: "ch68-l01", chapterId: ch68Id, order: 01, title: ch68L01Content._meta?.title ?? "Lesson 01", titleAr: ch68L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch68L01Content._meta?.xp_reward ?? 10, content: ch68L01Content },
    { id: "ch68-l02", chapterId: ch68Id, order: 02, title: ch68L02Content._meta?.title ?? "Lesson 02", titleAr: ch68L02Content._meta?.titleAr ?? "", template: "VERB_PATTERN", xpReward: ch68L02Content._meta?.xp_reward ?? 10, content: ch68L02Content },
    { id: "ch68-l03", chapterId: ch68Id, order: 03, title: ch68L03Content._meta?.title ?? "Lesson 03", titleAr: ch68L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch68L03Content._meta?.xp_reward ?? 10, content: ch68L03Content },
    { id: "ch68-l04", chapterId: ch68Id, order: 04, title: ch68L04Content._meta?.title ?? "Lesson 04", titleAr: ch68L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch68L04Content._meta?.xp_reward ?? 10, content: ch68L04Content },
    { id: "ch68-l05", chapterId: ch68Id, order: 05, title: ch68L05Content._meta?.title ?? "Lesson 05", titleAr: ch68L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch68L05Content._meta?.xp_reward ?? 10, content: ch68L05Content },
    { id: "ch68-l06", chapterId: ch68Id, order: 06, title: ch68L06Content._meta?.title ?? "Lesson 06", titleAr: ch68L06Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch68L06Content._meta?.xp_reward ?? 5, content: ch68L06Content },
    // Chapter 69
    { id: "ch69-l01", chapterId: ch69Id, order: 01, title: ch69L01Content._meta?.title ?? "Lesson 01", titleAr: ch69L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch69L01Content._meta?.xp_reward ?? 10, content: ch69L01Content },
    { id: "ch69-l02", chapterId: ch69Id, order: 02, title: ch69L02Content._meta?.title ?? "Lesson 02", titleAr: ch69L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch69L02Content._meta?.xp_reward ?? 10, content: ch69L02Content },
    { id: "ch69-l03", chapterId: ch69Id, order: 03, title: ch69L03Content._meta?.title ?? "Lesson 03", titleAr: ch69L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch69L03Content._meta?.xp_reward ?? 10, content: ch69L03Content },
    { id: "ch69-l04", chapterId: ch69Id, order: 04, title: ch69L04Content._meta?.title ?? "Lesson 04", titleAr: ch69L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch69L04Content._meta?.xp_reward ?? 10, content: ch69L04Content },
    { id: "ch69-l05", chapterId: ch69Id, order: 05, title: ch69L05Content._meta?.title ?? "Lesson 05", titleAr: ch69L05Content._meta?.titleAr ?? "", template: "REVIEW", xpReward: ch69L05Content._meta?.xp_reward ?? 5, content: ch69L05Content },
    // Chapter 70
    { id: "ch70-l01", chapterId: ch70Id, order: 01, title: ch70L01Content._meta?.title ?? "Lesson 01", titleAr: ch70L01Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch70L01Content._meta?.xp_reward ?? 10, content: ch70L01Content },
    { id: "ch70-l02", chapterId: ch70Id, order: 02, title: ch70L02Content._meta?.title ?? "Lesson 02", titleAr: ch70L02Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch70L02Content._meta?.xp_reward ?? 10, content: ch70L02Content },
    { id: "ch70-l03", chapterId: ch70Id, order: 03, title: ch70L03Content._meta?.title ?? "Lesson 03", titleAr: ch70L03Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch70L03Content._meta?.xp_reward ?? 10, content: ch70L03Content },
    { id: "ch70-l04", chapterId: ch70Id, order: 04, title: ch70L04Content._meta?.title ?? "Lesson 04", titleAr: ch70L04Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch70L04Content._meta?.xp_reward ?? 10, content: ch70L04Content },
    { id: "ch70-l05", chapterId: ch70Id, order: 05, title: ch70L05Content._meta?.title ?? "Lesson 05", titleAr: ch70L05Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch70L05Content._meta?.xp_reward ?? 10, content: ch70L05Content },
    { id: "ch70-l06", chapterId: ch70Id, order: 06, title: ch70L06Content._meta?.title ?? "Lesson 06", titleAr: ch70L06Content._meta?.titleAr ?? "", template: "STANDARD", xpReward: ch70L06Content._meta?.xp_reward ?? 5, content: ch70L06Content },
    { id: "ch70-l07", chapterId: ch70Id, order: 07, title: ch70L07SpContent._meta?.title ?? "SP11 Capstone Spoken Practice", titleAr: ch70L07SpContent._meta?.titleAr ?? "", template: "SPOKEN_PHRASES", xpReward: ch70L07SpContent._meta?.xp_reward ?? 10, content: ch70L07SpContent },
    // Chapter 71
    { id: "ch71-l01", chapterId: ch71Id, order: 01, title: ch71L01Content._meta?.title ?? "Lesson 01", titleAr: ch71L01Content._meta?.titleAr ?? "", template: ch71L01Content.template ?? "STANDARD", xpReward: ch71L01Content._meta?.xp_reward ?? 10, content: ch71L01Content },
    { id: "ch71-l02", chapterId: ch71Id, order: 02, title: ch71L02Content._meta?.title ?? "Lesson 02", titleAr: ch71L02Content._meta?.titleAr ?? "", template: ch71L02Content.template ?? "STANDARD", xpReward: ch71L02Content._meta?.xp_reward ?? 10, content: ch71L02Content },
    { id: "ch71-l03", chapterId: ch71Id, order: 03, title: ch71L03Content._meta?.title ?? "Lesson 03", titleAr: ch71L03Content._meta?.titleAr ?? "", template: ch71L03Content.template ?? "STANDARD", xpReward: ch71L03Content._meta?.xp_reward ?? 10, content: ch71L03Content },
    { id: "ch71-l04", chapterId: ch71Id, order: 04, title: ch71L04Content._meta?.title ?? "Lesson 04", titleAr: ch71L04Content._meta?.titleAr ?? "", template: ch71L04Content.template ?? "STANDARD", xpReward: ch71L04Content._meta?.xp_reward ?? 10, content: ch71L04Content },
    { id: "ch71-l05", chapterId: ch71Id, order: 05, title: ch71L05Content._meta?.title ?? "Lesson 05", titleAr: ch71L05Content._meta?.titleAr ?? "", template: ch71L05Content.template ?? "STANDARD", xpReward: ch71L05Content._meta?.xp_reward ?? 10, content: ch71L05Content },
    { id: "ch71-l06", chapterId: ch71Id, order: 06, title: ch71L06Content._meta?.title ?? "Lesson 06", titleAr: ch71L06Content._meta?.titleAr ?? "", template: ch71L06Content.template ?? "STANDARD", xpReward: ch71L06Content._meta?.xp_reward ?? 10, content: ch71L06Content },
    { id: "ch71-l07", chapterId: ch71Id, order: 07, title: ch71L07Content._meta?.title ?? "R11 Review", titleAr: ch71L07Content._meta?.titleAr ?? "", template: ch71L07Content.template ?? "REVIEW", xpReward: ch71L07Content._meta?.xp_reward ?? 20, content: ch71L07Content },
    // Chapter 72
    { id: "ch72-l01", chapterId: ch72Id, order: 01, title: ch72L01Content._meta?.title ?? "Lesson 01", titleAr: ch72L01Content._meta?.titleAr ?? "", template: ch72L01Content.template ?? "STANDARD", xpReward: ch72L01Content._meta?.xp_reward ?? 10, content: ch72L01Content },
    { id: "ch72-l02", chapterId: ch72Id, order: 02, title: ch72L02Content._meta?.title ?? "Lesson 02", titleAr: ch72L02Content._meta?.titleAr ?? "", template: ch72L02Content.template ?? "STANDARD", xpReward: ch72L02Content._meta?.xp_reward ?? 10, content: ch72L02Content },
    { id: "ch72-l03", chapterId: ch72Id, order: 03, title: ch72L03Content._meta?.title ?? "Lesson 03", titleAr: ch72L03Content._meta?.titleAr ?? "", template: ch72L03Content.template ?? "STANDARD", xpReward: ch72L03Content._meta?.xp_reward ?? 10, content: ch72L03Content },
    { id: "ch72-l04", chapterId: ch72Id, order: 04, title: ch72L04Content._meta?.title ?? "Lesson 04", titleAr: ch72L04Content._meta?.titleAr ?? "", template: ch72L04Content.template ?? "STANDARD", xpReward: ch72L04Content._meta?.xp_reward ?? 10, content: ch72L04Content },
    { id: "ch72-l05", chapterId: ch72Id, order: 05, title: ch72L05Content._meta?.title ?? "Lesson 05", titleAr: ch72L05Content._meta?.titleAr ?? "", template: ch72L05Content.template ?? "STANDARD", xpReward: ch72L05Content._meta?.xp_reward ?? 10, content: ch72L05Content },
    { id: "ch72-l06", chapterId: ch72Id, order: 06, title: ch72L06Content._meta?.title ?? "Lesson 06", titleAr: ch72L06Content._meta?.titleAr ?? "", template: ch72L06Content.template ?? "STANDARD", xpReward: ch72L06Content._meta?.xp_reward ?? 10, content: ch72L06Content },
    { id: "ch72-l07", chapterId: ch72Id, order: 07, title: ch72L07Content._meta?.title ?? "Lesson 07", titleAr: ch72L07Content._meta?.titleAr ?? "", template: ch72L07Content.template ?? "STANDARD", xpReward: ch72L07Content._meta?.xp_reward ?? 10, content: ch72L07Content },
    { id: "ch72-l08", chapterId: ch72Id, order: 08, title: ch72L08Content._meta?.title ?? "R15 Capstone Review", titleAr: ch72L08Content._meta?.titleAr ?? "", template: ch72L08Content.template ?? "REVIEW", xpReward: ch72L08Content._meta?.xp_reward ?? 20, content: ch72L08Content }
  ].map((lesson) => ({
    ...lesson,
    titleUr: lesson.content?._meta?.titleUr ?? localizeMetadata(lesson.title),
  }));
  for (const { id, ...data } of lessons) {
    await prisma.lesson.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  await cleanupObsoleteAuthoredLessons(lessons);

  await seedVocabulary(prisma, existingVocabularyMedia);
  await seedTadabbur(prisma);
  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

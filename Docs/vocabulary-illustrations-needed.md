# Vocabulary illustrations needed

Generated 2026-09-14 from the production database. **335 published words** had no
illustration: 16 curriculum words (Chapters 1–5) and 319 Core 500 words.

**2026-09-15: the 16 curriculum illustrations are delivered and live** (all URLs
HEAD 200; coverage 601/920). The Curriculum sections below are kept for the
record. **319 Core 500 words remain.**
The companion `vocabulary-illustrations-needed.csv` carries the same rows plus the
database `word_id`, which is what the upload step keys on.

## How to deliver

1. **One PNG per row, named exactly as the `Filename` column**, e.g.
   `rahma-mercy-transparent.png`. The name is what links the file to the word.
2. **Style:** same as the existing set — a single object or scene, transparent
   background, square, the Warsh palette (deep green, gold, cream, ink), realistic
   render. Any size is fine; compression to 768 px / ≤100 KB happens on upload,
   so send the full-quality original (it also becomes the local master copy).
3. Drop them all in **one folder** (sub-folders are fine) and say where it is.
4. Then Claude runs the compress + upload step, which sets each word's `imageUrl`,
   re-checks every URL, and reports coverage:
   ```powershell
   cd warsh-backend
   node scripts/compress-images.cjs --input <folder> --output exports/image-tests-compressed/<name> --target 100kb
   $env:VOCAB_IMAGE_SOURCE_DIR = "exports/image-tests-compressed/<name>"
   npm run images:upload -- --dry-run --manifest=../Docs/vocabulary-illustrations-needed.csv
   npm run images:upload -- --manifest=../Docs/vocabulary-illustrations-needed.csv
   ```
   `--manifest` keys on `word_id`; without it the uploader slug-matches and
   `raja-hope` would overwrite three words.

**Particles and abstract verbs** (`مِن`, `أَنَّ`, `لَعَلَّ`, "to know", …) have no
natural picture. Options: draw a symbolic scene, or leave those rows out — a word
without an image simply renders without one. The `Type` column marks them.


## Core 500 · Set 1

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 1 | `ma-what-transparent.png` | ما | mā | what; not | کیا، جو؛ نہیں | particle |
| 2 | `la-no-transparent.png` | لا | lā | no, not | نہیں | particle |

## Core 500 · Set 2

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 3 | `inna-indeed-transparent.png` | إِنَّ | inna | indeed, truly | بےشک | particle |
| 4 | `kana-be-transparent.png` | كانَ | kāna | to be | ہونا | verb past |

## Core 500 · Set 3

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 5 | `li-for-transparent.png` | لِ | li | for, to, belonging to | کے لیے | particle |
| 6 | `dha-this-transparent.png` | ذا | dhā | this | یہ | particle |

## Core 500 · Set 4

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 7 | `in-if-transparent.png` | إِن | in | if | اگر | particle |
| 8 | `illa-except-transparent.png` | إِلَّا | illā | except, unless | سوائے، مگر | particle |
| 9 | `an-that-transparent.png` | أَن | an | that, to (before a verb) | کہ | particle |
| 10 | `amana-believe-transparent.png` | آمَنَ | āmana | to believe, to have faith | ایمان لانا | verb past |

## Core 500 · Set 5

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 11 | `an-from-transparent.png` | عَن | ʿan | from, about, away from | سے، کے بارے میں | particle |

## Core 500 · Set 6

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 12 | `qad-indeed-transparent.png` | قَد | qad | indeed, already | یقیناً، بےشک | particle |
| 13 | `qawm-people-transparent.png` | قَوْم | qawm | people, folk, nation | قوم | noun |
| 14 | `alima-know-transparent.png` | عَلِمَ | ʿalima | to know | جاننا | verb past |
| 15 | `anna-that-transparent.png` | أَنَّ | anna | that | کہ | particle |

## Core 500 · Set 7

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 16 | `lam-did-not-transparent.png` | لَم | lam | did not | نہیں | particle |
| 17 | `jaala-make-transparent.png` | جَعَلَ | jaʿala | to make, to place | بنانا، رکھنا | verb past |

## Core 500 · Set 8

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 18 | `shay-thing-transparent.png` | شَيْء | shayʾ | thing | چیز | noun |

## Core 500 · Set 9

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 19 | `aw-or-transparent.png` | أَو | aw | or | یا | particle |

## Core 500 · Set 10

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 20 | `bayn-between-transparent.png` | بَيْن | bayn | between, among | درمیان | particle |
| 21 | `ata-come-transparent.png` | أَتَى | atā | to come, to arrive | آنا | verb past |

## Core 500 · Set 11

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 22 | `idh-when-transparent.png` | إِذ | idh | when (in the past) | جب | particle |
| 23 | `shaa-will-transparent.png` | شاءَ | shāʾa | to will, to wish | چاہنا | verb past |
| 24 | `ayy-which-transparent.png` | أَيّ | ayy | which, whichever | کون سا | noun |

## Core 500 · Set 12

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 25 | `law-if-transparent.png` | لَو | law | if (were it so) | اگر | particle |
| 26 | `ind-with-transparent.png` | عِند | ʿind | with, near, in the sight of | پاس، نزدیک | particle |

## Core 500 · Set 13

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 27 | `kadhdhaba-deny-transparent.png` | كَذَّبَ | kadhdhaba | to deny, to call a lie | جھٹلانا | verb past |
| 28 | `ittaqa-be-mindful-of-transparent.png` | اتَّقَى | ittaqā | to be mindful of God, to fear Him | تقویٰ اختیار کرنا، ڈرنا | verb past |

## Core 500 · Set 14

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 29 | `lamma-when-transparent.png` | لَمّا | lammā | when; not yet | جب؛ ابھی نہیں | particle |
| 30 | `maa-with-transparent.png` | مَعَ | maʿa | with, together with | ساتھ | particle |
| 31 | `bad-some-transparent.png` | بَعْض | baʿḍ | some, part of, one another | بعض، کچھ | noun |

## Core 500 · Set 15

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 32 | `dhu-possessor-of-transparent.png` | ذُو | dhū | possessor of, owner of | والا، مالک | noun |
| 33 | `ghayr-other-than-transparent.png` | غَيْر | ghayr | other than, without | کے سوا، بغیر | noun |

## Core 500 · Set 16

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 34 | `dun-besides-transparent.png` | دُون | dūn | besides, other than, short of | سوا، کے علاوہ | noun |
| 35 | `hatta-until-transparent.png` | حَتَّى | ḥattā | until, so that | یہاں تک کہ | particle |

## Core 500 · Set 17

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 36 | `arada-want-transparent.png` | أَرادَ | arāda | to want, to intend | ارادہ کرنا، چاہنا | verb past |
| 37 | `am-or-transparent.png` | أَم | am | or (in questions) | یا | particle |
| 38 | `ittabaa-follow-transparent.png` | اتَّبَعَ | ittabaʿa | to follow | پیروی کرنا | verb past |

## Core 500 · Set 18

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 39 | `laalla-so-that-transparent.png` | لَعَلَّ | laʿalla | so that, perhaps | تاکہ، شاید | particle |

## Core 500 · Set 19

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 40 | `bal-rather-transparent.png` | بَل | bal | rather, on the contrary | بلکہ | particle |
| 41 | `ahl-people-of-transparent.png` | أَهْل | ahl | people of, family, folk | اہل، والے | noun |
| 42 | `ittakhadha-take-for-oneself-transparent.png` | اتَّخَذَ | ittakhadha | to take for oneself, to adopt | بنا لینا | verb past |

## Core 500 · Set 20

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 43 | `mubin-clear-transparent.png` | مُبِين | mubīn | clear, manifest | واضح، کھلا | noun |
| 44 | `zalama-wrong-transparent.png` | ظَلَمَ | ẓalama | to wrong, to oppress | ظلم کرنا | verb past |

## Core 500 · Set 21

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 45 | `azim-great-transparent.png` | عَظِيم | ʿaẓīm | great, mighty | عظیم، بڑا | adjective |

## Core 500 · Set 22

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 46 | `lan-will-never-transparent.png` | لَن | lan | will never | ہرگز نہیں | particle |
| 47 | `fa-then-transparent.png` | فَ | fa | then, so | پس، تو | particle |
| 48 | `aziz-almighty-transparent.png` | عَزِيز | ʿazīz | almighty, mighty, precious | غالب، زبردست | noun |
| 49 | `akhraja-bring-out-transparent.png` | أَخْرَجَ | akhraja | to bring out, to expel | نکالنا | verb past |

## Core 500 · Set 23

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 50 | `hal-is-do-transparent.png` | هَل | hal | is? do? (question word) | کیا؟ | particle |
| 51 | `qawl-word-transparent.png` | قَوْل | qawl | word, saying, speech | قول، بات | noun |

## Core 500 · Set 24

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 52 | `laysa-not-be-transparent.png` | لَيْسَ | laysa | to not be | نہیں ہے | verb past |
| 53 | `shaytan-satan-transparent.png` | شَيْطان | shayṭān | Satan, devil | شیطان | proper noun |
| 54 | `mathal-example-transparent.png` | مَثَل | mathal | example, parable, likeness | مثال | noun |

## Core 500 · Set 25

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 55 | `dhakara-remember-transparent.png` | ذَكَرَ | dhakara | to remember, to mention | یاد کرنا، ذکر کرنا | verb past |

## Core 500 · Set 26

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 56 | `kayf-how-transparent.png` | كَيْف | kayf | how | کیسے | noun |
| 57 | `qatala-kill-transparent.png` | قَتَلَ | qatala | to kill | قتل کرنا | verb past |

## Core 500 · Set 27

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 58 | `bunayy-my-dear-son-transparent.png` | بُنَيّ | bunayy | my dear son (affectionate) | میرے بیٹے | noun |
| 59 | `akthar-most-transparent.png` | أَكْثَر | akthar | most, the majority | اکثر، زیادہ تر | noun |

## Core 500 · Set 28

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 60 | `ashab-companions-transparent.png` | أَصْحاب | aṣḥāb | companions, people of | ساتھی، والے | noun |
| 61 | `tawalla-turn-away-transparent.png` | تَوَلَّى | tawallā | to turn away; to take charge of | منہ پھیرنا | verb past |
| 62 | `jahannam-hell-transparent.png` | جَهَنَّم | jahannam | Hell | جہنم | proper noun |

## Core 500 · Set 29

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 63 | `mithl-like-transparent.png` | مِثْل | mithl | like, similar to | جیسا، مانند | noun |

## Core 500 · Set 30

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 64 | `lawla-if-not-transparent.png` | لَوْلا | lawlā | if not, were it not for | اگر نہ ہوتا | particle |
| 65 | `khalid-abiding-forever-transparent.png` | خالِد | khālid | abiding forever, eternal | ہمیشہ رہنے والا | noun |
| 66 | `firawn-pharaoh-transparent.png` | فِرْعَوْن | Firʿawn | Pharaoh | فرعون | proper noun |

## Core 500 · Set 31

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 67 | `ahad-one-transparent.png` | أَحَد | aḥad | one, anyone | ایک، کوئی | noun |
| 68 | `alam-world-transparent.png` | عالَم | ʿālam | world, realm | جہان، عالم | noun |
| 69 | `alim-painful-transparent.png` | أَلِيم | alīm | painful | دردناک | adjective |

## Core 500 · Set 32

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 70 | `ataa-obey-transparent.png` | أَطاعَ | aṭāʿa | to obey | اطاعت کرنا | verb past |
| 71 | `awha-reveal-transparent.png` | أَوْحَى | awḥā | to reveal, to inspire | وحی کرنا | verb past |
| 72 | `bayyinah-clear-proof-transparent.png` | بَيِّنَة | bayyinah | clear proof, evidence | کھلی دلیل | noun |

## Core 500 · Set 33

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 73 | `ashraka-associate-partners-with-transparent.png` | أَشْرَكَ | ashraka | to associate partners with God | شرک کرنا | verb past |
| 74 | `alqa-throw-transparent.png` | أَلْقَى | alqā | to throw, to cast | ڈالنا، پھینکنا | verb past |
| 75 | `qiyamah-resurrection-transparent.png` | قِيامَة | qiyāmah | resurrection | قیامت | noun |

## Core 500 · Set 34

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 76 | `akhar-another-transparent.png` | آخَر | ākhar | another, other | دوسرا | noun |
| 77 | `waada-promise-transparent.png` | وَعَدَ | waʿada | to promise | وعدہ کرنا | verb past |

## Core 500 · Set 35

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 78 | `lakin-but-transparent.png` | لٰكِن | lākin | but, however | لیکن | particle |
| 79 | `lakinna-but-transparent.png` | لٰكِنَّ | lākinna | but (emphatic) | لیکن | particle |

## Core 500 · Set 36

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 80 | `adalla-lead-astray-transparent.png` | أَضَلَّ | aḍalla | to lead astray | گمراہ کرنا | verb past |
| 81 | `ummah-community-transparent.png` | أُمَّة | ummah | community, nation | امت | noun |
| 82 | `aba-fathers-transparent.png` | آباء | ābāʾ | fathers, forefathers | آباء، باپ دادا | noun |
| 83 | `asaba-befall-transparent.png` | أَصابَ | aṣāba | to befall, to strike | پہنچنا، آ پڑنا | verb past |

## Core 500 · Set 37

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 84 | `nazzala-send-down-transparent.png` | نَزَّلَ | nazzala | to send down (gradually) | نازل کرنا | verb past |

## Core 500 · Set 38

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 85 | `salihah-righteous-transparent.png` | صالِحَة | ṣāliḥah | righteous (feminine); good deed | نیک عمل | noun |
| 86 | `kasaba-earn-transparent.png` | كَسَبَ | kasaba | to earn, to acquire | کمانا | verb past |
| 87 | `tala-recite-transparent.png` | تَلا | talā | to recite; to follow | تلاوت کرنا | verb past |

## Core 500 · Set 39

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 88 | `nisa-women-transparent.png` | نِساء | nisāʾ | women | عورتیں | noun |
| 89 | `qada-decree-transparent.png` | قَضَى | qaḍā | to decree, to decide, to complete | فیصلہ کرنا | verb past |
| 90 | `sabara-be-patient-transparent.png` | صَبَرَ | ṣabara | to be patient, to endure | صبر کرنا | verb past |
| 91 | `sayyiah-evil-deed-transparent.png` | سَيِّئَة | sayyiʾah | evil deed, bad thing | برائی | noun |

## Core 500 · Set 40

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 92 | `nadhir-warner-transparent.png` | نَذِير | nadhīr | warner | ڈرانے والا | noun |
| 93 | `jara-flow-transparent.png` | جَرَى | jarā | to flow, to run | بہنا | verb past |
| 94 | `qaryah-town-transparent.png` | قَرْيَة | qaryah | town, village | بستی | noun |

## Core 500 · Set 41

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 95 | `shahid-witness-martyr-transparent.png` | شَهِيد | shahīd | witness | گواہ | noun |
| 96 | `massa-touch-transparent.png` | مَسَّ | massa | to touch, to afflict | چھونا، پہنچنا | verb past |
| 97 | `shadid-severe-transparent.png` | شَدِيد | shadīd | severe, intense | سخت | adjective |

## Core 500 · Set 42

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 98 | `nahar-river-transparent.png` | نَهَر | nahar | river | نہر، دریا | noun |

## Core 500 · Set 43

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 99 | `qatala-fight-transparent.png` | قاتَلَ | qātala | to fight | لڑنا، جنگ کرنا | verb past |
| 100 | `jami-all-transparent.png` | جَمِيع | jamīʿ | all, altogether | سب، تمام | noun |
| 101 | `dalla-go-astray-transparent.png` | ضَلَّ | ḍalla | to go astray, to stray | گمراہ ہونا، بھٹکنا | verb past |

## Core 500 · Set 44

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 102 | `khalq-creation-transparent.png` | خَلْق | khalq | creation | خلق، پیدائش | noun |
| 103 | `mujrim-criminal-transparent.png` | مُجْرِم | mujrim | criminal, sinner | مجرم | noun |
| 104 | `taht-under-transparent.png` | تَحْت | taḥt | under, beneath | نیچے | noun |
| 105 | `ahya-give-life-transparent.png` | أَحْيا | aḥyā | to give life, to revive | زندہ کرنا | verb past |

## Core 500 · Set 45

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 106 | `ahlaka-destroy-transparent.png` | أَهْلَكَ | ahlaka | to destroy | ہلاک کرنا | verb past |
| 107 | `tadhakkara-take-heed-transparent.png` | تَذَكَّرَ | tadhakkara | to take heed, to recollect | نصیحت پکڑنا | verb past |

## Core 500 · Set 46

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 108 | `nimah-blessing-transparent.png` | نِعْمَة | niʿmah | blessing, favour | نعمت | noun |
| 109 | `su-evil-transparent.png` | سُوء | sūʾ | evil, harm | برائی | noun |
| 110 | `iftara-fabricate-transparent.png` | افْتَرَى | iftarā | to fabricate, to invent (a lie) | جھوٹ گھڑنا | verb past |
| 111 | `muttaqi-godconscious-one-transparent.png` | مُتَّقِي | muttaqī | God-conscious one, the righteous | پرہیزگار، متقی | noun |

## Core 500 · Set 47

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 112 | `zada-increase-transparent.png` | زادَ | zāda | to increase, to add | بڑھنا، بڑھانا | verb past |
| 113 | `aqala-reason-transparent.png` | عَقَلَ | ʿaqala | to reason, to understand | عقل سے کام لینا، سمجھنا | verb past |
| 114 | `alam-most-knowing-transparent.png` | أَعْلَم | aʿlam | most knowing | خوب جاننے والا | noun |
| 115 | `wad-promise-transparent.png` | وَعْد | waʿd | promise | وعدہ | noun |

## Core 500 · Set 48

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 116 | `basar-sight-transparent.png` | بَصَر | baṣar | sight, vision | نگاہ، بینائی | noun |
| 117 | `dar-home-transparent.png` | دار | dār | home, abode | گھر، ٹھکانہ | noun |
| 118 | `mulk-dominion-transparent.png` | مُلْك | mulk | dominion, sovereignty | بادشاہت، ملک | noun |
| 119 | `saah-hour-transparent.png` | ساعَة | sāʿah | hour; the Hour | گھڑی؛ قیامت | noun |
| 120 | `zanna-think-transparent.png` | ظَنَّ | ẓanna | to think, to assume | گمان کرنا، سمجھنا | verb past |

## Core 500 · Set 49

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 121 | `shakara-be-grateful-transparent.png` | شَكَرَ | shakara | to be grateful, to thank | شکر کرنا | verb past |
| 122 | `nabbaa-inform-transparent.png` | نَبَّأَ | nabbaʾa | to inform, to tell | خبر دینا، بتانا | verb past |

## Core 500 · Set 50

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 123 | `hakama-judge-transparent.png` | حَكَمَ | ḥakama | to judge, to rule | فیصلہ کرنا | verb past |
| 124 | `yadhar-leave-transparent.png` | يَذَر | yadhar | to leave, to forsake | چھوڑنا | verb past |
| 125 | `khabir-allaware-transparent.png` | خَبِير | khabīr | all-aware | باخبر | adjective |

## Core 500 · Set 51

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 126 | `andhara-warn-transparent.png` | أَنذَرَ | andhara | to warn | ڈرانا، خبردار کرنا | verb past |
| 127 | `shahida-bear-witness-transparent.png` | شَهِدَ | shahida | to bear witness, to testify | گواہی دینا | verb past |
| 128 | `mushrik-one-who-associates-transparent.png` | مُشْرِك | mushrik | one who associates partners with God | مشرک | noun |
| 129 | `hasiba-think-transparent.png` | حَسِبَ | ḥasiba | to think, to reckon | سمجھنا، گمان کرنا | verb past |

## Core 500 · Set 52

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 130 | `nada-call-out-transparent.png` | نادَى | nādā | to call out | پکارنا | verb past |
| 131 | `malaka-own-transparent.png` | مَلَكَ | malaka | to own, to possess | مالک ہونا | verb past |
| 132 | `israil-israel-transparent.png` | إِسْرائِيل | Isrāʾīl | Israel | اسرائیل | proper noun |

## Core 500 · Set 53

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 133 | `sabbaha-glorify-transparent.png` | سَبَّحَ | sabbaḥa | to glorify, to declare God free of fault | تسبیح کرنا | verb past |
| 134 | `kalimah-word-transparent.png` | كَلِمَة | kalimah | word | کلمہ، بات | noun |
| 135 | `istataa-be-able-to-transparent.png` | اسْتَطاعَ | istaṭāʿa | to be able to | قدرت رکھنا، کر سکنا | verb past |

## Core 500 · Set 54

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 136 | `adkhala-admit-transparent.png` | أَدْخَلَ | adkhala | to admit, to cause to enter | داخل کرنا | verb past |
| 137 | `sawfa-will-transparent.png` | سَوْف | sawfa | will, shall (future) | عنقریب | particle |
| 138 | `salam-peace-transparent.png` | سَلام | salām | peace | سلامتی | noun |
| 139 | `fawq-above-transparent.png` | فَوْق | fawq | above, over | اوپر | noun |
| 140 | `allama-teach-transparent.png` | عَلَّمَ | ʿallama | to teach | سکھانا | verb past |

## Core 500 · Set 55

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 141 | `adhdhaba-punish-transparent.png` | عَذَّبَ | ʿadhdhaba | to punish, to torment | عذاب دینا | verb past |
| 142 | `taraka-leave-transparent.png` | تَرَكَ | taraka | to leave, to abandon | چھوڑنا | verb past |

## Core 500 · Set 56

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 143 | `istakbara-be-arrogant-transparent.png` | اسْتَكْبَرَ | istakbara | to be arrogant | تکبر کرنا | verb past |
| 144 | `ihtada-be-guided-transparent.png` | اهْتَدَى | ihtadā | to be guided, to find the way | ہدایت پانا | verb past |
| 145 | `ara-show-transparent.png` | أَرَى | arā | to show | دکھانا | verb past |
| 146 | `wayl-woe-transparent.png` | وَيْل | wayl | woe | ہلاکت، خرابی | noun |
| 147 | `bisa-how-wretched-is-transparent.png` | بِئْسَ | biʾsa | how wretched is, evil is | برا ہے | verb past |

## Core 500 · Set 57

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 148 | `khashiya-fear-transparent.png` | خَشِيَ | khashiya | to fear, to be in awe of | ڈرنا | verb past |
| 149 | `balagha-reach-transparent.png` | بَلَغَ | balagha | to reach, to attain | پہنچنا | verb past |
| 150 | `istaghfara-seek-forgiveness-transparent.png` | اسْتَغْفَرَ | istaghfara | to seek forgiveness | مغفرت مانگنا | verb past |
| 151 | `kabir-great-transparent.png` | كَبِير | kabīr | great, big | بڑا | adjective |
| 152 | `tawakkala-put-ones-trust-transparent.png` | تَوَكَّلَ | tawakkala | to put one's trust (in God) | بھروسہ کرنا، توکل کرنا | verb past |

## Core 500 · Set 58

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 153 | `sharik-partner-transparent.png` | شَرِيك | sharīk | partner, associate | شریک، ساجھی | noun |
| 154 | `ism-name-transparent.png` | اسْم | ism | name | نام | noun |
| 155 | `idhn-permission-transparent.png` | إِذْن | idhn | permission, leave | اجازت | noun |

## Core 500 · Set 59

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 156 | `harrama-forbid-transparent.png` | حَرَّمَ | ḥarrama | to forbid, to make unlawful | حرام کرنا | verb past |
| 157 | `bashshara-give-glad-tidings-transparent.png` | بَشَّرَ | bashshara | to give glad tidings | خوشخبری دینا | verb past |

## Core 500 · Set 60

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 158 | `mayyit-dead-transparent.png` | مَيِّت | mayyit | dead | مردہ | noun |
| 159 | `muhsin-doer-of-good-transparent.png` | مُحْسِن | muḥsin | doer of good | نیکی کرنے والا | noun |
| 160 | `radiya-be-pleased-transparent.png` | رَضِيَ | raḍiya | to be pleased, to be content | راضی ہونا | verb past |
| 161 | `maruf-what-is-right-transparent.png` | مَعْرُوف | maʿrūf | what is right, honourable, kind | نیکی، بھلی بات | noun |
| 162 | `dalal-error-transparent.png` | ضَلال | ḍalāl | error, misguidance | گمراہی | noun |

## Core 500 · Set 61

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 163 | `fasiq-defiantly-disobedient-transparent.png` | فاسِق | fāsiq | defiantly disobedient, transgressor | نافرمان، فاسق | noun |
| 164 | `hazina-grieve-transparent.png` | حَزِنَ | ḥazina | to grieve, to be sad | غمگین ہونا | verb past |
| 165 | `najja-save-transparent.png` | نَجَّى | najjā | to save, to deliver | نجات دینا، بچانا | verb past |
| 166 | `asa-staff-transparent.png` | عَصا | ʿaṣā | staff, stick | لاٹھی، عصا | verb past |

## Core 500 · Set 62

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 167 | `hashara-gather-transparent.png` | حَشَرَ | ḥashara | to gather, to assemble | جمع کرنا | verb past |
| 168 | `dhanb-sin-transparent.png` | ذَنْب | dhanb | sin, fault | گناہ | noun |
| 169 | `naam-cattle-transparent.png` | نَعَم | naʿam | cattle, livestock | مویشی، چوپائے | noun |
| 170 | `bashar-human-being-transparent.png` | بَشَر | bashar | human being, mortal | بشر، انسان | noun |

## Core 500 · Set 63

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 171 | `sadda-turn-away-transparent.png` | صَدَّ | ṣadda | to turn away, to hinder | روکنا | verb past |
| 172 | `sultan-authority-transparent.png` | سُلْطان | sulṭān | authority, warrant | دلیل، اختیار | noun |
| 173 | `radda-return-transparent.png` | رَدَّ | radda | to return, to turn back | لوٹانا، پھیرنا | verb past |
| 174 | `ahsan-best-transparent.png` | أَحْسَن | aḥsan | best, finest | بہترین | noun |
| 175 | `dhaqa-taste-transparent.png` | ذاقَ | dhāqa | to taste | چکھنا | verb past |

## Core 500 · Set 64

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 176 | `istawa-be-equal-transparent.png` | اسْتَوَى | istawā | to be equal; to settle, to rise over | برابر ہونا؛ قائم ہونا | verb past |
| 177 | `hin-time-transparent.png` | حِين | ḥīn | time, while | وقت، مدت | noun |

## Core 500 · Set 65

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 178 | `nasiya-forget-transparent.png` | نَسِيَ | nasiya | to forget | بھولنا | verb past |
| 179 | `bayyana-make-clear-transparent.png` | بَيَّنَ | bayyana | to make clear, to explain | واضح کرنا، بیان کرنا | verb past |
| 180 | `ithm-sin-transparent.png` | إِثْم | ithm | sin | گناہ | noun |
| 181 | `nasir-helper-transparent.png` | نَصِير | naṣīr | helper | مددگار | noun |
| 182 | `ikhtalafa-differ-transparent.png` | اخْتَلَفَ | ikhtalafa | to differ, to disagree | اختلاف کرنا | verb past |

## Core 500 · Set 66

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 183 | `mursal-one-who-is-transparent.png` | مُرْسَل | mursal | one who is sent, messenger | بھیجا ہوا، رسول | noun |
| 184 | `maryam-mary-transparent.png` | مَرْيَم | Maryam | Mary | مریم | proper noun |
| 185 | `fitnah-trial-transparent.png` | فِتْنَة | fitnah | trial, temptation, persecution | آزمائش، فتنہ | noun |
| 186 | `ibtagha-seek-transparent.png` | ابْتَغَى | ibtaghā | to seek, to desire | تلاش کرنا، چاہنا | verb past |

## Core 500 · Set 67

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 187 | `ala-favours-transparent.png` | آلاء | ālāʾ | favours, bounties | نعمتیں | noun |
| 188 | `fariq-party-transparent.png` | فَرِيق | farīq | party, group | گروہ | noun |

## Core 500 · Set 68

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 189 | `kadhib-lie-transparent.png` | كَذِب | kadhib | lie, falsehood | جھوٹ | noun |
| 190 | `kalla-no-indeed-transparent.png` | كَلّا | kallā | no indeed, by no means | ہرگز نہیں | particle |
| 191 | `khasir-loser-transparent.png` | خاسِر | khāsir | loser | نقصان اٹھانے والا | noun |
| 192 | `dhurriyyah-offspring-transparent.png` | ذُرِّيَّة | dhurriyyah | offspring, descendants | اولاد، نسل | noun |

## Core 500 · Set 69

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 193 | `kafa-suffice-transparent.png` | كَفَى | kafā | to suffice, to be enough | کافی ہونا | verb past |
| 194 | `kadhib-liar-transparent.png` | كاذِب | kādhib | liar | جھوٹا | noun |
| 195 | `aqibah-outcome-transparent.png` | عاقِبَة | ʿāqibah | outcome, final end | انجام | noun |
| 196 | `arada-turn-away-transparent.png` | أَعْرَضَ | aʿraḍa | to turn away, to shun | منہ پھیرنا | verb past |

## Core 500 · Set 70

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 197 | `hayth-where-transparent.png` | حَيْث | ḥayth | where, wherever | جہاں | particle |
| 198 | `ashadd-stronger-transparent.png` | أَشَدّ | ashadd | stronger, more severe | زیادہ سخت | noun |
| 199 | `nafaa-benefit-transparent.png` | نَفَعَ | nafaʿa | to benefit, to profit | فائدہ دینا | verb past |
| 200 | `idhan-then-transparent.png` | إِذًا | idhan | then, in that case | پھر، تب | particle |
| 201 | `hasanah-good-deed-transparent.png` | حَسَنَة | ḥasanah | good deed, good thing | نیکی، بھلائی | noun |

## Core 500 · Set 71

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 202 | `wahidah-one-transparent.png` | واحِدَة | wāḥidah | one (feminine), single | ایک | noun |
| 203 | `tayyibah-good-transparent.png` | طَيِّبَة | ṭayyibah | good, pure, wholesome (feminine) | پاکیزہ، اچھی | noun |
| 204 | `quwwah-strength-transparent.png` | قُوَّة | quwwah | strength, power | قوت، طاقت | noun |
| 205 | `walla-turn-transparent.png` | وَلَّى | wallā | to turn, to turn away | پھیرنا، منہ موڑنا | verb past |

## Core 500 · Set 72

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 206 | `ad-aad-transparent.png` | عاد | ʿĀd | Aad (an ancient people) | قومِ عاد | proper noun |
| 207 | `asa-perhaps-transparent.png` | عَسَى | ʿasā | perhaps, it may be | شاید، امید ہے | verb past |
| 208 | `mala-chiefs-transparent.png` | مَلَأ | malaʾ | chiefs, notables, assembly | سردار، اشرافیہ | noun |
| 209 | `labitha-remain-transparent.png` | لَبِثَ | labitha | to remain, to stay | ٹھہرنا، رہنا | verb past |

## Core 500 · Set 73

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 210 | `hukm-judgement-transparent.png` | حُكْم | ḥukm | judgement, wisdom, authority | حکم، فیصلہ، حکمت | noun |
| 211 | `karim-noble-transparent.png` | كَرِيم | karīm | noble, generous | کریم، بزرگ | adjective |
| 212 | `absara-see-transparent.png` | أَبْصَرَ | abṣara | to see, to perceive | دیکھنا | verb past |
| 213 | `ahd-covenant-transparent.png` | عَهْد | ʿahd | covenant, pledge | عہد، وعدہ | noun |

## Core 500 · Set 74

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 214 | `kaanna-as-if-transparent.png` | كَأَنَّ | kaʾanna | as if, as though | گویا، جیسے | particle |
| 215 | `jund-host-transparent.png` | جُنْد | jund | host, army, troops | لشکر، فوج | noun |

## Core 500 · Set 75

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 216 | `naba-news-transparent.png` | نَبَأ | nabaʾ | news, tiding | خبر | noun |
| 217 | `sihr-magic-transparent.png` | سِحْر | siḥr | magic, sorcery | جادو | noun |
| 218 | `masir-destination-transparent.png` | مَصِير | maṣīr | destination, final return | ٹھکانہ، انجام | noun |

## Core 500 · Set 76

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 219 | `aslaha-set-right-transparent.png` | أَصْلَحَ | aṣlaḥa | to set right, to reform, to reconcile | اصلاح کرنا، درست کرنا | verb past |
| 220 | `maghfirah-forgiveness-transparent.png` | مَغْفِرَة | maghfirah | forgiveness | مغفرت، بخشش | noun |
| 221 | `istajaba-respond-transparent.png` | اسْتَجابَ | istajāba | to respond, to answer (a call) | قبول کرنا، جواب دینا | verb past |
| 222 | `muminah-believing-woman-transparent.png` | مُؤْمِنَة | muʾminah | believing woman | مومن عورت | noun |
| 223 | `anna-how-transparent.png` | أَنَّى | annā | how, from where | کیسے، کہاں سے | particle |

## Core 500 · Set 77

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 224 | `rijal-men-transparent.png` | رِجال | rijāl | men | مرد | noun |
| 225 | `aghna-avail-transparent.png` | أَغْنَى | aghnā | to avail, to enrich, to suffice | کام آنا، بےنیاز کرنا | verb past |
| 226 | `asbaha-become-transparent.png` | أَصْبَحَ | aṣbaḥa | to become; to enter upon morning | ہو جانا؛ صبح کرنا | verb past |

## Core 500 · Set 78

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 227 | `sawa-equal-transparent.png` | سَواء | sawāʾ | equal, alike; the same | برابر، یکساں | noun |
| 228 | `afa-pardon-transparent.png` | عَفا | ʿafā | to pardon, to excuse | معاف کرنا | verb past |
| 229 | `ghafil-heedless-transparent.png` | غافِل | ghāfil | heedless, unaware | غافل، بےخبر | noun |
| 230 | `qaddama-send-forth-transparent.png` | قَدَّمَ | qaddama | to send forth, to put forward | آگے بھیجنا، پیش کرنا | verb past |

## Core 500 · Set 79

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 231 | `aflaha-succeed-transparent.png` | أَفْلَحَ | aflaḥa | to succeed, to prosper | کامیاب ہونا | verb past |
| 232 | `jahada-strive-transparent.png` | جاهَدَ | jāhada | to strive, to struggle | جہاد کرنا، کوشش کرنا | verb past |
| 233 | `makan-place-transparent.png` | مَكان | makān | place | جگہ | noun |
| 234 | `munafiq-hypocrite-transparent.png` | مُنافِق | munāfiq | hypocrite | منافق | noun |

## Core 500 · Set 80

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 235 | `yusuf-joseph-transparent.png` | يُوسُف | Yūsuf | Joseph | یوسف | proper noun |
| 236 | `lut-lot-transparent.png` | لُوط | Lūṭ | Lot | لوط | proper noun |
| 237 | `madha-what-transparent.png` | ماذا | mādhā | what | کیا | particle |
| 238 | `khawf-fear-transparent.png` | خَوْف | khawf | fear | خوف، ڈر | noun |

## Core 500 · Set 81

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 239 | `jahim-blazing-fire-transparent.png` | جَحِيم | jaḥīm | the blazing fire, Hellfire | جہنم، بھڑکتی آگ | noun |
| 240 | `shahadah-testimony-transparent.png` | شَهادَة | shahādah | testimony, witnessing | گواہی، شہادت | noun |
| 241 | `ajma-all-together-transparent.png` | أَجْمَع | ajmaʿ | all together | سب کے سب | noun |

## Core 500 · Set 82

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 242 | `zayyana-adorn-transparent.png` | زَيَّنَ | zayyana | to adorn, to make attractive | خوبصورت بنانا، آراستہ کرنا | verb past |
| 243 | `imraah-woman-transparent.png` | امْرَأَة | imraʾah | woman, wife | عورت، بیوی | noun |
| 244 | `kayd-plot-transparent.png` | كَيْد | kayd | plot, scheme | چال، سازش | noun |
| 245 | `thamud-thamud-transparent.png` | ثَمُود | Thamūd | Thamud (an ancient people) | قومِ ثمود | proper noun |
| 246 | `shaara-perceive-transparent.png` | شَعَرَ | shaʿara | to perceive, to be aware | شعور رکھنا، محسوس کرنا | verb past |

## Core 500 · Set 83

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 247 | `mithaq-covenant-transparent.png` | مِيثاق | mīthāq | covenant, solemn pledge | پختہ عہد | noun |
| 248 | `junah-blame-transparent.png` | جُناح | junāḥ | blame, sin | گناہ، حرج | noun |

## Core 500 · Set 84

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 249 | `baid-far-transparent.png` | بَعِيد | baʿīd | far, distant | دور | adjective |
| 250 | `bas-might-transparent.png` | بَأْس | baʾs | might, force; punishment | زور، سختی، عذاب | noun |
| 251 | `qadara-decree-transparent.png` | قَدَرَ | qadara | to decree, to measure; to restrict | اندازہ کرنا، تنگ کرنا | verb past |
| 252 | `bagha-seek-transparent.png` | بَغَى | baghā | to seek; to transgress | چاہنا؛ زیادتی کرنا | verb past |

## Core 500 · Set 85

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 253 | `jadala-dispute-transparent.png` | جادَلَ | jādala | to dispute, to argue | جھگڑنا، بحث کرنا | verb past |
| 254 | `iyya--transparent.png` | إِيّا | iyyā | (object pronoun base: him, them, you) | (ضمیرِ مفعول کی بنیاد) | particle |
| 255 | `kada-almost-transparent.png` | كادَ | kāda | to almost, to be on the point of | قریب ہونا، تقریباً | verb past |
| 256 | `wara-behind-transparent.png` | وَراء | warāʾ | behind, beyond | پیچھے | particle |

## Core 500 · Set 86

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 257 | `a--transparent.png` | أَ | a | (turns a sentence into a question) | کیا؟ (سوالیہ) | particle |
| 258 | `hayy-living-transparent.png` | حَيّ | ḥayy | living, alive | زندہ | noun |
| 259 | `untha-female-transparent.png` | أُنثَى | unthā | female | مادہ، عورت | noun |
| 260 | `akbar-greater-transparent.png` | أَكْبَر | akbar | greater, greatest | بڑا، سب سے بڑا | noun |
| 261 | `tawaffa-take-in-full-transparent.png` | تَوَفَّى | tawaffā | to take in full; to cause to die | پورا لینا؛ وفات دینا | verb past |

## Core 500 · Set 87

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 262 | `taifah-group-transparent.png` | طائِفَة | ṭāʾifah | group, party | گروہ، جماعت | noun |
| 263 | `wakil-trustee-transparent.png` | وَكِيل | wakīl | trustee, disposer of affairs | کارساز، وکیل | noun |
| 264 | `liqa-meeting-transparent.png` | لِقاء | liqāʾ | meeting, encounter | ملاقات | noun |
| 265 | `zulmah-darkness-transparent.png` | ظُلْمَة | ẓulmah | darkness | اندھیرا | noun |

## Core 500 · Set 88

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 266 | `sab-seven-transparent.png` | سَبْع | sabʿ | seven | سات | noun |
| 267 | `imma-either-transparent.png` | إِمّا | immā | either, or; if | یا تو، خواہ | particle |
| 268 | `anja-rescue-transparent.png` | أَنجَى | anjā | to rescue, to deliver | نجات دینا، بچانا | verb past |
| 269 | `sajid-one-prostrating-transparent.png` | ساجِد | sājid | one prostrating | سجدہ کرنے والا | noun |
| 270 | `baddala-change-transparent.png` | بَدَّلَ | baddala | to change, to substitute | بدلنا | verb past |

## Core 500 · Set 89

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 271 | `laana-curse-transparent.png` | لَعَنَ | laʿana | to curse | لعنت کرنا | verb past |
| 272 | `fulk-ship-transparent.png` | فُلْك | fulk | ship | کشتی، جہاز | noun |
| 273 | `adhina-permit-transparent.png` | أَذِنَ | adhina | to permit, to give leave | اجازت دینا | verb past |

## Core 500 · Set 90

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 274 | `fatana-test-transparent.png` | فَتَنَ | fatana | to test, to try, to tempt | آزمانا، فتنے میں ڈالنا | verb past |
| 275 | `dhikra-reminder-transparent.png` | ذِكْرَى | dhikrā | reminder, admonition | نصیحت، یاد دہانی | noun |
| 276 | `sam-hearing-transparent.png` | سَمْع | samʿ | hearing | سماعت، سننا | noun |

## Core 500 · Set 91

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 277 | `khalf-behind-transparent.png` | خَلْف | khalf | behind, after | پیچھے | noun |
| 278 | `bala-yes-indeed-transparent.png` | بَلَى | balā | yes indeed (contradicting a negative) | کیوں نہیں، ضرور | particle |
| 279 | `aslama-submit-transparent.png` | أَسْلَمَ | aslama | to submit (to God) | سپرد کرنا، اسلام لانا | verb past |
| 280 | `nasr-help-transparent.png` | نَصْر | naṣr | help, victory | مدد، فتح | noun |

## Core 500 · Set 92

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 281 | `raja-to-hope-transparent.png` | رَجا | rajā | to hope, to expect | امید رکھنا | verb past |
| 282 | `wahaba-grant-transparent.png` | وَهَبَ | wahaba | to grant, to bestow | عطا کرنا، بخشنا | verb past |
| 283 | `jamaa-gather-transparent.png` | جَمَعَ | jamaʿa | to gather, to collect | جمع کرنا | verb past |
| 284 | `lada-with-transparent.png` | لَدَى | ladā | with, at, in the presence of | پاس، نزدیک | particle |
| 285 | `makara-plot-transparent.png` | مَكَرَ | makara | to plot, to scheme | چال چلنا، سازش کرنا | verb past |

## Core 500 · Set 93

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 286 | `mawa-refuge-transparent.png` | مَأْوَى | maʾwā | refuge, abode | ٹھکانہ، پناہ | noun |
| 287 | `barr-land-transparent.png` | بَرّ | barr | land, dry land | خشکی | noun |
| 288 | `adhaqa-make-someone-taste-transparent.png` | أَذاقَ | adhāqa | to make someone taste | چکھانا | verb past |
| 289 | `sahir-magician-transparent.png` | ساحِر | sāḥir | magician, sorcerer | جادوگر | noun |

## Core 500 · Set 94

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 290 | `sakhkhara-subject-transparent.png` | سَخَّرَ | sakhkhara | to subject, to make serviceable | مسخر کرنا، کام میں لگانا | verb past |
| 291 | `mufsid-corrupter-transparent.png` | مُفْسِد | mufsid | corrupter, one who spreads corruption | فساد کرنے والا | noun |
| 292 | `istahzaa-mock-transparent.png` | اسْتَهْزَأَ | istahzaʾa | to mock, to ridicule | مذاق اڑانا | verb past |
| 293 | `ishtara-buy-transparent.png` | اشْتَرَى | ishtarā | to buy, to trade away | خریدنا، سودا کرنا | verb past |
| 294 | `ama-blind-transparent.png` | أَعْمَى | aʿmā | blind | اندھا | noun |

## Core 500 · Set 95

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 295 | `amata-cause-to-die-transparent.png` | أَماتَ | amāta | to cause to die | موت دینا | verb past |
| 296 | `katama-conceal-transparent.png` | كَتَمَ | katama | to conceal, to hide | چھپانا | verb past |

## Core 500 · Set 96

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 297 | `ahsana-do-good-transparent.png` | أَحْسَنَ | aḥsana | to do good, to do well | احسان کرنا، اچھا کرنا | verb past |
| 298 | `nasib-share-transparent.png` | نَصِيب | naṣīb | share, portion | حصہ | noun |
| 299 | `kam-how-many-transparent.png` | كَم | kam | how many, how much | کتنے، کتنا | noun |
| 300 | `hasan-good-transparent.png` | حَسَن | ḥasan | good, fair | اچھا، بھلا | adjective |
| 301 | `musamman-named-transparent.png` | مُسَمًّى | musamman | named, appointed, specified | مقرر، معین | noun |

## Core 500 · Set 97

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 302 | `wadaa-put-down-transparent.png` | وَضَعَ | waḍaʿa | to put down, to lay; to give birth | رکھنا، اتارنا؛ جنم دینا | verb past |
| 303 | `shahid-witness-transparent.png` | شاهِد | shāhid | witness | گواہ | noun |
| 304 | `mukadhdhib-denier-transparent.png` | مُكَذِّب | mukadhdhib | denier, one who calls it a lie | جھٹلانے والا | noun |
| 305 | `zann-assumption-transparent.png` | ظَنّ | ẓann | assumption, conjecture | گمان، خیال | noun |
| 306 | `aadda-prepare-transparent.png` | أَعَدَّ | aʿadda | to prepare | تیار کرنا | verb past |

## Core 500 · Set 98

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 307 | `awfa-fulfil-transparent.png` | أَوْفَى | awfā | to fulfil, to give in full | پورا کرنا | verb past |
| 308 | `arafa-know-transparent.png` | عَرَفَ | ʿarafa | to know, to recognise | پہچاننا، جاننا | verb past |
| 309 | `kallama-speak-to-transparent.png` | كَلَّمَ | kallama | to speak to, to address | بات کرنا، کلام کرنا | verb past |
| 310 | `hikmah-wisdom-transparent.png` | حِكْمَة | ḥikmah | wisdom | حکمت، دانائی | noun |

## Core 500 · Set 99

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 311 | `sabir-patient-one-transparent.png` | صابِر | ṣābir | patient one, steadfast | صبر کرنے والا | noun |
| 312 | `bala-test-transparent.png` | بَلا | balā | to test, to try | آزمانا | verb past |
| 313 | `ahalla-make-lawful-transparent.png` | أَحَلَّ | aḥalla | to make lawful, to permit | حلال کرنا | verb past |
| 314 | `amina-be-safe-transparent.png` | أَمِنَ | amina | to be safe, to feel secure | امن میں ہونا، بےخوف ہونا | verb past |
| 315 | `iqab-penalty-transparent.png` | عِقاب | ʿiqāb | penalty, retribution | سزا، عذاب | noun |

## Core 500 · Set 100

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 316 | `marrah-time-transparent.png` | مَرَّة | marrah | time, occasion | بار، دفعہ | noun |
| 317 | `harun-aaron-transparent.png` | هارُون | Hārūn | Aaron | ہارون | proper noun |
| 318 | `qassa-narrate-transparent.png` | قَصَّ | qaṣṣa | to narrate, to relate | بیان کرنا، قصہ سنانا | verb past |
| 319 | `aqsama-swear-an-oath-transparent.png` | أَقْسَمَ | aqsama | to swear an oath | قسم کھانا | verb past |

## Curriculum · Chapter 1

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 320 | `malik-owner-transparent.png` | مَالِك | mālik | owner, master, possessor | مالک | noun |

## Curriculum · Chapter 2

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 321 | `walid-father-transparent.png` | وَالِد | wālid | father (formal) | والد | noun |
| 322 | `walida-mother-transparent.png` | وَالِدَة | wālida | mother (formal) | والدہ | noun |
| 323 | `daw-light-transparent.png` | ضَوْء | ḍaw' | light, brightness | روشنی | noun |
| 324 | `isha-night-transparent.png` | عِشَاء | 'ishā' | night, isha prayer time | عشاء | noun |

## Curriculum · Chapter 3

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 325 | `malik-king-transparent.png` | مَلِك | malik | king, ruler | بادشاہ | noun |
| 326 | `usbu-week-transparent.png` | أُسْبُوع | usbū' | week | ہفتہ | noun |
| 327 | `zaman-time-transparent.png` | زَمَان | zamān | time, era, age | زمانہ، وقت | noun |
| 328 | `thamara-fruit-transparent.png` | ثَمَرَة | thamara | fruit, result | پھل، نتیجہ | noun |
| 329 | `raja-he-hoped-transparent.png` | رَجَا | rajā | he hoped, he expected | اس نے امید رکھی | verb past |
| 330 | `jami-congregational-mosque-transparent.png` | جَامِع | jāmi' | congregational mosque | جامع مسجد | noun |
| 331 | `fahima-he-understood-transparent.png` | فَهِمَ | fahima | he understood | اس نے سمجھا | verb past |
| 332 | `hafiza-he-memorized-transparent.png` | حَفِظَ | ḥafiẓa | he memorized, he preserved | اس نے حفظ کیا | verb past |

## Curriculum · Chapter 4

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 333 | `raja-hope-transparent.png` | رَجَاء | rajā' | hope, expectation | امید، رجاء | noun |
| 334 | `musalla-prayer-mat-transparent.png` | مُصَلَّى | muṣallā | prayer mat, prayer area | مصلی، جائے نماز | noun |

## Curriculum · Chapter 5

| # | Filename | Arabic | Transliteration | English | Urdu | Type |
|---|---|---|---|---|---|---|
| 335 | `dahr-time-transparent.png` | دَهْر | dahr | time, age, eternity | زمانہ، دہر | noun |

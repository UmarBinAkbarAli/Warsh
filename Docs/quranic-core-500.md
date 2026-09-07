# Quranic Core 500 — source list

**Status:** source data captured and verified. Glosses not yet written. Nothing in the database.
**Source:** <https://hafiz-quran.com/top-500-words-in-the-quran> (ranks, Arabic, frequency, part of speech), captured 2026-09-07.
**Verified against:** Quranic Arabic Corpus morphology v0.4 (130,030 segments, lemma + root).
**Machine-readable copy:** `Docs/data/quranic-core-500.json`

---

## What the verification found

| Check | Result |
|---|---|
| Words on the page | 500, ranks 1–500 with no gaps |
| Stated total occurrences | 62,430 (the "~80% of the Quran" claim) |
| Frequencies matching the corpus exactly | 448/500 |
| Frequencies differing from the corpus | 52 — corpus value shown in the flag |
| Entries that are bare one-letter prefixes | 5 |
| Headwords stored in a non-dictionary form | 20 |
| English glosses that are broken text | 8 |
| English glosses that translate one ayah rather than the word | 59 |

**The Arabic and the frequencies are good. The English and the transliterations are not.**

### Why the English has to be rewritten

A bad find-and-replace on that page has eaten the letters `go` out of its own text:

| Rank | Word | Page says | Should be |
|---|---|---|---|
| 76 | إِلٰه | "d" | god, deity |
| 214 | ضَلَّ | "es astray" | goes astray |
| 297 | مُحْسِن | "od-doers" | good-doers |
| 321 | نَسِيَ | "they fort" | they forgot |
| 350 | حَسَنَة | "od" | good |
| 476 | أَحْسَنَ | "do od" | to do good |

Separately, most glosses translate one particular ayah rather than defining the word —
قالَ is given as "Say", نَفْس as "themselves", فَوْق as "above them", عَبَدَ as "you worship".
Transliterations are mangled too (`walīī`, `qīāmaa`, `hudanā`, `dhurrīīaa`).

So we write our own English and Urdu from scratch. That was already the plan, and it also puts
the copyright question to bed: we take only the word list and the frequencies, which are facts
about the Quran, and none of the page's own prose.

### One-letter entries

Five entries are bare prefixes, not words a learner can hold as a card — and three of them sit
at ranks 11, 20 and 21, i.e. inside the first two lessons if we ordered purely by frequency:

| Rank | Word | Meaning | Occurrences |
|---|---|---|---|
| 11 | ل | for, to | 1299 |
| 20 | ب | with, by | 514 |
| 21 | و | and | 506 |
| 107 | ف | then, so | 103 |
| 426 | أ | ? (question prefix) | 24 |

This is exactly the reason we settled on frequency-first but **curated** sets. My recommendation:
teach these as a short "how words join together" set rather than as five flashcards, and let the
first real set open with اللَّه, رَبّ, قالَ.

### Relationship to the Lisan screenshots

Every word in the 290 I extracted from your screenshots falls between rank 1 and rank 294, and
**none is above 300** — so that app's 300 words are simply the top 300 of this list. The ten I
could not capture are ranks 2, 4, 7, 8, 9, 10, 11, 12, 20 and 21:
اللَّه، فِي، قالَ، الَّذِي، عَلَى، كانَ، لِ، ذا، بِ، وَ. The screenshot audit in
`quranic-core-500-word-audit.md` is superseded by this file.

---

## Flag key

| Flag | Meaning |
|---|---|
| `prefix` | one-letter particle, not a standalone flashcard |
| `form` | headword is an inflected/odd form; needs a dictionary form |
| `gloss` | English translates one ayah, not the word |
| `gloss!!` | English is broken text |
| `freq(n)` | corpus count differs from the page; `n` is the corpus value, which we use |

## The 500

Occurrences are the corpus value where the two disagree.

| # | Arabic | Source translit | Source gloss (to be rewritten) | Occurrences | Part of speech | Flags |
|---|---|---|---|---|---|---|
| 1 | مِن | min | from | 3226 | Preposition | — |
| 2 | اللَّه | Allāh | Allah | 2699 | Proper noun | — |
| 3 | ما | mā | what; not | 2565 | Relative pronoun | freq(2565) |
| 4 | فِي | fī | in | 1701 | Preposition | — |
| 5 | لا | lā | not, no | 1742 | Negative particle | freq(1742) |
| 6 | إِنّ | inn | indeed | 1682 | Accusative particle | — |
| 7 | قالَ | qāla | Say | 1618 | Verb | — |
| 8 | الَّذِي | ālladhī | those who | 1468 | Relative pronoun | — |
| 9 | عَلَى | ʿalā | on, upon | 1445 | Preposition | — |
| 10 | كانَ | kāna | is | 1358 | Verb | — |
| 11 | ل | l | for, to | 4380 | Preposition | prefix freq(4380) |
| 12 | ذا | dhā | this | 1058 | Demonstrative pronoun | — |
| 13 | رَبّ | rabb | Lord | 975 | Noun | — |
| 14 | مَن | man | who, whoever | 3226 | Relative pronoun | freq(3226) |
| 15 | إِلَى | ilā | to | 742 | Preposition | — |
| 16 | إِن | in | if | 1682 | Conditional particle | freq(1682) |
| 17 | إِلّا | illā | except | 659 | Restriction particle | — |
| 18 | أَن | an | that, to | 1682 | Subordinating conjunction | freq(1682) |
| 19 | آمَنَ | āmana | believe | 537 | Verb | — |
| 20 | ب | b | with, by | 2544 | Preposition | prefix freq(2544) |
| 21 | و | w | and | 9594 | Coordinating conjunction | prefix freq(9594) |
| 22 | يَوْم | yawm | day | 475 | Noun | — |
| 23 | عَن | ʿan | from, about | 465 | Preposition | — |
| 24 | أَرْض | arḍ | earth | 461 | Noun | — |
| 25 | إِذا | idhā | when | 423 | Time adverb | — |
| 26 | قَد | qad | indeed, certainly | 406 | Particle of certainty | — |
| 27 | قَوْم | qawm | people | 383 | Noun | — |
| 28 | عَلِمَ | ʿalima | know | 382 | Verb | — |
| 29 | آيَة | āyaa | Signs | 382 | Noun | — |
| 30 | أَنّ | ann | that | 1682 | Accusative particle | freq(1682) |
| 31 | كُلّ | kull | every | 359 | Noun | — |
| 32 | لَم | lam | did not | 348 | Negative particle | freq(348) |
| 33 | جَعَلَ | jaʿala | made | 340 | Verb | — |
| 34 | ثُمّ | thumm | then | 338 | Coordinating conjunction | — |
| 35 | رَسُول | rasūl | Messenger | 332 | Noun | — |
| 36 | عَذاب | ʿadhāb | punishment | 322 | Noun | — |
| 37 | سَماء | samā | heavens | 310 | Noun | — |
| 38 | نَفْس | nafs | themselves | 295 | Noun | — |
| 39 | كَفَرَ | kafara | disbelieved | 289 | Verb | — |
| 40 | شَىْء | shā | thing | 283 | Noun | — |
| 41 | أَو | aw | or | 280 | Coordinating conjunction | — |
| 42 | جاءَ | jāʾa | came to them | 278 | Verb | gloss |
| 43 | عَمِلَ | ʿamila | do | 276 | Verb | — |
| 44 | آتَى | ātā | were given | 271 | Verb | — |
| 45 | رَأَى | raā | you see | 271 | Verb | gloss |
| 46 | بَيْن | bayn | between them | 266 | Location adverb | gloss |
| 47 | أَتَى | atā | comes to them | 271 | Verb | gloss freq(271) |
| 48 | كِتاب | kitāb | Book | 260 | Noun | — |
| 49 | حَقّ | ḥaqq | truth | 247 | Noun | — |
| 50 | قَبْل | qabl | before | 242 | Noun | — |
| 51 | ناس | nās | people | 241 | Noun | — |
| 52 | إِذ | idh | when | 309 | Time adverb | freq(309) |
| 53 | شاءَ | shāʾa | He wills | 236 | Verb | gloss |
| 54 | أَيّ | ayy | which, whichever | 215 | Noun | — |
| 55 | مُؤْمِن | muʾmin | believers | 202 | Noun | — |
| 56 | لَو | law | if (only) | 201 | Conditional particle | freq(201) |
| 57 | بَعْد | baʿd | after | 199 | Noun | — |
| 58 | عِند | ʿind | near | 197 | Location adverb | — |
| 59 | خَلَقَ | khalaqa | created | 184 | Verb | — |
| 60 | أَنزَلَ | anzala | was revealed | 183 | Verb | — |
| 61 | خَيْر | khayr | better | 178 | Noun | — |
| 62 | كَذَّبَ | kadhdhaba | you both deny | 176 | Verb | gloss |
| 63 | سَبِيل | sabīl | way | 176 | Noun | — |
| 64 | دَعا | daʿā | they invoke | 170 | Verb | — |
| 65 | اتَّقَى | āttaqā | fear | 166 | Verb | — |
| 66 | أَمْر | amr | matter | 166 | Noun | — |
| 67 | لَمّا | lammā | when, not yet | 165 | Time adverb | — |
| 68 | مَع | maʿ | with | 164 | Location adverb | — |
| 69 | عَلِيم | ʿalīm | All-Knower | 163 | Adjective | — |
| 70 | بَعْض | baʿḍ | some of them | 157 | Noun | gloss |
| 71 | كافِر | kāfir | disbelievers | 156 | Noun | — |
| 72 | ذُو | dhū | possessor of | 156 | Noun | — |
| 73 | آخِر | ākhir | Hereafter | 155 | Noun | — |
| 74 | غَيْر | ghayr | without | 147 | Noun | — |
| 75 | جَنَّة | jannaa | Gardens | 147 | Noun | — |
| 76 | إِلٰه | ilāh | d | 147 | Noun | gloss!! |
| 77 | نار | nār | Fire | 145 | Noun | — |
| 78 | هَدَى | hadā | guide | 144 | Verb | — |
| 79 | دُون | dūn | besides | 144 | Noun | — |
| 80 | حَتَّى | ḥattā | until | 142 | Preposition | — |
| 81 | أَرادَ | arāda | He intends | 139 | Verb | gloss |
| 82 | أَم | am | Or | 137 | Coordinating conjunction | — |
| 83 | مُوسَى | mūsā | Moses (Musa) | 136 | Proper noun | — |
| 84 | اتَّبَعَ | āttabaʿa | follow | 136 | Verb | — |
| 85 | قَلْب | qalb | hearts | 132 | Noun | — |
| 86 | عَبْد | ʿabd | slaves | 131 | Noun | — |
| 87 | أَرْسَلَ | arsala | We sent | 130 | Verb | gloss |
| 88 | لَعَلّ | laʿall | so that, perhaps | 129 | Accusative particle | — |
| 89 | ظالِم | ẓālim | wrongdoers | 129 | Noun | — |
| 90 | أَخَذَ | akhadha | We took | 127 | Verb | gloss |
| 91 | بَل | bal | nay, rather | 127 | Retraction particle | — |
| 92 | أَهْل | ahl | People | 127 | Noun | — |
| 93 | اتَّخَذَ | āttakhadha | take | 124 | Verb | — |
| 94 | عَبَدَ | ʿabada | you worship | 131 | Verb | gloss freq(131) |
| 95 | يَد | yad | hands | 120 | Noun | — |
| 96 | مُبِين | mubīn | clear | 119 | Noun | — |
| 97 | رَحِيم | raḥīm | Most Merciful | 116 | Adjective | — |
| 98 | دُنْيا | dunyā | world | 115 | Adjective | — |
| 99 | رَحْمَة | raḥmaa | mercy | 114 | Noun | — |
| 100 | ظَلَمَ | ẓalama | wronged | 110 | Verb | — |
| 101 | عَظِيم | ʿaẓīm | great | 107 | Adjective | — |
| 102 | سَأَلَ | saala | you ask them | 106 | Verb | gloss |
| 103 | وَجَدَ | wajada | you will find | 106 | Verb | gloss |
| 104 | عِلْم | ʿilm | knowledge | 382 | Noun | freq(382) |
| 105 | أَجْر | ajr | reward | 105 | Noun | — |
| 106 | لَن | lan | never (will not) | 106 | Negative particle | freq(106) |
| 107 | ف | f | then, so | 3001 | Resumption particle | prefix freq(3001) |
| 108 | عَزِيز | ʿazīz | All-Mighty | 101 | Noun | — |
| 109 | أَخْرَجَ | akhraja | We bring forth | 99 | Verb | gloss |
| 110 | حَكِيم | ḥakīm | All-Wise | 97 | Adjective | — |
| 111 | أَكَلَ | akala | Eat | 93 | Verb | — |
| 112 | هَل | hal | is/do? (question) | 93 | Interrogative particle | — |
| 113 | دِين | dīn | religion | 92 | Noun | — |
| 114 | قَوْل | qawl | word | 92 | Verbal noun | — |
| 115 | غَفُور | ghafūr | Oft-Forgiving | 91 | Noun | — |
| 116 | لَيْسَ | laysa | not | 89 | Verb | — |
| 117 | شَيْطان | shayṭān | Shaitaan | 88 | Proper noun | — |
| 118 | مَثَل | mathal | an example | 88 | Noun | — |
| 119 | فَعَلَ | faʿala | you do | 88 | Verb | gloss |
| 120 | مَلَك | malak | Angels | 88 | Noun | — |
| 121 | نَظَرَ | naẓara | see | 87 | Verb | — |
| 122 | وَلِيّ | walīī | protector | 86 | Noun | — |
| 123 | مال | māl | wealth | 86 | Noun | — |
| 124 | هُدًى | hudanā | guidance | 144 | Noun | freq(144) |
| 125 | ذَكَرَ | dhakara | remember | 84 | Verb | — |
| 126 | فَضْل | faḍl | Bounty | 84 | Noun | — |
| 127 | لَيْل | layl | night | 84 | Noun | — |
| 128 | صَلاة | ṣalāa | prayer | 83 | Noun | — |
| 129 | كَيْف | kayf | how | 83 | Noun | — |
| 130 | قَتَلَ | qatala | kill | 83 | Verb | — |
| 131 | خافَ | khāfa | fear | 83 | Verb | — |
| 132 | أَوَّل | awwal | former | 82 | Noun | — |
| 133 | بُنَىّ | bunāā | Children | 80 | Noun | form |
| 134 | أَكْثَر | akthar | most of them | 80 | Noun | gloss |
| 135 | رَجَعَ | rajaʿa | return | 79 | Verb | — |
| 136 | أَصْحاب | aṣḥāb | companions | 78 | Noun | — |
| 137 | تَوَلَّى | tawallā | they turn away | 78 | Verb | — |
| 138 | سَمِعَ | samiʿa | hear | 78 | Verb | — |
| 139 | أَمَرَ | amara | you are commanded | 166 | Verb | gloss freq(166) |
| 140 | جَهَنَّم | jahannam | Hell | 77 | Proper noun | — |
| 141 | زَوْج | zawj | pairs | 76 | Noun | — |
| 142 | دَخَلَ | dakhala | Enter | 76 | Verb | — |
| 143 | حَياة | ḥayāa | life | 76 | Noun | — |
| 144 | ذِكْر | dhikr | remembrance | 84 | Verbal noun | freq(84) |
| 145 | مِثْل | mithl | like | 88 | Noun | freq(88) |
| 146 | نَبِيّ | nabīī | a Prophet | 75 | Noun | — |
| 147 | لَوْلا | lawlā | if not, were it not | 75 | Exhortation particle | — |
| 148 | أَخ | akh | brother | 75 | Noun | — |
| 149 | خالِد | khālid | abide forever | 74 | Noun | — |
| 150 | فِرْعَوْن | firʿawn | Pharaoh | 74 | Proper noun | — |
| 151 | صالِح | ṣāliḥ | righteous | 74 | Noun | — |
| 152 | أَحَد | aḥad | anyone | 74 | Noun | — |
| 153 | عالَم | ʿālam | worlds | 73 | Noun | — |
| 154 | جَزَى | jazā | We recompense | 73 | Verb | gloss |
| 155 | أَلِيم | alīm | painful | 72 | Adjective | — |
| 156 | وَجْه | wajh | faces | 72 | Noun | — |
| 157 | أَطاعَ | aṭāʿa | obey me | 72 | Verb | — |
| 158 | أَوْحَى | awḥā | We revealed | 72 | Verb | gloss |
| 159 | إِنسان | insān | man | 71 | Noun | — |
| 160 | بَيِّنَة | bayyinaa | with clear proofs | 71 | Noun | — |
| 161 | أَشْرَكَ | ashraka | they associate | 71 | Verb | — |
| 162 | عَمَل | ʿamal | deeds | 276 | Noun | freq(276) |
| 163 | أَلْقَى | alqā | Throw | 71 | Verb | — |
| 164 | قَلِيل | qalīl | a little | 70 | Noun | — |
| 165 | قِيامَة | qīāmaa | Resurrection | 70 | Noun | — |
| 166 | آخَر | ākhar | another | 155 | Noun | freq(155) |
| 167 | قُرْءان | qurʾān | Quran | 70 | Proper noun | — |
| 168 | وَعَدَ | waʿada | promised | 70 | Verb | — |
| 169 | إِبْراهِيم | ibrāhīm | Ibrahim | 69 | Proper noun | — |
| 170 | أَنفَقَ | anfaqa | they spend | 68 | Verb | — |
| 171 | لٰكِن | lākin | but | 65 | Amendment particle | — |
| 172 | غَفَرَ | ghafara | forgive | 65 | Verb | — |
| 173 | لٰكِنّ | lākinn | but | 65 | Accusative particle | — |
| 174 | بَيْت | bayt | houses | 65 | Noun | — |
| 175 | يَمِين | yamīn | right hands | 65 | Noun | — |
| 176 | أَضَلَّ | aḍalla | He lets astray | 64 | Verb | gloss |
| 177 | أُمَّة | ummaa | nation | 64 | Noun | — |
| 178 | آباء | ābā | forefathers | 64 | Noun | — |
| 179 | أَصابَ | aṣāba | befalls you | 64 | Verb | gloss |
| 180 | أَحْبَبْ | aḥbab | love | 64 | Verb | form |
| 181 | ماء | mā | water | 2565 | Noun | freq(2565) |
| 182 | كَثِير | kathīr | many | 63 | Noun | — |
| 183 | تابَ | tāba | repent | 63 | Verb | — |
| 184 | ابْن | ābn | son | 63 | Noun | — |
| 185 | نَزَّلَ | nazzala | sends down | 62 | Verb | — |
| 186 | صالِحَة | ṣāliḥaa | righteous deeds | 62 | Noun | — |
| 187 | كَسَبَ | kasaba | earn | 62 | Verb | — |
| 188 | رَزَقَ | razaqa | We have provided them | 61 | Verb | gloss |
| 189 | تَلَى | talā | are recited | 61 | Verb | — |
| 190 | صادِق | ṣādiq | truthful | 59 | Noun | — |
| 191 | نَصَرَ | naṣara | be helped | 59 | Verb | — |
| 192 | نِساء | nisā | women | 59 | Noun | — |
| 193 | قَضَى | qaḍā | He decrees | 59 | Verb | gloss |
| 194 | صَبَرَ | ṣabara | be patient | 58 | Verb | — |
| 195 | سَيِّئَة | sayyiʾaa | evil | 58 | Noun | — |
| 196 | نَذِير | nadhīr | a warner | 58 | Noun | — |
| 197 | رَحْمٰن | raḥmān | Most Gracious | 57 | Noun | — |
| 198 | جَرَيْ | jaray | flow | 57 | Verb | form |
| 199 | قَرْيَة | qaryaa | town | 57 | Noun | — |
| 200 | عَيْن | ʿayn | eyes | 57 | Noun | — |
| 201 | نَهار | nahār | the day | 57 | Noun | — |
| 202 | شَهِيد | shahīd | witnesses | 56 | Noun | — |
| 203 | مَسَّ | massa | touches | 56 | Verb | — |
| 204 | وَلَد | walad | a son | 56 | Noun | — |
| 205 | شَدِيد | shadīd | severe | 56 | Adjective | — |
| 206 | رِزْق | rizq | provision | 61 | Noun | freq(61) |
| 207 | ضَرَبَ | ḍaraba | Allah sets forth | 55 | Verb | — |
| 208 | أَمّا | ammā | But as for | 55 | Explanation particle | — |
| 209 | أَقامَ | aqāma | establish | 54 | Verb | — |
| 210 | نَهَر | nahar | rivers | 54 | Noun | — |
| 211 | قاتَلَ | qātala | they fight you | 54 | Verb | gloss |
| 212 | جَمِيع | jamīʿ | all | 53 | Noun | — |
| 213 | خَرَجَ | kharaja | they leave | 53 | Verb | — |
| 214 | ضَلَّ | ḍalla | es astray | 53 | Verb | gloss!! |
| 215 | بَعَثَ | baʿatha | We sent | 52 | Verb | gloss |
| 216 | خَلْق | khalq | creation | 184 | Noun | freq(184) |
| 217 | أَجَل | ajal | a term | 52 | Noun | — |
| 218 | مُجْرِم | mujrim | criminals | 52 | Noun | — |
| 219 | تَحْت | taḥt | underneath it | 51 | Noun | — |
| 220 | أَحْيا | aḥyā | gives life | 51 | Verb | — |
| 221 | بَصِير | baṣīr | All-Seer | 51 | Noun | — |
| 222 | أَهْلَكَ | ahlaka | We destroyed | 51 | Verb | gloss |
| 223 | تَذَكَّرَ | tadhakkara | remember | 51 | Verb | — |
| 224 | مَوْت | mawt | [the] death | 50 | Noun | — |
| 225 | عَدُوّ | ʿadūū | an enemy | 50 | Noun | — |
| 226 | نِعْمَة | niʿmaa | Favor | 50 | Noun | — |
| 227 | سُوء | sū | evil | 50 | Noun | — |
| 228 | افْتَرَى | āftarā | invent | 50 | Verb | — |
| 229 | مُتَّقي | muttaqy | righteous | 49 | Noun | — |
| 230 | غَيْب | ghayb | unseen | 49 | Noun | — |
| 231 | زادَ | zāda | increase | 49 | Verb | — |
| 232 | عَقَلُ | ʿaqalu | understand | 49 | Verb | form |
| 233 | كَتَبَ | kataba | Prescribed | 49 | Verb | — |
| 234 | أَعْلَم | aʿlam | most knowing | 49 | Noun | — |
| 235 | وَعْد | waʿd | Promise | 70 | Noun | freq(70) |
| 236 | بَصَر | baṣar | the sight | 48 | Noun | — |
| 237 | دار | dār | homes | 48 | Noun | — |
| 238 | مُلْك | mulk | dominion | 88 | Noun | freq(88) |
| 239 | ساعَة | sāʿaa | Hour | 48 | Noun | — |
| 240 | ظَنَّ | ẓanna | they thought | 47 | Verb | — |
| 241 | سَمِيع | samīʿ | All-Hearer | 47 | Noun | — |
| 242 | شَكَرَ | shakara | grateful | 46 | Verb | — |
| 243 | نَبَّأَ | nabbaa | He will inform you | 46 | Verb | form gloss |
| 244 | أَب | ab | father | 46 | Noun | — |
| 245 | صِراط | ṣirāṭ | a path | 45 | Noun | — |
| 246 | قَدِير | qadīr | All-Powerful | 45 | Noun | — |
| 247 | إِيمان | īmān | faith | 45 | Verbal noun | — |
| 248 | حَكَمَ | ḥakama | you judge | 45 | Verb | gloss |
| 249 | يَذَرَ | yadhara | leave them | 45 | Verb | gloss |
| 250 | خَبِير | khabīr | All-Aware | 45 | Adjective | — |
| 251 | أَنذَرَ | andhara | warn | 44 | Verb | — |
| 252 | شَهِدَ | shahida | bear witness | 44 | Verb | — |
| 253 | مُشْرِك | mushrik | polytheists | 44 | Noun | — |
| 254 | حَسِبَ | ḥasiba | think | 44 | Verb | — |
| 255 | صَدْر | ṣadr | breasts | 44 | Noun | — |
| 256 | نادَى | nādā | he called | 44 | Verb | gloss |
| 257 | مَلَكَتْ | malakat | possess | 44 | Verb | form |
| 258 | حَمْد | ḥamd | praise | 43 | Noun | — |
| 259 | نُور | nūr | light | 43 | Noun | — |
| 260 | إِسْرائِيل | isrāʾīl | Israel | 43 | Proper noun | — |
| 261 | نُوح | nūḥ | Noah (Nuh) | 43 | Proper noun | — |
| 262 | سَبَّحَ | sabbaḥa | glorify | 42 | Verb | — |
| 263 | كَلِمَة | kalimaa | word | 42 | Noun | — |
| 264 | جَزاء | jazā | a reward | 42 | Noun | — |
| 265 | اسْتَطاعَ | āstaṭāʿa | they are able | 42 | Verb | — |
| 266 | أُدْخِلَ | udkhila | He will admit him | 42 | Verb | form gloss |
| 267 | سَوْف | sawf | will (future) | 42 | Future particle | — |
| 268 | سَلام | salām | Peace | 42 | Noun | — |
| 269 | فَوْق | fawq | above them | 41 | Noun | gloss |
| 270 | عَلَّمَ | ʿallama | teaches you | 382 | Verb | gloss freq(382) |
| 271 | سُبْحان | subḥān | Glory be to Him | 41 | Noun | — |
| 272 | بَحْر | baḥr | sea | 41 | Noun | — |
| 273 | حَمَلَ | ḥamala | We carried | 41 | Verb | gloss |
| 274 | عَذَّبَ | ʿadhdhaba | punishes | 41 | Verb | — |
| 275 | تَرَكَ | taraka | left | 40 | Verb | — |
| 276 | اسْتَكْبَرَ | āstakbara | were arrogant | 40 | Verb | — |
| 277 | اهْتَدَى | āhtadā | guided | 40 | Verb | — |
| 278 | أَرَيْ | aray | We show you | 40 | Verb | form gloss |
| 279 | وَيْل | wayl | woe | 40 | Noun | — |
| 280 | بِئْسَ | biʾsa | wretched is | 40 | Verb | — |
| 281 | خَشِيَ | khashīa | fear | 40 | Verb | — |
| 282 | بَلَغَ | balagha | he reached | 40 | Verb | gloss |
| 283 | اسْتَغْفَرَ | āstaghfara | ask forgiveness | 40 | Verb | — |
| 284 | كَبِير | kabīr | great | 40 | Adjective | — |
| 285 | تَوَكَّلْ | tawakkal | let put trust | 40 | Verb | form |
| 286 | شَرِيك | sharīk | partners | 40 | Noun | — |
| 287 | اسْم | āsm | name | 39 | Noun | — |
| 288 | أَلا | alā | behold; unquestionably | 659 | Particle of alerting | freq(659) |
| 289 | إِذْن | idhn | by permission | 39 | Noun | — |
| 290 | مُسْلِم | muslim | Muslims | 39 | Noun | — |
| 291 | ماتَ | māta | we die | 39 | Verb | gloss |
| 292 | حَرَّمَ | ḥarrama | He has forbidden | 39 | Verb | gloss |
| 293 | حِساب | ḥisāb | measure | 39 | Verbal noun | — |
| 294 | جَبَل | jabal | mountains | 39 | Noun | — |
| 295 | بُشِّرَ | bushshira | give glad tidings | 38 | Verb | form |
| 296 | مَيِّت | mayyit | dead | 38 | Noun | — |
| 297 | مُحْسِن | muḥsin | od-doers | 38 | Noun | gloss!! |
| 298 | رَضِيَ | raḍīa | they are pleased | 38 | Verb | — |
| 299 | مَعْرُوف | maʿrūf | in a fair manner | 38 | Noun | — |
| 300 | ضَلال | ḍalāl | error | 38 | Noun | — |
| 301 | مُسْتَقِيم | mustaqīm | straight | 37 | Noun | — |
| 302 | فاسِق | fāsiq | defiantly disobedient | 37 | Noun | — |
| 303 | يَحْزُن | yaḥzun | grieve | 37 | Verb | form |
| 304 | نَجَّى | najjā | We saved | 37 | Verb | gloss |
| 305 | عَصا | ʿaṣā | with your staff | 37 | Verb | form gloss |
| 306 | كُفْر | kufr | [the] disbelief | 289 | Noun | freq(289) |
| 307 | حَشَرَ | ḥashara | you will be gathered | 37 | Verb | gloss |
| 308 | ذَنب | dhanb | sins | 37 | Noun | — |
| 309 | نَعَم | naʿam | cattle | 37 | Noun | — |
| 310 | بَشَر | bashar | a man | 38 | Noun | freq(38) |
| 311 | صَدَّ | ṣadda | hinder | 37 | Verb | — |
| 312 | سُلْطان | sulṭān | an authority | 37 | Noun | — |
| 313 | رَدَّ | radda | they will turn you back | 36 | Verb | gloss |
| 314 | أَحْسَن | aḥsan | best | 36 | Noun | — |
| 315 | ذاقُ | dhāqu | Taste | 36 | Verb | form |
| 316 | ذَهَبَ | dhahaba | he went | 35 | Verb | gloss |
| 317 | اسْتَوَى | āstawā | equal | 35 | Verb | — |
| 318 | سَجَدَ | sajada | Prostrate | 35 | Verb | — |
| 319 | مَتاع | matāʿ | a provision | 35 | Noun | — |
| 320 | حِين | ḥīn | a time | 35 | Noun | — |
| 321 | نَسِيَ | nasīa | they fort | 35 | Verb | gloss!! |
| 322 | بَيَّنُ | bayyanu | makes clear | 266 | Verb | form freq(266) |
| 323 | إِثْم | ithm | sin | 35 | Noun | — |
| 324 | نَصِير | naṣīr | any helper | 35 | Noun | — |
| 325 | اخْتَلَفَ | ākhtalafa | differ | 35 | Verb | — |
| 326 | مُرْسَل | mursal | Messengers | 35 | Noun | — |
| 327 | مَرْيَم | maryam | Mary (Maryam) | 34 | Proper noun | — |
| 328 | فِتْنَة | fitnaa | a trial | 34 | Noun | — |
| 329 | ابْتَغَى | ābtaghā | seeking | 34 | Verb | — |
| 330 | أُمّ | umm | mothers | 137 | Noun | freq(137) |
| 331 | آلاء | ālā | favors | 659 | Noun | freq(659) |
| 332 | قامَ | qāma | stand | 33 | Verb | — |
| 333 | فَرِيق | farīq | a party | 33 | Noun | — |
| 334 | حَرام | ḥarām | Al-Haraam | 33 | Adjective | — |
| 335 | شَمْس | shams | sun | 33 | Noun | — |
| 336 | كَذِب | kadhib | a lie | 176 | Noun | freq(176) |
| 337 | كَلّا | kallā | nay!, by no means | 33 | Aversion particle | — |
| 338 | خاسِر | khāsir | losers | 32 | Noun | — |
| 339 | زَكاة | zakāa | zakah | 32 | Noun | — |
| 340 | ذُرِّيَّة | dhurrīīaa | offspring | 32 | Noun | — |
| 341 | كَفَى | kafā | is sufficient | 32 | Verb | — |
| 342 | كاذِب | kādhib | liars | 32 | Noun | — |
| 343 | نَهَى | nahā | forbid | 32 | Verb | — |
| 344 | عاقِبَة | ʿāqibaa | end | 32 | Noun | — |
| 345 | أَعْرَضَ | aʿraḍa | they turn away | 32 | Verb | — |
| 346 | حَيْث | ḥayth | wherever | 31 | Location adverb | — |
| 347 | أَشَدّ | ashadd | stronger | 31 | Noun | — |
| 348 | نَفَعَ | nafaʿa | benefits | 31 | Verb | — |
| 349 | إِذًا | idhanā | then | 423 | Answer particle | freq(423) |
| 350 | حَسَنَة | ḥasanaa | od | 31 | Noun | gloss!! |
| 351 | واحِدَة | wāḥidaa | one | 31 | Noun | — |
| 352 | طَيِّبَة | ṭayyibaa | od things | 30 | Noun | gloss!! |
| 353 | واحِد | wāḥid | One | 30 | Adjective | — |
| 354 | قُوَّة | qūūaa | strength | 30 | Noun | — |
| 355 | وَلَّى | wallā | [so] turn | 86 | Verb | freq(86) |
| 356 | عاد | ʿād | Aad | 30 | Proper noun | — |
| 357 | عَسَى | ʿasā | Perhaps | 30 | Verb | — |
| 358 | شَرّ | sharr | evil | 30 | Noun | — |
| 359 | مَلَأ | mala | chiefs | 30 | Noun | — |
| 360 | لَبِثَ | labitha | you remained | 30 | Verb | gloss |
| 361 | حُكْم | ḥukm | wisdom | 45 | Noun | freq(45) |
| 362 | ساءَ | sāʾa | evil | 30 | Verb | — |
| 363 | كَرِيم | karīm | noble | 30 | Adjective | — |
| 364 | أَبْصَرَ | abṣara | see | 29 | Verb | — |
| 365 | عَهْد | ʿahd | covenant | 29 | Noun | — |
| 366 | كَأَنّ | kaann | as if | 1358 | Accusative particle | freq(1358) |
| 367 | رِيح | rīḥ | winds | 29 | Noun | — |
| 368 | جُند | jund | hosts | 29 | Noun | — |
| 369 | عَرْش | ʿarsh | Throne | 29 | Noun | — |
| 370 | رَجُل | rajul | a man | 29 | Noun | — |
| 371 | نَبَأ | naba | news | 46 | Noun | freq(46) |
| 372 | أَبَدًا | abadanā | ever | 28 | Time adverb | — |
| 373 | سِحْر | siḥr | magic | 28 | Noun | — |
| 374 | مَسْجِد | masjid | Al-Masjid | 28 | Noun | — |
| 375 | مَصِير | maṣīr | destination | 28 | Noun | — |
| 376 | أَصْلَحَ | aṣlaḥa | reforms | 28 | Verb | — |
| 377 | مَغْفِرَة | maghfiraa | forgiveness | 28 | Noun | — |
| 378 | اسْتَجابَ | āstajāba | respond | 28 | Verb | — |
| 379 | مُؤْمِنَة | muʾminaa | the believing women | 28 | Noun | — |
| 380 | أَنَّى | annā | How | 28 | Interrogative particle | — |
| 381 | رِجال | rijāl | men | 28 | Noun | — |
| 382 | رَحِمَ | raḥima | receive mercy | 28 | Verb | — |
| 383 | أَغْنَتْ | aghnat | avail | 28 | Verb | form |
| 384 | أَصْبَحَ | aṣbaḥa | they became | 28 | Verb | — |
| 385 | حَدِيث | ḥadīth | statement | 28 | Noun | — |
| 386 | سَواء | sawā | equal | 27 | Noun | — |
| 387 | عَفا | ʿafā | pardon | 27 | Verb | — |
| 388 | باب | bāb | gates | 27 | Noun | — |
| 389 | غافِل | ghāfil | unaware | 27 | Noun | — |
| 390 | قَدَّمَ | qaddama | have sent forth | 27 | Verb | — |
| 391 | أَفْلَحَ | aflaḥa | successful | 27 | Verb | — |
| 392 | جاهَدَ | jāhada | strove hard | 27 | Verb | — |
| 393 | مَكان | makān | a place | 27 | Noun | — |
| 394 | مُنافِق | munāfiq | hypocrites | 27 | Noun | — |
| 395 | قَمَر | qamar | the moon | 27 | Noun | — |
| 396 | يُوسُف | yūsuf | Joseph (Yusuf) | 27 | Proper noun | — |
| 397 | لُوط | lūṭ | Lot (Lut) | 27 | Proper noun | — |
| 398 | ماذا | mādhā | what | 26 | Interrogative particle | — |
| 399 | خَوْف | khawf | fear | 26 | Noun | — |
| 400 | باطِل | bāṭil | falsehood | 26 | Noun | — |
| 401 | آل | āl | people | 8377 | Noun | freq(8377) |
| 402 | جَحِيم | jaḥīm | Hellfire | 26 | Noun | — |
| 403 | شَهادَة | shahādaa | the witnessed | 26 | Noun | — |
| 404 | أَجْمَع | ajmaʿ | all | 26 | Noun | — |
| 405 | قَرِيب | qarīb | near | 26 | Adjective | — |
| 406 | زَيَّنَ | zayyana | Beautified | 26 | Verb | — |
| 407 | امْرَأَت | āmraat | wife | 26 | Noun | — |
| 408 | كَيْد | kayd | a plot | 26 | Noun | — |
| 409 | ثَمُود | thamūd | Thamud | 26 | Proper noun | — |
| 410 | يَشْعُرُ | yashʿuru | perceive | 25 | Verb | form |
| 411 | خَلا | khalā | passed away | 25 | Verb | — |
| 412 | مِيثاق | mīthāq | covenant | 25 | Noun | — |
| 413 | آدَم | ādam | Adam | 25 | Proper noun | — |
| 414 | عِيسَى | ʿīsā | Jesus (Isa) | 25 | Proper noun | — |
| 415 | جُناح | junāḥ | blame | 25 | Noun | — |
| 416 | بَعِيد | baʿīd | far | 25 | Adjective | — |
| 417 | بَأْس | bas | punishment | 25 | Noun | — |
| 418 | قَدَرَ | qadara | restricts | 25 | Verb | — |
| 419 | لِسان | lisān | tongues | 25 | Noun | — |
| 420 | بَغَى | baghā | they seek | 25 | Verb | — |
| 421 | جادَلُ | jādalu | dispute | 25 | Verb | — |
| 422 | إِيّا | īīā | (pronoun: him/them…) | 24 | Personal pronoun | gloss |
| 423 | كادَ | kāda | Almost | 24 | Verb | — |
| 424 | طَعام | ṭaʿām | food | 24 | Noun | — |
| 425 | وَراء | warā | behind | 24 | Location adverb | — |
| 426 | أ | أ | ? (question prefix) | 513 | Interrogative particle | prefix freq(513) |
| 427 | حَيّ | ḥayy | living | 24 | Noun | — |
| 428 | أُنثَى | unthā | female | 24 | Noun | — |
| 429 | أَكْبَر | akbar | greater | 24 | Noun | — |
| 430 | تَوَفَّى | tawaffā | We cause you to die | 24 | Verb | gloss |
| 431 | غَنِيّ | ghanīī | Free of need | 24 | Noun | — |
| 432 | طائِفَة | ṭāʾifaa | a group | 24 | Noun | — |
| 433 | وَكِيل | wakīl | a manager | 24 | Noun | — |
| 434 | لِقاء | liqā | meeting | 24 | Verbal noun | — |
| 435 | ظُلُمَة | ẓulumaa | darkness[es] | 23 | Noun | — |
| 436 | سَبْع | sabʿ | seven | 23 | Noun | — |
| 437 | إِمّا | immā | or | 55 | Explanation particle | freq(55) |
| 438 | أَنجَى | anjā | We saved him | 23 | Verb | gloss |
| 439 | ساجِد | sājid | prostrating | 23 | Noun | — |
| 440 | بَدَّلَ | baddala | But changed | 23 | Verb | — |
| 441 | يَتِيم | yatīm | the orphans | 23 | Noun | — |
| 442 | مِسْكِين | miskīn | the needy | 23 | Noun | — |
| 443 | لَعَنَ | laʿana | curse them | 23 | Verb | gloss |
| 444 | فُلْك | fulk | ship | 23 | Noun | — |
| 445 | أَذِنَ | adhina | permits | 39 | Verb | freq(39) |
| 446 | فَتَنُ | fatanu | We tried | 23 | Verb | form gloss |
| 447 | قَرْن | qarn | generations | 23 | Noun | — |
| 448 | ذِكْرَى | dhikrā | a reminder | 23 | Noun | — |
| 449 | سَمْع | samʿ | hearing | 78 | Noun | freq(78) |
| 450 | رَفَعَ | rafaʿa | We raised | 22 | Verb | gloss |
| 451 | خَلْف | khalf | behind them | 22 | Noun | gloss |
| 452 | بَلَى | balā | yes, indeed | 22 | Answer particle | — |
| 453 | أَسْلَمَ | aslama | submits | 22 | Verb | — |
| 454 | دُعاء | duʿā | call | 170 | Noun | freq(170) |
| 455 | نَصْر | naṣr | with His help | 59 | Noun | gloss freq(59) |
| 456 | يَرْجُوا۟ | yarjūā | hope | 22 | Verb | form |
| 457 | وَهَبَ | wahaba | We bestowed | 22 | Verb | gloss |
| 458 | جَمَعَ | jamaʿa | they accumulate | 22 | Verb | — |
| 459 | لَدَى | ladā | with, at | 22 | Location adverb | — |
| 460 | مَكَرَ | makara | plotted | 22 | Verb | — |
| 461 | مَأْوَى | mawā | abode | 22 | Noun | — |
| 462 | بَرّ | barr | land | 22 | Noun | — |
| 463 | أَذاقَ | adhāqa | We will make him taste | 22 | Verb | gloss |
| 464 | جِنّ | jinn | jinn | 22 | Noun | — |
| 465 | ساحِر | sāḥir | magicians | 22 | Noun | — |
| 466 | سَخَّرَ | sakhkhara | subjected | 22 | Verb | — |
| 467 | مُفْسِد | mufsid | corrupters | 21 | Noun | — |
| 468 | اسْتُهْزِئَ | āstuhziʾa | mock | 21 | Verb | — |
| 469 | اشْتَرَى | āshtarā | exchange | 21 | Verb | — |
| 470 | أَعْمَى | aʿmā | blind | 21 | Noun | — |
| 471 | مَشَ | masha | walks | 21 | Verb | form |
| 472 | أَماتَ | amāta | causes death | 21 | Verb | — |
| 473 | كَتَمَ | katama | conceal | 21 | Verb | — |
| 474 | رُوح | rūḥ | Spirit | 21 | Noun | — |
| 475 | شَهْر | shahr | months | 21 | Noun | — |
| 476 | أَحْسَنَ | aḥsana | do od | 36 | Verb | gloss!! freq(36) |
| 477 | نَصِيب | naṣīb | a portion | 21 | Noun | — |
| 478 | كَم | kam | how many | 21 | Noun | — |
| 479 | حَسَن | ḥasan | od | 21 | Adjective | gloss!! |
| 480 | مُسَمًّى | musammanā | appointed | 21 | Noun | — |
| 481 | وَضَعَ | waḍaʿa | gives birth | 21 | Verb | — |
| 482 | شاهِد | shāhid | witnesses | 21 | Noun | — |
| 483 | مُكَذِّب | mukadhdhib | the deniers | 21 | Noun | — |
| 484 | ظَنّ | ẓann | assumption | 47 | Noun | freq(47) |
| 485 | أَعَدَّ | aʿadda | prepared | 20 | Verb | — |
| 486 | أَوْفَى | awfā | give full | 20 | Verb | — |
| 487 | عَرَفَ | ʿarafa | they recognize | 20 | Verb | — |
| 488 | سَعَى | saʿā | running | 20 | Verb | — |
| 489 | كَلَّمَ | kallama | speak to them | 20 | Verb | gloss |
| 490 | حِكْمَة | ḥikmaa | the wisdom | 20 | Noun | — |
| 491 | صابِر | ṣābir | patient ones | 20 | Noun | — |
| 492 | بَلَوْ | balaw | surely We will test you | 20 | Verb | form gloss |
| 493 | أَحَلَّ | aḥalla | Are made lawful | 20 | Verb | — |
| 494 | أَمِنَ | amina | you are secure | 537 | Verb | gloss freq(537) |
| 495 | عِقاب | ʿiqāb | penalty | 20 | Noun | — |
| 496 | مَرَّة | marraa | time | 20 | Noun | — |
| 497 | هارُون | hārūn | Aaron (Harun) | 20 | Proper noun | — |
| 498 | ظُلْم | ẓulm | injustice | 110 | Noun | freq(110) |
| 499 | قَصَّ | qaṣṣa | We relate | 20 | Verb | gloss |
| 500 | أَقْسَمُ | aqsamu | I swear | 20 | Verb | gloss |

---

## Next steps

1. You confirm this list is the one you want (it is complete and its numbers check out).
2. I normalise the ~20 non-dictionary headwords and write English + Urdu glosses for all 500.
3. Dedupe against the 604 words already in `VocabularyWord`; matches get a rank, the rest are new rows.
4. Everything loads as `DRAFT` for review in Warsh Studio.
5. Only then: schema, API, app.
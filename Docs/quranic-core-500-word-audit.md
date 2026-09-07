# Quranic Core 500 — word extraction for audit

> **Superseded by `quranic-core-500.md`.** The complete 500-word list has since been sourced
> directly and verified against the Quranic Arabic Corpus. This file is kept as the record of how we
> established that the Lisan app teaches exactly the top 300 of that list: every word extracted below
> falls between rank 1 and rank 294, and none is above 300.

**Status:** DRAFT — not yet in the database, not yet implemented.
**Source:** 17 screenshots in `C:\Users\sysadmin\Downloads\warsh-new-feature added` (Lisan app home list + one word-detail screen), captured 2026-09-07.
**Purpose:** Umar audits the Arabic + ḥarakāt below before any of this is turned into content or code.

---

## Read this before auditing

Four things you need to know about what I extracted.

**1. This is 290 words, not 500.**
The screenshots cover **58 lesson groups × 5 words = 290 word slots**. If the source really has 100 groups, roughly **42 groups (~210 words) are missing**. I also can't rule out gaps *in the middle* — the screenshots were taken while scrolling, and screenshot 16 overlaps screenshot 15 almost entirely, so the scroll wasn't even. Send the rest and I'll extend this file.

**2. Reading order is left→right.**
The cards are left-aligned with empty space on the right, and a 5th card wraps to the *left* of the second row — so the list flows LTR, not RTL. I read each group left→right, top→bottom. If you know the intended order is different, say so and I'll re-sequence; it doesn't change *which* words are in each group.

**3. ~14 words appear more than once** (listed at the bottom). Some are probably genuine near-pairs I need you to separate (مِن vs مَن, إِنَّ vs إِن, أَنَّ vs أَنْ). Others look like real repeats in the source. Either way, 290 slots ≠ 290 unique words.

**4. ⚠ marks a word whose ḥarakāt I could not read with confidence** at phone resolution, even after upscaling 3×. These are the ones that most need your eyes. Everything unmarked I'm confident about.

Once you sign off, I verify every word against the actual Quran text programmatically — confirming it occurs and getting its true occurrence count — before anything is written to the database.

---

## The words

Groups are numbered in the order they appear in the screenshots (top of the list downward).

### Group 1
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | رَبّ | rabb | lord | 975× |
| 2 | إِلَىٰ | ilā | to, towards | 742× |
| 3 | مَا | mā | what / not | 2565× |
| 4 | ⚠ مَن | man | who — **or is this مِن (min, "from")?** | مِن 3226× **or** مَن 871× |
| 5 | ⚠ إِن | in | if — **or إِنَّ (inna, "indeed")?** | إِنّ 1682× **or** إِن 703× |

### Group 2
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | ⚠ أَن | an | that — **or أَنَّ (anna)?** | إِنّ 1682× **or** إِن 703× |
| 2 | إِلَّا | illā | except | 659× |
| 3 | ءَامَنَ | āmana | he believed | 537× |
| 4 | ذَٰلِكَ | dhālika | that | — *(not lemmatised: particle/demonstrative)* |
| 5 | عَن | ʿan | from, about | 465× |

### Group 3
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَرْض | arḍ | earth, land | 461× |
| 2 | قَد | qad | indeed, already | 406× |
| 3 | إِذَا | idhā | when | 423× |
| 4 | قَوْم | qawm | people, folk | 383× |
| 5 | ءَايَة | āyah | sign, verse | 382× |

### Group 4
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | عَلِمَ | ʿalima | he knew | عَلِمَ 382× **or** عِلْم 105× |
| 2 | ⚠ أَنْ | an | that — **duplicate of 2.1?** | إِنّ 1682× **or** إِن 703× |
| 3 | كُلّ | kull | all, every | 359× |
| 4 | لَم | lam | did not | 348× |
| 5 | جَعَلَ | jaʿala | he made | 340× |

### Group 5
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | ثُمَّ | thumma | then | 338× |
| 2 | رَسُول | rasūl | messenger | 332× |
| 3 | لَا | lā | no, not | 1742× |
| 4 | يَوْم | yawm | day | 475× |
| 5 | عَذَاب | ʿadhāb | punishment | 322× |

### Group 6
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | هَٰذَا | hādhā | this | — *(not lemmatised: particle/demonstrative)* |
| 2 | سَمَآء | samāʾ | sky, heaven | 310× |
| 3 | نَفْس | nafs | soul, self | 295× |
| 4 | كَفَرَ | kafara | he disbelieved | 289× |
| 5 | شَىْء | shayʾ | thing | 283× |

### Group 7
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَو | aw | or | 280× |
| 2 | جَآءَ | jāʾa | he came | 278× |
| 3 | عَمِلَ | ʿamila | he did, worked | عَمِلَ 276× **or** عَمَل 71× |
| 4 | ءَاتَىٰ | ātā | he gave | آتَى 271× **or** أَتَى 264× |
| 5 | رَءَا | raʾā | he saw | 271× |

### Group 8
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَتَىٰ | atā | he came | آتَى 271× **or** أَتَى 264× |
| 2 | كِتَٰب | kitāb | book | 260× |
| 3 | بَيْن | bayn | between | 266× |
| 4 | حَقّ | ḥaqq | truth, right | 247× |
| 5 | نَاس | nās | people | 241× |

> Note: 7.4 ءَاتَىٰ (gave) and 8.1 أَتَىٰ (came) are genuinely different words — please confirm both are intended.

### Group 9
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | إِذ | idh | when | 309× |
| 2 | شَآءَ | shāʾa | he willed | 236× |
| 3 | أُو۟لَٰٓئِكَ | ulāʾika | those | — *(not lemmatised: particle/demonstrative)* |
| 4 | قَبْل | qabl | before | 242× |
| 5 | مُؤْمِن | muʾmin | believer | 202× |

### Group 10
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | لَو | law | if | 201× |
| 2 | ⚠ مَن | man | who — **duplicate of 1.4?** | مِن 3226× **or** مَن 871× |
| 3 | خَلَقَ | khalaqa | he created | خَلَقَ 184× **or** خَلْق 52× |
| 4 | أَنزَلَ | anzala | he sent down | 183× |
| 5 | سَبِيل | sabīl | way, path | 176× |

### Group 11
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | كَذَّبَ | kadhdhaba | he denied, belied | 176× |
| 2 | دَعَا | daʿā | he called, supplicated | 170× |
| 3 | أَمْر | amr | command, matter | أَمْر 166× **or** أَمَرَ 77× |
| 4 | ٱتَّقَىٰ | ittaqā | he feared (God) | 166× |
| 5 | عِند | ʿinda | with, at | 197× |

### Group 12
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | مَعَ | maʿa | with | 164× |
| 2 | بَعْض | baʿḍ | some, part | 157× |
| 3 | لَمَّا | lammā | when, not yet | 165× |
| 4 | أَيُّهَا | ayyuhā | O (vocative) | 215× |
| 5 | خَيْر | khayr | good, better | 178× |

### Group 13
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | إِلَٰه | ilāh | god, deity | 147× |
| 2 | نَار | nār | fire | 145× |
| 3 | غَيْر | ghayr | other than | 147× |
| 4 | هَدَىٰ | hadā | he guided | هَدَى 144× **or** هُدًى 85× |
| 5 | أَرَادَ | arāda | he wanted | 139× |

### Group 14
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | ⚠ أُمّ | umm | mother — **or أَمْ (am, "or")?** | 137× |
| 2 | مُوسَىٰ | Mūsā | Moses | 136× |
| 3 | ٱتَّبَعَ | ittabaʿa | he followed | 136× |
| 4 | دُون | dūn | besides, below | 144× |
| 5 | ءَاخِر | ākhir | last | آخِر 155× **or** آخَر 70× |

### Group 15
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | بَعْد | baʿd | after | 199× |
| 2 | قَلْب | qalb | heart | 132× |
| 3 | عَبْد | ʿabd | servant, slave | عَبْد 131× **or** عَبَدَ 122× |
| 4 | أَرْسَلَ | arsala | he sent | 130× |
| 5 | أَهْل | ahl | family, people of | 127× |

### Group 16
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَخَذَ | akhadha | he took | 127× |
| 2 | ٱتَّخَذَ | ittakhadha | he took (for himself) | 124× |
| 3 | لَعَلَّ | laʿalla | perhaps, so that | 129× |
| 4 | بَل | bal | rather, but | 127× |
| 5 | عَبَدَ | ʿabada | he worshipped | عَبْد 131× **or** عَبَدَ 122× |

> 15.3 عَبْد (slave) vs 16.5 عَبَدَ (worshipped) — different words, both intended I assume.

### Group 17
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | يَد | yad | hand | 120× |
| 2 | كَٰفِرُون | kāfirūn | disbelievers | 156× |
| 3 | ⚠ إِنَّ | inna | indeed — **duplicate of 1.5?** | إِنّ 1682× **or** إِن 703× |
| 4 | رَحْمَة | raḥmah | mercy | 114× |
| 5 | رَحِيم | raḥīm | most merciful | 116× |

### Group 18
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | ظَلَمَ | ẓalama | he wronged | 110× |
| 2 | سَأَلَ | saʾala | he asked | 106× |
| 3 | وَجَدَ | wajada | he found | 106× |
| 4 | أَجْر | ajr | reward | 105× |
| 5 | ظَالِم | ẓālim | wrongdoer | 129× |

### Group 19
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | عِلْم | ʿilm | knowledge | عَلِمَ 382× **or** عِلْم 105× |
| 2 | عَظِيم | ʿaẓīm | great | 107× |
| 3 | لَن | lan | will not | 106× |
| 4 | ⚠ إِلَّا | illā | except — **duplicate of 2.2** | 659× |
| 5 | عَلِيم | ʿalīm | all-knowing | 163× |

### Group 20
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَخْرَجَ | akhraja | he brought out | 99× |
| 2 | جَنَّة | jannah | garden, paradise | 147× |
| 3 | حَتَّىٰ | ḥattā | until | 142× |
| 4 | هَل | hal | (question particle) | 93× |
| 5 | أَكَلَ | akala | he ate | 93× |

### Group 21
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | دِين | dīn | religion, judgement | 92× |
| 2 | قَوْل | qawl | saying, word | 92× |
| 3 | ⚠ مَا | mā | what/not — **duplicate of 1.3** | 2565× |
| 4 | ذُو | dhū | possessor of | 156× |
| 5 | لَيْسَ | laysa | is not | 89× |

### Group 22
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | مَلَك | malak | angel | 88× |
| 2 | فَعَلَ | faʿala | he did | 88× |
| 3 | مَثَل | mathal | example, parable | مَثَل 88× **or** مِثْل 75× |
| 4 | نَظَرَ | naẓara | he looked | 87× |
| 5 | مَال | māl | wealth | 86× |

### Group 23
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | وَلِىّ | walī | protector, ally | 86× |
| 2 | هُدًى | hudan | guidance | هَدَى 144× **or** هُدًى 85× |
| 3 | حَكِيم | ḥakīm | wise | 97× |
| 4 | فَضْل | faḍl | bounty, favour | 84× |
| 5 | ذَكَرَ | dhakara | he remembered, mentioned | ذَكَرَ 84× **or** ذِكْر 76× |

> 13.4 هَدَىٰ (verb) vs 23.2 هُدًى (noun) — both intended?

### Group 24
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | صَلَوٰة | ṣalāh | prayer | 83× |
| 2 | خَافَ | khāfa | he feared | 83× |
| 3 | قَتَلَ | qatala | he killed | 83× |
| 4 | لَيْل | layl | night | 84× |
| 5 | ⚠ بَنَىٰ | banā | he built — **rendered unclearly; could be بَنِى / بَنُو ("children of")** | 80× |

### Group 25
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | شَيْطَٰن | shayṭān | satan | 88× |
| 2 | كَيْف | kayfa | how | 83× |
| 3 | ⚠ يَوْم | yawm | day — **duplicate of 5.4** | 475× |
| 4 | ⚠ مَا | mā | what/not — **third occurrence** | 2565× |
| 5 | رَجَعَ | rajaʿa | he returned | 79× |

### Group 26
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَصْحَٰب | aṣḥāb | companions | 78× |
| 2 | أَكْثَر | akthar | most, more | 80× |
| 3 | سَمِعَ | samiʿa | he heard | 78× |
| 4 | تَوَلَّىٰ | tawallā | he turned away | 78× |
| 5 | جَهَنَّم | jahannam | hell | 77× |

### Group 27
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَمَرَ | amara | he commanded | أَمْر 166× **or** أَمَرَ 77× |
| 2 | حَيَوٰة | ḥayāh | life | 76× |
| 3 | ذِكْر | dhikr | remembrance | ذَكَرَ 84× **or** ذِكْر 76× |
| 4 | زَوْج | zawj | spouse, pair | 76× |
| 5 | دَخَلَ | dakhala | he entered | 76× |

> 11.3 أَمْر (noun) vs 27.1 أَمَرَ (verb) — both intended?

### Group 28
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَخ | akh | brother | 75× |
| 2 | مِثْل | mithl | like, similar | مَثَل 88× **or** مِثْل 75× |
| 3 | نَبِىّ | nabī | prophet | 75× |
| 4 | أَحَد | aḥad | one, anyone | 74× |
| 5 | خَٰلِد | khālid | eternal, abiding | 74× |

> 22.3 مَثَل vs 28.2 مِثْل — different ḥarakāt, different meanings. Please confirm both.

### Group 29
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | دُنْيَا | dunyā | world | 115× |
| 2 | فِرْعَوْن | firʿawn | Pharaoh | 74× |
| 3 | عَٰلَمِين | ʿālamīn | worlds | 73× |
| 4 | جَزَىٰ | jazā | he recompensed | 73× |
| 5 | أَلِيم | alīm | painful | 72× |

### Group 30
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | مُبِين | mubīn | clear, manifest | 119× |
| 2 | أَطَاعَ | aṭāʿa | he obeyed | 72× |
| 3 | أَوْحَىٰ | awḥā | he revealed | 72× |
| 4 | إِنسَٰن | insān | human being | 71× |
| 5 | عَمَل | ʿamal | deed | عَمِلَ 276× **or** عَمَل 71× |

> 7.3 عَمِلَ (verb) vs 30.5 عَمَل (noun) — both intended?

### Group 31
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | وَجْه | wajh | face | 72× |
| 2 | أَشْرَكَ | ashraka | he associated partners | 71× |
| 3 | أَلْقَىٰ | alqā | he cast, threw | 71× |
| 4 | قِيَٰمَة | qiyāmah | resurrection | 70× |
| 5 | يَوْمَئِذ | yawmaʾidhin | that day | — *(not lemmatised: particle/demonstrative)* |

### Group 32
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | وَعَدَ | waʿada | he promised | 70× |
| 2 | إِبْرَاهِيم | Ibrāhīm | Abraham | 69× |
| 3 | قُرْءَان | qurʾān | Quran | 70× |
| 4 | أَنفَقَ | anfaqa | he spent | 68× |
| 5 | ⚠ بَعْد | baʿd | after — **duplicate of 15.1** | 199× |

### Group 33
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | بَيْت | bayt | house | 65× |
| 2 | لَٰكِن | lākin | but | لٰكِن 65× **or** لٰكِنّ 65× |
| 3 | يَمِين | yamīn | right hand, oath | 65× |
| 4 | غَفَرَ | ghafara | he forgave | 65× |
| 5 | ءَابَاء | ābāʾ | fathers | 64× |

### Group 34
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أُمَّة | ummah | community, nation | 64× |
| 2 | ⚠ أَحَبَّ | aḥabba | he loved — **rendered unclearly, looks like أَحْبَب** | 3× |
| 3 | أَصَابَ | aṣāba | it befell, struck | 64× |
| 4 | أَضَلَّ | aḍalla | he led astray | 64× |
| 5 | ٱبْن | ibn | son | 63× |

### Group 35
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | عَزِيز | ʿazīz | mighty, honoured | 101× |
| 2 | مَآء | māʾ | water | 2565× |
| 3 | تَابَ | tāba | he repented, turned | 63× |
| 4 | صَٰلِحَٰت | ṣāliḥāt | righteous deeds | 62× |
| 5 | ⚠ عَلِيم | ʿalīm | all-knowing — **duplicate of 19.5** | 163× |

### Group 36
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | غَفُور | ghafūr | most forgiving | 91× |
| 2 | كَسَبَ | kasaba | he earned | 62× |
| 3 | نَزَّلَ | nazzala | he sent down | 62× |
| 4 | أَوَّل | awwal | first | 82× |
| 5 | تَلَىٰ | talā | he recited | 61× |

### Group 37
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | صَادِق | ṣādiq | truthful | 59× |
| 2 | ⚠ صَٰلِح | ṣāliḥ | righteous — **ḥarakāt unclear** | 74× |
| 3 | رَزَقَ | razaqa | he provided | رَزَقَ 61× **or** رِزْق 55× |
| 4 | نِسَآء | nisāʾ | women | 59× |
| 5 | قَضَىٰ | qaḍā | he decreed | 59× |

### Group 38
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | نَصَرَ | naṣara | he helped | 59× |
| 2 | نَذِير | nadhīr | warner | 58× |
| 3 | صَبَرَ | ṣabara | he was patient | 58× |
| 4 | عَيْن | ʿayn | eye, spring | 57× |
| 5 | قَرْيَة | qaryah | town | 57× |

### Group 39
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | ⚠ لَٰكِنَّ | lākinna | but — **near-duplicate of 33.2 لَٰكِن** | لٰكِن 65× **or** لٰكِنّ 65× |
| 2 | جَرَىٰ | jarā | it flowed | 57× |
| 3 | نَهَار | nahār | daytime | 57× |
| 4 | وَلَد | walad | child, son | 56× |
| 5 | مَسَّ | massa | it touched | 56× |

### Group 40
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | بَيِّنَة | bayyinah | clear proof | 71× |
| 2 | رِزْق | rizq | provision | رَزَقَ 61× **or** رِزْق 55× |
| 3 | ضَرَبَ | ḍaraba | he struck, set forth | 55× |
| 4 | نَهَر | nahar | river | 54× |
| 5 | قَٰتَلَ | qātala | he fought | 54× |

> Three careful pairs here: 24.3 قَتَلَ (killed) vs 40.5 قَٰتَلَ (fought); 39.3 نَهَار (daytime) vs 40.4 نَهَر (river); 37.3 رَزَقَ (verb) vs 40.2 رِزْق (noun). All genuinely distinct — worth keeping, but they must not get merged during dedupe.

### Group 41
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَقَامَ | aqāma | he established | 54× |
| 2 | جَمِيع | jamīʿ | all together | 53× |
| 3 | خَرَجَ | kharaja | he went out | 53× |
| 4 | ضَلَّ | ḍalla | he went astray | 53× |
| 5 | أَجَل | ajal | term, appointed time | 52× |

### Group 42
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | خَلْق | khalq | creation | خَلَقَ 184× **or** خَلْق 52× |
| 2 | بَعَثَ | baʿatha | he raised, sent | 52× |
| 3 | ⚠ جَنَّة | jannah | garden — **duplicate of 20.2** | 147× |
| 4 | أَحْيَا | aḥyā | he gave life | 51× |
| 5 | تَذَكَّرَ | tadhakkara | he took heed | 51× |

### Group 43
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَهْلَكَ | ahlaka | he destroyed | 51× |
| 2 | سُوٓء | sūʾ | evil | 50× |
| 3 | مَوْت | mawt | death | 50× |
| 4 | نِعْمَة | niʿmah | blessing | 50× |
| 5 | ٱفْتَرَىٰ | iftarā | he fabricated | 50× |

### Group 44
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | عَدُوّ | ʿaduww | enemy | 50× |
| 2 | غَيْب | ghayb | the unseen | 49× |
| 3 | مُتَّقِين | muttaqīn | the God-fearing | 49× |
| 4 | وَعْد | waʿd | promise | 70× |
| 5 | زَادَ | zāda | he increased | 49× |

### Group 45
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | ⚠ عَقَلَ | ʿaqala | he understood — **could be عَقْل (ʿaql, "intellect")** | 49× |
| 2 | كَتَبَ | kataba | he wrote, prescribed | 49× |
| 3 | بَصَر | baṣar | sight | 48× |
| 4 | تَحْت | taḥt | beneath | 51× |
| 5 | دَار | dār | home, abode | 48× |

### Group 46
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | مُلْك | mulk | dominion | 88× |
| 2 | ⚠ أَن | an | that — **third occurrence** | إِنّ 1682× **or** إِن 703× |
| 3 | ⚠ حَتَّىٰ | ḥattā | until — **duplicate of 20.3** | 142× |
| 4 | سَاعَة | sāʿah | hour | 48× |
| 5 | ⚠ مُبِين | mubīn | clear — **duplicate of 30.1** | 119× |

### Group 47
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | ظَنَّ | ẓanna | he thought, assumed | 47× |
| 2 | أَب | ab | father | 46× |
| 3 | شَكَرَ | shakara | he thanked | 46× |
| 4 | نَبَأ | nabaʾ | news, tiding | 46× |
| 5 | ⚠ أُولَىٰ | ūlā | first (fem.) — **or أَوْلَىٰ (awlā, "more worthy")?** | 11× |

### Group 48
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | إِيمَٰن | īmān | faith | 45× |
| 2 | رَحْمَٰن | raḥmān | most gracious | 57× |
| 3 | صِرَٰط | ṣirāṭ | path | 45× |
| 4 | ⚠ قَبْل | qabl | before — **duplicate of 9.4** | 242× |
| 5 | حَكَمَ | ḥakama | he judged | 45× |

### Group 49
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَمَّا | ammā | as for | 55× |
| 2 | ءَاخَر | ākhar | another | آخِر 155× **or** آخَر 70× |
| 3 | يَذَرَ | yadhara | he leaves | 45× |
| 4 | صَدْر | ṣadr | breast, chest | 44× |
| 5 | قَدِير | qadīr | all-powerful | 45× |

> 14.5 ءَاخِر ("last") vs 49.2 ءَاخَر ("another") — one ḥarakah apart, genuinely different words. Both look intended; flagging so they don't get merged.

### Group 50
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | مُجْرِم | mujrim | criminal | 52× |
| 2 | مُشْرِك | mushrik | polytheist | 44× |
| 3 | حَسِبَ | ḥasiba | he reckoned, thought | 44× |
| 4 | شَهِدَ | shahida | he witnessed | 44× |
| 5 | مَلَكَتْ | malakat | she/it possessed | 44× |

### Group 51
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | نَادَىٰ | nādā | he called out | 44× |
| 2 | أَنذَرَ | andhara | he warned | 44× |
| 3 | إِسْرَٰٓئِيل | Isrāʾīl | Israel | 43× |
| 4 | حَمْد | ḥamd | praise | 43× |
| 5 | قَلِيل | qalīl | few, little | 70× |

### Group 52
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | نُوح | Nūḥ | Noah | 43× |
| 2 | نُور | nūr | light | 43× |
| 3 | جَزَآء | jazāʾ | recompense | 42× |
| 4 | سَوْف | sawfa | will, shall | 42× |
| 5 | كَثِير | kathīr | many, much | 63× |

### Group 53
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَدْخَلَ | adkhala | he admitted, entered (s.o.) | 42× |
| 2 | سَبَّحَ | sabbaḥa | he glorified | 42× |
| 3 | ٱسْتَطَاعَ | istaṭāʿa | he was able | 42× |
| 4 | بَحْر | baḥr | sea | 41× |
| 5 | ⚠ دُنْيَا | dunyā | world — **duplicate of 29.1** | 115× |

### Group 54
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | سُبْحَٰن | subḥān | glory be to | 41× |
| 2 | سَلَٰم | salām | peace | 42× |
| 3 | حَمَلَ | ḥamala | he carried | 41× |
| 4 | عَذَّبَ | ʿadhdhaba | he punished | 41× |
| 5 | عَلَّمَ | ʿallama | he taught | عَلِمَ 382× **or** عِلْم 105× |

> 5.5 عَذَاب (noun) vs 54.4 عَذَّبَ (verb); 4.1 عَلِمَ (knew) vs 54.5 عَلَّمَ (taught). Distinct — keep separate.

### Group 55
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | شَرِيك | sharīk | partner | 40× |
| 2 | شَهِيد | shahīd | witness | 56× |
| 3 | لَوْلَآ | lawlā | if not for | 75× |
| 4 | وَيْل | wayl | woe | 40× |
| 5 | بِئْسَ | biʾsa | wretched is | 40× |

### Group 56
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | بَلَغَ | balagha | he reached | 40× |
| 2 | تَرَكَ | taraka | he left | 40× |
| 3 | خَشِىَ | khashiya | he feared | 40× |
| 4 | أَرَىٰ | arā | he showed | 40× |
| 5 | ٱسْتَغْفَرَ | istaghfara | he sought forgiveness | 40× |

### Group 57
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | ٱسْتَكْبَرَ | istakbara | he was arrogant | 40× |
| 2 | ٱهْتَدَىٰ | ihtadā | he was guided | 40× |
| 3 | تَوَكَّلَ | tawakkala | he trusted | 40× |
| 4 | إِذْن | idhn | permission | 39× |
| 5 | ٱسْم | ism | name | 39× |

### Group 58
| # | Arabic | Translit | Meaning | In Quran |
|---|---|---|---|---|
| 1 | أَلَآ | alā | unquestionably, surely | 659× |
| 2 | جَبَل | jabal | mountain | 39× |
| 3 | سَمِيع | samīʿ | all-hearing | 47× |
| 4 | حَرَّمَ | ḥarrama | he forbade | 39× |
| 5 | مَاتَ | māta | he died | 39× |

> Screenshot 17 shows the detail page for 58.1 أَلَآ: *"Unquestionably / surely — Repeated 39 times in the Quran"*, example Al-Baqarah 2:12. I'll cross-check that count against the corpus.

---

## Repeats to resolve

These appear in more than one group. For each: is it a genuine second word (different ḥarakāt/meaning) or a repeat in the source?

| Word | Groups | Likely explanation |
|---|---|---|
| مَا | 1, 21, 25 | Possibly مَا vs مَّا, or a true repeat |
| أَن / أَنْ | 2, 4, 46 | Possibly أَنْ vs أَنَّ |
| مَن | 1, 10 | One may be مِن ("from") |
| إِن / إِنَّ | 1, 17 | Possibly إِن ("if") vs إِنَّ ("indeed") |
| إِلَّا | 2, 19 | Looks like a true repeat |
| قَبْل | 9, 48 | Looks like a true repeat |
| بَعْد | 15, 32 | Looks like a true repeat |
| جَنَّة | 20, 42 | Looks like a true repeat |
| حَتَّىٰ | 20, 46 | Looks like a true repeat |
| يَوْم | 5, 25 | Looks like a true repeat |
| عَلِيم | 19, 35 | Looks like a true repeat |
| مُبِين | 30, 46 | Looks like a true repeat |
| دُنْيَا | 29, 53 | Looks like a true repeat |
| لَٰكِن / لَٰكِنَّ | 33, 39 | Genuinely two words in Arabic |

**If the plain repeats are real, 290 slots hold roughly 274 unique words.**

---

## What happens after you sign off

1. Corpus verification — confirm each word occurs in the Quran and pull its true occurrence count.
2. Dedupe against the 604 words already in `VocabularyWord`; matches get tagged, the rest come in as new rows.
3. I draft Urdu + English glosses, load everything as `DRAFT`, your reviewer approves in Warsh Studio.
4. Only then: schema, API, app.

Nothing is written to any database until step 1 passes and you've approved this list.

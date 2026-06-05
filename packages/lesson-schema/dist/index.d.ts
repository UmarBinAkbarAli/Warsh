import { z } from 'zod';

declare const ArabicTextSchema: z.ZodObject<{
    ar: z.ZodString;
    ar_plain: z.ZodString;
    translit: z.ZodString;
    en: z.ZodString;
    ur: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ar: string;
    ar_plain: string;
    translit: string;
    en: string;
    ur?: string | undefined;
}, {
    ar: string;
    ar_plain: string;
    translit: string;
    en: string;
    ur?: string | undefined;
}>;
type ArabicText = z.infer<typeof ArabicTextSchema>;
declare const AyahWordTimingSchema: z.ZodObject<{
    index: z.ZodNumber;
    start_ms: z.ZodNumber;
    end_ms: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    index: number;
    start_ms: number;
    end_ms: number;
}, {
    index: number;
    start_ms: number;
    end_ms: number;
}>;
declare const AyahReferenceSchema: z.ZodObject<{
    surah: z.ZodNumber;
    ayah: z.ZodNumber;
    label: z.ZodString;
    ar: z.ZodString;
    en: z.ZodString;
    ur: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodString>;
    word_timings: z.ZodOptional<z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        start_ms: z.ZodNumber;
        end_ms: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        index: number;
        start_ms: number;
        end_ms: number;
    }, {
        index: number;
        start_ms: number;
        end_ms: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    ar: string;
    en: string;
    surah: number;
    ayah: number;
    label: string;
    ur?: string | undefined;
    audio_url?: string | undefined;
    word_timings?: {
        index: number;
        start_ms: number;
        end_ms: number;
    }[] | undefined;
}, {
    ar: string;
    en: string;
    surah: number;
    ayah: number;
    label: string;
    ur?: string | undefined;
    audio_url?: string | undefined;
    word_timings?: {
        index: number;
        start_ms: number;
        end_ms: number;
    }[] | undefined;
}>;
declare const VocabRefSchema: z.ZodObject<{
    word_id: z.ZodOptional<z.ZodString>;
    ar_plain: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ar_plain: string;
    word_id?: string | undefined;
}, {
    ar_plain: string;
    word_id?: string | undefined;
}>;
declare const HookBeatSchema: z.ZodObject<{
    ayah: z.ZodObject<{
        surah: z.ZodNumber;
        ayah: z.ZodNumber;
        label: z.ZodString;
        ar: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
        audio_url: z.ZodOptional<z.ZodString>;
        word_timings: z.ZodOptional<z.ZodArray<z.ZodObject<{
            index: z.ZodNumber;
            start_ms: z.ZodNumber;
            end_ms: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            index: number;
            start_ms: number;
            end_ms: number;
        }, {
            index: number;
            start_ms: number;
            end_ms: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        en: string;
        surah: number;
        ayah: number;
        label: string;
        ur?: string | undefined;
        audio_url?: string | undefined;
        word_timings?: {
            index: number;
            start_ms: number;
            end_ms: number;
        }[] | undefined;
    }, {
        ar: string;
        en: string;
        surah: number;
        ayah: number;
        label: string;
        ur?: string | undefined;
        audio_url?: string | undefined;
        word_timings?: {
            index: number;
            start_ms: number;
            end_ms: number;
        }[] | undefined;
    }>;
    noor_intro: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
    autoplay: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    ayah: {
        ar: string;
        en: string;
        surah: number;
        ayah: number;
        label: string;
        ur?: string | undefined;
        audio_url?: string | undefined;
        word_timings?: {
            index: number;
            start_ms: number;
            end_ms: number;
        }[] | undefined;
    };
    noor_intro?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    autoplay?: boolean | undefined;
}, {
    ayah: {
        ar: string;
        en: string;
        surah: number;
        ayah: number;
        label: string;
        ur?: string | undefined;
        audio_url?: string | undefined;
        word_timings?: {
            index: number;
            start_ms: number;
            end_ms: number;
        }[] | undefined;
    };
    noor_intro?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    autoplay?: boolean | undefined;
}>;
declare const CloseBeatSchema: z.ZodObject<{
    noor_message_template: z.ZodOptional<z.ZodString>;
    noor_message: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    noor_message_template?: string | undefined;
    noor_message?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    noor_message_template?: string | undefined;
    noor_message?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;

declare const DiscoverCardSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"WORD">;
    text: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    image_url: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodString>;
    explanation: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    introduces_vocab: z.ZodOptional<z.ZodObject<{
        word_id: z.ZodOptional<z.ZodString>;
        ar_plain: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ar_plain: string;
        word_id?: string | undefined;
    }, {
        ar_plain: string;
        word_id?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "WORD";
    text: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    audio_url?: string | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    examples?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
}, {
    type: "WORD";
    text: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    audio_url?: string | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    examples?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"CONCEPT">;
    concept: z.ZodObject<{
        en: z.ZodString;
        ar: z.ZodOptional<z.ZodString>;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    }, {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    }>;
    explanation: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    image_url: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodString>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    introduces_vocab: z.ZodOptional<z.ZodObject<{
        word_id: z.ZodOptional<z.ZodString>;
        ar_plain: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ar_plain: string;
        word_id?: string | undefined;
    }, {
        ar_plain: string;
        word_id?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "CONCEPT";
    explanation: {
        en: string;
        ur?: string | undefined;
    };
    concept: {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    };
    audio_url?: string | undefined;
    image_url?: string | undefined;
    examples?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
}, {
    type: "CONCEPT";
    explanation: {
        en: string;
        ur?: string | undefined;
    };
    concept: {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    };
    audio_url?: string | undefined;
    image_url?: string | undefined;
    examples?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"EXAMPLE">;
    text: z.ZodOptional<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>>;
    explanation: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
    image_url: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodString>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    introduces_vocab: z.ZodOptional<z.ZodObject<{
        word_id: z.ZodOptional<z.ZodString>;
        ar_plain: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ar_plain: string;
        word_id?: string | undefined;
    }, {
        ar_plain: string;
        word_id?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "EXAMPLE";
    audio_url?: string | undefined;
    text?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    } | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    examples?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
}, {
    type: "EXAMPLE";
    audio_url?: string | undefined;
    text?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    } | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    examples?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"CONTRAST">;
    concept: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ar: z.ZodOptional<z.ZodString>;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    }, {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    }>>;
    text: z.ZodOptional<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>>;
    explanation: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
    image_url: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodString>;
    examples: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    introduces_vocab: z.ZodOptional<z.ZodObject<{
        word_id: z.ZodOptional<z.ZodString>;
        ar_plain: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ar_plain: string;
        word_id?: string | undefined;
    }, {
        ar_plain: string;
        word_id?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "CONTRAST";
    examples: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    audio_url?: string | undefined;
    text?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    } | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
    concept?: {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "CONTRAST";
    examples: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    audio_url?: string | undefined;
    text?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    } | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
    concept?: {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"AYAH_PREVIEW">;
    concept: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ar: z.ZodOptional<z.ZodString>;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    }, {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    }>>;
    text: z.ZodOptional<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>>;
    explanation: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
    image_url: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodString>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    introduces_vocab: z.ZodOptional<z.ZodObject<{
        word_id: z.ZodOptional<z.ZodString>;
        ar_plain: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ar_plain: string;
        word_id?: string | undefined;
    }, {
        ar_plain: string;
        word_id?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "AYAH_PREVIEW";
    audio_url?: string | undefined;
    text?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    } | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    examples?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
    concept?: {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "AYAH_PREVIEW";
    audio_url?: string | undefined;
    text?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    } | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    examples?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
    concept?: {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"GRAMMAR_NOTE">;
    title: z.ZodObject<{
        en: z.ZodString;
        ar: z.ZodOptional<z.ZodString>;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    }, {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    }>;
    body: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    image_url: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "GRAMMAR_NOTE";
    title: {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    };
    body: {
        en: string;
        ur?: string | undefined;
    };
    audio_url?: string | undefined;
    image_url?: string | undefined;
}, {
    type: "GRAMMAR_NOTE";
    title: {
        en: string;
        ar?: string | undefined;
        ur?: string | undefined;
    };
    body: {
        en: string;
        ur?: string | undefined;
    };
    audio_url?: string | undefined;
    image_url?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"SENTENCE">;
    text: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    explanation: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
    image_url: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodString>;
    introduces_vocab: z.ZodOptional<z.ZodObject<{
        word_id: z.ZodOptional<z.ZodString>;
        ar_plain: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ar_plain: string;
        word_id?: string | undefined;
    }, {
        ar_plain: string;
        word_id?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "SENTENCE";
    text: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    audio_url?: string | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
}, {
    type: "SENTENCE";
    text: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    audio_url?: string | undefined;
    image_url?: string | undefined;
    explanation?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    introduces_vocab?: {
        ar_plain: string;
        word_id?: string | undefined;
    } | undefined;
}>]>;
type DiscoverCard = z.infer<typeof DiscoverCardSchema>;
type DiscoverCardType = DiscoverCard["type"];

declare const TrueFalseExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"TRUE_FALSE">;
    statement: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
        ar_example: z.ZodOptional<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
        ar_example?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        en: string;
        ur?: string | undefined;
        ar_example?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>;
    correct_answer: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "TRUE_FALSE";
    id: string;
    statement: {
        en: string;
        ur?: string | undefined;
        ar_example?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
    };
    correct_answer: boolean;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "TRUE_FALSE";
    id: string;
    statement: {
        en: string;
        ur?: string | undefined;
        ar_example?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
    };
    correct_answer: boolean;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const TapTranslationExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"TAP_TRANSLATION">;
    prompt: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    options: z.ZodArray<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_index: z.ZodNumber;
    audio_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "TAP_TRANSLATION";
    id: string;
    prompt: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    correct_index: number;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "TAP_TRANSLATION";
    id: string;
    prompt: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    correct_index: number;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const FillBlankExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"FILL_BLANK">;
    mode: z.ZodEnum<["TAP", "TYPE"]>;
    sentence_ar: z.ZodString;
    hint: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    correct_answer: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "FILL_BLANK";
    id: string;
    correct_answer: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    mode: "TAP" | "TYPE";
    sentence_ar: string;
    hint: {
        en: string;
        ur?: string | undefined;
    };
    options?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "FILL_BLANK";
    id: string;
    correct_answer: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    mode: "TAP" | "TYPE";
    sentence_ar: string;
    hint: {
        en: string;
        ur?: string | undefined;
    };
    options?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const BuildSentenceExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"BUILD_SENTENCE">;
    target_translation: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    tiles: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_order: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    type: "BUILD_SENTENCE";
    id: string;
    target_translation: {
        en: string;
        ur?: string | undefined;
    };
    tiles: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    correct_order: number[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "BUILD_SENTENCE";
    id: string;
    target_translation: {
        en: string;
        ur?: string | undefined;
    };
    tiles: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    correct_order: number[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const MatchingExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"MATCHING">;
    left_column: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    right_column: z.ZodArray<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_pairs: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "MATCHING";
    id: string;
    left_column: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    right_column: {
        en: string;
        ur?: string | undefined;
    }[];
    correct_pairs: [number, number][];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "MATCHING";
    id: string;
    left_column: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    right_column: {
        en: string;
        ur?: string | undefined;
    }[];
    correct_pairs: [number, number][];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const GrammaticalRoleSchema: z.ZodEnum<["SUBJECT", "PREDICATE", "VERB", "OBJECT", "PARTICLE", "PREPOSITION", "POSSESSIVE", "ADJECTIVE", "DEMONSTRATIVE", "RELATIVE_PRONOUN", "PRONOUN", "LITERARY_DEVICE", "CONJUNCTION", "INTERJECTION", "VERB_PHRASE", "NOUN", "VOCATIVE", "TIME_ZARF", "PLACE_ZARF"]>;
type GrammaticalRole = z.infer<typeof GrammaticalRoleSchema>;
declare const GrammarParseExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"GRAMMAR_PARSE">;
    sentence_ar: z.ZodString;
    words: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    available_roles: z.ZodArray<z.ZodEnum<["SUBJECT", "PREDICATE", "VERB", "OBJECT", "PARTICLE", "PREPOSITION", "POSSESSIVE", "ADJECTIVE", "DEMONSTRATIVE", "RELATIVE_PRONOUN", "PRONOUN", "LITERARY_DEVICE", "CONJUNCTION", "INTERJECTION", "VERB_PHRASE", "NOUN", "VOCATIVE", "TIME_ZARF", "PLACE_ZARF"]>, "many">;
    correct_roles: z.ZodArray<z.ZodEnum<["SUBJECT", "PREDICATE", "VERB", "OBJECT", "PARTICLE", "PREPOSITION", "POSSESSIVE", "ADJECTIVE", "DEMONSTRATIVE", "RELATIVE_PRONOUN", "PRONOUN", "LITERARY_DEVICE", "CONJUNCTION", "INTERJECTION", "VERB_PHRASE", "NOUN", "VOCATIVE", "TIME_ZARF", "PLACE_ZARF"]>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "GRAMMAR_PARSE";
    id: string;
    sentence_ar: string;
    words: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    available_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
    correct_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "GRAMMAR_PARSE";
    id: string;
    sentence_ar: string;
    words: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    available_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
    correct_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const ConversationBuilderExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"CONVERSATION_BUILDER">;
    prompt_line: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    response_mode: z.ZodEnum<["PICK", "BUILD"]>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    correct_option_index: z.ZodOptional<z.ZodNumber>;
    tiles: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    correct_order: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "CONVERSATION_BUILDER";
    id: string;
    prompt_line: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    response_mode: "PICK" | "BUILD";
    options?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    tiles?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    correct_order?: number[] | undefined;
    correct_option_index?: number | undefined;
}, {
    type: "CONVERSATION_BUILDER";
    id: string;
    prompt_line: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    response_mode: "PICK" | "BUILD";
    options?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    tiles?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    correct_order?: number[] | undefined;
    correct_option_index?: number | undefined;
}>;
declare const ShadowRepeatExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"SHADOW_REPEAT">;
    phrase: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    audio_url: z.ZodString;
    self_grading: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    type: "SHADOW_REPEAT";
    audio_url: string;
    id: string;
    phrase: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    self_grading: true;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "SHADOW_REPEAT";
    audio_url: string;
    id: string;
    phrase: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    self_grading: true;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const AudioRecognitionExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"AUDIO_RECOGNITION">;
    arabic_text: z.ZodString;
    audio_url: z.ZodOptional<z.ZodString>;
    options: z.ZodArray<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_index: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "AUDIO_RECOGNITION";
    id: string;
    correct_index: number;
    arabic_text: string;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "AUDIO_RECOGNITION";
    id: string;
    correct_index: number;
    arabic_text: string;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const WriteArabicExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"WRITE_ARABIC">;
    prompt: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    audio_url: z.ZodOptional<z.ZodString>;
    correct_answer: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    hint_available: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "WRITE_ARABIC";
    id: string;
    correct_answer: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    prompt: {
        en: string;
        ur?: string | undefined;
    };
    hint_available: boolean;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "WRITE_ARABIC";
    id: string;
    correct_answer: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    prompt: {
        en: string;
        ur?: string | undefined;
    };
    hint_available: boolean;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const HarakahPlacementExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"HARAKAH_PLACEMENT">;
    word_unvowelled: z.ZodString;
    correct_vowelled: z.ZodString;
    hint: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "HARAKAH_PLACEMENT";
    id: string;
    hint: {
        en: string;
        ur?: string | undefined;
    };
    word_unvowelled: string;
    correct_vowelled: string;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "HARAKAH_PLACEMENT";
    id: string;
    hint: {
        en: string;
        ur?: string | undefined;
    };
    word_unvowelled: string;
    correct_vowelled: string;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const WordOrderExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"WORD_ORDER">;
    tiles: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_order: z.ZodArray<z.ZodNumber, "many">;
    context: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "WORD_ORDER";
    id: string;
    tiles: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    correct_order: number[];
    context: {
        en: string;
        ur?: string | undefined;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "WORD_ORDER";
    id: string;
    tiles: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    correct_order: number[];
    context: {
        en: string;
        ur?: string | undefined;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const TranslateToArabicExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"TRANSLATE_TO_ARABIC">;
    source: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    acceptable_answers: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "TRANSLATE_TO_ARABIC";
    id: string;
    source: {
        en: string;
        ur?: string | undefined;
    };
    acceptable_answers: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "TRANSLATE_TO_ARABIC";
    id: string;
    source: {
        en: string;
        ur?: string | undefined;
    };
    acceptable_answers: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const IdentifyRootExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"IDENTIFY_ROOT">;
    word: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    options: z.ZodArray<z.ZodString, "many">;
    correct_index: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    options: string[];
    type: "IDENTIFY_ROOT";
    id: string;
    correct_index: number;
    word: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    options: string[];
    type: "IDENTIFY_ROOT";
    id: string;
    correct_index: number;
    word: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const MatchAyahExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"MATCH_AYAH">;
    ayah_fragment: z.ZodObject<{
        ar: z.ZodString;
        surah_ref: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        surah_ref: string;
    }, {
        ar: string;
        surah_ref: string;
    }>;
    options: z.ZodArray<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_index: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "MATCH_AYAH";
    id: string;
    correct_index: number;
    ayah_fragment: {
        ar: string;
        surah_ref: string;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "MATCH_AYAH";
    id: string;
    correct_index: number;
    ayah_fragment: {
        ar: string;
        surah_ref: string;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>;
declare const ExerciseSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"TRUE_FALSE">;
    statement: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
        ar_example: z.ZodOptional<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
        ar_example?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        en: string;
        ur?: string | undefined;
        ar_example?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>;
    correct_answer: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "TRUE_FALSE";
    id: string;
    statement: {
        en: string;
        ur?: string | undefined;
        ar_example?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
    };
    correct_answer: boolean;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "TRUE_FALSE";
    id: string;
    statement: {
        en: string;
        ur?: string | undefined;
        ar_example?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
    };
    correct_answer: boolean;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"TAP_TRANSLATION">;
    prompt: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    options: z.ZodArray<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_index: z.ZodNumber;
    audio_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "TAP_TRANSLATION";
    id: string;
    prompt: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    correct_index: number;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "TAP_TRANSLATION";
    id: string;
    prompt: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    correct_index: number;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"FILL_BLANK">;
    mode: z.ZodEnum<["TAP", "TYPE"]>;
    sentence_ar: z.ZodString;
    hint: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    correct_answer: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "FILL_BLANK";
    id: string;
    correct_answer: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    mode: "TAP" | "TYPE";
    sentence_ar: string;
    hint: {
        en: string;
        ur?: string | undefined;
    };
    options?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "FILL_BLANK";
    id: string;
    correct_answer: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    mode: "TAP" | "TYPE";
    sentence_ar: string;
    hint: {
        en: string;
        ur?: string | undefined;
    };
    options?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"BUILD_SENTENCE">;
    target_translation: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    tiles: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_order: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    type: "BUILD_SENTENCE";
    id: string;
    target_translation: {
        en: string;
        ur?: string | undefined;
    };
    tiles: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    correct_order: number[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "BUILD_SENTENCE";
    id: string;
    target_translation: {
        en: string;
        ur?: string | undefined;
    };
    tiles: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    correct_order: number[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"MATCHING">;
    left_column: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    right_column: z.ZodArray<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_pairs: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "MATCHING";
    id: string;
    left_column: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    right_column: {
        en: string;
        ur?: string | undefined;
    }[];
    correct_pairs: [number, number][];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "MATCHING";
    id: string;
    left_column: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    right_column: {
        en: string;
        ur?: string | undefined;
    }[];
    correct_pairs: [number, number][];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"GRAMMAR_PARSE">;
    sentence_ar: z.ZodString;
    words: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    available_roles: z.ZodArray<z.ZodEnum<["SUBJECT", "PREDICATE", "VERB", "OBJECT", "PARTICLE", "PREPOSITION", "POSSESSIVE", "ADJECTIVE", "DEMONSTRATIVE", "RELATIVE_PRONOUN", "PRONOUN", "LITERARY_DEVICE", "CONJUNCTION", "INTERJECTION", "VERB_PHRASE", "NOUN", "VOCATIVE", "TIME_ZARF", "PLACE_ZARF"]>, "many">;
    correct_roles: z.ZodArray<z.ZodEnum<["SUBJECT", "PREDICATE", "VERB", "OBJECT", "PARTICLE", "PREPOSITION", "POSSESSIVE", "ADJECTIVE", "DEMONSTRATIVE", "RELATIVE_PRONOUN", "PRONOUN", "LITERARY_DEVICE", "CONJUNCTION", "INTERJECTION", "VERB_PHRASE", "NOUN", "VOCATIVE", "TIME_ZARF", "PLACE_ZARF"]>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "GRAMMAR_PARSE";
    id: string;
    sentence_ar: string;
    words: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    available_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
    correct_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "GRAMMAR_PARSE";
    id: string;
    sentence_ar: string;
    words: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    available_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
    correct_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"CONVERSATION_BUILDER">;
    prompt_line: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    response_mode: z.ZodEnum<["PICK", "BUILD"]>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    correct_option_index: z.ZodOptional<z.ZodNumber>;
    tiles: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">>;
    correct_order: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "CONVERSATION_BUILDER";
    id: string;
    prompt_line: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    response_mode: "PICK" | "BUILD";
    options?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    tiles?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    correct_order?: number[] | undefined;
    correct_option_index?: number | undefined;
}, {
    type: "CONVERSATION_BUILDER";
    id: string;
    prompt_line: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    response_mode: "PICK" | "BUILD";
    options?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
    tiles?: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[] | undefined;
    correct_order?: number[] | undefined;
    correct_option_index?: number | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"SHADOW_REPEAT">;
    phrase: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    audio_url: z.ZodString;
    self_grading: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    type: "SHADOW_REPEAT";
    audio_url: string;
    id: string;
    phrase: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    self_grading: true;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "SHADOW_REPEAT";
    audio_url: string;
    id: string;
    phrase: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    self_grading: true;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"AUDIO_RECOGNITION">;
    arabic_text: z.ZodString;
    audio_url: z.ZodOptional<z.ZodString>;
    options: z.ZodArray<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_index: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "AUDIO_RECOGNITION";
    id: string;
    correct_index: number;
    arabic_text: string;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "AUDIO_RECOGNITION";
    id: string;
    correct_index: number;
    arabic_text: string;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"WRITE_ARABIC">;
    prompt: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    audio_url: z.ZodOptional<z.ZodString>;
    correct_answer: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    hint_available: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "WRITE_ARABIC";
    id: string;
    correct_answer: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    prompt: {
        en: string;
        ur?: string | undefined;
    };
    hint_available: boolean;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "WRITE_ARABIC";
    id: string;
    correct_answer: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    prompt: {
        en: string;
        ur?: string | undefined;
    };
    hint_available: boolean;
    audio_url?: string | undefined;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"HARAKAH_PLACEMENT">;
    word_unvowelled: z.ZodString;
    correct_vowelled: z.ZodString;
    hint: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "HARAKAH_PLACEMENT";
    id: string;
    hint: {
        en: string;
        ur?: string | undefined;
    };
    word_unvowelled: string;
    correct_vowelled: string;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "HARAKAH_PLACEMENT";
    id: string;
    hint: {
        en: string;
        ur?: string | undefined;
    };
    word_unvowelled: string;
    correct_vowelled: string;
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"WORD_ORDER">;
    tiles: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_order: z.ZodArray<z.ZodNumber, "many">;
    context: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "WORD_ORDER";
    id: string;
    tiles: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    correct_order: number[];
    context: {
        en: string;
        ur?: string | undefined;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "WORD_ORDER";
    id: string;
    tiles: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    correct_order: number[];
    context: {
        en: string;
        ur?: string | undefined;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"TRANSLATE_TO_ARABIC">;
    source: z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>;
    acceptable_answers: z.ZodArray<z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "TRANSLATE_TO_ARABIC";
    id: string;
    source: {
        en: string;
        ur?: string | undefined;
    };
    acceptable_answers: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    type: "TRANSLATE_TO_ARABIC";
    id: string;
    source: {
        en: string;
        ur?: string | undefined;
    };
    acceptable_answers: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }[];
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"IDENTIFY_ROOT">;
    word: z.ZodObject<{
        ar: z.ZodString;
        ar_plain: z.ZodString;
        translit: z.ZodString;
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }, {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    }>;
    options: z.ZodArray<z.ZodString, "many">;
    correct_index: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    options: string[];
    type: "IDENTIFY_ROOT";
    id: string;
    correct_index: number;
    word: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    options: string[];
    type: "IDENTIFY_ROOT";
    id: string;
    correct_index: number;
    word: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string | undefined;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    xp_value: z.ZodOptional<z.ZodNumber>;
    explanation_on_wrong: z.ZodOptional<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>>;
} & {
    type: z.ZodLiteral<"MATCH_AYAH">;
    ayah_fragment: z.ZodObject<{
        ar: z.ZodString;
        surah_ref: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ar: string;
        surah_ref: string;
    }, {
        ar: string;
        surah_ref: string;
    }>;
    options: z.ZodArray<z.ZodObject<{
        en: z.ZodString;
        ur: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        en: string;
        ur?: string | undefined;
    }, {
        en: string;
        ur?: string | undefined;
    }>, "many">;
    correct_index: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "MATCH_AYAH";
    id: string;
    correct_index: number;
    ayah_fragment: {
        ar: string;
        surah_ref: string;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}, {
    options: {
        en: string;
        ur?: string | undefined;
    }[];
    type: "MATCH_AYAH";
    id: string;
    correct_index: number;
    ayah_fragment: {
        ar: string;
        surah_ref: string;
    };
    xp_value?: number | undefined;
    explanation_on_wrong?: {
        en: string;
        ur?: string | undefined;
    } | undefined;
}>]>;
type Exercise = z.infer<typeof ExerciseSchema>;
type ExerciseType = Exercise["type"];
declare function isExercise(value: unknown): value is Exercise;

declare const LessonContentSchema: z.ZodObject<{
    schema_version: z.ZodLiteral<"1.0">;
    template: z.ZodEnum<["STANDARD", "SPOKEN_PHRASES", "REVIEW", "VERB_PATTERN"]>;
    hook: z.ZodObject<{
        ayah: z.ZodObject<{
            surah: z.ZodNumber;
            ayah: z.ZodNumber;
            label: z.ZodString;
            ar: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
            audio_url: z.ZodOptional<z.ZodString>;
            word_timings: z.ZodOptional<z.ZodArray<z.ZodObject<{
                index: z.ZodNumber;
                start_ms: z.ZodNumber;
                end_ms: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                index: number;
                start_ms: number;
                end_ms: number;
            }, {
                index: number;
                start_ms: number;
                end_ms: number;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
            word_timings?: {
                index: number;
                start_ms: number;
                end_ms: number;
            }[] | undefined;
        }, {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
            word_timings?: {
                index: number;
                start_ms: number;
                end_ms: number;
            }[] | undefined;
        }>;
        noor_intro: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
        autoplay: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        ayah: {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
            word_timings?: {
                index: number;
                start_ms: number;
                end_ms: number;
            }[] | undefined;
        };
        noor_intro?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        autoplay?: boolean | undefined;
    }, {
        ayah: {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
            word_timings?: {
                index: number;
                start_ms: number;
                end_ms: number;
            }[] | undefined;
        };
        noor_intro?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        autoplay?: boolean | undefined;
    }>;
    close: z.ZodObject<{
        noor_message_template: z.ZodOptional<z.ZodString>;
        noor_message: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        noor_message_template?: string | undefined;
        noor_message?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        noor_message_template?: string | undefined;
        noor_message?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>;
    discover_cards: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"WORD">;
        text: z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>;
        image_url: z.ZodOptional<z.ZodString>;
        audio_url: z.ZodOptional<z.ZodString>;
        explanation: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
        examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">>;
        introduces_vocab: z.ZodOptional<z.ZodObject<{
            word_id: z.ZodOptional<z.ZodString>;
            ar_plain: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ar_plain: string;
            word_id?: string | undefined;
        }, {
            ar_plain: string;
            word_id?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "WORD";
        text: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    }, {
        type: "WORD";
        text: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"CONCEPT">;
        concept: z.ZodObject<{
            en: z.ZodString;
            ar: z.ZodOptional<z.ZodString>;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }>;
        explanation: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
        image_url: z.ZodOptional<z.ZodString>;
        audio_url: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">>;
        introduces_vocab: z.ZodOptional<z.ZodObject<{
            word_id: z.ZodOptional<z.ZodString>;
            ar_plain: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ar_plain: string;
            word_id?: string | undefined;
        }, {
            ar_plain: string;
            word_id?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "CONCEPT";
        explanation: {
            en: string;
            ur?: string | undefined;
        };
        concept: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    }, {
        type: "CONCEPT";
        explanation: {
            en: string;
            ur?: string | undefined;
        };
        concept: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"EXAMPLE">;
        text: z.ZodOptional<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>>;
        explanation: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
        image_url: z.ZodOptional<z.ZodString>;
        audio_url: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">>;
        introduces_vocab: z.ZodOptional<z.ZodObject<{
            word_id: z.ZodOptional<z.ZodString>;
            ar_plain: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ar_plain: string;
            word_id?: string | undefined;
        }, {
            ar_plain: string;
            word_id?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "EXAMPLE";
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    }, {
        type: "EXAMPLE";
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"CONTRAST">;
        concept: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ar: z.ZodOptional<z.ZodString>;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }>>;
        text: z.ZodOptional<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>>;
        explanation: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
        image_url: z.ZodOptional<z.ZodString>;
        audio_url: z.ZodOptional<z.ZodString>;
        examples: z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">;
        introduces_vocab: z.ZodOptional<z.ZodObject<{
            word_id: z.ZodOptional<z.ZodString>;
            ar_plain: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ar_plain: string;
            word_id?: string | undefined;
        }, {
            ar_plain: string;
            word_id?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "CONTRAST";
        examples: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
        concept?: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "CONTRAST";
        examples: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
        concept?: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"AYAH_PREVIEW">;
        concept: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ar: z.ZodOptional<z.ZodString>;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }>>;
        text: z.ZodOptional<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>>;
        explanation: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
        image_url: z.ZodOptional<z.ZodString>;
        audio_url: z.ZodOptional<z.ZodString>;
        examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">>;
        introduces_vocab: z.ZodOptional<z.ZodObject<{
            word_id: z.ZodOptional<z.ZodString>;
            ar_plain: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ar_plain: string;
            word_id?: string | undefined;
        }, {
            ar_plain: string;
            word_id?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "AYAH_PREVIEW";
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
        concept?: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "AYAH_PREVIEW";
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
        concept?: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"GRAMMAR_NOTE">;
        title: z.ZodObject<{
            en: z.ZodString;
            ar: z.ZodOptional<z.ZodString>;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }>;
        body: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
        image_url: z.ZodOptional<z.ZodString>;
        audio_url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "GRAMMAR_NOTE";
        title: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        body: {
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
    }, {
        type: "GRAMMAR_NOTE";
        title: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        body: {
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"SENTENCE">;
        text: z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>;
        explanation: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
        image_url: z.ZodOptional<z.ZodString>;
        audio_url: z.ZodOptional<z.ZodString>;
        introduces_vocab: z.ZodOptional<z.ZodObject<{
            word_id: z.ZodOptional<z.ZodString>;
            ar_plain: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ar_plain: string;
            word_id?: string | undefined;
        }, {
            ar_plain: string;
            word_id?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "SENTENCE";
        text: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    }, {
        type: "SENTENCE";
        text: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    }>]>, "many">>;
    exercises: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"TRUE_FALSE">;
        statement: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
            ar_example: z.ZodOptional<z.ZodObject<{
                ar: z.ZodString;
                ar_plain: z.ZodString;
                translit: z.ZodString;
                en: z.ZodString;
                ur: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            }, {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
            ar_example?: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            } | undefined;
        }, {
            en: string;
            ur?: string | undefined;
            ar_example?: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            } | undefined;
        }>;
        correct_answer: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        type: "TRUE_FALSE";
        id: string;
        statement: {
            en: string;
            ur?: string | undefined;
            ar_example?: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            } | undefined;
        };
        correct_answer: boolean;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "TRUE_FALSE";
        id: string;
        statement: {
            en: string;
            ur?: string | undefined;
            ar_example?: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            } | undefined;
        };
        correct_answer: boolean;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"TAP_TRANSLATION">;
        prompt: z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>;
        options: z.ZodArray<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>, "many">;
        correct_index: z.ZodNumber;
        audio_url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "TAP_TRANSLATION";
        id: string;
        prompt: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        correct_index: number;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "TAP_TRANSLATION";
        id: string;
        prompt: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        correct_index: number;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"FILL_BLANK">;
        mode: z.ZodEnum<["TAP", "TYPE"]>;
        sentence_ar: z.ZodString;
        hint: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">>;
        correct_answer: z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "FILL_BLANK";
        id: string;
        correct_answer: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        mode: "TAP" | "TYPE";
        sentence_ar: string;
        hint: {
            en: string;
            ur?: string | undefined;
        };
        options?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "FILL_BLANK";
        id: string;
        correct_answer: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        mode: "TAP" | "TYPE";
        sentence_ar: string;
        hint: {
            en: string;
            ur?: string | undefined;
        };
        options?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"BUILD_SENTENCE">;
        target_translation: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
        tiles: z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">;
        correct_order: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "BUILD_SENTENCE";
        id: string;
        target_translation: {
            en: string;
            ur?: string | undefined;
        };
        tiles: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        correct_order: number[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "BUILD_SENTENCE";
        id: string;
        target_translation: {
            en: string;
            ur?: string | undefined;
        };
        tiles: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        correct_order: number[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"MATCHING">;
        left_column: z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">;
        right_column: z.ZodArray<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>, "many">;
        correct_pairs: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "MATCHING";
        id: string;
        left_column: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        right_column: {
            en: string;
            ur?: string | undefined;
        }[];
        correct_pairs: [number, number][];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "MATCHING";
        id: string;
        left_column: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        right_column: {
            en: string;
            ur?: string | undefined;
        }[];
        correct_pairs: [number, number][];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"GRAMMAR_PARSE">;
        sentence_ar: z.ZodString;
        words: z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">;
        available_roles: z.ZodArray<z.ZodEnum<["SUBJECT", "PREDICATE", "VERB", "OBJECT", "PARTICLE", "PREPOSITION", "POSSESSIVE", "ADJECTIVE", "DEMONSTRATIVE", "RELATIVE_PRONOUN", "PRONOUN", "LITERARY_DEVICE", "CONJUNCTION", "INTERJECTION", "VERB_PHRASE", "NOUN", "VOCATIVE", "TIME_ZARF", "PLACE_ZARF"]>, "many">;
        correct_roles: z.ZodArray<z.ZodEnum<["SUBJECT", "PREDICATE", "VERB", "OBJECT", "PARTICLE", "PREPOSITION", "POSSESSIVE", "ADJECTIVE", "DEMONSTRATIVE", "RELATIVE_PRONOUN", "PRONOUN", "LITERARY_DEVICE", "CONJUNCTION", "INTERJECTION", "VERB_PHRASE", "NOUN", "VOCATIVE", "TIME_ZARF", "PLACE_ZARF"]>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "GRAMMAR_PARSE";
        id: string;
        sentence_ar: string;
        words: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        available_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
        correct_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "GRAMMAR_PARSE";
        id: string;
        sentence_ar: string;
        words: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        available_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
        correct_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"CONVERSATION_BUILDER">;
        prompt_line: z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>;
        response_mode: z.ZodEnum<["PICK", "BUILD"]>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">>;
        correct_option_index: z.ZodOptional<z.ZodNumber>;
        tiles: z.ZodOptional<z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">>;
        correct_order: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "CONVERSATION_BUILDER";
        id: string;
        prompt_line: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        response_mode: "PICK" | "BUILD";
        options?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        tiles?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        correct_order?: number[] | undefined;
        correct_option_index?: number | undefined;
    }, {
        type: "CONVERSATION_BUILDER";
        id: string;
        prompt_line: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        response_mode: "PICK" | "BUILD";
        options?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        tiles?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        correct_order?: number[] | undefined;
        correct_option_index?: number | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"SHADOW_REPEAT">;
        phrase: z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>;
        audio_url: z.ZodString;
        self_grading: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        type: "SHADOW_REPEAT";
        audio_url: string;
        id: string;
        phrase: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        self_grading: true;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "SHADOW_REPEAT";
        audio_url: string;
        id: string;
        phrase: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        self_grading: true;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"AUDIO_RECOGNITION">;
        arabic_text: z.ZodString;
        audio_url: z.ZodOptional<z.ZodString>;
        options: z.ZodArray<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>, "many">;
        correct_index: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "AUDIO_RECOGNITION";
        id: string;
        correct_index: number;
        arabic_text: string;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "AUDIO_RECOGNITION";
        id: string;
        correct_index: number;
        arabic_text: string;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"WRITE_ARABIC">;
        prompt: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
        audio_url: z.ZodOptional<z.ZodString>;
        correct_answer: z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>;
        hint_available: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        type: "WRITE_ARABIC";
        id: string;
        correct_answer: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        prompt: {
            en: string;
            ur?: string | undefined;
        };
        hint_available: boolean;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "WRITE_ARABIC";
        id: string;
        correct_answer: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        prompt: {
            en: string;
            ur?: string | undefined;
        };
        hint_available: boolean;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"HARAKAH_PLACEMENT">;
        word_unvowelled: z.ZodString;
        correct_vowelled: z.ZodString;
        hint: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "HARAKAH_PLACEMENT";
        id: string;
        hint: {
            en: string;
            ur?: string | undefined;
        };
        word_unvowelled: string;
        correct_vowelled: string;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "HARAKAH_PLACEMENT";
        id: string;
        hint: {
            en: string;
            ur?: string | undefined;
        };
        word_unvowelled: string;
        correct_vowelled: string;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"WORD_ORDER">;
        tiles: z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">;
        correct_order: z.ZodArray<z.ZodNumber, "many">;
        context: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "WORD_ORDER";
        id: string;
        tiles: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        correct_order: number[];
        context: {
            en: string;
            ur?: string | undefined;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "WORD_ORDER";
        id: string;
        tiles: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        correct_order: number[];
        context: {
            en: string;
            ur?: string | undefined;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"TRANSLATE_TO_ARABIC">;
        source: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
        acceptable_answers: z.ZodArray<z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "TRANSLATE_TO_ARABIC";
        id: string;
        source: {
            en: string;
            ur?: string | undefined;
        };
        acceptable_answers: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        type: "TRANSLATE_TO_ARABIC";
        id: string;
        source: {
            en: string;
            ur?: string | undefined;
        };
        acceptable_answers: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"IDENTIFY_ROOT">;
        word: z.ZodObject<{
            ar: z.ZodString;
            ar_plain: z.ZodString;
            translit: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }, {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }>;
        options: z.ZodArray<z.ZodString, "many">;
        correct_index: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        options: string[];
        type: "IDENTIFY_ROOT";
        id: string;
        correct_index: number;
        word: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        options: string[];
        type: "IDENTIFY_ROOT";
        id: string;
        correct_index: number;
        word: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        xp_value: z.ZodOptional<z.ZodNumber>;
        explanation_on_wrong: z.ZodOptional<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>>;
    } & {
        type: z.ZodLiteral<"MATCH_AYAH">;
        ayah_fragment: z.ZodObject<{
            ar: z.ZodString;
            surah_ref: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            surah_ref: string;
        }, {
            ar: string;
            surah_ref: string;
        }>;
        options: z.ZodArray<z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>, "many">;
        correct_index: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "MATCH_AYAH";
        id: string;
        correct_index: number;
        ayah_fragment: {
            ar: string;
            surah_ref: string;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }, {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "MATCH_AYAH";
        id: string;
        correct_index: number;
        ayah_fragment: {
            ar: string;
            surah_ref: string;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    }>]>, "many">>;
    reveal: z.ZodOptional<z.ZodObject<{
        concept_name: z.ZodObject<{
            en: z.ZodString;
            ar: z.ZodOptional<z.ZodString>;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }>;
        ayah: z.ZodObject<{
            surah: z.ZodNumber;
            ayah: z.ZodNumber;
            label: z.ZodString;
            ar: z.ZodString;
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
            audio_url: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
        }, {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
        }>;
        highlighted_word_indices: z.ZodArray<z.ZodNumber, "many">;
        noor_explanation: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        ayah: {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
        };
        concept_name: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        highlighted_word_indices: number[];
        noor_explanation: {
            en: string;
            ur?: string | undefined;
        };
    }, {
        ayah: {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
        };
        concept_name: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        highlighted_word_indices: number[];
        noor_explanation: {
            en: string;
            ur?: string | undefined;
        };
    }>>;
    spoken_phrases: z.ZodOptional<z.ZodObject<{
        scene: z.ZodObject<{
            en: z.ZodString;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ur?: string | undefined;
        }, {
            en: string;
            ur?: string | undefined;
        }>;
        phrases: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            phrase: z.ZodObject<{
                ar: z.ZodString;
                ar_plain: z.ZodString;
                translit: z.ZodString;
                en: z.ZodString;
                ur: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            }, {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            }>;
            audio_url: z.ZodString;
            context: z.ZodOptional<z.ZodObject<{
                en: z.ZodString;
                ur: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                en: string;
                ur?: string | undefined;
            }, {
                en: string;
                ur?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            audio_url: string;
            id: string;
            phrase: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            context?: {
                en: string;
                ur?: string | undefined;
            } | undefined;
        }, {
            audio_url: string;
            id: string;
            phrase: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            context?: {
                en: string;
                ur?: string | undefined;
            } | undefined;
        }>, "many">;
        dialogue: z.ZodOptional<z.ZodArray<z.ZodObject<{
            speaker: z.ZodEnum<["A", "B"]>;
            phrase_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            speaker: "A" | "B";
            phrase_id: string;
        }, {
            speaker: "A" | "B";
            phrase_id: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        scene: {
            en: string;
            ur?: string | undefined;
        };
        phrases: {
            audio_url: string;
            id: string;
            phrase: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            context?: {
                en: string;
                ur?: string | undefined;
            } | undefined;
        }[];
        dialogue?: {
            speaker: "A" | "B";
            phrase_id: string;
        }[] | undefined;
    }, {
        scene: {
            en: string;
            ur?: string | undefined;
        };
        phrases: {
            audio_url: string;
            id: string;
            phrase: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            context?: {
                en: string;
                ur?: string | undefined;
            } | undefined;
        }[];
        dialogue?: {
            speaker: "A" | "B";
            phrase_id: string;
        }[] | undefined;
    }>>;
    conjugation_table: z.ZodOptional<z.ZodObject<{
        root: z.ZodString;
        pattern_name: z.ZodObject<{
            en: z.ZodString;
            ar: z.ZodOptional<z.ZodString>;
            ur: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }, {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        }>;
        rows: z.ZodArray<z.ZodObject<{
            pronoun: z.ZodObject<{
                ar: z.ZodString;
                ar_plain: z.ZodString;
                translit: z.ZodString;
                en: z.ZodString;
                ur: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            }, {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            }>;
            conjugated: z.ZodObject<{
                ar: z.ZodString;
                ar_plain: z.ZodString;
                translit: z.ZodString;
                en: z.ZodString;
                ur: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            }, {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            }>;
            audio_url: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            pronoun: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            conjugated: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            audio_url?: string | undefined;
        }, {
            pronoun: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            conjugated: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            audio_url?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        root: string;
        pattern_name: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        rows: {
            pronoun: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            conjugated: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            audio_url?: string | undefined;
        }[];
    }, {
        root: string;
        pattern_name: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        rows: {
            pronoun: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            conjugated: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            audio_url?: string | undefined;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    schema_version: "1.0";
    template: "STANDARD" | "SPOKEN_PHRASES" | "REVIEW" | "VERB_PATTERN";
    hook: {
        ayah: {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
            word_timings?: {
                index: number;
                start_ms: number;
                end_ms: number;
            }[] | undefined;
        };
        noor_intro?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        autoplay?: boolean | undefined;
    };
    close: {
        noor_message_template?: string | undefined;
        noor_message?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    };
    discover_cards?: ({
        type: "WORD";
        text: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    } | {
        type: "CONCEPT";
        explanation: {
            en: string;
            ur?: string | undefined;
        };
        concept: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    } | {
        type: "EXAMPLE";
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    } | {
        type: "CONTRAST";
        examples: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
        concept?: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "AYAH_PREVIEW";
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
        concept?: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "GRAMMAR_NOTE";
        title: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        body: {
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
    } | {
        type: "SENTENCE";
        text: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    })[] | undefined;
    exercises?: ({
        type: "TRUE_FALSE";
        id: string;
        statement: {
            en: string;
            ur?: string | undefined;
            ar_example?: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            } | undefined;
        };
        correct_answer: boolean;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "TAP_TRANSLATION";
        id: string;
        prompt: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        correct_index: number;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "FILL_BLANK";
        id: string;
        correct_answer: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        mode: "TAP" | "TYPE";
        sentence_ar: string;
        hint: {
            en: string;
            ur?: string | undefined;
        };
        options?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "BUILD_SENTENCE";
        id: string;
        target_translation: {
            en: string;
            ur?: string | undefined;
        };
        tiles: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        correct_order: number[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "MATCHING";
        id: string;
        left_column: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        right_column: {
            en: string;
            ur?: string | undefined;
        }[];
        correct_pairs: [number, number][];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "GRAMMAR_PARSE";
        id: string;
        sentence_ar: string;
        words: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        available_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
        correct_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "CONVERSATION_BUILDER";
        id: string;
        prompt_line: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        response_mode: "PICK" | "BUILD";
        options?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        tiles?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        correct_order?: number[] | undefined;
        correct_option_index?: number | undefined;
    } | {
        type: "SHADOW_REPEAT";
        audio_url: string;
        id: string;
        phrase: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        self_grading: true;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "AUDIO_RECOGNITION";
        id: string;
        correct_index: number;
        arabic_text: string;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "WRITE_ARABIC";
        id: string;
        correct_answer: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        prompt: {
            en: string;
            ur?: string | undefined;
        };
        hint_available: boolean;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "HARAKAH_PLACEMENT";
        id: string;
        hint: {
            en: string;
            ur?: string | undefined;
        };
        word_unvowelled: string;
        correct_vowelled: string;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "WORD_ORDER";
        id: string;
        tiles: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        correct_order: number[];
        context: {
            en: string;
            ur?: string | undefined;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "TRANSLATE_TO_ARABIC";
        id: string;
        source: {
            en: string;
            ur?: string | undefined;
        };
        acceptable_answers: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        options: string[];
        type: "IDENTIFY_ROOT";
        id: string;
        correct_index: number;
        word: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "MATCH_AYAH";
        id: string;
        correct_index: number;
        ayah_fragment: {
            ar: string;
            surah_ref: string;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    })[] | undefined;
    reveal?: {
        ayah: {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
        };
        concept_name: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        highlighted_word_indices: number[];
        noor_explanation: {
            en: string;
            ur?: string | undefined;
        };
    } | undefined;
    spoken_phrases?: {
        scene: {
            en: string;
            ur?: string | undefined;
        };
        phrases: {
            audio_url: string;
            id: string;
            phrase: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            context?: {
                en: string;
                ur?: string | undefined;
            } | undefined;
        }[];
        dialogue?: {
            speaker: "A" | "B";
            phrase_id: string;
        }[] | undefined;
    } | undefined;
    conjugation_table?: {
        root: string;
        pattern_name: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        rows: {
            pronoun: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            conjugated: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            audio_url?: string | undefined;
        }[];
    } | undefined;
}, {
    schema_version: "1.0";
    template: "STANDARD" | "SPOKEN_PHRASES" | "REVIEW" | "VERB_PATTERN";
    hook: {
        ayah: {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
            word_timings?: {
                index: number;
                start_ms: number;
                end_ms: number;
            }[] | undefined;
        };
        noor_intro?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        autoplay?: boolean | undefined;
    };
    close: {
        noor_message_template?: string | undefined;
        noor_message?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    };
    discover_cards?: ({
        type: "WORD";
        text: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    } | {
        type: "CONCEPT";
        explanation: {
            en: string;
            ur?: string | undefined;
        };
        concept: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    } | {
        type: "EXAMPLE";
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    } | {
        type: "CONTRAST";
        examples: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
        concept?: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "AYAH_PREVIEW";
        audio_url?: string | undefined;
        text?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        } | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        examples?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
        concept?: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "GRAMMAR_NOTE";
        title: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        body: {
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
    } | {
        type: "SENTENCE";
        text: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        audio_url?: string | undefined;
        image_url?: string | undefined;
        explanation?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        introduces_vocab?: {
            ar_plain: string;
            word_id?: string | undefined;
        } | undefined;
    })[] | undefined;
    exercises?: ({
        type: "TRUE_FALSE";
        id: string;
        statement: {
            en: string;
            ur?: string | undefined;
            ar_example?: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            } | undefined;
        };
        correct_answer: boolean;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "TAP_TRANSLATION";
        id: string;
        prompt: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        correct_index: number;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "FILL_BLANK";
        id: string;
        correct_answer: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        mode: "TAP" | "TYPE";
        sentence_ar: string;
        hint: {
            en: string;
            ur?: string | undefined;
        };
        options?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "BUILD_SENTENCE";
        id: string;
        target_translation: {
            en: string;
            ur?: string | undefined;
        };
        tiles: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        correct_order: number[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "MATCHING";
        id: string;
        left_column: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        right_column: {
            en: string;
            ur?: string | undefined;
        }[];
        correct_pairs: [number, number][];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "GRAMMAR_PARSE";
        id: string;
        sentence_ar: string;
        words: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        available_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
        correct_roles: ("SUBJECT" | "PREDICATE" | "VERB" | "OBJECT" | "PARTICLE" | "PREPOSITION" | "POSSESSIVE" | "ADJECTIVE" | "DEMONSTRATIVE" | "RELATIVE_PRONOUN" | "PRONOUN" | "LITERARY_DEVICE" | "CONJUNCTION" | "INTERJECTION" | "VERB_PHRASE" | "NOUN" | "VOCATIVE" | "TIME_ZARF" | "PLACE_ZARF")[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "CONVERSATION_BUILDER";
        id: string;
        prompt_line: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        response_mode: "PICK" | "BUILD";
        options?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
        tiles?: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[] | undefined;
        correct_order?: number[] | undefined;
        correct_option_index?: number | undefined;
    } | {
        type: "SHADOW_REPEAT";
        audio_url: string;
        id: string;
        phrase: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        self_grading: true;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "AUDIO_RECOGNITION";
        id: string;
        correct_index: number;
        arabic_text: string;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "WRITE_ARABIC";
        id: string;
        correct_answer: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        prompt: {
            en: string;
            ur?: string | undefined;
        };
        hint_available: boolean;
        audio_url?: string | undefined;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "HARAKAH_PLACEMENT";
        id: string;
        hint: {
            en: string;
            ur?: string | undefined;
        };
        word_unvowelled: string;
        correct_vowelled: string;
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "WORD_ORDER";
        id: string;
        tiles: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        correct_order: number[];
        context: {
            en: string;
            ur?: string | undefined;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        type: "TRANSLATE_TO_ARABIC";
        id: string;
        source: {
            en: string;
            ur?: string | undefined;
        };
        acceptable_answers: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        }[];
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        options: string[];
        type: "IDENTIFY_ROOT";
        id: string;
        correct_index: number;
        word: {
            ar: string;
            ar_plain: string;
            translit: string;
            en: string;
            ur?: string | undefined;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    } | {
        options: {
            en: string;
            ur?: string | undefined;
        }[];
        type: "MATCH_AYAH";
        id: string;
        correct_index: number;
        ayah_fragment: {
            ar: string;
            surah_ref: string;
        };
        xp_value?: number | undefined;
        explanation_on_wrong?: {
            en: string;
            ur?: string | undefined;
        } | undefined;
    })[] | undefined;
    reveal?: {
        ayah: {
            ar: string;
            en: string;
            surah: number;
            ayah: number;
            label: string;
            ur?: string | undefined;
            audio_url?: string | undefined;
        };
        concept_name: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        highlighted_word_indices: number[];
        noor_explanation: {
            en: string;
            ur?: string | undefined;
        };
    } | undefined;
    spoken_phrases?: {
        scene: {
            en: string;
            ur?: string | undefined;
        };
        phrases: {
            audio_url: string;
            id: string;
            phrase: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            context?: {
                en: string;
                ur?: string | undefined;
            } | undefined;
        }[];
        dialogue?: {
            speaker: "A" | "B";
            phrase_id: string;
        }[] | undefined;
    } | undefined;
    conjugation_table?: {
        root: string;
        pattern_name: {
            en: string;
            ar?: string | undefined;
            ur?: string | undefined;
        };
        rows: {
            pronoun: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            conjugated: {
                ar: string;
                ar_plain: string;
                translit: string;
                en: string;
                ur?: string | undefined;
            };
            audio_url?: string | undefined;
        }[];
    } | undefined;
}>;
type AyahWordTiming = {
    index: number;
    start_ms: number;
    end_ms: number;
};
type AyahReference = {
    surah: number;
    ayah: number;
    label: string;
    ar: string;
    en: string;
    ur?: string;
    audio_url?: string;
    word_timings?: AyahWordTiming[];
};
type VocabRef = {
    word_id?: string;
    ar_plain: string;
};
type HookBeat = {
    ayah: AyahReference;
    noor_intro?: {
        en: string;
        ur?: string;
    };
    autoplay?: boolean;
};
type CloseBeat = {
    noor_message_template?: string;
    noor_message?: {
        en: string;
        ur?: string;
    };
};
type SpokenPhrase = {
    id: string;
    phrase: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string;
    };
    audio_url: string;
    context?: {
        en: string;
        ur?: string;
    };
};
type SpokenPhrasesBlock = {
    scene: {
        en: string;
        ur?: string;
    };
    phrases: SpokenPhrase[];
    dialogue?: {
        speaker: "A" | "B";
        phrase_id: string;
    }[];
};
type ConjugationRow = {
    pronoun: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string;
    };
    conjugated: {
        ar: string;
        ar_plain: string;
        translit: string;
        en: string;
        ur?: string;
    };
    audio_url?: string;
};
type ConjugationTable = {
    root: string;
    pattern_name: {
        en: string;
        ar?: string;
        ur?: string;
    };
    rows: ConjugationRow[];
};
type LessonContent = z.infer<typeof LessonContentSchema>;
type LessonTemplate = LessonContent["template"];
declare function isStandardLesson(v: LessonContent): boolean;
declare function isSpokenPhrasesLesson(v: LessonContent): boolean;
declare function isVerbPatternLesson(v: LessonContent): boolean;
declare function isReviewLesson(v: LessonContent): boolean;
/**
 * Lenient parse — used when opening a lesson for editing.
 * Wraps the schema in a try/catch and also handles completely malformed JSON.
 */
declare function parseLenient(json: unknown): LessonContent | null;

/**
 * Creates a fresh candidate ID for a new exercise.
 * Format: ex_<nanoid(12)> — e.g. ex_abc123defg
 */
declare function createExerciseId(): string;
declare function createStarterCard(type: DiscoverCardType): DiscoverCard;
declare function createStarterExercise(type: ExerciseType): Exercise;

/**
 * Form config registry for the lesson builder UI.
 * Maps each discover card type and exercise type to UI metadata:
 * - inputKind: the kind of input widget to render
 * - rtl: whether the primary text input is RTL (Arabic)
 * - required: whether the field is required
 * - playerSupported: whether the mobile player can render this type today
 * - authoringScope: whether the structured Add picker offers this type in v1
 */
type InputKind = "text" | "arabic" | "number" | "boolean" | "select" | "options" | "matching_pairs" | "tiles";
interface FieldConfig {
    label: {
        en: string;
        ur?: string;
    };
    inputKind: InputKind;
    rtl?: boolean;
    required?: boolean;
}
interface TypeFormConfig {
    type: string;
    label: {
        en: string;
        ur?: string;
    };
    playerSupported: boolean;
    authoringScope: boolean;
    fields: Record<string, FieldConfig>;
}
declare const discoverCardFormConfig: Record<string, TypeFormConfig>;
declare const exerciseFormConfig: Record<string, TypeFormConfig>;

export { type ArabicText, ArabicTextSchema, AudioRecognitionExerciseSchema, type AyahReference, AyahReferenceSchema, type AyahWordTiming, AyahWordTimingSchema, BuildSentenceExerciseSchema, type CloseBeat, CloseBeatSchema, type ConjugationRow, type ConjugationTable, ConversationBuilderExerciseSchema, type DiscoverCard, DiscoverCardSchema, type DiscoverCardType, type Exercise, ExerciseSchema, type ExerciseType, FillBlankExerciseSchema, GrammarParseExerciseSchema, type GrammaticalRole, GrammaticalRoleSchema, HarakahPlacementExerciseSchema, type HookBeat, HookBeatSchema, IdentifyRootExerciseSchema, type LessonContent, LessonContentSchema, type LessonTemplate, MatchAyahExerciseSchema, MatchingExerciseSchema, ShadowRepeatExerciseSchema, type SpokenPhrase, type SpokenPhrasesBlock, TapTranslationExerciseSchema, TranslateToArabicExerciseSchema, TrueFalseExerciseSchema, type VocabRef, VocabRefSchema, WordOrderExerciseSchema, WriteArabicExerciseSchema, createExerciseId, createStarterCard, createStarterExercise, discoverCardFormConfig, exerciseFormConfig, isExercise, isReviewLesson, isSpokenPhrasesLesson, isStandardLesson, isVerbPatternLesson, parseLenient };

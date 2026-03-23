import re
import regex as regx
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate
from wordfreq import zipf_frequency

MODEL_NAME = "facebook/nllb-200-distilled-600M"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

MENTION_RE = r"@\w+"
HASHTAG_RE = r"#\w+"
URL_RE = r"(https?://\S+|www\.\S+)"

# ✅ FULL emoji sequences (handles 🌤️, 👨‍👩‍👧‍👦, skin tones, etc.)
EMOJI_SEQ_RE = r"(?:\p{Extended_Pictographic}(?:\p{EMod}|\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\p{EMod}|\uFE0F)?)*)"

PROTECTED_RE = regx.compile(
    f"({URL_RE}|{MENTION_RE}|{HASHTAG_RE}|{EMOJI_SEQ_RE})",
    flags=regx.IGNORECASE
)

def nllb_translate_nepali_deva_to_english(text: str) -> str:
    if not text.strip():
        return text

    tokenizer.src_lang = "npi_Deva"
    inputs = tokenizer(text, return_tensors="pt", truncation=True)

    forced_bos_token_id = tokenizer.convert_tokens_to_ids("eng_Latn")
    output = model.generate(
        **inputs,
        forced_bos_token_id=forced_bos_token_id,
        max_new_tokens=256
    )
    return tokenizer.batch_decode(output, skip_special_tokens=True)[0]

def devanagari_to_english_keep_symbols(raw_text: str) -> str:
    parts = PROTECTED_RE.split(raw_text)  # keep delimiters
    out = []

    for part in parts:
        if part is None or part == "":
            continue

        # If protected token → keep exact
        if PROTECTED_RE.fullmatch(part):
            out.append(part)
        else:
            out.append(nllb_translate_nepali_deva_to_english(part))

    return "".join(out)

# Protected tokens (NO CHANGE TO @/#/URLs/emojis)
MENTION_RE = r"@\w+"
HASHTAG_RE = r"#\w+"
URL_RE = r"(?:https?://\S+|www\.\S+)"  # non-capturing

# FULL emoji sequences (handles 🌤️, 👨‍👩‍👧‍👦, skin tones, etc.)
EMOJI_SEQ_RE = r"(?:\p{Extended_Pictographic}(?:\p{EMod}|\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\p{EMod}|\uFE0F)?)*)"

# One combined protected splitter (IMPORTANT: only ONE capturing group outside)
PROTECTED_RE = regx.compile(
    rf"({URL_RE}|{MENTION_RE}|{HASHTAG_RE}|{EMOJI_SEQ_RE})",
    flags=regx.IGNORECASE
)

# Script detection
DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")
LATIN_WORD_RE = re.compile(r"[A-Za-z]+")

# Heuristics
ENGLISH_ZIPF_THRESHOLD = 3.5 

# Force Nepali chat tokens (always convert even if English detector thinks English)
FORCE_NEPALI = {
    "ma", "m",
"timi", "tapai", "hami", "u", "uni",
"mero", "timro", "hamro",
"malai", "timilai", "uslai", "hamilai",
"yo", "ta", "ni", "na", "ra", "ani", "pani",
"k", "ke", "kina", "kasto", "kati", "kaha", "kata",
"xa", "xaina", "xu", "xau", "xas", "xan",
"hunxa", "bhayo",
"aaja", "aja", "bholi", "hijo",
"ramro", "naramo", "dherai", "khusi", "dukha", "dami", "lastai",
"jana", "parxa", "garcha", "garxu", "garchu", "garne"
}

# Small overrides for common chat spellings 
OVERRIDE_WORDS = {
# core verbs / helpers
"xa": "छ",
"xaina": "छैन",
"xu": "छु",
"xau": "छौ",
"xas": "छस्",
"xan": "छन्",
"hunxa": "हुन्छ",
"hunchha": "हुन्छ",
"ho": "हो",
"hoina": "होइन",
"haina": "होइन",
"thik": "ठिक",
"thikai": "ठिकै",
"bhayo": "भयो",
"vayo": "भयो",
"gayo": "गयो",
"aayo": "आयो",


# pronouns / people
"ma": "म",
"m": "म",
"timi": "तिमी",
"tapai": "तपाईं",
"hami": "हामी",
"uni": "उनी",
"u": "ऊ",


# possessives / cases
"mero": "मेरो",
"timro": "तिम्रो",
"hamro": "हाम्रो",
"malai": "मलाई",
"timilai": "तिमीलाई",
"uslai": "उसलाई",
"hamilai": "हामीलाई",


# common chat words
"yo": "यो",
"ta": "त",
"ni": "नि",
"na": "न",
"ra": "र",
"ani": "अनि",
"pani": "पनि",
"kina": "किन",
"k": "के",
"ke": "के",
"kasto": "कस्तो",
"kati": "कति",
"kaha": "कहाँ",
"kata": "कतै",


# time / routine
"aaja": "आज",
"aja": "आज",
"bholi": "भोलि",
"hijo": "हिजो",


# sentiment/common adjectives
"ramro": "राम्रो",
"naramo": "नराम्रो",
"dherai": "धेरै",
"sano": "सानो",
"thulo": "ठूलो",
"khusi": "खुसी",
"dukha": "दुःख",
"dami": "दामी",
"lastai": "लास्टै",
"garxu": "गर्छु",
"garchu": "गर्छु",
"garcha": "गर्छ",
"garne": "गर्ने",
"jana": "जान",
"janxu": "जान्छु",
"parxa": "पर्छ",
}

def is_probably_english(word: str) -> bool:
    w = word.lower()

    # force nepali always
    if w in FORCE_NEPALI:
        return False

    # keep common short English words
    if w in {"i","a","an","the","and","or","but","to","in","on","of","is","am","are","was","were","be"}:
        return True

    return zipf_frequency(w, "en") >= ENGLISH_ZIPF_THRESHOLD


def roman_word_to_devanagari(word: str) -> str:
    w = word.lower()

    # override if known
    if w in OVERRIDE_WORDS:
        return OVERRIDE_WORDS[w]

    # transliterate fallback
    return transliterate(word, sanscript.ITRANS, sanscript.DEVANAGARI)


def convert_romanized_nepali_to_devanagari(raw_text: str) -> str:
    """
    Convert only Romanized Nepali words to Devanagari.
    Keep EXACT:
      - emojis
      - urls
      - @mentions
      - #hashtags
      - existing Devanagari text
      - intended English words
    """
    parts = PROTECTED_RE.split(raw_text)  # keeps protected tokens in output
    out = []

    for part in parts:
        if not part:
            continue

        # protected token -> keep
        if PROTECTED_RE.fullmatch(part):
            out.append(part)
            continue

        # existing devanagari -> keep unchanged
        if DEVANAGARI_RE.search(part):
            out.append(part)
            continue

        # replace latin words inside normal text chunks
        def repl(m):
            w = m.group(0)
            if is_probably_english(w):
                return w
            return roman_word_to_devanagari(w)

        out.append(LATIN_WORD_RE.sub(repl, part))

    return "".join(out)

def compile_raw_to_english(raw_text: str) -> str:
    """
    RAW text (mixed English + Devanagari Nepali + romanized Nepali + emojis/@/#/URLs)
    -> English (keeping emojis/@/#/URLs unchanged)
    """
    # Step 1: Convert romanized Nepali words -> Devanagari (keep everything else same)
    deva_text = convert_romanized_nepali_to_devanagari(raw_text)

    # Step 2: Convert Devanagari Nepali -> English (keep emojis/@/#/URLs unchanged)
    english_text = devanagari_to_english_keep_symbols(deva_text)

    return english_text

def run_compile_tests():
        tests = [
            # 1) pure Devanagari Nepali
            "म आज धेरै खुशी छु 😄🔥 @shashank #happy https://example.com",

            # 2) pure romanized Nepali
            "ma aaja dherai khusi xu 😄🔥 @shashank #happy https://example.com",

            # 3) mix Devanagari + roman + English
            "आज मौसम ekदम ramro xa 😍🌤️ @shashank #goodvibes",

            # 4) roman Nepali with English words that must stay English
            "I am going to office aaja 🙂 #work @boss",

            # 5) roman Nepali (yo ta) + English + URL
            "Bro yo ta lastai ramro xa 😂 visit www.test.com @user_99",

            # 6) heavy mentions + hashtags
            "ma timilai bholi call garxu 📞🙂 @friend #callme #tomorrow",

            # 7) only English (should remain mostly same)
            "This is purely English 😎🔥 @someone #english https://openai.com",

            # 8) Devanagari + hashtags + emojis
            "आज मेरो दिन राम्रो भयो 🎉✅ #success @team",

            # 9) roman Nepali anger + emojis
            "kina yesto bhayo 😡🔥 @someone #angry",

            # 10) Nepali question
            "timi kaha xau? 🤔📍 @friend #curious",

            # 11) mixed punctuation
            "ma aaja, timi bholi? ok 😅 @user #plan",

            # 12) long-ish mixed text
            "आज ma dherai tired xu 😴💤 but kaam garna parxa 💼 @office #life",

            # 13) multiple emojis sequence test
            "ma khusi xu 😍🌤️😄🔥 @shashank #vibes",

            # 14) multiple URLs
            "yo link hera https://example.com ani yo pani www.test.com 😂 @user",

            # 15) mix Nepali + English + tags
            "project deadline bholi xa 😵‍💫📌 submit fast @team #urgent",

            # 16) Devanagari only but with URL + mention
            "तिमीले यो भिडियो हेर्‍यौ? 😂🎥 https://youtube.com @friend",

            # 17) roman + devanagari combined
            "ma आज ghar janxu 😴🏠 @home #tired",

            # 18) finance / money words
            "malai paisa chaiyo 💸😩 @bank #money",

            # 19) sports style
            "hijo ko match dami thyo 😂⚽ #football @bro",

            # 20) random mix
            "yo ta serious ho 😐⚠️ but it will be fine ✅ @you #important"
        ]

        for i, raw in enumerate(tests, 1):
            print("=" * 80)
            print(f"TEST {i}")
            print("RAW  :", raw)
            try:
                out = compile_raw_to_english(raw)
                print("FINAL:", out)
            except Exception as e:
                print("ERROR:", repr(e))


if __name__ == "__main__":

    run_compile_tests()
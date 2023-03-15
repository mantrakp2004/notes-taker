import spacy
import os
from spacy.lang.en.stop_words import STOP_WORDS
from string import punctuation
from heapq import nlargest

def summarize(text, per):
    nlp = spacy.load('en_core_web_sm')
    doc = nlp(text)
    tokens = [token.text for token in doc]
    word_frequencies = {}
    for word in doc:
        if word.text.lower() not in list(STOP_WORDS):
            if word.text.lower() not in punctuation:
                if word.text not in word_frequencies.keys():
                    word_frequencies[word.text] = 1
                else:
                    word_frequencies[word.text] += 1
    max_frequency = max(word_frequencies.values())
    for word in word_frequencies.keys():
        word_frequencies[word] = word_frequencies[word] / max_frequency
    sentence_tokens = [sent for sent in doc.sents]
    sentence_scores = {}
    for sent in sentence_tokens:
        for word in sent:
            if word.text.lower() in word_frequencies.keys():
                if sent not in sentence_scores.keys():
                    sentence_scores[sent] = word_frequencies[word.text.lower()]
                else:
                    sentence_scores[sent] += word_frequencies[word.text.lower()]
    select_length = int(len(sentence_tokens) * per)
    summary_sentences = nlargest(select_length, sentence_scores, key=sentence_scores.get)
    summary_sentences = sorted(summary_sentences, key=lambda x: x.start)
    summary = " ".join([sent.text.strip() for sent in summary_sentences])
    return summary

# Get the absolute path of the current script
script_path = os.path.abspath(__file__)

# Construct the absolute paths for captions.txt and summary.txt
captions_path = os.path.join(os.path.dirname(script_path), "captions.txt")
summary_path = os.path.join(os.path.dirname(script_path), "summary.txt")

# Read the contents of captions.txt
with open(captions_path, "r") as f:
    text = f.read()

# Summarize the text using the provided `summarize` function
summary = summarize(text, 0.09)

# Write the summary to summary.txt
with open(summary_path, "w") as f:
    f.write(summary)

#delete the python file after execution
os.remove(script_path)
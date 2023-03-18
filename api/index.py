from flask import Flask, render_template, jsonify
from bs4 import BeautifulSoup
from keybert import KeyBERT
from cltk.stops.enm import STOPS as middle_english_stopwords

app = Flask(__name__)

othello_tei = 'static/shake-othello.tei.xml'
with open(othello_tei, 'r', encoding='utf-8') as tei:
    oth_soup = BeautifulSoup(tei, 'lxml') 

cast = {}
cast_items = oth_soup.find_all('castitem')
for c in cast_items:
    cast_val = c.get('sameas')
    if cast_val:
        cast_name = c.find('name')
        if cast_name:
            cast[cast_name.text] = cast_val   

with open('static/early_modern_eng_stopwords.txt', 'r', encoding='utf-8') as em_english_stopwords:
    em_english_stopwords = em_english_stopwords.read()
em_english_stopwords = em_english_stopwords.split("\n")

stopwords = list(set(middle_english_stopwords) | set(em_english_stopwords)) + ['didn', 'doesn', 'don', 'hadn']
keywords_model = KeyBERT()

@app.route('/')
def index():
    return render_template('index.html', characters=cast)

@app.route('/getcharact/<character>', methods=['GET'])
def getcharact(character):
    char_acts = []
    for act in oth_soup.find_all('div', type='act'):
        found_char = act.find('sp', who=cast[character])
        if(found_char):
            char_acts.append(act.get('n'))
    return jsonify(char_acts)


@app.route('/getcharscene/<character>&<actn>', methods=['GET'])
def getcharscene(character, actn):
    char_scenes = []
    act = oth_soup.find('div', type='act', n=actn)
    for scene in act.find_all('div', type='scene'):
        found_char = scene.find('sp', who=cast[character])
        if(found_char):
            char_scenes.append(scene.get('n'))
    return jsonify(char_scenes)

@app.route('/getkeywords/<character>&<actn>&<scenen>&<keywordsn>', methods=['GET'])
def getkeywords(character, actn, scenen, keywordsn):

    character = cast[character]
    act = None if actn == "None" else actn
    scene = None if scenen == "None" else scenen
    numkeywords = int(keywordsn)

    sp = None
    if act is None:
        sp = oth_soup.find_all('sp', who=character)
    elif act is not None:
        cur_act = oth_soup.find('div', type='act', n=act)
        if scene is None:
            sp = cur_act.find_all('sp', who=character)
        else:
            cur_scene = cur_act.find('div', type='scene', n=scene)
            sp = cur_scene.find_all('sp', who=character)

    speech = ''
    for s in sp:
        speaker_tag = s.find('speaker')
        if(speaker_tag is not None):
            speaker_tag.extract()
        line = s.text.replace('\n\n\n', ' ').replace('\n\n', ' ').replace('\n', '')
        speech = line if (len(speech) == 0) else (speech + ' ' + line)
    
    keywords = keywords_model.extract_keywords(speech, keyphrase_ngram_range=(1,1), stop_words=stopwords, top_n=numkeywords)
    return jsonify(keywords)

@app.route('/about')
def about():
    return render_template('about.html')

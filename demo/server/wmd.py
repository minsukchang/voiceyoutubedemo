import json, gensim
from time import time
start_nb = time()
import logging
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s')
import os

from gensim.models import Word2Vec
if not os.path.isfile('./static/model/GoogleNews-vectors-negative300.bin.gz'):
    raise ValueError("SKIP: You need to download the google news model")
    
model = gensim.models.KeyedVectors.load_word2vec_format('./static/model/GoogleNews-vectors-negative300.bin.gz', binary=True)

# with open("./static/subtitle/"+out_filename, 'r') as f:
#   js = json.load(f)
#   content = ' '.join([i['content'] for i in js])
#   model = gensim.models.Word2Vec(
#         content,
#         size=150,
#         window=10,
#         min_count=2,
#         workers=10)
#   model.train(content, total_examples=len(content), epochs=10)
#   model.wv.most_similar(positive='makeup')
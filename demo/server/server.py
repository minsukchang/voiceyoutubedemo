from flask import Flask
from flask_cors import CORS, cross_origin
import requests, srttojson, json, os
from bs4 import BeautifulSoup

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/")
@cross_origin()
def helloWorld():
  return "Hello, cross-origin-world!"

@app.route("/fetchSubtitle")
@cross_origin()
def fetchSubtitle(video_id):
  # video_id="Ew-3-8itpjc"
  out_filename = video_id+".json"
  if not os.path.isfile('./static/subtitle/'+out_filename):
    URL = "https://downsub.com/?url=https://www.youtube.com/watch?v="+video_id
    r = requests.get(URL)
    html = r.text
    soup = BeautifulSoup(html, 'html.parser')
    href = soup.select('div#show a')[0].get('href')
    subtitle = requests.get("https://downsub.com/"+href)
    subtitle = srttojson.parse_srt(subtitle.content.decode())
    open("./static/subtitle/"+out_filename, 'w').write(json.dumps(subtitle, indent=2, sort_keys=True))



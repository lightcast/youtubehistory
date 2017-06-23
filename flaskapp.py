#!flask/bin/python
import os
import random
import json
from collections import OrderedDict
from flask import Flask, jsonify, render_template, request, redirect, url_for, send_from_directory
from flask.ext.cors import CORS
from werkzeug import secure_filename
from datetime import date, datetime, timedelta
from os.path import isfile, join
from flaskext.mysql import MySQL
from configuration import db_password, db_name


app = Flask(__name__)
CORS(app)

mysql = MySQL()

app.config['MYSQL_DATABASE_HOST'] = os.environ.get('OPENSHIFT_MYSQL_DB_HOST','.')
app.config['MYSQL_DATABASE_USER'] = os.environ.get('OPENSHIFT_MYSQL_DB_USERNAME', '.')
app.config['MYSQL_DATABASE_PASSWORD'] = db_password
app.config['MYSQL_DATABASE_DB'] =  db_name

mysql.init_app(app)

def getVideo(param):
   conn = mysql.connect()
   cursor = conn.cursor()
   try:
    cursor.execute("SELECT VideoID FROM myhistory WHERE VideoID = %s", (param))
    rows = cursor.fetchone()[0]
    cursor.close()
    conn.close()
   except:
    rows = 'none'
   return rows


def saveVideo(url, param, videoTitle):
  conn = mysql.connect()
  cursor = conn.cursor()
  query = "INSERT INTO myhistory(URL, VIEW_DATE, VideoID, Date_Time, VideoTitle)VALUES(%s, now(), %s, now(), %s)"
  values = (url, param, videoTitle)
  try:
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    rows = "something"
  except:
    rows = "test"
  return rows

def dictfetchall(cursor):
    """Returns all rows from a cursor as a list of dicts"""
    desc = cursor.description
    return [dict(zip([col[0] for col in desc], row))
            for row in cursor.fetchall()]

@app.route('/pillfinder/api/v1.0/youtubehistory', methods=['POST'])
def youtubehistory():
  content = request.get_json(force=True)
  jsObj = content['videos']
  values = []
  for i in jsObj:
    values.append(i['videoID'])
  conn = mysql.connect()
  cursor = conn.cursor()
  format_strings = ','.join(['%s'] * len(values))

  try:
    cursor.execute("SELECT VideoID FROM myhistory WHERE VideoID IN (%s)" % format_strings, tuple(values))
    results = dictfetchall(cursor)
    jsObj = json.dumps(results)
    cursor.close()
    conn.close()
  except:
   jsObj = 'none'
  return jsObj


@app.route('/pillfinder/api/v1.0/youtube', methods=['POST'])
def youtube():
   # this will work for posted data
   content = request.get_json(force=True)
   url = content['url']
   param = content['video']
   rows = getVideo(param)
   if rows == 'none':
    rows = saveVideo(url, param)
   return  rows

def getAllVideos(param):
   conn = mysql.connect()
   cursor = conn.cursor()
   try:
    cursor.execute("SELECT * FROM myhistory ")
    results = dictfetchall(cursor)
    history = json.dumps(results)
   except:
    history = 'none'
   return history


@app.route('/myhistory')
def myhistory():
    history = getAllVideos('')
    return history # render_template('myhistory.html')

if __name__ == '__main__':
    app.run(
        debug=True
    )

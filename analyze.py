import json
import numpy as np
from pathlib import Path

file = sorted(list(Path.cwd().rglob('*.dump.json')))[-1]

with open(file) as f:
  content = f.readlines()

  levelScores = {}
  yearScores = {}
  interviewerLevelScores = {}
  interviewerYearScores = {}

  with open("analysis.md", "a") as file:
    for line in content:
      obj = json.loads(line)

      level = obj['details']['level']
      year = obj['details']['gradYear']

      if level not in levelScores:
        levelScores[level] = []
      if year not in yearScores:
        yearScores[year] = []
      if level not in interviewerLevelScores:
        interviewerLevelScores[level] = []
      if year not in interviewerYearScores:
        interviewerYearScores[year] = []

      file.write('# {}\n'.format(obj['details']['intervieweeName']))
      file.write('Year: {}\n'.format(year))
      file.write('Level: {}\n'.format(level))
      file.write('Interviewers: {}\n\n'.format(obj['details']['interviewerName']))
      file.write('Resume Notes: {}\n\n'.format(obj['notes']['resume']['notes']))
      file.write('Interview 1 Score: {}\n'.format(obj['notes']['final-comments']['interviewer1Score']))
      file.write('Interview 2 Score: {}\n'.format(obj['notes']['final-comments']['interviewer2Score']))
      file.write('Final Notes: {}\n\n'.format(obj['notes']['final-comments']['notes']))

      interviewerLevelScores[level].append(float(obj['notes']['final-comments']['interviewer1Score']))
      interviewerLevelScores[level].append(float(obj['notes']['final-comments']['interviewer2Score']))
      interviewerYearScores[year].append(float(obj['notes']['final-comments']['interviewer1Score']))
      interviewerYearScores[year].append(float(obj['notes']['final-comments']['interviewer2Score']))

      del obj['notes']['resume']
      del obj['notes']['final-comments']

      personAvg = []

      for key, value in obj['notes'].items():
        file.write('{}\nScore: {}\nNotes: {}\n\n'.format(key, value['score'], value['notes']))
        #if not (level == 'Beginner' and key == 'problem-4') and not (level == 'Intermediate' and key == 'problem-5') and not (level == 'Advanced' and key == 'problem-5'):
        levelScores[level].append(int(value['score']))
        yearScores[year].append(int(value['score']))
        personAvg.append(int(value['score']))

      file.write('Question Average: {}\n\n'.format(round(sum(personAvg) / len(personAvg), 2)))

for level, values in levelScores.items():
  print('{} Question Score Average: {}'.format(level, round(np.mean(values), 2)))
  print('{} Question Score STD: {}\n'.format(level, round(np.std(values), 2)))
for year, values in yearScores.items():
  print('{} Question Score Average: {}'.format(year, round(np.mean(values), 2)))
  print('{} Question Score STD: {}\n'.format(level, round(np.std(values), 2)))

for level, values in interviewerLevelScores.items():
  print('{} Interviewer Score Average: {}'.format(level, round(np.mean(values), 2)))
  print('{} Interviewer Score STD: {}\n'.format(level, round(np.std(values), 2)))
for year, values in interviewerYearScores.items():
  print('{} Interviewer Score Average: {}'.format(year, round(np.mean(values), 2)))
  print('{} Interviewer Score STD: {}\n'.format(level, round(np.std(values), 2)))

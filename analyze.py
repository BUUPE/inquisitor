import json

with open('07-13-25.dump.json') as f:
  content = f.readlines()

  levelAvg = {}
  yearAvg = {}

  with open("analysis.md", "a") as file:
    for line in content:
      obj = json.loads(line)

      level = obj['details']['level']
      year = obj['details']['gradYear']

      if level not in levelAvg:
        levelAvg[level] = []

      if year not in yearAvg:
        yearAvg[year] = []

      file.write('# {}\n'.format(obj['details']['intervieweeName']))
      file.write('Year: {}\n'.format(year))
      file.write('Level: {}\n'.format(level))
      file.write('Interviewers: {}\n\n'.format(obj['details']['interviewerName']))
      file.write('Resume Notes: {}\n\n'.format(obj['notes']['resume']['notes']))
      file.write('Interview 1 Score: {}\n'.format(obj['notes']['final-comments']['interviewer1Score']))
      file.write('Interview 2 Score: {}\n'.format(obj['notes']['final-comments']['interviewer2Score']))
      file.write('Final Notes: {}\n\n'.format(obj['notes']['final-comments']['notes']))

      del obj['notes']['resume']
      del obj['notes']['final-comments']

      personAvg = []

      for key, value in obj['notes'].items():
        file.write('{}\nScore: {}\nNotes: {}\n\n'.format(key, value['score'], value['notes']))
        if not (level == 'Beginner' and key == 'problem-4') and not (level == 'Intermediate' and key == 'problem-5') and not (level == 'Advanced' and key == 'problem-5'):
          levelAvg[level].append(int(value['score']))
          yearAvg[year].append(int(value['score']))
          personAvg.append(int(value['score']))

      file.write('Question Average: {}\n\n'.format(round(sum(personAvg) / len(personAvg), 2)))

print("Level Averages\n")
for level, values in levelAvg.items():
  print('{} Average Question Score (non-bonus): {}'.format(level, round(sum(values) / len(values), 2)))
print('\n\n')
for year, values in yearAvg.items():
  print('{} Average Question Score (non-bonus): {}'.format(year, round(sum(values) / len(values), 2)))
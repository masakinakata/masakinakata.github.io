data = []
with open('data.txt', encoding='utf-8') as file:
    for row in file:
        line = row.rstrip()
        data.extend(map(int, line.split()))

print(int(len(data)/5))

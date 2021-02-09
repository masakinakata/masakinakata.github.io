from math import sqrt
class Point:
    def __init__(self, x = 0, y = 0, r = 0, b = 0, g = 0):
        self.x = x
        self.y = y
        self.r = r
        self.b = b
        self.g = g
        self.bright = sqrt(r*r+b*b+g*g)

data = []
with open('data.txt', encoding='utf-8') as file:
    for row in file:
        line = row.rstrip()
        data.extend(map(int, line.split()))

point = []        
for i in range(0, len(data), 5):
    point.append(Point(data[i], data[i+1], data[i+2], data[i+3], data[i+4]))


maxi = Point(0,0,0,0,0)
for p in point:
    if maxi.bright < p.bright:
        maxi = p

print(maxi.x, maxi.y)

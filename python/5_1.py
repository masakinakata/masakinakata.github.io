import numpy as np
import matplotlib.pyplot as plt
data = []
x = np.array([])
y = np.array([])

with open('sample.txt', encoding='utf-8') as file:
    for row in file:
        line = row.rstrip()
        data.extend(map(float, line.split()))

for i in range(0, len(data), 2):
    x = np.append(x, data[i])
    y = np.append(y, data[i+1])
    
def reg1dim(x, y):
    n = len(x)
    a = ((np.dot(x, y)- y.sum() * x.sum()/n)/
        ((x ** 2).sum() - x.sum()**2 / n))
    b = (y.sum() - a * x.sum())/n
    return a, b

a, b = reg1dim(x, y)
print(a, b)
print(max(x))
plt.scatter(x, y, color="k")
plt.plot([0, x.max()], [b, a * x.max() + b]) #(0, b)地点から(xの最大値,ax + b)地点までの線
plt.show()

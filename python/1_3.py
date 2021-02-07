import numpy as np

inputline = input()
inputsize = inputline.split()
n = int(inputsize[0])
m = int(inputsize[1])

a = np.zeros((n,m))
b = np.zeros((n,m))

for i in range (n):
    inputline = input()
    inputsize = inputline.split()
    for j in range(m):
        a[i,j] = inputsize[j]

for i in range (n):
    inputline = input()
    inputsize = inputline.split()
    for j in range(m):
        b[i,j] = inputsize[j]

ans = a*b

for i in range (n):
    for j in range (m):
        print(ans[i,j], end=' ')
    print()
import numpy as np

inputline = input()
inputsize = inputline.split()
n = int(inputsize[0])
m = int(inputsize[1])

a = np.zeros((n,m))

for i in range (n):
    inputline = input()
    inputsize = inputline.split()
    for j in range(m):
        a[i,j] = inputsize[j]

ans = a.T

for i in range (m):
    for j in range (n):
        print(ans[i,j], end=' ')
    print()
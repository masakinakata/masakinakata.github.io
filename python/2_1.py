x = 0
grad = 12*x*x*x-24*x*x-12*x+24

alpha = 1e-7
threshold = 1e-7
while abs(grad) > threshold:
    grad = 12*x*x*x-24*x*x-12*x+24
    x = x - alpha * grad

print(3*x*x*x*x-8*x*x*x-6*x*x+24*x+1)

memo = [-1 for i in range(2000)]
memo[1] = 1
memo[2] = 1
def fib(n):
    if memo[n] != -1:
        return memo[n]
    memo[n] = fib(n-1) + fib(n-2)
    return memo[n]

print(fib(100))

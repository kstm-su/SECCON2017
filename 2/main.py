import sys

sys.setrecursionlimit(99999)
memo = {}


def f(n):
    if memo.has_key(n):
        return memo[n]
    if n < 2:
        return n
    memo[n] = f(n - 2) + f(n - 1)
    return memo[n]


print "SECCON{" + str(f(11011))[:32] + "}"

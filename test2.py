# # 1
# # (a1 | a2 | a3 | ...)
# for a in A:
#   add(a)

# # 2
# # (a1 | a2 | a3 | ...) & (b1 | b2 | b3 | ...)
# for a in A:
#   for b in B:
#       if a.intersects(b):
#           continue
#       add(a, b)

# # 3
# # (a1 | a2 | a3 | ...) & (b1 | b2 | b3 | ...) & (c1 | c2 | c3 | ...)
# for a in A:
#   for b in B:
#       if a.intersects(b):
#           continue
#       for c in C:
#           if a.intersects(c) or b.intersects(c):
#               continue
#           add(a, b, c)

# # 4
# # (a1 | a2 | a3 | ...) & (b1 | b2 | b3 | ...) & (c1 | c2 | c3 | ...) & (d1 | d2 | d3 | ...)
# for a in A:
#   for b in B:
#       if a.intersects(b):
#           continue
#       for c in C:
#           if a.intersects(c) or b.intersects(c):
#               continue
#           for d in D:
#               if a.intersects(d) or b.intersects(d) or c.intersects(d):
#                   continue
#               add(a, b, c, d)


# # 2
# sofar = []
# for a in A:
#   for s in sofar:
#       if s.intersects(a):
#           continue
#   sofar.append(a)
#   for b in B:
#       for s in sofar:
#           if s.intersects(b):
#               continue
#       add(a, b)

# # 4
# sofar = []
# for a in A:
#   for s in sofar:
#       if s.intersects(a):
#           continue
#   sofar.append(a)
#   for b in B:
#       for s in sofar:
#           if s.intersects(b):
#               continue
#       sofar.append(b)
#       for c in C:
#           for s in sofar:
#               if s.intersects(c):
#                   continue
#           sofar.append(c)
#           for d in D:
#               for s in sofar:
#                   if s.intersects(d):
#                       continue
#               add(a, b, c, d)


# for a in A:
#   for b in B:
#       for c in C:
#           for d in D:
#               add(a, b, c, d)



from itertools import product
from time import time

def my_product(*args):
    result = [[]]
    for pool in args:
        result = [x+[y] for x in result for y in pool]
    for prod in result:
        yield tuple(prod)

# def my_product(*args):
#     h = product(
#         *map(
#             lambda x: range(len(x)),
#             args
#         )
#     )
#     for indices in h:
#         yield tuple(args[i][j] for i, j in zip(range(len(args)), indices))




stuff = ((7,2,5,2),(1,9,5,2,6,2,5))
t = time()
a = tuple(
    product(*stuff)
)
print(time() - t)

t = time()
b = tuple(
    my_product(*stuff)
)
print(time() - t)

print(b)

print(a)





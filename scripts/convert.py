import json
import tableview

table = tableview.load('plants.csv', 'utf8')

keys = table[0]
output = []
for record in table[1:]:
    product = {}
    for i,key in enumerate(keys):
        product[key] = record[i]
    output.append(product)

with open('../data/catalog.js','w') as fp:
    fp.write('var products = ')
    json.dump(output, fp, sort_keys=True, indent=3)


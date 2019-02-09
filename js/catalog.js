const DEFAULT_SIZE_CLASS = 'default'
const DEFAULT_PRICES = {'Start (3.25")' : 3.50, 'Quart' : 7.50}
const DEFAULT_DATES_AVAILABLE = {'Start (3.25")' : '2018/03/02', 'Quart' : '2018/03/22'}
const SIZE_CLASSES = {
	'smallPlantOnly' : ['Start (3.25")'],
	'largePlantOnly' : ['Quart'],
	'default' : ['Start (3.25")', 'Quart']
}

var Product = function(data) {
	this.catalog = data['catalog'] || {}
	this.name = data['name'] || ''
	this.latinName = data['latinName'] || ''
	this.sizeClass = data['sizeClass'] || DEFAULT_SIZE_CLASS
	this.sizes = SIZE_CLASSES[this.sizeClass]
	this.growth = data['growth'] || ''
	this.uses = data['uses']
	this.qty = data['qty'] || 0
	this.size = data['size'] || SIZE_CLASSES[this.sizeClass][0]

	this.prices = data['prices'] || DEFAULT_PRICES
	this.datesAvailable = data['datesAvailable'] || DEFAULT_DATES_AVAILABLE

    var t = document.querySelector('#product-row');
    var tb = document.querySelector("#catalog");
    this.row = document.importNode(t.content, true);
	
	var select = this.row.querySelector('select');
	this.sizes.forEach(size => {
		var option = document.createElement('option');
		option.textContent = size;
		select.appendChild(option);
	})

	select.addEventListener('change',evt => {
		this.setSize(evt.target.value);
		this.catalog.emit('change', {target : this.catalog})
	})

	var qty = this.row.querySelector('input')
	qty.addEventListener('change',evt => {
		console.log('new qty')
		this.setQty(evt.target.value)
		this._update()
		this.catalog.emit('change', {target : this.catalog})
	})

	this._update();
}

Product.prototype.getPrice = function() {
	return this.prices[this.size]
}

Product.prototype.getExtendedPrice = function() {
	return this.getPrice()*this.qty
}

Product.prototype.getDateAvailable = function() {
	return this.datesAvailable[this.size]
}

Product.prototype.setQty = function(qty) {
	this.qty = qty
}

Product.prototype.setSize = function(size) {
	this.size = size
	this._update()
}

Product.prototype.addToTable = function(node) {
	node.appendChild(this.row)
	this.row = node.lastElementChild
}
Product.prototype._update = function() {
    var td = this.row.querySelectorAll("td")
    td[0].textContent = this.name
    td[1].textContent = this.latinName
    // 2 -> Size selection
    td[3].textContent = '$' + this.getPrice().toFixed(2)
    td[4].textContent = this.getDateAvailable()
    td[5].textContent = this.growth
    td[6].textContent = this.uses
    // 7 -> Quantity selection
    td[8].textContent = '$' + this.getExtendedPrice().toFixed(2)

    var select = this.row.querySelector('select')
    select.value = this.size

    var qty = this.row.querySelector('input')
    qty.value = this.qty
}
var ProductCatalog = function() {
	this.products = []
	this.eventListeners = {
		'change' : []
	}
}

ProductCatalog.prototype.addProduct = function(data) {
	data['catalog'] = this
	var product = new Product(data)
	this.products.push(product)
	return product
}

ProductCatalog.prototype.getTotalPrice = function() {
	var total = 0
	this.products.forEach(product => {
		total += product.getExtendedPrice()
	})
	return total
}

ProductCatalog.prototype.addEventListener = function(type, cb) {
	if(type in this.eventListeners) {
		this.eventListeners[type].push(cb)		
	}
}

ProductCatalog.prototype.emit = function(type, evt) {
	if(type in this.eventListeners) {
		this.eventListeners[type].forEach(cb => {
			cb(evt);
		});
	}
}

var products = [
{
	name : 'Tulsi Vana',
	latinName : 'Ocimum gratissima',
	growth : 'Full-sun. Woody stemmed perennial which can overwinter indoors.',
	uses : 'Tea, used for stress, anxiety, heart disease, arthritis, diabetes, and dementia',
},
{
	name : 'Tulsi Rama',
	latinName : 'Ocimum sanctum',
	growth : 'Full-sun. Annual, or can overwinter indoors.',
	uses : 'Tea, gentle stimulant.'
}
]

var catalog = new ProductCatalog();

products.forEach(product => {
	catalog.addProduct(product);
});

var setupOrderForm = function() {
	
}

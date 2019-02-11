const DEFAULT_SIZE_CLASS = 'default'
const DEFAULT_PRICES = {'Start (3.25")' : 3.50, 'Quart' : 7.50}
const DEFAULT_DATES_AVAILABLE = {'Start (3.25")' : '02 Mar 2019', 'Quart' : '22 Mar 2019'}
const SIZE_CLASSES = {
	'smallPlantOnly' : ['Start (3.25")'],
	'largePlantOnly' : ['Quart'],
	'default' : ['Start (3.25")', 'Quart']
}

const CUSTOMER_FIELDS = [
	'firstname', 
	'lastname', 
	'email', 
	'phone',
	'address',
	'city',
	'state',
	'zip',
	'payment',
	'comments'
]

var notEmptyString = function(s) {return s.trim() != ''}
var isEmailAddress = function(email) {
	return /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(email).toLowerCase())
}
var noValidation = function() { return true }

const CUSTOMER_FIELD_VALIDATORS = {
	firstname : notEmptyString,
	lastname : notEmptyString,
	email : isEmailAddress,
	phone : notEmptyString,
	address : notEmptyString,
	city : notEmptyString,
	state : notEmptyString,
	zip : notEmptyString,
	payment : noValidation,
	comments : noValidation
}

const FORM_POST_URL = 'https://usebasin.com/f/1aa70f183436.json'


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

    var tb = document.querySelector('#catalog-table')
    var t = tb.querySelector('.product-row')
    this.catalogRow = document.importNode(t.content, true)

	var select = this.catalogRow.querySelector('select')
	this.sizes.forEach(size => {
		var option = document.createElement('option')
		option.textContent = size
		select.appendChild(option)
	})

	select.addEventListener('change',evt => {
		this.setSize(evt.target.value)
		this.catalog.emit('change', {target : this.catalog})
	})

	var qty = this.catalogRow.querySelector('input')
	qty.addEventListener('change',evt => {
		this.setQty(evt.target.value)
		this._update()
		this.catalog.emit('change', {target : this.catalog})
	})

	tb = document.querySelector("#order-summary-table")
	t = tb.querySelector('.product-row')
	this.summaryRow = document.importNode(t.content, true)

	this._update()
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

Product.prototype.addToCatalog = function(node) {
	node.appendChild(this.catalogRow)
	this.catalogRow = node.lastElementChild
}

Product.prototype.addToSummary = function(node) {
	node.appendChild(this.summaryRow)
	this.summaryRow = node.lastElementChild
}


Product.prototype._update = function() {
    var td = this.catalogRow.querySelectorAll("td")
    td[0].textContent = this.name
    td[1].textContent = this.latinName
    td[2].textContent = this.growth
    td[3].textContent = this.uses

    // 4 -> Size selection
    td[5].textContent = '$' + this.getPrice().toFixed(2)
    td[6].textContent = this.getDateAvailable()
    // 7 -> Quantity selection
    td[8].textContent = '$' + this.getExtendedPrice().toFixed(2)

    var select = this.catalogRow.querySelector('select')
    select.value = this.size

    var qty = this.catalogRow.querySelector('input')
    qty.value = this.qty

    var td = this.summaryRow.querySelectorAll("td")
    td[0].textContent = this.name
    td[1].textContent = this.size
    td[2].textContent = this.getDateAvailable()
    td[3].textContent = '$' + this.getPrice().toFixed(2)
    td[4].textContent = this.qty
    td[5].textContent = '$' + this.getExtendedPrice().toFixed(2)
}
/*
                                             <tr>
                                                <td></td> <!-- Qty -->
                                                <td></td> <!-- Name -->
                                                <td></td> <!-- Size -->
                                                <td></td> <!-- Available -->
                                                <td></td> <!-- Unit Price -->
                                                <td></td> <!-- Total -->
                                            </tr>

*/
/*
 * ProductCatalog is essentially the order form.
 * It contains all the products, and tracks the quantity selected by the customer
 */
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
			cb(evt)
		})
	}
}

ProductCatalog.prototype.getShoppingCart = function() {
	var cart = []
	this.products.forEach(product => {
		if(product.qty > 0) {
			cart.push({
				product : product.name,
				size : product.size,
				qty : product.qty,
				price : product.getExtendedPrice()
			})
		}
	})
	return cart
}

var catalog = new ProductCatalog()

products.forEach(product => {
	catalog.addProduct(product)
})

var currentPage = 1

var setupCatalog = function() {
	var tbody = document.getElementById('catalog-table')

	catalog.products.forEach(product => {
		product.addToCatalog(tbody)
	})

	catalog.addEventListener('change', evt => {
		document.getElementById('catalog-total').textContent = 'Order Total: $' + catalog.getTotalPrice().toFixed(2)
		var btn = document.getElementById('btn-catalog-page1-next')
		if(catalog.getTotalPrice() > 0) {
			btn.disabled = false
		} else {
			btn.disabled = true
		}
	})

	document.getElementById('btn-catalog-page1-next').addEventListener('click', evt => {
		catalogNextPage()
	})

	document.getElementById('btn-catalog-page2-next').addEventListener('click', evt => {
		catalogNextPage()
	})

	document.getElementById('btn-catalog-submit').addEventListener('click', evt => {
		catalogNextPage()
	})

}

var updateOrderSummary = function() {
	var tbody = document.getElementById('order-summary-table')
	while (tbody.firstChild) {
    	tbody.removeChild(tbody.firstChild);
	}
	catalog.products.forEach(product => {
		if(product.qty > 0) {
			product.addToSummary(tbody)			
		}
	});
	document.getElementById('order-summary-total').textContent = 'Order Total: $' + catalog.getTotalPrice().toFixed(2)

	var info = catalogGetCustomerInfo()
	document.getElementById('summary-customer-name').textContent = info.firstname + ' ' + info.lastname
	document.getElementById('summary-customer-address').textContent = info.address
	document.getElementById('summary-customer-citystatezip').textContent = info.city + ', ' + info.state + ' ' + info.zip 
	document.getElementById('summary-customer-phone').textContent = info.phone
	document.getElementById('summary-customer-email').textContent = info.email
	document.getElementById('summary-customer-email').href = 'mailto:' + info.email
	document.getElementById('summary-customer-payment').textContent = info.payment
}

var catalogShowPage = function(page) {
	const $catPages = Array.prototype.slice.call(document.querySelectorAll('.catalog-page'), 0)
	if($catPages.length > 0) {
		$catPages.forEach( el => {
	    	el.classList.add('inactive')
	    })
	}
	document.getElementById('catalog-page' + page).classList.remove('inactive')
	currentPage = page
}

function catalogPOST(data, callback) {
	callback = callback || function() {}
	var xhr = new XMLHttpRequest()
	xhr.open('POST', FORM_POST_URL)
	xhr.onload = function(data) {
	    callback(this.responseText)
	}
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.send(JSON.stringify(data))
}

var catalogNextPage = function() {
	switch(currentPage) {
		case 1:
			catalogShowPage(2)
			break

		case 2:
			if(catalogValidateCustomerInfo()) {
				updateOrderSummary()
				catalogShowPage(3)
			} else {
				console.error("Nope.")
			}
			break
		case 3:
			document.getElementById('btn-catalog-submit').classList.add('is-loading')
			catalogPOST({
				customer : catalogGetCustomerInfo(),
				order : catalog.getShoppingCart()
			}, response => {
				document.getElementById('btn-catalog-submit').classList.remove('is-loading')
				catalogShowPage(4)
			})				
			break
	}
}

var catalogGetCustomerInfo = function() {
	var user = {}
	CUSTOMER_FIELDS.forEach(name => {
		user[name] = document.getElementById('field-' + name).value
	})
	return user
}

var catalogValidateCustomerInfo = function() {
	var isValid = true
	CUSTOMER_FIELDS.forEach(name => {
		var field = document.getElementById('field-' + name)
		var validator = CUSTOMER_FIELD_VALIDATORS[name]
		valid = validator(field.value)
		if(!valid) {
			isValid = false
			field.classList.add('is-danger')
			field.addEventListener('keypress', catalogValidateCustomerInfo)
			field.addEventListener('change', catalogValidateCustomerInfo)
		} else {
			field.classList.remove('is-danger')
			field.removeEventListener('keypress', catalogValidateCustomerInfo)
			field.addEventListener('change', catalogValidateCustomerInfo)
		}
	})
	return isValid
}